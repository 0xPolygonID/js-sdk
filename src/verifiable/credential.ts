/* eslint-disable @typescript-eslint/no-explicit-any */
import { BJJSignatureProof2021, Iden3SparseMerkleTreeProof, CredentialStatus } from './proof';
import { Claim, DID, buildDIDType, Id } from '@iden3/js-iden3-core';
import { ProofType } from './constants';
import { Proof, Hash, rootFromProof, verifyProof } from '@iden3/js-merkletree';
import { Merklizer, Options } from '@iden3/js-jsonld-merklization';
import { PublicKey, poseidon } from '@iden3/js-crypto';
import type { DIDResolutionResult, VerificationMethod } from 'did-resolver';
import { CredentialStatusResolverRegistry } from '../credentials';

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

  /**
   * Verify credential proof
   *
   * @returns {*}  {(boolean)}
   */
  async verifyProof(
    proofType: ProofType,
    resolverURL: string,
    credStatusResolverRegistry?: CredentialStatusResolverRegistry
  ): Promise<boolean> {
    const proof = this.getProofByType(proofType);
    if (!proof) {
      throw new Error('proof not found');
    }

    const coreClaim = this.getCoreClaimFromProof(proofType);
    if (!coreClaim) {
      throw new Error(`can't get core claim`);
    }

    switch (proofType) {
      case ProofType.BJJSignature: {
        if (!credStatusResolverRegistry) {
          throw new Error('please provide credential status resolver registry');
        }
        const userDID = DID.parse(this.credentialSubject.id as string);
        return this.verifyBJJSignatureProof(
          proof as BJJSignatureProof2021,
          coreClaim,
          resolverURL,
          userDID,
          credStatusResolverRegistry
        );
      }
      case ProofType.Iden3SparseMerkleTreeProof: {
        return this.verifyIden3SparseMerkleTreeProof(
          proof as Iden3SparseMerkleTreeProof,
          coreClaim,
          resolverURL
        );
      }
      default: {
        throw new Error('invalid proof type');
      }
    }
  }

  private async verifyBJJSignatureProof(
    proof: BJJSignatureProof2021,
    coreClaim: Claim,
    resolverURL: string,
    userDID: DID,
    credStatusResolverRegistry: CredentialStatusResolverRegistry
  ): Promise<boolean> {
    // issuer auth claim
    const authClaim = proof.issuerData.authCoreClaim;
    const rawSlotsInt = authClaim.rawSlotsAsInts();
    const pubKey = new PublicKey([rawSlotsInt[2], rawSlotsInt[3]]);

    // core claim hash
    const { hi, hv } = coreClaim.hiHv();
    const claimHash = poseidon.hash([hi, hv]);
    const bjjValid = pubKey.verifyPoseidon(claimHash, proof.signature);

    if (!bjjValid) {
      throw new Error('signature proof not valid');
    }
    await this.validateDIDDocumentAuth(
      proof.issuerData.id,
      resolverURL,
      proof.issuerData.state.value
    );

    const credStatusType = proof.issuerData.credentialStatus.type;
    const credStatusResolver = await credStatusResolverRegistry.get(credStatusType);
    if (!credStatusResolver) {
      throw new Error(`please register credential status resolver for ${credStatusType} type`);
    }
    const credStatus = await credStatusResolver.resolve(proof.issuerData.credentialStatus, {
      issuerDID: proof.issuerData.id,
      userDID: userDID
    });
    const stateValid = this.validateTreeState(credStatus.issuer);
    if (!stateValid) {
      throw new Error('invalid tree state');
    }

    const revocationNonce = BigInt(proof.issuerData.credentialStatus.revocationNonce || 0);
    const proofValid = await verifyProof(
      Hash.fromHex(credStatus.issuer.revocationTreeRoot),
      credStatus.mtp,
      revocationNonce,
      BigInt(0)
    );
    if (!proofValid) {
      throw new Error(`proof validation failed. revNonce=${revocationNonce}`);
    }
    if (credStatus.mtp.existence) {
      throw new Error('credential is revoked');
    }
    return true;
  }

  private async verifyIden3SparseMerkleTreeProof(
    proof: Iden3SparseMerkleTreeProof,
    coreClaim: Claim,
    resolverURL: string
  ): Promise<boolean> {
    await this.validateDIDDocumentAuth(
      proof.issuerData.id,
      resolverURL,
      proof.issuerData.state.value
    );
    // root from proof == issuerData.state.сlaimsTreeRoot
    const { hi, hv } = coreClaim.hiHv();
    const rootFromProofValue = await rootFromProof(proof.mtp, hi, hv);
    if (!rootFromProofValue.equals(proof.issuerData.state.claimsTreeRoot)) {
      throw new Error('root from proof not equal to issuer data claims tree root');
    }
    return true;
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

  private async validateDIDDocumentAuth(did: DID, resolverURL: string, state: Hash) {
    const vm = await this.resolveDIDDocumentAuth(did, resolverURL, state);
    if (!vm) {
      throw new Error(`can't resolve DID document`);
    }
    // published or genesis
    if (!(vm as any).published && !this.isGenesis(did, state)) {
      throw new Error(`issuer state not published and not genesis`);
    }
  }

  private async resolveDIDDocumentAuth(
    did: DID,
    resolveURL: string,
    state?: Hash
  ): Promise<VerificationMethod | undefined> {
    let url = `${resolveURL}/${did.string().replace(/:/g, '%3A')}`;
    if (state) {
      url += `?state=${state.hex()}`;
    }
    const resp = await fetch(url);
    const didResolutionRes = (await resp.json()) as DIDResolutionResult;
    return didResolutionRes.didDocument?.verificationMethod?.find(
      (i) => i.type === 'Iden3StateInfo2023'
    );
  }

  private isGenesis(did: DID, state: Hash): boolean {
    const id = DID.idFromDID(did);
    const { method, blockchain, networkId } = DID.decodePartsFromId(id);
    const didType = buildDIDType(method, blockchain, networkId);
    const genesisId = Id.idGenesisFromIdenState(didType, state.bigInt());
    return genesisId.equal(id);
  }

  private validateTreeState(treeState: Issuer) {
    const ctrHash = treeState.claimsTreeRoot ? Hash.fromHex(treeState.claimsTreeRoot) : new Hash();
    const rtrHash = treeState.revocationTreeRoot
      ? Hash.fromHex(treeState.revocationTreeRoot)
      : new Hash();
    const rorHash = treeState.rootOfRoots ? Hash.fromHex(treeState.rootOfRoots) : new Hash();
    const wantState = poseidon.hash([ctrHash.bigInt(), rtrHash.bigInt(), rorHash.bigInt()]);

    const stateHash = treeState.state ? Hash.fromHex(treeState.state) : new Hash();
    return wantState === stateHash.bigInt();
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
