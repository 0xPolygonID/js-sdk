import { DID } from '@iden3/js-iden3-core';
import { ZeroKnowledgeProofRequest } from '../iden3comm';
import { IdentityMerkleTreeMetaInformation, MerkleTreeType } from './entities';
import { sha256 } from 'ethers';
import canonicalizeData from 'canonicalize';
import { byteEncoder } from '../utils';

export const MERKLE_TREE_TYPES: MerkleTreeType[] = [
  MerkleTreeType.Claims,
  MerkleTreeType.Revocations,
  MerkleTreeType.Roots
];

export const createMerkleTreeMetaInfo = (
  identifier: string
): IdentityMerkleTreeMetaInformation[] => {
  const treesMeta: IdentityMerkleTreeMetaInformation[] = [];
  for (let index = 0; index < MERKLE_TREE_TYPES.length; index++) {
    const mType = MERKLE_TREE_TYPES[index];
    const treeId = `${identifier}+${mType}`;
    treesMeta.push({ treeId, identifier, type: mType });
  }
  return treesMeta;
};

export enum CACHE_KEY_VERSION {
  V1 = 'v1'
}

/**
 * @beta
 * Creates a cache key for a zero-knowledge proof request.
 * @param version - The cache key version.
 * @param profileDID - The DID of the profile.
 * @param r - The zero-knowledge proof request.
 * @param credId - The credential ID.
 */
export const createZkpRequestCacheKey = (
  version: CACHE_KEY_VERSION,
  profileDID: DID,
  r: ZeroKnowledgeProofRequest,
  credId: string
) => {
  const payload = {
    ...r,
    query: {
      ...r.query,
      allowedIssuers: [...r.query.allowedIssuers].sort()
    }
  };
  const canonical = canonicalizeData(payload);
  if (!canonical) {
    throw new Error('Failed to canonicalize ZKP request');
  }
  const requestCanonicalBytes = byteEncoder.encode(canonical);
  return `${version}:${profileDID.string()}:${credId}:${sha256(requestCanonicalBytes)}`;
};
