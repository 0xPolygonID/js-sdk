import { JsonDocumentObject, ZeroKnowledgeProofRequest } from '../iden3comm';
import { IdentityMerkleTreeMetaInformation, MerkleTreeType } from './entities';
import { sha256, toUtf8Bytes } from 'ethers';

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

export const createZkpRequestCacheKey = (
  version: CACHE_KEY_VERSION,
  r: ZeroKnowledgeProofRequest,
  credId: string
) => {
  const cs = r.query.credentialSubject
    ? Object.keys(r.query.credentialSubject)
        .sort()
        .map((k) => `${k}:${JSON.stringify((r.query.credentialSubject as JsonDocumentObject)[k])}`)
        .join('|')
    : '';
  const params = r.params
    ? Object.keys(r.params)
        .sort()
        .map((k) => `${k}:${(r.params as any)[k]}`)
        .join('|')
    : '';
  const s =
    `credId=${credId}|id=${r.id}|circuit=${r.circuitId}|opt=${!!r.optional}|` +
    `ctx=${r.query.context}|type=${r.query.type}|proofType=${r.query.proofType ?? ''}|` +
    `rev=${r.query.skipClaimRevocationCheck ?? ''}|group=${r.query.groupId ?? ''}|` +
    `issuers=[${r.query.allowedIssuers.sort().join(',')}]|` +
    `cs={${cs}}|params=${params}`;
  return `${version}:${sha256(toUtf8Bytes(s))}`;
};
