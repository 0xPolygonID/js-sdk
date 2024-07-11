import { UseStore, createStore, get, set, entries } from 'idb-keyval';
import { AbstractPrivateKeyStore } from './abstract-key-store';

/**
 * Allows storing keys in the indexed db storage of the browser
 * (NOT ENCRYPTED: DO NOT USE IN THE PRODUCTION)
 *
 * @public
 * @class IndexedDBPrivateKeyStore
 * @implements implements AbstractPrivateKeyStore interface
 */
export class IndexedDBPrivateKeyStore implements AbstractPrivateKeyStore {
  static readonly storageKey = 'keystore';
  private readonly _store: UseStore;

  constructor() {
    this._store = createStore(
      `${IndexedDBPrivateKeyStore.storageKey}-db`,
      IndexedDBPrivateKeyStore.storageKey
    );
  }

  /**
   * get all keys
   *
   * @abstract
   * @returns `Promise<{ alias: string; key: string }[]>`
   */
  async list(): Promise<{ alias: string; key: string }[]> {
    const allEntries = await entries(this._store);
    return allEntries.map(([alias, key]) => ({ alias, key: key.value })) as unknown as {
      alias: string;
      key: string;
    }[];
  }

  /**
   * Gets key from the indexed db storage
   *
   * @param {{ alias: string }} args
   * @returns hex string
   */
  async get(args: { alias: string }): Promise<string> {
    const key = await get(args.alias, this._store);
    if (!key) {
      throw new Error('no key under given alias');
    }
    return key.value;
  }

  /**
   * Import key to the indexed db storage
   *
   * @param {{ alias: string; key: string }} args - alias and private key in the hex
   * @returns void
   */
  async importKey(args: { alias: string; key: string }): Promise<void> {
    await set(args.alias, { value: args.key }, this._store);
  }
}
