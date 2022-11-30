import { Proof } from '@iden3/js-merkletree';
import { merklizeJSONLD, Merklizer } from '../processor';
import { SubjectPosition, MerklizedRootPosition, CredentialStatusType } from './constants';

// Iden3Credential is that represents claim json-ld document
export class Iden3Credential {
  id: string;
  '@context': string[];
  type: string[];
  expirationDate?: number;
  issuanceDate?: number;
  updatable: boolean;
  version: number;
  revNonce: number;
  credentialSubject: { [key: string]: any };
  credentialStatus?: CredentialStatus;
  subjectPosition?: SubjectPosition;
  merklizedRootPosition?: MerklizedRootPosition;
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
