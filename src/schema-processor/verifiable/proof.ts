import { Claim as CoreClaim, Id } from '@iden3/js-iden3-core';
import { Proof } from '@iden3/js-merkletree';
import { ProofType } from './constants';
import { CredentialStatus } from './credential';

// State represents the state of the issuer
export interface State {
  tx_id?: string;
  block_timestamp?: number;
  block_number?: number;
  rootOfRoots?: string;
  claimsTreeRoot?: string;
  revocationTreeRoot?: string;
  value?: string;
  status?: string;
}

// IssuerData is the data that is used to create a proof
export interface IssuerData {
  id?: Id;
  state?: State;
  authClaim?: CoreClaim;
  mtp?: Proof;
  revocationStatus: CredentialStatus;
}

// Iden3SparseMerkleProof JSON-LD structure
export class Iden3SparseMerkleProof {
  type: ProofType;
  issuerData: IssuerData;
  mtp: Proof;
}

// BJJSignatureProof2021 JSON-LD BBJJSignatureProof
export interface BJJSignatureProof2021 {
  type: ProofType;
  issuerData: IssuerData;
  signature: string;
}
