import { Merkletree } from '@iden3/js-merkletree';
import { IdentityMerkleTreeMetaInformation, MerkleTreeType } from '../entities/mt';
import { IMerkleTreeStorage } from '../interfaces/merkletree';
export interface TreeWithMetaInfo {
    tree: Merkletree;
    metaInfo: IdentityMerkleTreeMetaInformation;
}
/**
 *
 *
 * @public
 * @class InMemoryMerkleTreeStorage
 * @implements implements IMerkleTreeStorage interface
 */
export declare class InMemoryMerkleTreeStorage implements IMerkleTreeStorage {
    /**
     * key value storage for trees where key is identifier
     *
     * @type {{
     *     [v in string]: TreeWithMetaInfo[];
     *   }}
     */
    _data: {
        [v in string]: TreeWithMetaInfo[];
    };
    /**
     * tree depth
     *
     * @type {number}
     */
    mtDepth: number;
    /**
     * Creates an instance of InMemoryMerkleTreeStorage.
     * @param {number} _mtDepth
     */
    constructor(_mtDepth: number);
    /** create trees in the  memory*/
    createIdentityMerkleTrees(identifier: string): Promise<IdentityMerkleTreeMetaInformation[]>;
    /** get trees meta info from the memory */
    getIdentityMerkleTreesInfo(identifier: string): Promise<IdentityMerkleTreeMetaInformation[]>;
    /** get merkle tree by identifier and type from memory */
    getMerkleTreeByIdentifierAndType(identifier: string, mtType: MerkleTreeType): Promise<Merkletree>;
    /** adds entry to merkle tree in the memory */
    addToMerkleTree(identifier: string, mtType: MerkleTreeType, hindex: bigint, hvalue: bigint): Promise<void>;
    /** bind merkle tree identifier in memory */
    bindMerkleTreeToNewIdentifier(oldIdentifier: string, newIdentifier: string): Promise<void>;
}
