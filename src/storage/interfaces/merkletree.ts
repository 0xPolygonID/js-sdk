import { Merkletree } from '@iden3/js-merkletree';
import { IdentityMerkleTreeMetaInformation, MerkleTreeType } from '../entities/mt';

export interface IMerkleTreeStorage {
  createIdentityMerkleTrees(identifier: string): Promise<IdentityMerkleTreeMetaInformation[]>;

  addToMerkleTree(
    identifier: string,
    mtType: MerkleTreeType,
    hindex: bigint,
    hvalue: bigint
  ): Promise<void>;

  getMerkleTreeByIdentifierAndType(
    identifier: string,
    mtType: MerkleTreeType
  ): Promise<Merkletree | undefined>;

  bindMerkleTreeToNewIdentifier(oldIdentifier: string, newIdentifier: string): Promise<void>;
}
