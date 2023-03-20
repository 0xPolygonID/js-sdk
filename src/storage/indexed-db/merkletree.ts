import { createStore, UseStore, get, set, del } from 'idb-keyval';
import { IndexedDBStorage, Merkletree, str2Bytes } from '@iden3/js-merkletree';
import { IdentityMerkleTreeMetaInformation, MerkleTreeType } from '../entities/mt';
import * as uuid from 'uuid';

import { IMerkleTreeStorage } from '../interfaces/merkletree';

const mtTypes = [MerkleTreeType.Claims, MerkleTreeType.Revocations, MerkleTreeType.Roots];

/**
 * Merkle tree storage that uses browser local storage
 *
 * @export
 * @beta
 * @class MerkleTreeLocalStorage
 * @implements implements IMerkleTreeStorage interface
 */
export class MerkleTreeIndexedDBStorage implements IMerkleTreeStorage {
  /**
   * key for the storage key metadata
   *
   * @static
   */
  static readonly storageKeyMeta = 'merkle-tree-meta';

  private readonly _merkleTreeMetaStore: UseStore;

  /**
   * Creates an instance of MerkleTreeLocalStorage.
   * @param {number} _mtDepth
   */
  constructor(private readonly _mtDepth: number) {
    this._merkleTreeMetaStore = createStore(
      `${MerkleTreeIndexedDBStorage.storageKeyMeta}-db`,
      MerkleTreeIndexedDBStorage.storageKeyMeta
    );
  }

  /** creates a tree in the local storage */
  async createIdentityMerkleTrees(
    identifier: string
  ): Promise<IdentityMerkleTreeMetaInformation[]> {
    if (!identifier) {
      identifier = `${uuid.v4()}`;
    }
    const createMetaInfo = () => {
      const treesMeta: IdentityMerkleTreeMetaInformation[] = [];
      for (let index = 0; index < mtTypes.length; index++) {
        const mType = mtTypes[index];
        const treeId = identifier.concat('+' + mType.toString());
        const metaInfo = { treeId, identifier, type: mType };
        treesMeta.push(metaInfo);
      }
      return treesMeta;
    };
    const meta = await get(identifier, this._merkleTreeMetaStore);
    if (meta) {
      return meta;
    }
    const treesMeta = createMetaInfo();
    await set(identifier, treesMeta, this._merkleTreeMetaStore);
    return treesMeta;
  }
  /**
   *
   * getIdentityMerkleTreesInfo from the local storage
   * @param {string} identifier
   * @returns `{Promise<IdentityMerkleTreeMetaInformation[]>}`
   */
  async getIdentityMerkleTreesInfo(
    identifier: string
  ): Promise<IdentityMerkleTreeMetaInformation[]> {
    const meta = await get(identifier, this._merkleTreeMetaStore);
    if (meta) {
      return meta;
    }
    throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
  }

  /** get merkle tree from the local storage */
  async getMerkleTreeByIdentifierAndType(
    identifier: string,
    mtType: MerkleTreeType
  ): Promise<Merkletree> {
    const meta = await get(identifier, this._merkleTreeMetaStore);
    const err = new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
    if (!meta) {
      throw err;
    }

    const resultMeta = meta.find((m) => m.identifier === identifier && m.type === mtType);
    if (!resultMeta) {
      throw err;
    }
    return new Merkletree(new IndexedDBStorage(str2Bytes(resultMeta.treeId)), true, this._mtDepth);
  }
  /** adds to merkle tree in the local storage */
  async addToMerkleTree(
    identifier: string,
    mtType: MerkleTreeType,
    hindex: bigint,
    hvalue: bigint
  ): Promise<void> {
    const meta = await get(identifier, this._merkleTreeMetaStore);
    if (!meta) {
      throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
    }
    const resultMeta = meta.find((m) => m.identifier === identifier && m.type === mtType);
    if (!resultMeta) {
      throw new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
    }

    const tree = new Merkletree(
      new IndexedDBStorage(str2Bytes(resultMeta.treeId)),
      true,
      this._mtDepth
    );

    await tree.add(hindex, hvalue);
  }

  /** binds merkle tree in the local storage to the new identifiers */
  async bindMerkleTreeToNewIdentifier(oldIdentifier: string, newIdentifier: string): Promise<void> {
    const meta = await get(oldIdentifier, this._merkleTreeMetaStore);
    if (!meta || !meta?.length) {
      throw new Error(`Merkle tree meta not found for identifier ${oldIdentifier}`);
    }

    const treesMeta = meta.map((m) => ({ ...m, identifier: newIdentifier }));

    await set(newIdentifier, treesMeta, this._merkleTreeMetaStore);
    await del(oldIdentifier, this._merkleTreeMetaStore);
  }
}
