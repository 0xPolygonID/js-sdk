"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BJJSignatureProof2021 = exports.Iden3SparseMerkleTreeProof = exports.IssuerData = void 0;
/**
 *  IssuerData is the data that is used to create a proof
 *
 * @public
 * @class   IssuerData
 */
class IssuerData {
    /**
     * Creates an instance ofIssuerData .
     * @param {object} obj
     */
    constructor(obj) {
        this.id = '';
        Object.assign(this, obj ?? {});
    }
    /**
     *
     *
     * @returns `string`
     */
    toJSON() {
        return {
            ...this,
            mtp: {
                existence: this.mtp?.existence,
                siblings: this.mtp?.siblings,
                nodeAux: this.mtp?.nodeAux
            }
        };
    }
}
exports.IssuerData = IssuerData;
/**
 * Iden3SparseMerkleProof is a iden3 protocol merkle tree proof
 *
 * @public
 * @class Iden3SparseMerkleTreeProof
 */
class Iden3SparseMerkleTreeProof {
    /**
     * Creates an instance of Iden3SparseMerkleTreeProof.
     * @param {object} obj
     */
    constructor(obj) {
        this.coreClaim = '';
        Object.assign(this, obj ?? {});
    }
    /**
     *
     *
     * @returns `string`
     */
    toJSON() {
        return {
            ...this,
            mtp: { existence: this.mtp.existence, siblings: this.mtp.siblings, nodeAux: this.mtp.nodeAux }
        };
    }
}
exports.Iden3SparseMerkleTreeProof = Iden3SparseMerkleTreeProof;
/**
 *
 * BJJSignatureProof2021 is a signature of core claim by BJJ key
 * @public
 * @class BJJSignatureProof2021
 */
class BJJSignatureProof2021 {
    constructor(obj) {
        Object.assign(this, obj ?? {});
    }
}
exports.BJJSignatureProof2021 = BJJSignatureProof2021;
//# sourceMappingURL=proof.js.map