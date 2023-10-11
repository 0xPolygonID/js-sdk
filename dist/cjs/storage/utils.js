"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMerkleTreeMetaInfo = exports.MERKLE_TREE_TYPES = void 0;
const entities_1 = require("./entities");
exports.MERKLE_TREE_TYPES = [
    entities_1.MerkleTreeType.Claims,
    entities_1.MerkleTreeType.Revocations,
    entities_1.MerkleTreeType.Roots
];
const createMerkleTreeMetaInfo = (identifier) => {
    const treesMeta = [];
    for (let index = 0; index < exports.MERKLE_TREE_TYPES.length; index++) {
        const mType = exports.MERKLE_TREE_TYPES[index];
        const treeId = `${identifier}+${mType}`;
        treesMeta.push({ treeId, identifier, type: mType });
    }
    return treesMeta;
};
exports.createMerkleTreeMetaInfo = createMerkleTreeMetaInfo;
//# sourceMappingURL=utils.js.map