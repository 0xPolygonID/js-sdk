import { Id } from '@iden3/js-iden3-core';
import { Merkletree, Proof, Hash } from '@iden3/js-merkletree';
import { IDataStorage } from '../storage';

const errorMsgNotCreated = 'identity merkle trees were not created';

export enum MerkleTreeType {
  // Claims is merkle tree type for claims tree
  Claims = 0,
  // Revocations is merkle tree type for revocations tree
  Revocations = 1,
  // Roots is merkle tree type for roots tree
  Roots = 2
}

const mtTypes = [MerkleTreeType.Claims, MerkleTreeType.Revocations, MerkleTreeType.Roots];

const mtTypesCount = 3;

const mtDepth = 40;

// IdentityMerkleTree model
export interface IdentityMerkleTree {
  id: number;
  identifier: string;
  type: MerkleTreeType;
}

//todo: reorganize this class and dependencies
export class IdentityMerkleTrees {
  constructor(
    private readonly _identifier: Id,
    private readonly _trees: Merkletree[],
    private readonly _imtModels: IdentityMerkleTree[],
    private readonly _storage: IDataStorage
  ) {}

  claimsTree(): Merkletree {
    if (this._trees.length < mtTypesCount) {
      throw new Error(errorMsgNotCreated);
    }
    return this._trees[MerkleTreeType.Claims];
  }
  // GenerateRevocationProof generates the proof of existence (or non-existence) of an nonce in RevocationTree
  async generateRevocationProof(nonce: bigint, root: Hash): Promise<Proof> {
    return (await this._trees[MerkleTreeType.Revocations].generateProof(nonce, root))?.proof;
  }

  // GetIdentityMerkleTrees loads merkle trees of the identity into
  // IdentityMerkleTrees structure
  // todo: storage interface
  static async getIdentityMerkleTrees(identifier: Id): Promise<IdentityMerkleTrees> {
    const trees: Merkletree[] = new Array(mtTypesCount);

    const imtModels: IdentityMerkleTree[] = new Array(mtTypesCount);

    const imts: IdentityMerkleTree[] = this.getMerkleTreeByIdentifierAndTypes(identifier);

    for (const mtType of mtTypes) {
      const imt = imts.find((i) => mtType === i.type) ?? ({} as IdentityMerkleTree);
      imtModels[mtType] = imt;
      //todo: sql
      //todo: storage
      // const tree = new Merkletree({} as unknown, true, mtDepth);
      trees[mtType] = {} as Merkletree;
    }
    return new IdentityMerkleTrees(identifier, trees, imtModels, {} as IDataStorage);
  }

  static getMerkleTreeByIdentifierAndTypes(identifier: Id): IdentityMerkleTree[] {
    throw new Error('Method not implemented.');
  }
}
