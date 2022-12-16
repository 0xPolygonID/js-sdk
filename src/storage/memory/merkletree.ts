import { InMemoryDB, Merkletree, str2Bytes } from '@iden3/js-merkletree';
import { IdentityMerkleTreeMetaInformation, MerkleTreeType } from '../entities/mt';
import * as uuid from 'uuid';

import { IMerkleTreeStorage } from '../interfaces/merkletree';

const mtTypes = [MerkleTreeType.Claims, MerkleTreeType.Revocations, MerkleTreeType.Roots];

declare type TreeWithMetaInfo = {
  tree: Merkletree;
  metaInfo: IdentityMerkleTreeMetaInformation;
};

export class InMemoryMerkleTreeStorage implements IMerkleTreeStorage {
  _data: {
    [v in string]: TreeWithMetaInfo[];
  };
  mtDepth: number;
  constructor(_mtDepth: number) {
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
      const tree = new Merkletree(new InMemoryDB(str2Bytes(treeId)), true, this.mtDepth);

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
