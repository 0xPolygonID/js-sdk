import { Merkletree } from '@iden3/js-merkletree';
import { IdentityMerkleTreeMetaInformation, MerkleTreeType } from '../entities/mt';
import { IMerkleTreeStorage } from '../interfaces/merkletree';
/**
 * Merkle tree storage that uses browser local storage
 *
 * @public
 * @class MerkleTreeLocalStorage
 * @implements implements IMerkleTreeStorage interface
 */
export declare class MerkleTreeLocalStorage implements IMerkleTreeStorage {
    private readonly _mtDepth;
    /**
     * key for the storage key metadata
     *
     * @static
     */
    static readonly storageKeyMeta = "merkle-tree-meta";
    /**
     * Creates an instance of MerkleTreeLocalStorage.
     * @param {number} _mtDepth
     */
    constructor(_mtDepth: number);
    /** creates a tree in the local storage */
    createIdentityMerkleTrees(identifier: string): Promise<IdentityMerkleTreeMetaInformation[]>;
    /**
     *
     * getIdentityMerkleTreesInfo from the local storage
     * @param {string} identifier
     * @returns `{Promise<IdentityMerkleTreeMetaInformation[]>}`
     */
    getIdentityMerkleTreesInfo(identifier: string): Promise<IdentityMerkleTreeMetaInformation[]>;
    /** get merkle tree from the local storage */
    getMerkleTreeByIdentifierAndType(identifier: string, mtType: MerkleTreeType): Promise<Merkletree>;
    private getMeta;
    /** adds to merkle tree in the local storage */
    addToMerkleTree(identifier: string, mtType: MerkleTreeType, hindex: bigint, hvalue: bigint): Promise<void>;
    /** binds merkle tree in the local storage to the new identifiers */
    bindMerkleTreeToNewIdentifier(oldIdentifier: string, newIdentifier: string): Promise<void>;
}
