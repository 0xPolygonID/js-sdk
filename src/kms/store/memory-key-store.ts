import { AbstractPrivateKeyStore } from './abstract-key-store';

/**
 * Key Store to use in memory
 *
 * @export
 * @beta
 * @class InMemoryPrivateKeyStore
 * @implements implements AbstractPrivateKeyStore interface
 */
export class InMemoryPrivateKeyStore implements AbstractPrivateKeyStore {
  private _data: Map<string, string>;
  constructor() {
    this._data = new Map<string, string>();
  }
  async get(args: { alias: string }): Promise<string> {
    console.log('get', args.alias);
    const privateKey = this._data.get(args.alias);
    if (!privateKey) {
      throw new Error('no key under given alias');
    }
    return privateKey;
  }

  async import(args: { alias: string; key: string }): Promise<void> {
    console.log('import', args.alias, args.key);
    this._data.set(args.alias, args.key);
  }
}
