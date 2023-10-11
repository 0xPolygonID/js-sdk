/**
 *  IssuerData is the data that is used to create a proof
 *
 * @public
 * @class   IssuerData
 */
export class IssuerData {
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
/**
 * Iden3SparseMerkleProof is a iden3 protocol merkle tree proof
 *
 * @public
 * @class Iden3SparseMerkleTreeProof
 */
export class Iden3SparseMerkleTreeProof {
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
/**
 *
 * BJJSignatureProof2021 is a signature of core claim by BJJ key
 * @public
 * @class BJJSignatureProof2021
 */
export class BJJSignatureProof2021 {
    constructor(obj) {
        Object.assign(this, obj ?? {});
    }
}
//# sourceMappingURL=proof.js.map