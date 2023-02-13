/**
 * Interface to store metadata about merkle tree
 *
 * @export
 * @beta
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
 * @export
 * @enum {number}
 */
export enum MerkleTreeType {
  // Claims is merkle tree type for claims tree
  Claims = 0,
  // Revocations is merkle tree type for revocations tree
  Revocations = 1,
  // Roots is merkle tree type for roots tree
  Roots = 2
}
