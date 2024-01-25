import { NodeAux, Hash, Proof, ZERO_HASH } from '@iden3/js-merkletree';
import {
  buildTreeState,
  CircuitId,
  ClaimNonRevStatus,
  defaultValueArraySize,
  GISTProof,
  isValidOperation,
  Operators,
  prepareCircuitArrayValues,
  Query,
  QueryOperators
} from '../circuits';
import { StateProof } from '../storage/entities/state';
import {
  MerkleTreeProofWithTreeState,
  RevocationStatus,
  W3CCredential,
  buildFieldPath
} from '../verifiable';
import { Merklizer, Options, Path } from '@iden3/js-jsonld-merklization';
import { Parser } from '../schema-processor/json';
import { byteEncoder } from '../utils';
import { JSONObject } from '../iden3comm';
import { Claim } from '@iden3/js-iden3-core';
import { poseidon } from '@iden3/js-crypto';

export type PreparedCredential = {
  credential: W3CCredential;
  credentialCoreClaim: Claim;
  revStatus?: RevocationStatus;
};

export type PreparedAuthBJJCredential = {
  credential: W3CCredential;
  incProof: MerkleTreeProofWithTreeState;
  nonRevProof: MerkleTreeProofWithTreeState;
  coreClaim: Claim;
};
/**
 * converts verifiable RevocationStatus model to circuits structure
 *
 * @param {RevocationStatus} - credential.status of the verifiable credential
 * @returns {ClaimNonRevStatus}
 */
export const toClaimNonRevStatus = (s?: RevocationStatus): ClaimNonRevStatus => {
  if (!s) {
    const hash = poseidon.hash(new Array(3).fill(0n));
    return {
      proof: new Proof(),
      treeState: {
        state: Hash.fromBigInt(hash),
        claimsRoot: ZERO_HASH,
        revocationRoot: ZERO_HASH,
        rootOfRoots: ZERO_HASH
      }
    };
  }
  return {
    proof: s.mtp,
    treeState: buildTreeState(
      s.issuer.state,
      s.issuer.claimsTreeRoot,
      s.issuer.revocationTreeRoot,
      s.issuer.rootOfRoots
    )
  };
};

/**
 * converts state info from smart contract to gist proof
 *
 * @param {StateProof} smtProof  - state proof from smart contract
 * @returns {GISTProof}
 */
export const toGISTProof = (smtProof: StateProof): GISTProof => {
  let existence = false;
  let nodeAux: NodeAux | undefined;

  if (smtProof.existence) {
    existence = true;
  } else {
    if (smtProof.auxExistence) {
      nodeAux = {
        key: Hash.fromBigInt(smtProof.auxIndex),
        value: Hash.fromBigInt(smtProof.auxValue)
      };
    }
  }

  const allSiblings: Hash[] = smtProof.siblings.map((s) => Hash.fromBigInt(s));

  const proof = new Proof({ siblings: allSiblings, nodeAux: nodeAux, existence: existence });

  const root = Hash.fromBigInt(smtProof.root);

  return {
    root,
    proof
  };
};

export type PropertyQuery = {
  fieldName: string;
  operator: Operators;
  operatorValue?: unknown;
};

export type QueryMetadata = PropertyQuery & {
  slotIndex: number;
  values: bigint[];
  path: Path;
  claimPathKey: bigint;
  datatype: string;
  merklizedSchema: boolean;
};

export const parseCredentialSubject = (credentialSubject?: JSONObject): PropertyQuery[] => {
  // credentialSubject is empty
  if (!credentialSubject) {
    return [{ operator: QueryOperators.$eq, fieldName: '' }];
  }

  const queries: PropertyQuery[] = [];
  const entries = Object.entries(credentialSubject);
  if (!entries.length) {
    throw new Error(`query must have at least 1 predicate`);
  }

  for (const [fieldName, fieldReq] of entries) {
    const fieldReqEntries = Object.entries(fieldReq as { [key: string]: unknown });

    const isSelectiveDisclosure = fieldReqEntries.length === 0;

    if (isSelectiveDisclosure) {
      queries.push({ operator: QueryOperators.$sd, fieldName: fieldName });
      continue;
    }

    for (const [operatorName, operatorValue] of fieldReqEntries) {
      if (!QueryOperators[operatorName as keyof typeof QueryOperators]) {
        throw new Error(`operator is not supported by lib`);
      }
      const operator = QueryOperators[operatorName as keyof typeof QueryOperators];
      queries.push({ operator, fieldName, operatorValue });
    }
  }
  return queries;
};

export const parseQueryMetadata = async (
  propertyQuery: PropertyQuery,
  ldContextJSON: string,
  credentialType: string,
  options: Options
): Promise<QueryMetadata> => {
  const datatype = await Path.newTypeFromContext(
    ldContextJSON,
    `${credentialType}.${propertyQuery.fieldName}`,
    options
  );

  const query: QueryMetadata = {
    ...propertyQuery,
    slotIndex: 0,
    merklizedSchema: false,
    datatype: datatype,
    claimPathKey: BigInt(0),
    values: [],
    path: new Path()
  };

  const serAttr = await Parser.getSerializationAttrFromContext(
    JSON.parse(ldContextJSON),
    options,
    credentialType
  );
  if (!serAttr) {
    query.merklizedSchema = true;
  }
  // for merklized credentials slotIndex in query must be equal to zero
  // and not a position of merklization root.
  // it has no influence on check in the off-chain circuits, but it aligns with onchain verification standard

  if (!query.merklizedSchema) {
    query.slotIndex = await Parser.getFieldSlotIndex(
      propertyQuery.fieldName,
      credentialType,
      byteEncoder.encode(ldContextJSON)
    );
  } else {
    try {
      const path = await buildFieldPath(
        ldContextJSON,
        credentialType,
        propertyQuery.fieldName,
        options
      );
      query.claimPathKey = await path.mtEntry();
      query.path = path;
    } catch (e) {
      throw new Error(`field does not exist in the schema ${(e as Error).message}`);
    }
  }
  // noop operator
  if (propertyQuery.operatorValue) {
    if (!isValidOperation(datatype, propertyQuery.operator)) {
      throw new Error(
        `operator ${propertyQuery.operator} is not supported for datatype ${datatype}`
      );
    }

    query.values = await transformQueryValueToBigInts(propertyQuery.operatorValue, datatype);
  }
  return query;
};

export const transformQueryValueToBigInts = async (
  value: unknown,
  ldType: string
): Promise<bigint[]> => {
  const values: bigint[] = [];

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index++) {
      values.push(await Merklizer.hashValue(ldType, value[index]));
    }
  } else {
    values[0] = await Merklizer.hashValue(ldType, value);
  }
  return values;
};

const queryTransformV3Circuit = (query: Query): Query => {
  if (query.operator === Operators.SD) {
    return new Query({
      ...query,
      values: new Array(defaultValueArraySize).fill(0)
    });
  }

  const values = prepareCircuitArrayValues(query.values, defaultValueArraySize);
  if ([Operators.IN, Operators.NIN].includes(query.operator)) {
    const lastValue = query.values[query.values.length - 1];
    const valuesLength = query.values.length;

    return new Query({
      ...query,
      // values
      values: [
        ...values.slice(0, valuesLength),
        ...new Array(values.length - valuesLength).fill(lastValue)
      ]
    });
  }

  return new Query({ ...query, values });
};

const queryTransformV2Circuit = (query: Query): Query => {
  return new Query({
    ...query,
    values: prepareCircuitArrayValues(query.values, defaultValueArraySize),
    operator: query.operator === Operators.SD ? Operators.EQ : query.operator
  });
};

/**
 * Transforms a query based on the circuit ID.
 * @param circuitId The ID of the circuit.
 * @param query The query to be transformed.
 * @returns The transformed query.
 */
export const circuitQueryTransformer = (circuitId: CircuitId, query: Query): Query => {
  switch (circuitId) {
    case CircuitId.AtomicQueryMTPV2:
    case CircuitId.AtomicQueryMTPV2OnChain:
    case CircuitId.AtomicQuerySigV2:
    case CircuitId.AtomicQuerySigV2OnChain:
      return queryTransformV2Circuit(query);
    case CircuitId.AtomicQueryV3:
    case CircuitId.AtomicQueryV3OnChain:
      return queryTransformV3Circuit(query);
    default:
      return new Query({
        ...query,
        values: prepareCircuitArrayValues(query.values, defaultValueArraySize)
      });
  }
};
