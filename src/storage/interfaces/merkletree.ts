import { Entry, Merkletree } from '@iden3/js-merkletree';
import { IdentityMerkleTreeMetaInformation, MerkleTreeType } from '../entities/mt';

export interface IMerkleTreeStorage {
  createIdentityMerkleTrees(identifier?: string): Promise<IdentityMerkleTreeMetaInformation[]>;

  addEntryToMerkleTree(identifier: string, mtType: MerkleTreeType, entry: Entry): Promise<void>;

  getMerkleTreeByIdentifierAndType(identifier: string, mtType: MerkleTreeType): Promise<Merkletree>;
  
  bindMerkleTreeToNewIdentifier(oldIdentifier: string, newIdentifier: string): Promise<void>;
}
