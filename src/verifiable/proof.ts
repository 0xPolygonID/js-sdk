import { Proof } from '@iden3/js-merkletree';
import { ProofType } from './constants';
import { TreeState } from '../circuits';

/**
 * Represents the published state of the issuer
 *
 * @export
 * @beta
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
 * @export
 * @beta
 * @interface   IssuerData
 */
export interface IssuerData {
  id: string;
  state: State;
  authCoreClaim?: string;
  mtp?: Proof;
  credentialStatus?: object;
}

/**
 * Iden3SparseMerkleProof is a iden3 protocol merkle tree proof
 *
 * @export
 * @beta
 * @class Iden3SparseMerkleTreeProof
 */
export class Iden3SparseMerkleTreeProof {
  type: ProofType;
  issuerData: IssuerData;
  mtp: Proof;
  coreClaim: string;
}

/**
 *
 * BJJSignatureProof2021 is a signature of core claim by BJJ key
 * @export
 * @beta
 * @class BJJSignatureProof2021
 */
export class BJJSignatureProof2021 {
  type: ProofType;
  issuerData: IssuerData;
  signature: string;
  coreClaim: string;
}
/**
 *  Query represents structure for query to atomic circuit
 *
 * @export
 * @beta
 * @interface   ProofQuery
 */
export interface ProofQuery {
  allowedIssuers?: string[];
  req?: { [key: string]: unknown };
  schema?: string; // string url
  claimId?: string;
  credentialSubjectId?: string;
  context?: string;
  type?: string;
}

/**
 * Proof with MerkleTree info
 *
 * @export
 * @beta
 * @interface   MerkleTreeProofWithTreeState
 */
export interface MerkleTreeProofWithTreeState {
  proof: Proof;
  treeState: TreeState;
}
