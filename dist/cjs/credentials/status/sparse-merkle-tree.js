"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toRevocationStatus = exports.IssuerResolver = void 0;
const js_merkletree_1 = require("@iden3/js-merkletree");
/**
 * IssuerResolver is a class that allows to interact with the issuer's http endpoint to get revocation status.
 *
 * @public
 * @class IssuerResolver
 */
class IssuerResolver {
    /**
     * resolve is a method to resolve a credential status directly from the issuer.
     *
     * @public
     * @param {CredentialStatus} credentialStatus -  credential status to resolve
     * @param {CredentialStatusResolveOptions} credentialStatusResolveOptions -  options for resolver
     * @returns `{Promise<RevocationStatus>}`
     */
    async resolve(credentialStatus) {
        const revStatusResp = await fetch(credentialStatus.id);
        const revStatus = await revStatusResp.json();
        return (0, exports.toRevocationStatus)(revStatus);
    }
}
exports.IssuerResolver = IssuerResolver;
/**
 * toRevocationStatus is a result of fetching credential status with type SparseMerkleTreeProof converts to RevocationStatus
 *
 * @param {RevocationStatusResponse} { issuer, mtp }
 * @returns {RevocationStatus} RevocationStatus
 */
const toRevocationStatus = ({ issuer, mtp }) => {
    const p = new js_merkletree_1.Proof();
    p.existence = mtp.existence;
    if (mtp.node_aux) {
        p.nodeAux = {
            key: (0, js_merkletree_1.newHashFromBigInt)(BigInt(mtp.node_aux.key)),
            value: (0, js_merkletree_1.newHashFromBigInt)(BigInt(mtp.node_aux.value))
        };
    }
    const s = mtp.siblings.map((s) => (0, js_merkletree_1.newHashFromBigInt)(BigInt(s)));
    p.siblings = [];
    p.depth = s.length;
    for (let lvl = 0; lvl < s.length; lvl++) {
        if (s[lvl].bigInt() !== BigInt(0)) {
            (0, js_merkletree_1.setBitBigEndian)(p.notEmpties, lvl);
            p.siblings.push(s[lvl]);
        }
    }
    return {
        mtp: p,
        issuer
    };
};
exports.toRevocationStatus = toRevocationStatus;
//# sourceMappingURL=sparse-merkle-tree.js.map