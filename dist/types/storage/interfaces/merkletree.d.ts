import { Merkletree } from '@iden3/js-merkletree';
import { IdentityMerkleTreeMetaInformation, MerkleTreeType } from '../entities/mt';
/**
 * Interface to work with a merkle tree storage
 *
 * @public
 * @interface   IMerkleTreeStorage
 */
export interface IMerkleTreeStorage {
    /**
     * creates merkle tree in the storage
     *
     * @param {string} identifier
     * @returns `Promise<IdentityMerkleTreeMetaInformation[]>`
     */
    createIdentityMerkleTrees(identifier: string): Promise<IdentityMerkleTreeMetaInformation[]>;
    /**
     * adds entry to merkle tree
     *
     * @param {string} identifier - identifier to which tree belongs
     * @param {MerkleTreeType} mtType - merkle tree type
     * @param {bigint} hindex - hash index
     * @param {bigint} hvalue - hash value
     * @returns `Promise<void>`
     */
    addToMerkleTree(identifier: string, mtType: MerkleTreeType, hindex: bigint, hvalue: bigint): Promise<void>;
    /**
     * gets merkle tree by identifier and type
     *
     * @param {string} identifier     - identifier for tree
     * @param {MerkleTreeType} mtType - merkle tree type
     * @returns `{Promise<Merkletree>}`
     */
    getMerkleTreeByIdentifierAndType(identifier: string, mtType: MerkleTreeType): Promise<Merkletree>;
    /**
     * binding to be able to update identifier that belongs to tree
     *
     * @param {string} oldIdentifier -
     * @param {string} newIdentifier -
     * @returns `{Promise<void>}`
     */
    bindMerkleTreeToNewIdentifier(oldIdentifier: string, newIdentifier: string): Promise<void>;
}
