import { DID, getDateFromUnixTimestamp, Id, SchemaHash } from '@iden3/js-iden3-core';
import { DocumentLoader, Merklizer, MtValue, Path } from '@iden3/js-jsonld-merklization';
import { Proof } from '@iden3/js-merkletree';
import { byteEncoder } from '../../utils';
import { getOperatorNameByValue, Operators, QueryOperators } from '../../circuits/comparer';
import { CircuitId } from '../../circuits/models';
import { calculateCoreSchemaHash, ProofQuery, VerifiableConstants } from '../../verifiable';
import { QueryMetadata } from '../common';
import { circuitValidator } from '../provers';
import { JsonLd } from 'jsonld/jsonld-spec';

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
  operatorOutput?: bigint;
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
  queriesMetadata: QueryMetadata[],
  ldContext: JsonLd,
  outputs: ClaimOutputs,
  circuitId: CircuitId,
  schemaLoader?: DocumentLoader,
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
  if (!query.type) {
    throw new Error('query type is missing');
  }

  const schemaId: string = await Path.getTypeIDFromContext(JSON.stringify(ldContext), query.type, {
    documentLoader: schemaLoader
  });
  const schemaHash = calculateCoreSchemaHash(byteEncoder.encode(schemaId));

  if (schemaHash.bigInt() !== outputs.schemaHash.bigInt()) {
    throw new Error(`schema that was used is not equal to requested in query`);
  }

  if (!query.skipClaimRevocationCheck && outputs.isRevocationChecked === 0) {
    throw new Error(`check revocation is required`);
  }

  checkCircuitQueriesLength(circuitId, queriesMetadata);

  // verify timestamp
  let acceptedProofGenerationDelay = defaultProofGenerationDelayOpts;
  if (opts?.acceptedProofGenerationDelay) {
    acceptedProofGenerationDelay = opts.acceptedProofGenerationDelay;
  }

  const timeDiff = Date.now() - getDateFromUnixTimestamp(Number(outputs.timestamp)).getTime();
  if (timeDiff > acceptedProofGenerationDelay) {
    throw new Error('generated proof is outdated');
  }

  return;
}

export function checkCircuitQueriesLength(circuitId: CircuitId, queriesMetadata: QueryMetadata[]) {
  const circuitValidationData = circuitValidator[circuitId];

  if (queriesMetadata.length > circuitValidationData.maxQueriesCount) {
    throw new Error(
      `circuit ${circuitId} supports only ${circuitValidator[circuitId as CircuitId].maxQueriesCount} queries`
    );
  }

}

export function checkCircuitOperator(circuitId: CircuitId, operator: number) {
  const circuitValidationData = circuitValidator[circuitId];

  if (!circuitValidationData.supportedOperations.includes(operator)) {
    throw new Error(
      `circuit ${circuitId} not support ${getOperatorNameByValue(operator)} operator`
    );
  }
}

export function verifyFieldValueInclusionV2(outputs: ClaimOutputs, metadata: QueryMetadata) {
  if (outputs.operator == QueryOperators.$noop) {
    return;
  }
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
}
export function verifyFieldValueInclusionNativeExistsSupport(
  outputs: ClaimOutputs,
  metadata: QueryMetadata
) {
  if (outputs.operator == Operators.NOOP) {
    return;
  }
  if (outputs.operator === Operators.EXISTS && !outputs.merklized) {
    throw new Error('$exists operator is not supported for non-merklized credential');
  }
  if (outputs.merklized === 1) {
    if (outputs.claimPathKey !== metadata.claimPathKey) {
      throw new Error(`proof was generated for another path`);
    }
  } else {
    if (outputs.slotIndex !== metadata.slotIndex) {
      throw new Error(`wrong claim slot was used in claim`);
    }
  }
}

export async function validateEmptyCredentialSubjectV2Circuit(
  cq: QueryMetadata,
  outputs: ClaimOutputs
) {
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
export async function validateOperators(cq: QueryMetadata, outputs: ClaimOutputs) {
  if (outputs.operator !== cq.operator) {
    throw new Error(`operator that was used is not equal to request`);
  }
  if (outputs.operator === Operators.NOOP) {
    // for noop operator slot and value are not used in this case
    return;
  }

  for (let index = 0; index < outputs.value.length; index++) {
    if (outputs.value[index] !== cq.values[index]) {
      if (outputs.value[index] === 0n && cq.values[index] === undefined) {
        continue;
      }
      throw new Error(`comparison value that was used is not equal to requested in query`);
    }
  }
}

export async function validateDisclosureV2Circuit(
  cq: QueryMetadata,
  outputs: ClaimOutputs,
  verifiablePresentation?: JSON,
  ldLoader?: DocumentLoader
) {
  const bi = await fieldValueFromVerifiablePresentation(
    cq.fieldName,
    verifiablePresentation,
    ldLoader
  );
  if (bi !== outputs.value[0]) {
    throw new Error(`value that was used is not equal to requested in query`);
  }

  if (outputs.operator !== Operators.EQ) {
    throw new Error(`operator for selective disclosure must be $eq`);
  }

  for (let index = 1; index < outputs.value.length; index++) {
    if (outputs.value[index] !== 0n) {
      throw new Error(`selective disclosure not available for array of values`);
    }
  }
}

export async function validateDisclosureNativeSDSupport(
  cq: QueryMetadata,
  outputs: ClaimOutputs,
  verifiablePresentation?: JSON,
  ldLoader?: DocumentLoader
) {
  const bi = await fieldValueFromVerifiablePresentation(
    cq.fieldName,
    verifiablePresentation,
    ldLoader
  );
  if (bi !== outputs.operatorOutput) {
    throw new Error(`operator output should be equal to disclosed value`);
  }

  if (outputs.operator !== Operators.SD) {
    throw new Error(`operator for selective disclosure must be $sd`);
  }

  for (let index = 0; index < outputs.value.length; index++) {
    if (outputs.value[index] !== 0n) {
      throw new Error(`public signal values must be zero`);
    }
  }
}
export async function validateEmptyCredentialSubjectNoopNativeSupport(outputs: ClaimOutputs) {
  if (outputs.operator !== Operators.NOOP) {
    throw new Error('empty credentialSubject request available only for $noop operation');
  }
  for (let index = 1; index < outputs.value.length; index++) {
    if (outputs.value[index] !== 0n) {
      throw new Error(`empty credentialSubject request not available for array of values`);
    }
  }
}

export const fieldValueFromVerifiablePresentation = async (
  fieldName: string,
  verifiablePresentation?: JSON,
  ldLoader?: DocumentLoader
): Promise<bigint> => {
  if (!verifiablePresentation) {
    throw new Error(`verifiablePresentation is required for selective disclosure request`);
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
    const p = `verifiableCredential.credentialSubject.${fieldName}`;
    merklizedPath = await Path.fromDocument(null, strVerifiablePresentation, p, {
      documentLoader: ldLoader
    });
  } catch (e) {
    throw new Error(`can't build path to '${fieldName}' key`);
  }

  let proof: Proof;
  let value: MtValue | undefined;
  try {
    ({ proof, value } = await mz.proof(merklizedPath));
  } catch (e) {
    throw new Error(`can't get value by path '${fieldName}'`);
  }
  if (!value) {
    throw new Error(`can't get merkle value for field '${fieldName}'`);
  }

  if (!proof.existence) {
    throw new Error(
      `path [${merklizedPath.parts}] doesn't exist in verifiablePresentation document`
    );
  }

  return await value.mtEntry();
};
