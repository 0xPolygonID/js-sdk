import { BJJSignatureProof2021, Iden3SparseMerkleTreeProof } from './proof';
import { Claim } from '@iden3/js-iden3-core';
import { ProofType } from './constants';
import { Merklizer } from '@iden3/js-jsonld-merklization';
/**
 * W3C Verifiable credential
 *
 * @public
 * @export
 * @class W3CCredential
 */
export class W3CCredential {
    constructor() {
        this.id = '';
        this['@context'] = [];
        this.type = [];
        this.credentialSubject = {};
        this.issuer = '';
    }
    /**
     * merklization of the verifiable credential
     *
     * @returns `Promise<Merklizer>`
     */
    async merklize(opts) {
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
    getCoreClaimFromProof(proofType) {
        if (Array.isArray(this.proof)) {
            for (const proof of this.proof) {
                const { claim, proofType: extractedProofType } = extractProof(proof);
                if (proofType === extractedProofType) {
                    return claim;
                }
            }
        }
        else if (typeof this.proof === 'object') {
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
    getBJJSignature2021Proof() {
        const proofType = ProofType.BJJSignature;
        if (Array.isArray(this.proof)) {
            for (const proof of this.proof) {
                const { proofType: extractedProofType } = extractProof(proof);
                if (proofType === extractedProofType) {
                    return new BJJSignatureProof2021(proof);
                }
            }
        }
        else if (typeof this.proof === 'object') {
            const { proofType: extractedProofType } = extractProof(this.proof);
            if (extractedProofType == proofType) {
                return new BJJSignatureProof2021(this.proof);
            }
        }
        return undefined;
    }
    /**
     * checks Iden3SparseMerkleTreeProof in W3C VC
     *
     * @returns {*}  {(Iden3SparseMerkleTreeProof | undefined)}
     */
    getIden3SparseMerkleTreeProof() {
        const proofType = ProofType.Iden3SparseMerkleTreeProof;
        if (Array.isArray(this.proof)) {
            for (const proof of this.proof) {
                const { proofType: extractedProofType } = extractProof(proof);
                if (proofType === extractedProofType) {
                    return new Iden3SparseMerkleTreeProof(proof);
                }
            }
        }
        else if (typeof this.proof === 'object') {
            const { proofType: extractedProofType } = extractProof(this.proof);
            if (extractedProofType == proofType) {
                return new Iden3SparseMerkleTreeProof(this.proof);
            }
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
export function extractProof(proof) {
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
        const p = proof;
        const defaultProofType = p.type;
        if (!defaultProofType) {
            throw new Error('proof type is not specified');
        }
        const coreClaimHex = p.coreClaim;
        if (!coreClaimHex) {
            throw new Error(`coreClaim field is not defined in proof type ${defaultProofType}`);
        }
        return { claim: new Claim().fromHex(coreClaimHex), proofType: defaultProofType };
    }
    throw new Error('proof format is not supported');
}
//# sourceMappingURL=credential.js.map