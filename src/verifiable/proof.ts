import { Proof } from '@iden3/js-merkletree';
import { ProofType, CredentialStatusType } from './constants';
import { TreeState } from '../circuits';

/**
 * Represents the published state of the issuer
 *
 * @public
 * @interface   State
 */
export interface State {
  txId?: string;
  blockTimestamp?: number;
  blockNumber?: number;
  rootOfRoots: string;
  claimsTreeRoot: string;
  revocationTreeRoot: string;
  value: string;
  status?: string;
}

/**
 *  IssuerData is the data that is used to create a proof
 *
 * @public
 * @class   IssuerData
 */
export class IssuerData {
  id = '';
  state!: State;
  authCoreClaim?: string;
  mtp?: Proof;
  credentialStatus?: CredentialStatus;
  /**
   * Creates an instance ofIssuerData .
   * @param {object} obj
   */
  constructor(obj?: object) {
    Object.assign(this, obj ?? {});
  }
  /**
   *
   *
   * @returns `string`
   */
  toJSON() {
    return {
      ...this,
      mtp: {
        existence: this.mtp?.existence,
        siblings: this.mtp?.siblings,
        nodeAux: this.mtp?.nodeAux
      }
    };
  }
}

/**
 * Iden3SparseMerkleProof is a iden3 protocol merkle tree proof
 *
 * @public
 * @class Iden3SparseMerkleTreeProof
 */
export class Iden3SparseMerkleTreeProof {
  type!: ProofType;
  issuerData!: IssuerData;
  mtp!: Proof;
  coreClaim = '';
  /**
   * Creates an instance of Iden3SparseMerkleTreeProof.
   * @param {object} obj
   */
  constructor(obj?: object) {
    Object.assign(this, obj ?? {});
  }
  /**
   *
   *
   * @returns `string`
   */
  toJSON() {
    return {
      ...this,
      mtp: { existence: this.mtp.existence, siblings: this.mtp.siblings, nodeAux: this.mtp.nodeAux }
    };
  }
}

/**
 *
 * BJJSignatureProof2021 is a signature of core claim by BJJ key
 * @public
 * @class BJJSignatureProof2021
 */
export class BJJSignatureProof2021 {
  type!: ProofType;
  issuerData!: IssuerData;
  signature!: string;
  coreClaim!: string;

  constructor(obj?: object) {
    Object.assign(this, obj ?? {});
  }
}
/**
 *  Query represents structure for query to atomic circuit
 *
 * @public
 * @interface   ProofQuery
 */
export interface ProofQuery {
  allowedIssuers?: string[];
  credentialSubject?: { [key: string]: unknown };
  schema?: string; // string url
  claimId?: string;
  credentialSubjectId?: string;
  context?: string;
  type?: string;
  skipClaimRevocationCheck?: boolean;
}

/**
 * Proof with MerkleTree info
 *
 * @public
 * @interface   MerkleTreeProofWithTreeState
 */
export interface MerkleTreeProofWithTreeState {
  proof: Proof;
  treeState: TreeState;
}

/**
 *
 * CredentialStatus contains type and revocation Url
 * @public
 * @interface   CredentialStatus
 */
export interface CredentialStatus {
  id: string;
  type: CredentialStatusType;
  revocationNonce?: number;
  statusIssuer?: CredentialStatus;
}
