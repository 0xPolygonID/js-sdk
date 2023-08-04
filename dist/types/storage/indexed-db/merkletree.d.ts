import { Merkletree } from '@iden3/js-merkletree';
import { IdentityMerkleTreeMetaInformation, MerkleTreeType } from '../entities/mt';
import { IMerkleTreeStorage } from '../interfaces/merkletree';
/**
 * Merkle tree storage that uses browser indexed db storage
 *
 * @public
 * @class MerkleTreeIndexedDBStorage
 * @implements implements IMerkleTreeStorage interface
 */
export declare class MerkleTreeIndexedDBStorage implements IMerkleTreeStorage {
    private readonly _mtDepth;
    /**
     * key for the storage key metadata
     *
     * @static
     */
    static readonly storageKeyMeta = "merkle-tree-meta";
    static readonly storageBindingKeyMeta = "binding-did";
    private readonly _merkleTreeMetaStore;
    private readonly _bindingStore;
    /**
     * Creates an instance of MerkleTreeIndexedDBStorage.
     * @param {number} _mtDepth
     */
    constructor(_mtDepth: number);
    /** creates a tree in the indexed db storage */
    createIdentityMerkleTrees(identifier: string): Promise<IdentityMerkleTreeMetaInformation[]>;
    /**
     *
     * getIdentityMerkleTreesInfo from the indexed db storage
     * @param {string} identifier
     * @returns `{Promise<IdentityMerkleTreeMetaInformation[]>}`
     */
    getIdentityMerkleTreesInfo(identifier: string): Promise<IdentityMerkleTreeMetaInformation[]>;
    /** get merkle tree from the indexed db storage */
    getMerkleTreeByIdentifierAndType(identifier: string, mtType: MerkleTreeType): Promise<Merkletree>;
    /** adds to merkle tree in the indexed db storage */
    addToMerkleTree(identifier: string, mtType: MerkleTreeType, hindex: bigint, hvalue: bigint): Promise<void>;
    /** binds merkle tree in the indexed db storage to the new identifiers */
    bindMerkleTreeToNewIdentifier(oldIdentifier: string, newIdentifier: string): Promise<void>;
}
