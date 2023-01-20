import {
  InMemoryDB,
  ITreeStorage,
  LocalStorageDB,
  Merkletree,
  str2Bytes
} from '@iden3/js-merkletree';
import { IdentityMerkleTreeMetaInformation, MerkleTreeType } from '../entities/mt';
import * as uuid from 'uuid';

import { IMerkleTreeStorage } from '../interfaces/merkletree';
import { InMemoryDataSource } from '../memory/data-source';
import { IDataSource } from '../interfaces/data-source';

const mtTypes = [MerkleTreeType.Claims, MerkleTreeType.Revocations, MerkleTreeType.Roots];

declare type TreeWithMetaInfo = {
  tree:Merkletree,
  metaInfo: IdentityMerkleTreeMetaInformation;
};

export class MerkleTreeRepository implements IMerkleTreeStorage {
  constructor(private _mtDepth: number, private source: IDataSource<TreeWithMetaInfo>,  private treeStorageFactory: (treeId: Uint8Array) => ITreeStorage) {}

  async createIdentityMerkleTrees(
    identifier: string
  ): Promise<IdentityMerkleTreeMetaInformation[]> {
    if (!identifier) {
      identifier = `${uuid.v4()}`;
    }

    const treesMeta: IdentityMerkleTreeMetaInformation[] = [];
    mtTypes.forEach((t) => {
      const treeId = identifier.concat('+' + t.toString());

      const treeStorage = this.treeStorageFactory(str2Bytes(treeId));
      const tree = new Merkletree(treeStorage, true, this._mtDepth);

  
      const metaInfo = { treeId, identifier: identifier, type: t };
      //this._data[identifier].push({ tree, metaInfo });

      treesMeta.push(metaInfo);

      // this.source.save(treeId, <TreeSt)

      // treesMeta.push(metaInfo);
    });
    return treesMeta;
  }
  async addToMerkleTree(
    identifier: string,
    mtType: MerkleTreeType,
    hindex: bigint,
    hvalue: bigint
  ): Promise<void> {
    for (let index = 0; index < this._data[identifier].length; index++) {
      if (this._data[identifier][index].metaInfo.type === mtType) {
        await this.source..tree.add(hindex, hvalue);
      }
    }
  }
  getMerkleTreeByIdentifierAndType(identifier: string, mtType: MerkleTreeType): Promise<Merkletree> {
    throw new Error('Method not implemented.');
  }
  bindMerkleTreeToNewIdentifier(oldIdentifier: string, newIdentifier: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

}


export class MerkleTreeService implements IMerkleTreeStorage {
  _data: {
    [v in string]: TreeWithMetaInfo[];
  };
  mtDepth: number;
  constructor(_mtDepth: number, private treeStorageFactory: (treeId: Uint8Array) => ITreeStorage) {
    this.mtDepth = _mtDepth;
    this._data = {};
  }

  async createIdentityMerkleTrees(
    identifier: string
  ): Promise<IdentityMerkleTreeMetaInformation[]> {
    if (!identifier) {
      identifier = `${uuid.v4()}`;
    }
    this._data[identifier] = [];

    const treesMeta: IdentityMerkleTreeMetaInformation[] = [];
    mtTypes.forEach((t) => {
      const treeId = identifier.concat('+' + t.toString());

      const treeStorage = this.treeStorageFactory(str2Bytes(treeId));
      const tree = new Merkletree(treeStorage, true, this.mtDepth);

      const metaInfo = { treeId, identifier: identifier, type: t };
      this._data[identifier].push({ tree, metaInfo });

      treesMeta.push(metaInfo);
    });
    return treesMeta;
  }

  async getIdentityMerkleTreesInfo(
    identifier: string
  ): Promise<IdentityMerkleTreeMetaInformation[]> {
    return this._data[identifier].map((treeWithInfo) => treeWithInfo.metaInfo);
  }

  async getMerkleTreeByIdentifierAndType(
    identifier: string,
    mtType: MerkleTreeType
  ): Promise<Merkletree> {
    const treeWithMeta = this._data[identifier].find(
      (treeWithInfo) => treeWithInfo.metaInfo.type == mtType
    );
    if (!treeWithMeta) {
      throw new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
    }

    return treeWithMeta.tree;
  }

  async addToMerkleTree(
    identifier: string,
    mtType: MerkleTreeType,
    hindex: bigint,
    hvalue: bigint
  ): Promise<void> {
    for (let index = 0; index < this._data[identifier].length; index++) {
      if (this._data[identifier][index].metaInfo.type === mtType) {
        await this._data[identifier][index].tree.add(hindex, hvalue);
      }
    }
  }

  async bindMerkleTreeToNewIdentifier(oldIdentifier: string, newIdentifier: string): Promise<void> {
    this._data[newIdentifier] = [...this._data[oldIdentifier]];
    delete this._data[oldIdentifier];

    this._data[newIdentifier].forEach((treeWithMeta) => {
      treeWithMeta.metaInfo.identifier = newIdentifier;
    });
  }
}
