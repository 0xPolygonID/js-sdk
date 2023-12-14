import { NodeAux, Hash, Proof } from '@iden3/js-merkletree';
import {
  buildTreeState,
  CircuitClaim,
  ClaimNonRevStatus,
  GISTProof,
  MTProof,
  Operators,
  QueryOperators,
  TreeState
} from '../circuits';
import { StateProof } from '../storage/entities/state';
import {
  Iden3SparseMerkleTreeProof,
  MerkleTreeProofWithTreeState,
  ProofType,
  RevocationStatus,
  W3CCredential,
  buildFieldPath
} from '../verifiable';
import { Merklizer, Options, Path } from '@iden3/js-jsonld-merklization';
import { Parser } from '../schema-processor/json';
import { byteEncoder } from '../utils';
import { JSONObject } from '../iden3comm';
import { Claim, DID } from '@iden3/js-iden3-core';
import { ICredentialWallet } from '../credentials';
import { IIdentityWallet } from '../identity';

export type PreparedCredential = {
  credential: W3CCredential;
  credentialCoreClaim: Claim;
  revStatus: RevocationStatus;
};

export type PreparedAuthBJJCredential = {
  authCredential: W3CCredential;
  incProof: MerkleTreeProofWithTreeState;
  nonRevProof: MerkleTreeProofWithTreeState;
  authCoreClaim: Claim;
};
/**
 * converts verifiable RevocationStatus model to circuits structure
 *
 * @param {RevocationStatus} - credential.status of the verifiable credential
 * @returns {ClaimNonRevStatus}
 */
export const toClaimNonRevStatus = (s: RevocationStatus): ClaimNonRevStatus => {
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

export const parseCredentialSubject = async (
  credentialSubject?: JSONObject
): Promise<PropertyQuery[]> => {
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
  if (propertyQuery.operatorValue) {
    query.values = await transformQueryValueToBigInts(propertyQuery.operatorValue, datatype);
  }
  return query;
};

export const parseQueriesMetadata = async (
  credentialType: string,
  ldContextJSON: string,
  credentialSubject: JSONObject,
  options: Options
): Promise<QueryMetadata[]> => {
  const queriesMetadata = await parseCredentialSubject(credentialSubject);
  return Promise.all(
    queriesMetadata.map((m) => parseQueryMetadata(m, ldContextJSON, credentialType, options))
  );
};

export const transformQueryValueToBigInts = async (
  value: unknown,
  ldType: string
): Promise<bigint[]> => {
  const values: bigint[] = new Array<bigint>(64).fill(BigInt(0));

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index++) {
      values[index] = await Merklizer.hashValue(ldType, value[index]);
    }
  } else {
    values[0] = await Merklizer.hashValue(ldType, value);
  }
  return values;
};

export const newCircuitClaimData = async (
  preparedCredential: PreparedCredential
): Promise<CircuitClaim> => {
  const smtProof: Iden3SparseMerkleTreeProof | undefined =
    preparedCredential.credential.getIden3SparseMerkleTreeProof();

  const circuitClaim = new CircuitClaim();
  circuitClaim.claim = preparedCredential.credentialCoreClaim;
  circuitClaim.issuerId = DID.idFromDID(DID.parse(preparedCredential.credential.issuer));

  if (smtProof) {
    circuitClaim.proof = smtProof.mtp;
    circuitClaim.treeState = {
      state: smtProof.issuerData.state.value,
      claimsRoot: smtProof.issuerData.state.claimsTreeRoot,
      revocationRoot: smtProof.issuerData.state.revocationTreeRoot,
      rootOfRoots: smtProof.issuerData.state.rootOfRoots
    };
  }

  const sigProof = preparedCredential.credential.getBJJSignature2021Proof();

  if (sigProof) {
    if (!sigProof.issuerData.credentialStatus) {
      throw new Error(
        "can't check the validity of issuer auth claim: no credential status in proof"
      );
    }

    const rs = preparedCredential.revStatus;
    if (!rs) {
      throw new Error("can't fetch the credential status of issuer auth claim");
    }

    const issuerAuthNonRevProof: MTProof = toClaimNonRevStatus(rs);
    if (!sigProof.issuerData.mtp) {
      throw new Error('issuer auth credential must have a mtp proof');
    }
    if (!sigProof.issuerData.authCoreClaim) {
      throw new Error('issuer auth credential must have a core claim proof');
    }

    circuitClaim.signatureProof = {
      signature: sigProof.signature,
      issuerAuthIncProof: {
        proof: sigProof.issuerData.mtp,
        treeState: {
          state: sigProof.issuerData.state.value,
          claimsRoot: sigProof.issuerData.state.claimsTreeRoot,
          revocationRoot: sigProof.issuerData.state.revocationTreeRoot,
          rootOfRoots: sigProof.issuerData.state.rootOfRoots
        }
      },
      issuerAuthClaim: sigProof.issuerData.authCoreClaim,
      issuerAuthNonRevProof
    };
  }

  return circuitClaim;
};

export const prepareAuthBJJCredential = async (
  credentialWallet: ICredentialWallet,
  identityWallet: IIdentityWallet,
  did: DID,
  treeStateInfo?: TreeState
): Promise<PreparedAuthBJJCredential> => {
  const authCredential = await credentialWallet.getAuthBJJCredential(did);

  const incProof = await identityWallet.generateCredentialMtp(did, authCredential, treeStateInfo);

  const nonRevProof = await identityWallet.generateNonRevocationMtp(
    did,
    authCredential,
    treeStateInfo
  );

  const authCoreClaim = authCredential.getCoreClaimFromProof(ProofType.Iden3SparseMerkleTreeProof);

  if (!authCoreClaim) {
    throw new Error('auth core claim is not defined for auth bjj credential');
  }

  return { authCredential, incProof, nonRevProof, authCoreClaim };
};
