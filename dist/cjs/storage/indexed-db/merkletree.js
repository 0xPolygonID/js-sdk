"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerkleTreeIndexedDBStorage = void 0;
const idb_keyval_1 = require("idb-keyval");
const js_merkletree_1 = require("@iden3/js-merkletree");
const uuid = __importStar(require("uuid"));
const utils_1 = require("../utils");
/**
 * Merkle tree storage that uses browser indexed db storage
 *
 * @public
 * @class MerkleTreeIndexedDBStorage
 * @implements implements IMerkleTreeStorage interface
 */
class MerkleTreeIndexedDBStorage {
    /**
     * Creates an instance of MerkleTreeIndexedDBStorage.
     * @param {number} _mtDepth
     */
    constructor(_mtDepth) {
        this._mtDepth = _mtDepth;
        this._merkleTreeMetaStore = (0, idb_keyval_1.createStore)(`${MerkleTreeIndexedDBStorage.storageKeyMeta}-db`, MerkleTreeIndexedDBStorage.storageKeyMeta);
        this._bindingStore = (0, idb_keyval_1.createStore)(`${MerkleTreeIndexedDBStorage.storageBindingKeyMeta}-db`, MerkleTreeIndexedDBStorage.storageBindingKeyMeta);
    }
    /** creates a tree in the indexed db storage */
    async createIdentityMerkleTrees(identifier) {
        if (!identifier) {
            identifier = `${uuid.v4()}`;
        }
        const existingBinging = await (0, idb_keyval_1.get)(identifier, this._bindingStore);
        if (existingBinging) {
            throw new Error(`Present merkle tree meta information in the store for current identifier ${identifier}`);
        }
        const treesMeta = (0, utils_1.createMerkleTreeMetaInfo)(identifier);
        await (0, idb_keyval_1.set)(identifier, treesMeta, this._merkleTreeMetaStore);
        return treesMeta;
    }
    /**
     *
     * getIdentityMerkleTreesInfo from the indexed db storage
     * @param {string} identifier
     * @returns `{Promise<IdentityMerkleTreeMetaInformation[]>}`
     */
    async getIdentityMerkleTreesInfo(identifier) {
        const meta = await (0, idb_keyval_1.get)(identifier, this._merkleTreeMetaStore);
        if (meta) {
            return meta;
        }
        throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
    }
    /** get merkle tree from the indexed db storage */
    async getMerkleTreeByIdentifierAndType(identifier, mtType) {
        const meta = await (0, idb_keyval_1.get)(identifier, this._merkleTreeMetaStore);
        const err = new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
        if (!meta) {
            throw err;
        }
        const resultMeta = meta.find((m) => m.identifier === identifier && m.type === mtType);
        if (!resultMeta) {
            throw err;
        }
        return new js_merkletree_1.Merkletree(new js_merkletree_1.IndexedDBStorage((0, js_merkletree_1.str2Bytes)(resultMeta.treeId)), true, this._mtDepth);
    }
    /** adds to merkle tree in the indexed db storage */
    async addToMerkleTree(identifier, mtType, hindex, hvalue) {
        const meta = await (0, idb_keyval_1.get)(identifier, this._merkleTreeMetaStore);
        if (!meta) {
            throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
        }
        const resultMeta = meta.find((m) => m.identifier === identifier && m.type === mtType);
        if (!resultMeta) {
            throw new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
        }
        const tree = new js_merkletree_1.Merkletree(new js_merkletree_1.IndexedDBStorage((0, js_merkletree_1.str2Bytes)(resultMeta.treeId)), true, this._mtDepth);
        await tree.add(hindex, hvalue);
    }
    /** binds merkle tree in the indexed db storage to the new identifiers */
    async bindMerkleTreeToNewIdentifier(oldIdentifier, newIdentifier) {
        const meta = await (0, idb_keyval_1.get)(oldIdentifier, this._merkleTreeMetaStore);
        if (!meta || !meta?.length) {
            throw new Error(`Merkle tree meta not found for identifier ${oldIdentifier}`);
        }
        const treesMeta = meta.map((m) => ({
            ...m,
            identifier: newIdentifier
        }));
        await (0, idb_keyval_1.del)(oldIdentifier, this._merkleTreeMetaStore);
        await (0, idb_keyval_1.set)(newIdentifier, treesMeta, this._merkleTreeMetaStore);
        await (0, idb_keyval_1.set)(oldIdentifier, newIdentifier, this._bindingStore);
    }
}
exports.MerkleTreeIndexedDBStorage = MerkleTreeIndexedDBStorage;
/**
 * key for the storage key metadata
 *
 * @static
 */
MerkleTreeIndexedDBStorage.storageKeyMeta = 'merkle-tree-meta';
MerkleTreeIndexedDBStorage.storageBindingKeyMeta = 'binding-did';
//# sourceMappingURL=merkletree.js.map