/**
 * Type of MerkleTree
 *
 * @enum {number}
 */
export var MerkleTreeType;
(function (MerkleTreeType) {
    // Claims is merkle tree type for claims tree
    MerkleTreeType[MerkleTreeType["Claims"] = 0] = "Claims";
    // Revocations is merkle tree type for revocations tree
    MerkleTreeType[MerkleTreeType["Revocations"] = 1] = "Revocations";
    // Roots is merkle tree type for roots tree
    MerkleTreeType[MerkleTreeType["Roots"] = 2] = "Roots";
})(MerkleTreeType || (MerkleTreeType = {}));
//# sourceMappingURL=mt.js.map