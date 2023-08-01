import { IdentityMerkleTreeMetaInformation, MerkleTreeType } from './entities';

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
