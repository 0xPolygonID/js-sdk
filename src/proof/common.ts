import { NodeAux, Hash, Proof, ZERO_HASH } from '@iden3/js-merkletree';
import {
  buildTreeState,
  ClaimNonRevStatus,
  GISTProof,
  isValidOperation,
  Operators,
  QueryOperators
} from '../circuits';
import {
  MerkleTreeProofWithTreeState,
  RevocationStatus,
  W3CCredential,
  buildFieldPath,
  getSerializationAttrFromContext,
  getFieldSlotIndex,
  VerifiableConstants,
  ProofQuery,
  CredentialStatusType
} from '../verifiable';
import { Merklizer, Options, Path } from '@iden3/js-jsonld-merklization';
import { byteEncoder } from '../utils';
import { JsonDocumentObject, VerifiablePresentation, ZeroKnowledgeProofQuery } from '../iden3comm';
import { Claim } from '@iden3/js-iden3-core';
import { poseidon } from '@iden3/js-crypto';
import { StateProof } from '../storage';

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

export const parseZKPQuery = (query: ZeroKnowledgeProofQuery): PropertyQuery[] => {
  const propertiesMetadata: PropertyQuery[] = [];
  if (query.credentialSubject) {
    const credSubjFlattened = flattenNestedObject(
      query.credentialSubject as Record<string, JsonDocumentObject | undefined>,
      'credentialSubject'
    );
    propertiesMetadata.push(...parseJsonDocumentObject(credSubjFlattened));
  }
  if (query.expirationDate) {
    const expirationDate = parseJsonDocumentObject({ expirationDate: query.expirationDate });
    propertiesMetadata.push(...expirationDate);
  }
  if (query.issuanceDate) {
    const issuanceDate = parseJsonDocumentObject({ issuanceDate: query.issuanceDate });
    propertiesMetadata.push(...issuanceDate);
  }
  if (query.credentialStatus) {
    const flattenedObject = flattenNestedObject(
      query.credentialStatus as Record<string, JsonDocumentObject | undefined>,
      'credentialStatus'
    );
    propertiesMetadata.push(...parseJsonDocumentObject(flattenedObject));
  }
  if (propertiesMetadata.length === 0) {
    return [{ operator: QueryOperators.$noop, fieldName: '' }];
  }
  return propertiesMetadata;
};

const flattenNestedObject = (
  input: Record<string, JsonDocumentObject | undefined>,
  parentKey: string
): Record<string, JsonDocumentObject> => {
  const result: Record<string, JsonDocumentObject> = {};

  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      result[`${parentKey}.${key}`] = value;
    }
  }
  return result;
};

export const parseDocumentToPropertyQueries = (
  documentName: 'credentialStatus' | 'credentialSubject',
  document?: JsonDocumentObject,
  vp?: VerifiablePresentation
): PropertyQuery[] => {
  if (!document) {
    return [{ operator: QueryOperators.$noop, fieldName: '' }];
  }
  // if document is empty, full disclosure is needed
  if (Object.entries(document).length === 0) {
    if (!vp) {
      throw new Error(`VerifiablePresentation is required for full disclosure of ${documentName}`);
    }
    const queries: PropertyQuery[] = [];
    const flattened = flattenToQueryShape(
      (vp.verifiableCredential as Record<string, any>)[documentName],
      documentName
    );
    queries.push(...parseJsonDocumentObject(flattened));
    return queries;
  }
  const flattenedObject = flattenNestedObject(
    document as Record<string, JsonDocumentObject | undefined>,
    documentName
  );
  return parseJsonDocumentObject(flattenedObject);
};

export const flattenToQueryShape = (
  obj: Record<string, any>,
  parentKey = ''
): JsonDocumentObject => {
  const result: JsonDocumentObject = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'id' || key === 'type') {
      continue;
    }
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenToQueryShape(value, fullKey));
    } else {
      result[fullKey] = {};
    }
  }
  return result;
};

export const parseJsonDocumentObject = (document?: JsonDocumentObject): PropertyQuery[] => {
  // document is empty
  if (!document) {
    return [{ operator: QueryOperators.$noop, fieldName: '' }];
  }

  const queries: PropertyQuery[] = [];
  const entries = Object.entries(document);
  if (!entries.length) {
    throw new Error(`query must have at least 1 predicate`);
  }

  for (const [fieldName, fieldReq] of entries) {
    const fieldReqEntries = Object.entries(fieldReq as { [key: string]: unknown });

    const isSelectiveDisclosure = fieldReqEntries.length === 0;

    if (isSelectiveDisclosure) {
      queries.push({ operator: QueryOperators.$sd, fieldName });
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

/**
 * @deprecated use parseDocumentToPropertyQueries instead
 * @param credentialSubject credentialSubject object
 * @returns PropertyQuery[]
 */
export const parseCredentialSubject = (credentialSubject?: JsonDocumentObject): PropertyQuery[] => {
  return parseJsonDocumentObject(credentialSubject);
};

export const parseQueryMetadata = async (
  propertyQuery: PropertyQuery,
  ldContextJSON: string,
  credentialType: string,
  options: Options
): Promise<QueryMetadata> => {
  const replacedFieldName = propertyQuery.fieldName;
  const [fieldParentObj] = propertyQuery.fieldName.split('.');
  switch (fieldParentObj) {
    case 'credentialStatus':
      propertyQuery.fieldName = propertyQuery.fieldName.replace('credentialStatus.', '');
      ldContextJSON = VerifiableConstants.JSONLD_SCHEMA.IDEN3_PROOFS_DEFINITION_DOCUMENT;
      break;
    case 'credentialSubject':
      propertyQuery.fieldName = propertyQuery.fieldName.replace('credentialSubject.', '');
      break;
    case '':
      break;
    default:
      ldContextJSON = VerifiableConstants.JSONLD_SCHEMA.W3C_VC_DOCUMENT_2018;
      credentialType = VerifiableConstants.CREDENTIAL_TYPE.W3C_VERIFIABLE_CREDENTIAL;
  }
  const query: QueryMetadata = {
    ...propertyQuery,
    slotIndex: 0,
    merklizedSchema: false,
    datatype: '',
    claimPathKey: BigInt(0),
    values: [],
    path: new Path()
  };

  if (!propertyQuery.fieldName && propertyQuery.operator !== Operators.NOOP) {
    throw new Error('query must have a field name if operator is not $noop');
  }

  if (propertyQuery.fieldName) {
    query.datatype = await Path.newTypeFromContext(
      ldContextJSON,
      `${credentialType}.${propertyQuery.fieldName}`,
      options
    );
  }

  const serAttr = await getSerializationAttrFromContext(
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
    query.slotIndex = await getFieldSlotIndex(
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

  if (propertyQuery.operatorValue !== undefined) {
    if (!isValidOperation(query.datatype, propertyQuery.operator)) {
      throw new Error(
        `operator ${propertyQuery.operator} is not supported for datatype ${query.datatype}`
      );
    }

    if (
      (propertyQuery.operator === Operators.NOOP || propertyQuery.operator === Operators.SD) &&
      propertyQuery.operatorValue
    ) {
      throw new Error(`operator value should be undefined for ${propertyQuery.operator} operator`);
    }

    let values: bigint[];
    switch (propertyQuery.operator) {
      case Operators.NOOP:
      case Operators.SD:
        values = [];
        break;
      case Operators.EXISTS:
        values = transformExistsValue(propertyQuery.operatorValue);
        break;
      default:
        values = await transformQueryValueToBigInts(propertyQuery.operatorValue, query.datatype);
    }
    query.values = values;
  }
  query.fieldName = replacedFieldName;
  return query;
};

export const parseProofQueryMetadata = async (
  credentialType: string,
  ldContextJSON: string,
  query: ProofQuery,
  options: Options,
  vp?: VerifiablePresentation
): Promise<QueryMetadata[]> => {
  const propertyQuery = parseDocumentToPropertyQueries(
    'credentialSubject',
    query.credentialSubject,
    vp
  );
  if (query.expirationDate) {
    propertyQuery.push(...parseJsonDocumentObject({ expirationDate: query.expirationDate }));
  }
  if (query.issuanceDate) {
    propertyQuery.push(...parseJsonDocumentObject({ issuanceDate: query.issuanceDate }));
  }

  if (query.credentialStatus) {
    const credSubject = parseDocumentToPropertyQueries(
      'credentialStatus',
      query.credentialStatus,
      vp
    );
    propertyQuery.push(...credSubject);
  }

  return Promise.all(
    propertyQuery.map((p) => {
      let credType = credentialType;
      if (p.fieldName.startsWith('credentialStatus.')) {
        if (!vp?.verifiableCredential?.credentialStatus?.type) {
          throw new Error('credentialStatus.type is required for w3cV1 queries');
        }
        credType = vp?.verifiableCredential?.credentialStatus?.type;
      }
      return parseQueryMetadata(p, ldContextJSON, credType, options);
    })
  );
};

export const parseQueriesMetadata = async (
  credentialType: string,
  ldContextJSON: string,
  credentialSubject: JsonDocumentObject,
  options: Options
): Promise<QueryMetadata[]> => {
  const queriesMetadata = parseDocumentToPropertyQueries('credentialSubject', credentialSubject);
  return Promise.all(
    queriesMetadata.map((m) => parseQueryMetadata(m, ldContextJSON, credentialType, options))
  );
};

export const transformQueryValueToBigInts = async (
  value: unknown,
  ldType: string
): Promise<bigint[]> => {
  const values: bigint[] = [];

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index++) {
      values[index] = await Merklizer.hashValue(ldType, value[index]);
    }
  } else {
    values[0] = await Merklizer.hashValue(ldType, value);
  }
  return values;
};

const transformExistsValue = (value: unknown): bigint[] => {
  if (typeof value == 'boolean') {
    return [BigInt(value)];
  }
  throw new Error('exists operator value must be true or false');
};
