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
exports.InMemoryMerkleTreeStorage = void 0;
const js_merkletree_1 = require("@iden3/js-merkletree");
const uuid = __importStar(require("uuid"));
const utils_1 = require("../utils");
/**
 *
 *
 * @public
 * @class InMemoryMerkleTreeStorage
 * @implements implements IMerkleTreeStorage interface
 */
class InMemoryMerkleTreeStorage {
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
        utils_1.MERKLE_TREE_TYPES.forEach((t) => {
            const treeId = identifier.concat('+' + t.toString());
            const tree = new js_merkletree_1.Merkletree(new js_merkletree_1.InMemoryDB((0, js_merkletree_1.str2Bytes)(treeId)), true, this.mtDepth);
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
exports.InMemoryMerkleTreeStorage = InMemoryMerkleTreeStorage;
//# sourceMappingURL=merkletree.js.map