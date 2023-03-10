/* eslint-disable @typescript-eslint/no-unused-vars */
import { IDataSource } from '../interfaces/data-source';
import { set, get, del, values, createStore, UseStore } from 'idb-keyval';

/**
 * Storage in the browser, uses local storage
 *
 * @export
 * @beta
 * @class BrowserDataSource
 * @template Type
 */
export class IndexedDBDataSource<Type> implements IDataSource<Type> {
  /**
   * Creates an instance of BrowserDataSource.
   *
   * @param {string} _storageKey - key string to put storage name
   */
  private readonly _store: UseStore;
  constructor(private _storageKey: string) {
    this._store = createStore(`${_storageKey}-db`, _storageKey);
  }

  /**
   * Saves value to the local storage
   *
   * @param {string} key - key value
   * @param {Type} value - value to store
   * @param {string} [keyName='id'] -  key name
   */
  async save(key: string, value: Type, keyName = 'id'): Promise<void> {
    return set(key, value, this._store);
  }

  /**
   * Gets value from the local storage by given key
   *
   * @param {string} key - key value
   * @param {string}  [keyName='id'] -  key name
   */

  async get(key: string, keyName = 'id'): Promise<Type | undefined> {
    return get(key, this._store);
  }

  /**
   * loads all from the local storage
   */
  async load(): Promise<Type[]> {
    return values(this._store);
  }
  /**
   * deletes item from the local storage
   * @param {string} key - key value
   * @param {string}  [keyName='id'] -  key name
   */
  async delete(key: string, keyName = 'id'): Promise<void> {
    return del(key, this._store);
  }
}
