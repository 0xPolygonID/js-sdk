"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractProof = exports.W3CCredential = void 0;
const proof_1 = require("./proof");
const js_iden3_core_1 = require("@iden3/js-iden3-core");
const constants_1 = require("./constants");
const js_jsonld_merklization_1 = require("@iden3/js-jsonld-merklization");
/**
 * W3C Verifiable credential
 *
 * @public
 * @export
 * @class W3CCredential
 */
class W3CCredential {
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
        return await js_jsonld_merklization_1.Merklizer.merklizeJSONLD(JSON.stringify(credential), opts);
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
        const proofType = constants_1.ProofType.BJJSignature;
        if (Array.isArray(this.proof)) {
            for (const proof of this.proof) {
                const { proofType: extractedProofType } = extractProof(proof);
                if (proofType === extractedProofType) {
                    return new proof_1.BJJSignatureProof2021(proof);
                }
            }
        }
        else if (typeof this.proof === 'object') {
            const { proofType: extractedProofType } = extractProof(this.proof);
            if (extractedProofType == proofType) {
                return new proof_1.BJJSignatureProof2021(this.proof);
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
        const proofType = constants_1.ProofType.Iden3SparseMerkleTreeProof;
        if (Array.isArray(this.proof)) {
            for (const proof of this.proof) {
                const { proofType: extractedProofType } = extractProof(proof);
                if (proofType === extractedProofType) {
                    return new proof_1.Iden3SparseMerkleTreeProof(proof);
                }
            }
        }
        else if (typeof this.proof === 'object') {
            const { proofType: extractedProofType } = extractProof(this.proof);
            if (extractedProofType == proofType) {
                return new proof_1.Iden3SparseMerkleTreeProof(this.proof);
            }
        }
        return undefined;
    }
}
exports.W3CCredential = W3CCredential;
/**
 * extracts core claim from Proof and returns Proof Type
 *
 * @param {object} proof - proof of vc
 * @returns {*}  {{ claim: Claim; proofType: ProofType }}
 */
function extractProof(proof) {
    if (proof instanceof proof_1.Iden3SparseMerkleTreeProof) {
        return {
            claim: new js_iden3_core_1.Claim().fromHex(proof.coreClaim),
            proofType: constants_1.ProofType.Iden3SparseMerkleTreeProof
        };
    }
    if (proof instanceof proof_1.BJJSignatureProof2021) {
        return { claim: new js_iden3_core_1.Claim().fromHex(proof.coreClaim), proofType: constants_1.ProofType.BJJSignature };
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
        return { claim: new js_iden3_core_1.Claim().fromHex(coreClaimHex), proofType: defaultProofType };
    }
    throw new Error('proof format is not supported');
}
exports.extractProof = extractProof;
//# sourceMappingURL=credential.js.map