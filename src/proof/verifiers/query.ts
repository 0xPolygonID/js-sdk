import { DID, getDateFromUnixTimestamp, Id, SchemaHash } from '@iden3/js-iden3-core';
import {
  DocumentLoader,
  getDocumentLoader,
  Merklizer,
  MtValue,
  Path
} from '@iden3/js-jsonld-merklization';
import { Proof } from '@iden3/js-merkletree';
import { JSONObject } from '../../iden3comm';
import { byteEncoder } from '../../utils';
import { Operators } from '../../circuits/comparer';
import { CircuitId } from '../../circuits/models';
import { caclulateCoreSchemaHash, ProofQuery, VerifiableConstants } from '../../verifiable';
import { parseQueriesMetadata, QueryMetadata } from '../common';
import { circuitValidator } from '../provers';

/**
 * Options to verify state
 */
export type VerifyOpts = {
  // acceptedStateTransitionDelay is the period of time in milliseconds that a revoked state remains valid.
  acceptedStateTransitionDelay?: number;
  // acceptedProofGenerationDelay is the period of time in milliseconds that a generated proof remains valid.
  acceptedProofGenerationDelay?: number;
};

const defaultProofGenerationDelayOpts = 24 * 60 * 60 * 1000; // 24 hours

// ClaimOutputs fields that are used in proof generation
export interface ClaimOutputs {
  issuerId: Id;
  schemaHash: SchemaHash;
  slotIndex?: number;
  operator: number;
  value: bigint[];
  timestamp: number;
  merklized: number;
  claimPathKey?: bigint;
  claimPathNotExists?: number;
  valueArraySize: number;
  isRevocationChecked: number;
}

export async function checkQueryRequest(
  query: ProofQuery,
  outputs: ClaimOutputs,
  circuitId: CircuitId,
  schemaLoader?: DocumentLoader,
  verifiablePresentation?: JSON,
  opts?: VerifyOpts
): Promise<void> {
  // validate issuer
  const userDID = DID.parseFromId(outputs.issuerId);
  const issuerAllowed =
    !query.allowedIssuers ||
    query.allowedIssuers?.some((issuer) => issuer === '*' || issuer === userDID.string());
  if (!issuerAllowed) {
    throw new Error('issuer is not in allowed list');
  }

  // validate schema
  let schema: object;
  try {
    const loader = schemaLoader ?? getDocumentLoader();
    schema = (await loader(query.context ?? '')).document;
  } catch (e) {
    throw new Error(`can't load schema for request query`);
  }

  if (!query.type) {
    throw new Error(`proof query type is undefined`);
  }

  const schemaId: string = await Path.getTypeIDFromContext(JSON.stringify(schema), query.type, {
    documentLoader: schemaLoader
  });
  const schemaHash = caclulateCoreSchemaHash(byteEncoder.encode(schemaId));

  if (schemaHash.bigInt() !== outputs.schemaHash.bigInt()) {
    throw new Error(`schema that was used is not equal to requested in query`);
  }

  if (!query.skipClaimRevocationCheck && outputs.isRevocationChecked === 0) {
    throw new Error(`check revocation is required`);
  }

  const queriesMetadata = await parseQueriesMetadata(
    query.type,
    JSON.stringify(schema),
    query.credentialSubject as JSONObject,
    {
      documentLoader: schemaLoader
    }
  );

  const circuitValidationData = circuitValidator[circuitId];

  if (queriesMetadata.length > circuitValidationData.maxQueriesCount) {
    throw new Error(
      `circuit ${circuitId} supports only ${
        circuitValidator[circuitId as CircuitId].maxQueriesCount
      } queries`
    );
  }

  const notSupportedOpIndx = queriesMetadata.findIndex(
    (i) => !circuitValidationData.supportedOperations.includes(i.operator)
  );
  if (notSupportedOpIndx > -1) {
    throw new Error(
      `circuit ${circuitId} not support ${queriesMetadata[notSupportedOpIndx].operator} operator`
    );
  }

  queriesMetadata.forEach(async (metadata) => {
    if (!query.type) {
      throw new Error(`proof query type is undefined`);
    }

    // validate selective disclosure
    if (metadata.operator === Operators.SD) {
      try {
        await validateDisclosure(metadata, outputs, verifiablePresentation, schemaLoader);
      } catch (e) {
        throw new Error(`failed to validate selective disclosure: ${(e as Error).message}`);
      }
    } else if (!metadata.fieldName && metadata.operator == Operators.NOOP) {
      try {
        await validateEmptyCredentialSubject(metadata, outputs);
        return;
      } catch (e: unknown) {
        throw new Error(`failed to validate operators: ${(e as Error).message}`);
      }
    } else {
      try {
        await validateOperators(metadata, outputs);
      } catch (e) {
        throw new Error(`failed to validate operators: ${(e as Error).message}`);
      }
    }

    // verify claim
    if (outputs.merklized === 1) {
      if (outputs.claimPathNotExists === 1) {
        throw new Error(`proof doesn't contains target query key`);
      }

      if (outputs.claimPathKey !== metadata.claimPathKey) {
        throw new Error(`proof was generated for another path`);
      }
    } else {
      if (outputs.slotIndex !== metadata.slotIndex) {
        throw new Error(`wrong claim slot was used in claim`);
      }
    }

    // verify timestamp
    let acceptedProofGenerationDelay = defaultProofGenerationDelayOpts;
    if (opts?.acceptedProofGenerationDelay) {
      acceptedProofGenerationDelay = opts.acceptedProofGenerationDelay;
    }

    const timeDiff = Date.now() - getDateFromUnixTimestamp(Number(outputs.timestamp)).getTime();
    if (timeDiff > acceptedProofGenerationDelay) {
      throw new Error('generated proof is outdated');
    }
  });

  return;
}

async function validateEmptyCredentialSubject(cq: QueryMetadata, outputs: ClaimOutputs) {
  if (outputs.operator !== Operators.EQ) {
    throw new Error('empty credentialSubject request available only for equal operation');
  }
  for (let index = 1; index < outputs.value.length; index++) {
    if (outputs.value[index] !== 0n) {
      throw new Error(`empty credentialSubject request not available for array of values`);
    }
  }
  const path = Path.newPath([VerifiableConstants.CREDENTIAL_SUBJECT_PATH]);
  const subjectEntry = await path.mtEntry();
  if (outputs.claimPathKey !== subjectEntry) {
    throw new Error(`proof doesn't contain credentialSubject in claimPathKey`);
  }
  return;
}
async function validateOperators(cq: QueryMetadata, outputs: ClaimOutputs) {
  if (outputs.operator !== cq.operator) {
    throw new Error(`operator that was used is not equal to request`);
  }
  if (outputs.operator === Operators.NOOP) {
    // for noop operator slot and value are not used in this case
    return;
  }

  for (let index = 0; index < outputs.value.length; index++) {
    if (outputs.value[index] !== cq.values[index]) {
      throw new Error(`comparison value that was used is not equal to requested in query`);
    }
  }
}

async function validateDisclosure(
  cq: QueryMetadata,
  outputs: ClaimOutputs,
  verifiablePresentation?: JSON,
  ldLoader?: DocumentLoader
) {
  if (!verifiablePresentation) {
    throw new Error(`verifiablePresentation is required for selective disclosure request`);
  }

  if (outputs.operator !== Operators.EQ) {
    throw new Error(`operator for selective disclosure must be $eq`);
  }

  for (let index = 1; index < outputs.value.length; index++) {
    if (outputs.value[index] !== 0n) {
      throw new Error(`selective disclosure not available for array of values`);
    }
  }

  let mz: Merklizer;
  const strVerifiablePresentation: string = JSON.stringify(verifiablePresentation);
  try {
    mz = await Merklizer.merklizeJSONLD(strVerifiablePresentation, {
      documentLoader: ldLoader
    });
  } catch (e) {
    throw new Error(`can't merklize verifiablePresentation`);
  }

  let merklizedPath: Path;
  try {
    const p = `verifiableCredential.credentialSubject.${cq.fieldName}`;
    merklizedPath = await Path.fromDocument(null, strVerifiablePresentation, p, {
      documentLoader: ldLoader
    });
  } catch (e) {
    throw new Error(`can't build path to '${cq.fieldName}' key`);
  }

  let proof: Proof;
  let value: MtValue | undefined;
  try {
    ({ proof, value } = await mz.proof(merklizedPath));
  } catch (e) {
    throw new Error(`can't get value by path '${cq.fieldName}'`);
  }
  if (!value) {
    throw new Error(`can't get merkle value for field '${cq.fieldName}'`);
  }

  if (!proof.existence) {
    throw new Error(
      `path [${merklizedPath.parts}] doesn't exist in verifiablePresentation document`
    );
  }

  const bi = await value.mtEntry();
  if (bi !== outputs.value[0]) {
    throw new Error(`value that was used is not equal to requested in query`);
  }
}