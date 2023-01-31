import { AbstractPrivateKeyStore } from './abstract-key-store';

/**
 * Allows storing keys in the local storage of the browser
 * (NOT ENCRYPTED: DO NOT USE IN THE PRODUCTION)
 *
 * @export
 * @class LocalStoragePrivateKeyStore
 * @implements {AbstractPrivateKeyStore}
 */
export class LocalStoragePrivateKeyStore implements AbstractPrivateKeyStore {
  static readonly storageKey = 'keystore';
  /**
   * Gets key from the local storage
   *
   * @param {{ alias: string }} args
   * @returns hex string
   */
  async get(args: { alias: string }): Promise<string> {
    const dataStr = localStorage.getItem(LocalStoragePrivateKeyStore.storageKey);
    if (!dataStr) {
      throw new Error('no key under given alias');
    }
    const data = JSON.parse(dataStr);
    const privateKey = data.find((d) => d.id === args.alias);
    if (!privateKey) {
      throw new Error('no key under given alias');
    }
    return privateKey.value;
  }

  /**
   * Import key to the local storage
   *
   * @param {{ alias: string; key: string }} args - alias and private key in the hex
   * @returns void
   */
  async import(args: { alias: string; key: string }): Promise<void> {
    const dataStr = localStorage.getItem(LocalStoragePrivateKeyStore.storageKey);
    let data = [];
    if (dataStr) {
      data = JSON.parse(dataStr);
    }

    const index = data.findIndex((d) => d.id === args.alias);
    if (index > -1) {
      data[index].value = args.key;
    } else {
      data.push({ id: args.alias, value: args.key });
    }
    localStorage.setItem(LocalStoragePrivateKeyStore.storageKey, JSON.stringify(data));
  }
}
