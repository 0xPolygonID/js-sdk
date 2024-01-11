/* eslint-disable @typescript-eslint/no-explicit-any */
import { BJJSignatureProof2021, Iden3SparseMerkleTreeProof, CredentialStatus } from './proof';
import { Claim } from '@iden3/js-iden3-core';
import { ProofType, RefreshServiceType } from './constants';
import { Proof } from '@iden3/js-merkletree';
import { Merklizer, Options } from '@iden3/js-jsonld-merklization';
import { RefreshService } from './refresh-service';

/**
 * W3C Verifiable credential
 *
 * @public
 * @export
 * @class W3CCredential
 */
export class W3CCredential {
  id = '';
  '@context': string[] = [];
  type: string[] = [];
  expirationDate?: string;
  refreshService?: RefreshService;
  issuanceDate?: string;
  credentialSubject: { [key: string]: object | string | number | boolean } = {};
  credentialStatus!: CredentialStatus;
  issuer = '';
  credentialSchema!: CredentialSchema;
  proof?: object | unknown[];

  toJSON() {
    return {
      ...this,
      proof: Array.isArray(this.proof)
        ? this.proof.map(this.proofToJSON)
        : this.proofToJSON(this.proof)
    };
  }

  private proofToJSON(p: any) {
    if (!p) {
      return p;
    }
    if (!p['type']) {
      throw new Error('proof must have type property');
    }
    switch (p.type) {
      case ProofType.Iden3SparseMerkleTreeProof:
      case ProofType.BJJSignature:
        return p.toJSON();
      default:
        return p;
    }
  }

  private static proofFromJSON = (p: any) => {
    if (!p) {
      return p;
    }
    if (!p['type']) {
      throw new Error('proof must have type property');
    }
    switch (p.type) {
      case ProofType.Iden3SparseMerkleTreeProof:
        return Iden3SparseMerkleTreeProof.fromJSON(p);
      case ProofType.BJJSignature:
        return BJJSignatureProof2021.fromJSON(p);
      default:
        return p;
    }
  };

  static fromJSON(obj: W3CCredential): W3CCredential {
    const w = new W3CCredential();
    Object.assign(w, obj);
    w.proof = Array.isArray(w.proof)
      ? w.proof.map(W3CCredential.proofFromJSON)
      : W3CCredential.proofFromJSON(w.proof);

    return w;
  }
  /**
   * merklization of the verifiable credential
   *
   * @returns `Promise<Merklizer>`
   */
  async merklize(opts?: Options): Promise<Merklizer> {
    const credential = { ...this };
    delete credential.proof;
    return await Merklizer.merklizeJSONLD(JSON.stringify(credential), opts);
  }

  /**
   * gets core claim representation from credential proof
   *
   * @param {ProofType} proofType
   * @returns {*}  {(Claim | undefined)}
   */
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
  /**
   * checks BJJSignatureProof2021 in W3C VC
   *
   * @returns BJJSignatureProof2021 | undefined
   */
  getBJJSignature2021Proof(): BJJSignatureProof2021 | undefined {
    const proof = this.getProofByType(ProofType.BJJSignature);
    if (proof) {
      return proof as BJJSignatureProof2021;
    }
    return undefined;
  }

  /**
   * checks Iden3SparseMerkleTreeProof in W3C VC
   *
   * @returns {*}  {(Iden3SparseMerkleTreeProof | undefined)}
   */
  getIden3SparseMerkleTreeProof(): Iden3SparseMerkleTreeProof | undefined {
    const proof = this.getProofByType(ProofType.Iden3SparseMerkleTreeProof);
    if (proof) {
      return proof as Iden3SparseMerkleTreeProof;
    }
    return undefined;
  }

  private getProofByType(proofType: ProofType): unknown | undefined {
    if (Array.isArray(this.proof)) {
      for (const proof of this.proof) {
        if ((proof as { [k: string]: ProofType })?.type === proofType) {
          return proof;
        }
      }
    } else if ((this.proof as { [k: string]: ProofType })?.type == proofType) {
      return this.proof;
    }
    return undefined;
  }
}

/**
 * extracts core claim from Proof and returns Proof Type
 *
 * @param {object} proof - proof of vc
 * @returns {*}  {{ claim: Claim; proofType: ProofType }}
 */
export function extractProof(proof: object): { claim: Claim; proofType: ProofType } {
  if (proof instanceof Iden3SparseMerkleTreeProof) {
    return {
      claim: proof.coreClaim,
      proofType: ProofType.Iden3SparseMerkleTreeProof
    };
  }
  if (proof instanceof BJJSignatureProof2021) {
    return { claim: proof.coreClaim, proofType: ProofType.BJJSignature };
  }
  if (typeof proof === 'object') {
    const p = proof as { type: ProofType; coreClaim: string | Claim };
    const defaultProofType: ProofType = p.type;
    if (!defaultProofType) {
      throw new Error('proof type is not specified');
    }

    if (!p.coreClaim) {
      throw new Error(`coreClaim field is not defined in proof type ${defaultProofType}`);
    }

    const coreClaim = p.coreClaim instanceof Claim ? p.coreClaim : new Claim().fromHex(p.coreClaim);

    return { claim: coreClaim, proofType: defaultProofType as ProofType };
  }

  throw new Error('proof format is not supported');
}

/**
 * Credential schema vc
 *
 * @public
 * @interface   CredentialSchema
 */
export interface CredentialSchema {
  id: string;
  type: string;
}

/**
 * Issuer tree information
 *
 * @public
 * @interface   Issuer
 */
export interface Issuer {
  state?: string;
  rootOfRoots?: string;
  claimsTreeRoot?: string;
  revocationTreeRoot?: string;
}

/**
 *
 * RevocationStatus status of revocation nonce. Info required to check revocation state of claim in circuits
 * @public
 * @interface   RevocationStatus
 */
export interface RevocationStatus {
  mtp: Proof;
  issuer: Issuer;
}
