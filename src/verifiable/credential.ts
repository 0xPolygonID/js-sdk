import { Merkelizer, merkelizeJSONLD } from './../schema-processor/merklize/merkelizer';
import { BJJSignatureProof2021, Iden3SparseMerkleTreeProof } from './proof';
import { Claim } from '@iden3/js-iden3-core';
import { CredentialStatusType, ProofType } from './constants';
import { Proof } from '@iden3/js-merkletree';

// Iden3Credential is that represents claim json-ld document
export class W3CCredential {
  id: string;
  '@context': string[];
  type: string[];
  expirationDate?: string;
  issuanceDate?: string;
  credentialSubject: { [key: string]: object | string | number };
  credentialStatus?: CredentialStatus | RHSCredentialStatus;
  issuer: string;
  credentialSchema: CredentialSchema;
  proof?: object;

  // Merklize merklizes verifiable credential
  async merklize(): Promise<Merkelizer> {
    const credential = { ...this };
    delete credential.proof;
    return await merkelizeJSONLD(JSON.stringify(credential));
  }

  getCoreClaimFromProof(proofType: ProofType): Claim | undefined {
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
    return undefined;
  }
  getBJJSignature2021Proof(): BJJSignatureProof2021 | undefined {
    const proofType: ProofType = ProofType.BJJSignature;
    if (Array.isArray(this.proof)) {
      for (const proof of this.proof) {
        const { proofType: extractedProofType } = extractProof(proof);
        if (proofType === extractedProofType) {
          return proof as BJJSignatureProof2021;
        }
      }
    } else if (typeof this.proof === 'object') {
      const { proofType: extractedProofType } = extractProof(this.proof);
      if (extractedProofType == proofType) {
        return this.proof as BJJSignatureProof2021;
      }
    }
    return undefined;
  }

  getIden3SparseMerkleTreeProof(): Iden3SparseMerkleTreeProof | undefined {
    const proofType: ProofType = ProofType.Iden3SparseMerkleTreeProof;
    if (Array.isArray(this.proof)) {
      for (const proof of this.proof) {
        const { proofType: extractedProofType } = extractProof(proof);
        if (proofType === extractedProofType) {
          return proof as Iden3SparseMerkleTreeProof;
        }
      }
    } else if (typeof this.proof === 'object') {
      const { proofType: extractedProofType } = extractProof(this.proof);
      if (extractedProofType == proofType) {
        return this.proof as Iden3SparseMerkleTreeProof;
      }
    }
    return undefined;
  }
}

export function extractProof(proof: object): { claim: Claim; proofType: ProofType } {
  if (proof instanceof Iden3SparseMerkleTreeProof) {
    return {
      claim: new Claim().fromHex(proof.coreClaim),
      proofType: ProofType.Iden3SparseMerkleTreeProof
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
  mtp: Proof;
  issuer: Issuer;
}
