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
exports.MerkleTreeLocalStorage = void 0;
const js_merkletree_1 = require("@iden3/js-merkletree");
const uuid = __importStar(require("uuid"));
const utils_1 = require("../utils");
/**
 * Merkle tree storage that uses browser local storage
 *
 * @public
 * @class MerkleTreeLocalStorage
 * @implements implements IMerkleTreeStorage interface
 */
class MerkleTreeLocalStorage {
    /**
     * Creates an instance of MerkleTreeLocalStorage.
     * @param {number} _mtDepth
     */
    constructor(_mtDepth) {
        this._mtDepth = _mtDepth;
    }
    /** creates a tree in the local storage */
    async createIdentityMerkleTrees(identifier) {
        if (!identifier) {
            identifier = `${uuid.v4()}`;
        }
        const meta = localStorage.getItem(MerkleTreeLocalStorage.storageKeyMeta);
        if (meta) {
            const metaInfo = JSON.parse(meta);
            const presentMetaForIdentifier = metaInfo.find((m) => m.treeId === `${identifier}+${m.type}`);
            if (presentMetaForIdentifier) {
                throw new Error(`Present merkle tree meta information in the store for current identifier ${identifier}`);
            }
            const identityMetaInfo = metaInfo.filter((m) => m.identifier === identifier);
            if (identityMetaInfo.length > 0) {
                return identityMetaInfo;
            }
            const treesMeta = (0, utils_1.createMerkleTreeMetaInfo)(identifier);
            localStorage.setItem(MerkleTreeLocalStorage.storageKeyMeta, JSON.stringify([...metaInfo, ...treesMeta]));
            return [...metaInfo, ...treesMeta];
        }
        const treesMeta = (0, utils_1.createMerkleTreeMetaInfo)(identifier);
        localStorage.setItem(MerkleTreeLocalStorage.storageKeyMeta, JSON.stringify(treesMeta));
        return treesMeta;
    }
    /**
     *
     * getIdentityMerkleTreesInfo from the local storage
     * @param {string} identifier
     * @returns `{Promise<IdentityMerkleTreeMetaInformation[]>}`
     */
    async getIdentityMerkleTreesInfo(identifier) {
        const meta = localStorage.getItem(MerkleTreeLocalStorage.storageKeyMeta);
        if (meta) {
            const metaInfo = JSON.parse(meta);
            return metaInfo.filter((m) => m.identifier === identifier);
        }
        throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
    }
    /** get merkle tree from the local storage */
    async getMerkleTreeByIdentifierAndType(identifier, mtType) {
        const resultMeta = this.getMeta(identifier, mtType);
        return new js_merkletree_1.Merkletree(new js_merkletree_1.LocalStorageDB((0, js_merkletree_1.str2Bytes)(resultMeta.treeId)), true, this._mtDepth);
    }
    getMeta(identifier, mtType) {
        const meta = localStorage.getItem(MerkleTreeLocalStorage.storageKeyMeta);
        const err = new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
        if (!meta) {
            throw err;
        }
        const metaInfo = JSON.parse(meta);
        const resultMeta = metaInfo.filter((m) => m.identifier === identifier && m.type === mtType)[0];
        if (!resultMeta) {
            throw err;
        }
        return resultMeta;
    }
    /** adds to merkle tree in the local storage */
    async addToMerkleTree(identifier, mtType, hindex, hvalue) {
        const resultMeta = this.getMeta(identifier, mtType);
        const tree = new js_merkletree_1.Merkletree(new js_merkletree_1.LocalStorageDB((0, js_merkletree_1.str2Bytes)(resultMeta.treeId)), true, this._mtDepth);
        await tree.add(hindex, hvalue);
    }
    /** binds merkle tree in the local storage to the new identifiers */
    async bindMerkleTreeToNewIdentifier(oldIdentifier, newIdentifier) {
        const meta = localStorage.getItem(MerkleTreeLocalStorage.storageKeyMeta);
        if (!meta) {
            throw new Error(`Merkle tree meta not found for identifier ${oldIdentifier}`);
        }
        const metaInfo = JSON.parse(meta);
        const treesMeta = metaInfo
            .filter((m) => m.identifier === oldIdentifier)
            .map((m) => ({ ...m, identifier: newIdentifier }));
        if (treesMeta.length === 0) {
            throw new Error(`Merkle tree meta not found for identifier ${oldIdentifier}`);
        }
        const newMetaInfo = [...metaInfo.filter((m) => m.identifier !== oldIdentifier), ...treesMeta];
        localStorage.setItem(MerkleTreeLocalStorage.storageKeyMeta, JSON.stringify(newMetaInfo));
    }
}
exports.MerkleTreeLocalStorage = MerkleTreeLocalStorage;
/**
 * key for the storage key metadata
 *
 * @static
 */
MerkleTreeLocalStorage.storageKeyMeta = 'merkle-tree-meta';
//# sourceMappingURL=merkletree.js.map