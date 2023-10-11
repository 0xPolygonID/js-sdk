"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toGISTProof = exports.toClaimNonRevStatus = void 0;
const js_merkletree_1 = require("@iden3/js-merkletree");
const circuits_1 = require("../circuits");
/**
 * converts verifiable RevocationStatus model to circuits structure
 *
 * @param {RevocationStatus} - credential.status of the verifiable credential
 * @returns {ClaimNonRevStatus}
 */
const toClaimNonRevStatus = (s) => {
    return {
        proof: s.mtp,
        treeState: (0, circuits_1.buildTreeState)(s.issuer.state, s.issuer.claimsTreeRoot, s.issuer.revocationTreeRoot, s.issuer.rootOfRoots)
    };
};
exports.toClaimNonRevStatus = toClaimNonRevStatus;
const newProofFromData = (existence, allSiblings, nodeAux) => {
    const p = new js_merkletree_1.Proof();
    p.existence = existence;
    p.nodeAux = nodeAux;
    p.depth = allSiblings.length;
    const siblings = [];
    for (let lvl = 0; lvl < allSiblings.length; lvl++) {
        const sibling = allSiblings[lvl];
        if (!sibling.bytes.every((b) => b === 0)) {
            (0, js_merkletree_1.setBitBigEndian)(p.notEmpties, lvl);
            siblings.push(sibling);
        }
    }
    p.siblings = siblings;
    return p;
};
/**
 * converts state info from smart contract to gist proof
 *
 * @param {StateProof} smtProof  - state proof from smart contract
 * @returns {GISTProof}
 */
const toGISTProof = (smtProof) => {
    let existence = false;
    let nodeAux;
    if (smtProof.existence) {
        existence = true;
    }
    else {
        if (smtProof.auxExistence) {
            nodeAux = {
                key: (0, js_merkletree_1.newHashFromBigInt)(smtProof.auxIndex),
                value: (0, js_merkletree_1.newHashFromBigInt)(smtProof.auxValue)
            };
        }
    }
    const allSiblings = smtProof.siblings.map((s) => (0, js_merkletree_1.newHashFromBigInt)(s));
    const proof = newProofFromData(existence, allSiblings, nodeAux);
    const root = (0, js_merkletree_1.newHashFromBigInt)(smtProof.root);
    return {
        root,
        proof
    };
};
exports.toGISTProof = toGISTProof;
//# sourceMappingURL=common.js.map