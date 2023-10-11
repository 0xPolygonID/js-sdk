import { MerkleTreeType } from './entities';
export const MERKLE_TREE_TYPES = [
    MerkleTreeType.Claims,
    MerkleTreeType.Revocations,
    MerkleTreeType.Roots
];
export const createMerkleTreeMetaInfo = (identifier) => {
    const treesMeta = [];
    for (let index = 0; index < MERKLE_TREE_TYPES.length; index++) {
        const mType = MERKLE_TREE_TYPES[index];
        const treeId = `${identifier}+${mType}`;
        treesMeta.push({ treeId, identifier, type: mType });
    }
    return treesMeta;
};
//# sourceMappingURL=utils.js.map