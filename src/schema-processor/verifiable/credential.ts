import { BJJSignatureProof2021, Iden3SparseMerkleProof } from './proof';
import { Claim } from '@iden3/js-iden3-core';
import { merklizeJSONLD, Merklizer } from '../processor';
import { CredentialStatusType, ProofType } from './constants';
import { Proof } from '@iden3/js-merkletree';

export interface SparseMerkleTreeProof {
  id: string;
  type: CredentialStatusType;
  revocationNonce: string;
}

export interface Iden3ReverseSparseMerkleTreeProof {
  id: string;
  type: CredentialStatusType;
  revocationNonce: string;
  statusIssuer: {
    id: string;
    type: CredentialStatusType;
    revocationNonce;
  };
}

// Iden3Credential is that represents claim json-ld document
export class W3CCredential {
  id: string;
  '@context': string[];
  type: string[];
  expirationDate?: number;
  issuanceDate?: number;
  credentialSubject: { [key: string]: object };
  credentialStatus?: SparseMerkleTreeProof | Iden3ReverseSparseMerkleTreeProof;
  issuer: string;
  credentialSchema: CredentialSchema;
  proof?: object;

  // Merklize merklizes verifiable credential
  merklize(): Merklizer {
    const credential = { ...this };
    delete credential.proof;
    const credentialWithoutProofBytes = new TextEncoder().encode(JSON.stringify(credential));
    return merklizeJSONLD(credentialWithoutProofBytes);
  }

  getCoreClaimFromProof(proofType: ProofType): Claim {
    if (Array.isArray(this.proof)) {
      for (const proof of this.proof) {
        const { claim, proofType: extractedProofType } = extractProof(proof);
        if (proofType === extractedProofType) {
          return claim;
        }
      }
    } else if (typeof this.proof === 'object') {
      const { claim, proofType: extractedProofType } = extractProof(this.proof);
      if (extractedProofType == proofType) {
        return claim;
      }
    }
    throw new Error('proof not found');
  }
}

export function extractProof(proof: object): { claim: Claim; proofType: ProofType } {
  if (proof instanceof Iden3SparseMerkleProof) {
    return {
      claim: new Claim().fromHex(proof.coreClaim),
      proofType: ProofType.Iden3SparseMerkle
    };
  }
  if (proof instanceof BJJSignatureProof2021) {
    return { claim: new Claim().fromHex(proof.coreClaim), proofType: ProofType.BJJSignature };
  }
  if (typeof proof === 'object') {
    const defaultProofType = proof['type'];
    if (!defaultProofType) {
      throw new Error('proof type is not specified');
    }
    const coreClaimHex = proof['coreClaim'];
    if (!coreClaimHex) {
      throw new Error(`coreClaim field is not defined in proof type ${defaultProofType}`);
    }
    return { claim: new Claim().fromHex(coreClaimHex), proofType: defaultProofType as ProofType };
  }

  throw new Error('proof format is not supported');
}

export interface CredentialSchema {
  id: string;
  type: string;
}

// RHSCredentialStatus contains type, url to fetch RHS info, issuer ID and revocation nonce and backup option to fetch credential status
export interface RHSCredentialStatus {
  id: string;
  type: CredentialStatusType;
  revocationNonce: number;
  statusIssuer?: CredentialStatus;
}

// CredentialStatus contains type and revocation Url
export interface CredentialStatus {
  id: string;
  type: CredentialStatusType;
  revocationNonce?: number;
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
