import { createStore, get, set, del } from 'idb-keyval';
import { IndexedDBStorage, Merkletree, str2Bytes } from '@iden3/js-merkletree';
import * as uuid from 'uuid';
import { createMerkleTreeMetaInfo } from '../utils';
/**
 * Merkle tree storage that uses browser indexed db storage
 *
 * @public
 * @class MerkleTreeIndexedDBStorage
 * @implements implements IMerkleTreeStorage interface
 */
export class MerkleTreeIndexedDBStorage {
    /**
     * Creates an instance of MerkleTreeIndexedDBStorage.
     * @param {number} _mtDepth
     */
    constructor(_mtDepth) {
        this._mtDepth = _mtDepth;
        this._merkleTreeMetaStore = createStore(`${MerkleTreeIndexedDBStorage.storageKeyMeta}-db`, MerkleTreeIndexedDBStorage.storageKeyMeta);
        this._bindingStore = createStore(`${MerkleTreeIndexedDBStorage.storageBindingKeyMeta}-db`, MerkleTreeIndexedDBStorage.storageBindingKeyMeta);
    }
    /** creates a tree in the indexed db storage */
    async createIdentityMerkleTrees(identifier) {
        if (!identifier) {
            identifier = `${uuid.v4()}`;
        }
        const existingBinging = await get(identifier, this._bindingStore);
        if (existingBinging) {
            throw new Error(`Present merkle tree meta information in the store for current identifier ${identifier}`);
        }
        const treesMeta = createMerkleTreeMetaInfo(identifier);
        await set(identifier, treesMeta, this._merkleTreeMetaStore);
        return treesMeta;
    }
    /**
     *
     * getIdentityMerkleTreesInfo from the indexed db storage
     * @param {string} identifier
     * @returns `{Promise<IdentityMerkleTreeMetaInformation[]>}`
     */
    async getIdentityMerkleTreesInfo(identifier) {
        const meta = await get(identifier, this._merkleTreeMetaStore);
        if (meta) {
            return meta;
        }
        throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
    }
    /** get merkle tree from the indexed db storage */
    async getMerkleTreeByIdentifierAndType(identifier, mtType) {
        const meta = await get(identifier, this._merkleTreeMetaStore);
        const err = new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
        if (!meta) {
            throw err;
        }
        const resultMeta = meta.find((m) => m.identifier === identifier && m.type === mtType);
        if (!resultMeta) {
            throw err;
        }
        return new Merkletree(new IndexedDBStorage(str2Bytes(resultMeta.treeId)), true, this._mtDepth);
    }
    /** adds to merkle tree in the indexed db storage */
    async addToMerkleTree(identifier, mtType, hindex, hvalue) {
        const meta = await get(identifier, this._merkleTreeMetaStore);
        if (!meta) {
            throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
        }
        const resultMeta = meta.find((m) => m.identifier === identifier && m.type === mtType);
        if (!resultMeta) {
            throw new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
        }
        const tree = new Merkletree(new IndexedDBStorage(str2Bytes(resultMeta.treeId)), true, this._mtDepth);
        await tree.add(hindex, hvalue);
    }
    /** binds merkle tree in the indexed db storage to the new identifiers */
    async bindMerkleTreeToNewIdentifier(oldIdentifier, newIdentifier) {
        const meta = await get(oldIdentifier, this._merkleTreeMetaStore);
        if (!meta || !meta?.length) {
            throw new Error(`Merkle tree meta not found for identifier ${oldIdentifier}`);
        }
        const treesMeta = meta.map((m) => ({
            ...m,
            identifier: newIdentifier
        }));
        await del(oldIdentifier, this._merkleTreeMetaStore);
        await set(newIdentifier, treesMeta, this._merkleTreeMetaStore);
        await set(oldIdentifier, newIdentifier, this._bindingStore);
    }
}
/**
 * key for the storage key metadata
 *
 * @static
 */
MerkleTreeIndexedDBStorage.storageKeyMeta = 'merkle-tree-meta';
MerkleTreeIndexedDBStorage.storageBindingKeyMeta = 'binding-did';
//# sourceMappingURL=merkletree.js.map