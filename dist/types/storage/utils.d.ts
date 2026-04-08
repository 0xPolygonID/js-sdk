import { DID } from '@iden3/js-iden3-core';
import { ZeroKnowledgeProofRequest } from '../iden3comm';
import { IdentityMerkleTreeMetaInformation, MerkleTreeType } from './entities';
export declare const MERKLE_TREE_TYPES: MerkleTreeType[];
export declare const createMerkleTreeMetaInfo: (identifier: string) => IdentityMerkleTreeMetaInformation[];
export declare enum CACHE_KEY_VERSION {
    V1 = "v1"
}
/**
 * @beta
 * Creates a cache key for a zero-knowledge proof request.
 * @param version - The cache key version.
 * @param profileDID - The DID of the profile.
 * @param r - The zero-knowledge proof request.
 * @param credId - The credential ID.
 */
export declare const createZkpRequestCacheKey: (version: CACHE_KEY_VERSION, profileDID: DID, r: ZeroKnowledgeProofRequest, credId: string) => string;
//# sourceMappingURL=utils.d.ts.map