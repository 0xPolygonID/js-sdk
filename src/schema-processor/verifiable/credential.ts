import { Proof } from '@iden3/js-merkletree';

// ErrStateNotFound issuer state is genesis state.
export const ErrStateNotFound = 'issuer state not found';
// Iden3Credential is that represents claim json-ld document
export interface Iden3Credential {
  id: string;
  '@context': string[];
  '@type': string[];
  expirationDate?: Date;
  updatable: boolean;
  version: number;
  rev_nonce: number;
  credentialSubject: Map<string, unknown>;
  credentialStatus?: CredentialStatus;
  subject_position?: string;
  merklized?: string;
  credentialSchema: CredentialSchema;
  proof?: unknown;
}

export interface CredentialSchema {
  id: string;
  type: string;
}

// CredentialStatusType type for understanding revocation type
export enum CredentialStatusType {
  Iden3SparseMerkleTreeProof = 'Iden3SparseMerkleTreeProof',
  Iden3ReverseSparseMerkleTreeProof = 'Iden3ReverseSparseMerkleTreeProof'
}

// Iden3ReverseSparseMerkleTreeProof is CredentialStatusType
export const JSONSchemaValidator2018 = 'JsonSchemaValidator2018';

// StatusIssuer represents the URL to fetch claim revocation info directly from the issuer.
export interface StatusIssuer {
  id: string;
  type: CredentialStatusType;
}

// CredentialStatus contains type and revocation Url
export interface CredentialStatus {
  id: string;
  type: CredentialStatusType;
  issuer: string;
  revocationNonce?: number;
  statusIssuer?: StatusIssuer;
}

export interface Issuer {
  state?: string;
  root_of_roots?: string;
  claims_tree_root?: string;
  revocation_tree_root?: string;
}

// RevocationStatus status of revocation nonce. Info required to check revocation state of claim in circuits
export interface RevocationStatus {
  // RevocationNonce is the nonce of the claim
  // TODO: import from merkletree
  mtp: Proof;
  issuer: Issuer;
}
