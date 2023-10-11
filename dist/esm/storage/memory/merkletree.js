import { InMemoryDB, Merkletree, str2Bytes } from '@iden3/js-merkletree';
import * as uuid from 'uuid';
import { MERKLE_TREE_TYPES } from '../utils';
/**
 *
 *
 * @public
 * @class InMemoryMerkleTreeStorage
 * @implements implements IMerkleTreeStorage interface
 */
export class InMemoryMerkleTreeStorage {
    /**
     * Creates an instance of InMemoryMerkleTreeStorage.
     * @param {number} _mtDepth
     */
    constructor(_mtDepth) {
        this.mtDepth = _mtDepth;
        this._data = {};
    }
    /** create trees in the  memory*/
    async createIdentityMerkleTrees(identifier) {
        if (!identifier) {
            identifier = `${uuid.v4()}`;
        }
        if (this._data[identifier]) {
            throw new Error(`Present merkle tree meta information in the store for current identifier ${identifier}`);
        }
        this._data[identifier] = [];
        const treesMeta = [];
        MERKLE_TREE_TYPES.forEach((t) => {
            const treeId = identifier.concat('+' + t.toString());
            const tree = new Merkletree(new InMemoryDB(str2Bytes(treeId)), true, this.mtDepth);
            const metaInfo = { treeId, identifier: identifier, type: t };
            this._data[identifier].push({ tree, metaInfo });
            treesMeta.push(metaInfo);
        });
        return treesMeta;
    }
    /** get trees meta info from the memory */
    async getIdentityMerkleTreesInfo(identifier) {
        return this._data[identifier].map((treeWithInfo) => treeWithInfo.metaInfo);
    }
    /** get merkle tree by identifier and type from memory */
    async getMerkleTreeByIdentifierAndType(identifier, mtType) {
        const treeWithMeta = this._data[identifier].find((treeWithInfo) => treeWithInfo.metaInfo.type == mtType);
        if (!treeWithMeta) {
            throw new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
        }
        return treeWithMeta.tree;
    }
    /** adds entry to merkle tree in the memory */
    async addToMerkleTree(identifier, mtType, hindex, hvalue) {
        for (let index = 0; index < this._data[identifier].length; index++) {
            if (this._data[identifier][index].metaInfo.type === mtType) {
                await this._data[identifier][index].tree.add(hindex, hvalue);
            }
        }
    }
    /** bind merkle tree identifier in memory */
    async bindMerkleTreeToNewIdentifier(oldIdentifier, newIdentifier) {
        this._data[newIdentifier] = [...this._data[oldIdentifier]];
        delete this._data[oldIdentifier];
        this._data[newIdentifier].forEach((treeWithMeta) => {
            treeWithMeta.metaInfo.identifier = newIdentifier;
        });
    }
}
//# sourceMappingURL=merkletree.js.map