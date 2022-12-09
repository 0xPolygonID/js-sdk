import { Id } from '@iden3/js-iden3-core';
import { Merkletree, Proof, Hash, Entry, InMemoryDB, str2Bytes } from '@iden3/js-merkletree';
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
    private _identifier: Id | null,
    private _trees: Merkletree[],
    private _imtModels: IdentityMerkleTree[],
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

  // todo: implement initialization
  static createIdentityMerkleTrees(): IdentityMerkleTrees {
    const trees = mtTypes.map(() => new Merkletree(new InMemoryDB(str2Bytes('')), true, mtDepth));
    const mtrees = mtTypes.map(() => ({} as IdentityMerkleTree));
    return new IdentityMerkleTrees(null, trees, mtrees, {} as IDataStorage);
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

  async addEntry(entry: Entry) {
    const { hi, hv } = await entry.hiHv();
    await this._trees[MerkleTreeType.Claims].add(hi.bigInt(), hv.bigInt());
  }

  bindToIdentifier(identifier: Id): void {
    if (this._identifier != null) {
      throw new Error("can't change not empty identifier");
    }

    if (this._imtModels.length < mtTypesCount) {
      throw new Error("can't change not empty identifier");
    }

    this._identifier = identifier;

    for (const mtType of mtTypes) {
      this._imtModels[mtType].identifier = identifier.string();
      // save to db
    }
  }
}
