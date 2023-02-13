import { LocalStorageDB, Merkletree, str2Bytes } from '@iden3/js-merkletree';
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
export class MerkleTreeLocalStorage implements IMerkleTreeStorage {
  /**
   * key for the local storage
   *
   * @static
   */
  static readonly storageKey = 'merkle-tree';
  /**
   * key for the storage key metadata
   *
   * @static
   */
  static readonly storageKeyMeta = 'merkle-tree-meta';

  /**
   * Creates an instance of MerkleTreeLocalStorage.
   * @param {number} _mtDepth
   */
  constructor(private readonly _mtDepth: number) {}

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
    const meta = localStorage.getItem(MerkleTreeLocalStorage.storageKeyMeta);
    if (meta) {
      const metaInfo: IdentityMerkleTreeMetaInformation[] = JSON.parse(meta);
      const identityMetaInfo = metaInfo.filter((m) => m.identifier === identifier);
      if (identityMetaInfo.length > 0) {
        return identityMetaInfo;
      }
      const treesMeta = createMetaInfo();
      localStorage.setItem(
        MerkleTreeLocalStorage.storageKeyMeta,
        JSON.stringify([...metaInfo, ...treesMeta])
      );
    }
    const treesMeta = createMetaInfo();
    localStorage.setItem(MerkleTreeLocalStorage.storageKeyMeta, JSON.stringify(treesMeta));
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
    const meta = localStorage.getItem(MerkleTreeLocalStorage.storageKeyMeta);
    if (meta) {
      const metaInfo: IdentityMerkleTreeMetaInformation[] = JSON.parse(meta);
      return metaInfo.filter((m) => m.identifier === identifier);
    }
    throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
  }

  /** get merkle tree from the local storage */
  async getMerkleTreeByIdentifierAndType(
    identifier: string,
    mtType: MerkleTreeType
  ): Promise<Merkletree> {
    const meta = localStorage.getItem(MerkleTreeLocalStorage.storageKeyMeta);
    const err = new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
    if (!meta) {
      throw err;
    }

    const metaInfo: IdentityMerkleTreeMetaInformation[] = JSON.parse(meta);
    const resultMeta = metaInfo.filter((m) => m.identifier === identifier && m.type === mtType)[0];
    if (!resultMeta) {
      throw err;
    }
    return new Merkletree(new LocalStorageDB(str2Bytes(resultMeta.treeId)), true, this._mtDepth);
  }
  /** adds to merkle tree in the local storage */
  async addToMerkleTree(
    identifier: string,
    mtType: MerkleTreeType,
    hindex: bigint,
    hvalue: bigint
  ): Promise<void> {
    const meta = localStorage.getItem(MerkleTreeLocalStorage.storageKeyMeta);
    if (!meta) {
      throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
    }

    const metaInfo: IdentityMerkleTreeMetaInformation[] = JSON.parse(meta);
    const resultMeta = metaInfo.filter((m) => m.identifier === identifier && m.type === mtType)[0];
    if (!resultMeta) {
      throw new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
    }

    const tree = new Merkletree(
      new LocalStorageDB(str2Bytes(resultMeta.treeId)),
      true,
      this._mtDepth
    );

    await tree.add(hindex, hvalue);
  }

  /** binds merkle tree in the local storage to the new identifiers */
  async bindMerkleTreeToNewIdentifier(oldIdentifier: string, newIdentifier: string): Promise<void> {
    const meta = localStorage.getItem(MerkleTreeLocalStorage.storageKeyMeta);
    if (!meta) {
      throw new Error(`Merkle tree meta not found for identifier ${oldIdentifier}`);
    }
    const metaInfo: IdentityMerkleTreeMetaInformation[] = JSON.parse(meta);
    const treesMeta = metaInfo
      .filter((m) => m.identifier === oldIdentifier)
      .map((m) => ({ ...m, identifier: newIdentifier }));
    if (treesMeta.length === 0) {
      throw new Error(`Merkle tree meta not found for identifier ${oldIdentifier}`);
    }

    const newMetaInfo = [...metaInfo.filter((m) => m.identifier !== oldIdentifier), ...treesMeta];
    localStorage.setItem(MerkleTreeLocalStorage.storageKeyMeta, JSON.stringify(newMetaInfo));
  }
}
