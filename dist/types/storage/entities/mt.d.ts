/**
 * Interface to store metadata about merkle tree
 *
 * @public
 * @interface   IdentityMerkleTreeMetaInformation
 */
export interface IdentityMerkleTreeMetaInformation {
    treeId: string;
    identifier: string;
    type: MerkleTreeType;
}
/**
 * Type of MerkleTree
 *
 * @enum {number}
 */
export declare enum MerkleTreeType {
    Claims = 0,
    Revocations = 1,
    Roots = 2
}
