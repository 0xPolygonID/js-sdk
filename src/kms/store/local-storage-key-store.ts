import { AbstractPrivateKeyStore } from './abstract-key-store';

export class LocalStoragePrivateKeyStore implements AbstractPrivateKeyStore {
  static readonly storageKey = 'keystore';
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
