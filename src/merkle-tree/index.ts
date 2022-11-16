import { Id } from '@iden3/js-iden3-core';
import { Merkletree, Proof, Hash } from '@iden3/js-merkletree';

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

// GetIdentityMerkleTrees loads merkle trees of the identity into
// IdentityMerkleTrees structure
// todo: storage interface
export const getIdentityMerkleTrees = (conn, identifier: Id): IdentityMerkleTrees => {
  const trees: Merkletree[] = new Array(mtTypesCount);

  const imtModels: IdentityMerkleTree[] = new Array(mtTypesCount);

  const imts: IdentityMerkleTree[] = conn.getMerkleTreeByIdentifierAndTypes(
    conn,
    identifier,
    mtTypes
  );

  for (const mtType of mtTypes) {
    const imt = imts.find((i) => mtType === i.type) ?? ({} as IdentityMerkleTree);
    imtModels[mtType] = imt;
    //todo: sql
    const sql = {} as any;
    const treeStorage: Storage = sql.newSqlStorage(conn, imt.id);
    //todo: storage
    const tree = new Merkletree({} as unknown, true, mtDepth);
    trees[mtType] = tree;
  }

  return new IdentityMerkleTrees(identifier, trees, imtModels);
};

// IdentityMerkleTree model
export interface IdentityMerkleTree {
  id: number;
  identifier: string;
  type: MerkleTreeType;
}

export class IdentityMerkleTrees {
  constructor(
    private readonly identifier: Id,
    private readonly trees: Merkletree[],
    private readonly imtModels: IdentityMerkleTree[]
  ) {}

  claimsTree(): Merkletree {
    if (this.trees.length < mtTypesCount) {
      throw new Error(errorMsgNotCreated);
    }
    return this.trees[MerkleTreeType.Claims];
  }
  // GenerateRevocationProof generates the proof of existence (or non-existence) of an nonce in RevocationTree
  async generateRevocationProof(nonce: bigint, root: Hash): Promise<Proof> {
    return (await this.trees[MerkleTreeType.Revocations].generateProof(nonce, root))?.proof;
  }
}
