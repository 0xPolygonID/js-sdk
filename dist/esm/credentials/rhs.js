import { newHashFromBigInt, testBit, NodeLeaf } from '@iden3/js-merkletree';
import { NODE_TYPE_LEAF } from '@iden3/js-merkletree';
import { hashElems } from '@iden3/js-merkletree';
import { ProofNode } from './status/reverse-sparse-merkle-tree';
/**
 * Pushes identity state information to a reverse hash service.
 *
 * A reverse hash service (RHS) is a centralized or decentralized service for storing publicly available data about identity.
 * Such data are identity state and state of revocation tree and roots tree root tree.
 *
 * @param {Hash} state - current state of identity
 * @param {TreesModel} trees - current trees of identity (claims, revocation, rootOfRoots )
 * @param {string} rhsUrl - URL of service
 * @param {number[]} [revokedNonces] - revoked nonces since last published info
 * @returns void
 */
export async function pushHashesToRHS(state, trees, rhsUrl, revokedNonces) {
    const nb = new NodesBuilder();
    if (revokedNonces) {
        await addRevocationNode(nb, trees, revokedNonces);
    }
    await addRoRNode(nb, trees);
    // add new state node
    if (!state.bytes.every((b) => b === 0)) {
        nb.addProofNode(new ProofNode(state, [
            await trees.claimsTree.root(),
            await trees.revocationTree.root(),
            await trees.rootsTree.root()
        ]));
    }
    if (nb.nodes.length > 0) {
        await saveNodes(nb.nodes, rhsUrl);
    }
}
async function saveNodes(nodes, nodeUrl) {
    const nodesJSON = nodes.map((n) => n.toJSON());
    const resp = await fetch(nodeUrl + '/node', { method: 'post', body: JSON.stringify(nodesJSON) });
    const status = resp.status;
    return status === 200;
}
async function addRoRNode(nb, trees) {
    const currentRootsTree = trees.rootsTree;
    const claimsTree = trees.claimsTree;
    return nb.addKey(currentRootsTree, (await claimsTree.root()).bigInt());
}
async function addRevocationNode(nb, trees, revokedNonces) {
    const revocationTree = trees.revocationTree;
    for (const nonce of revokedNonces) {
        await nb.addKey(revocationTree, BigInt(nonce));
    }
}
/**
 * Builder to send state information to Reverse hash Service
 *
 * @public
 * @class NodesBuilder
 */
class NodesBuilder {
    constructor(nodes = [], seen = new Map()) {
        this.nodes = nodes;
        this.seen = seen;
    }
    async addKey(tree, nodeKey) {
        const { value: nodeValue, siblings } = await tree.get(nodeKey);
        const nodeKeyHash = newHashFromBigInt(nodeKey);
        const nodeValueHash = newHashFromBigInt(nodeValue);
        const node = new NodeLeaf(nodeKeyHash, nodeValueHash);
        const newNodes = await buildNodesUp(siblings, node);
        for (const n of newNodes) {
            if (!this.seen.get(n.hash.hex())) {
                this.nodes.push(n);
                this.seen.set(n.hash.hex(), true);
            }
        }
    }
    addProofNode(node) {
        const hex = node.hash.hex();
        const isSeen = this.seen.get(hex);
        if (!isSeen) {
            this.nodes.push(node);
            this.seen.set(hex, true);
        }
    }
}
async function buildNodesUp(siblings, node) {
    if (node.type !== NODE_TYPE_LEAF) {
        throw new Error('node is not a leaf');
    }
    let prevHash = await node.getKey();
    const sl = siblings.length;
    const nodes = new Array(sl + 1);
    for (let index = 0; index < nodes.length; index++) {
        nodes[index] = new ProofNode();
    }
    nodes[sl].hash = prevHash;
    const hashOfOne = newHashFromBigInt(BigInt(1));
    nodes[sl].children = [node.entry[0], node.entry[1], hashOfOne];
    const pathKey = node.entry[0];
    for (let i = sl - 1; i >= 0; i--) {
        const isRight = testBit(pathKey.bytes, i);
        nodes[i].children = new Array(2);
        if (isRight) {
            nodes[i].children[0] = siblings[i];
            nodes[i].children[1] = prevHash;
        }
        else {
            nodes[i].children[0] = prevHash;
            nodes[i].children[1] = siblings[i];
        }
        nodes[i].hash = await hashElems([nodes[i].children[0].bigInt(), nodes[i].children[1].bigInt()]);
        prevHash = nodes[i].hash;
    }
    return nodes;
}
//# sourceMappingURL=rhs.js.map