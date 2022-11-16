import { Claim as CoreClaim, Id } from '@iden3/js-iden3-core';
import { Proof } from '@iden3/js-merkletree';
import { CredentialStatus } from './credential';

export enum ProofType {
  // BJJSignatureProofType schema type
  BJJSignature = 'BJJSignature2021',
  // Iden3SparseMerkleProofType schema
  Iden3SparseMerkle = 'Iden3SparseMerkleProof',
  // SparseMerkleTreeProofType schema
  SparseMerkleTree = 'SparseMerkleTreeProof'
}

// State represents the state of the issuer
export interface State {
  tx_id?: string;
  block_timestamp?: number;
  block_number?: number;
  root_of_roots?: string;
  claims_tree_root?: string;
  revocation_tree_root?: string;
  value?: string;
  status?: string;
}

// IssuerData is the data that is used to create a proof
export interface IssuerData {
  id?: Id;
  state?: State;
  auth_claim?: CoreClaim;
  mtp?: Proof;
  revocation_status: CredentialStatus;
}

// Iden3SparseMerkleProof JSON-LD structure
export class Iden3SparseMerkleProof {
  type: ProofType;
  issuer_data: IssuerData;
  mtp: Proof;
}

// BJJSignatureProof2021 JSON-LD BBJJSignatureProof

export interface BJJSignatureProof2021 {
  type: ProofType;
  issuer_data: IssuerData;
  signature: string;
}
