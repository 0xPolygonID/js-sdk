import { Proof } from '@iden3/js-merkletree';
import { merklizeJSONLD, Merklizer } from '../processor';

// ErrStateNotFound issuer state is genesis state.
export const ErrStateNotFound = 'issuer state not found';
// Iden3Credential is that represents claim json-ld document

export enum SubjectPosition {
  None = '',
  // Index save subject in index part of claim. By default.
  Index = 'index',
  // Value save subject in value part of claim.
  Value = 'value'
}

export enum MerklizedRootPosition {
  // PositionIndex merklized root is stored in index.
  Index = 'index',
  // Value merklized root is stored in value.
  Value = 'value',
  // None merklized root is not stored in the claim. By Default.
  None = ''
}
export class Iden3Credential {
  id: string;
  '@context': string[];
  type: string[];
  expirationDate?: string;
  issuanceDate?: string;
  updatable: boolean;
  version: number;
  revNonce: number;
  credentialSubject: { [key: string]: any };
  credentialStatus?: CredentialStatus;
  subjectPosition?: SubjectPosition;
  merklizedRootPosition?: string;
  issuer: string;
  credentialSchema: CredentialSchema;
  proof?: any;

  // Merklize merklizes verifiable credential
  merklize(): Merklizer {
    const credential = { ...this };
    delete credential.proof;
    const credentialWithoutProofBytes = new TextEncoder().encode(JSON.stringify(credential));
    return merklizeJSONLD(credentialWithoutProofBytes);
  }
}

export interface CredentialSchema {
  id: string;
  type: string;
}

// CredentialStatusType type for understanding revocation type
export enum CredentialStatusType {
  SparseMerkleTreeProof = 'SparseMerkleTreeProof',
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
  rootOfRoots?: string;
  claimsTreeRoot?: string;
  revocationTreeRoot?: string;
}

// RevocationStatus status of revocation nonce. Info required to check revocation state of claim in circuits
export interface RevocationStatus {
  // RevocationNonce is the nonce of the claim
  mtp: Proof;
  issuer: Issuer;
}
