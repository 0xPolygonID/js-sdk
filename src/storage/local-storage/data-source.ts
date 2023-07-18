/* eslint-disable @typescript-eslint/no-explicit-any */
import { StorageErrors } from '../errors';
import { IDataSource } from '../interfaces/data-source';

/**
 * Storage in the browser, uses local storage
 *
 * @export
 * @beta
 * @class BrowserDataSource
 * @template Type
 */
export class BrowserDataSource<Type> implements IDataSource<Type> {
  /**
   * Creates an instance of BrowserDataSource.
   * @param {string} _localStorageKey - key string to put storage name in the local storage
   */
  constructor(private _localStorageKey: string) {
    const data = localStorage.getItem(this._localStorageKey);
    if (!data) {
      localStorage.setItem(_localStorageKey, JSON.stringify([]));
    }
  }

  /**
   *
   * saves value to the local storage
   * @param {string} key - key value
   * @param {Type} value - value to store
   * @param {string} [keyName='id'] -  key name
   */
  async save(key: string, value: Type, keyName = 'id'): Promise<void> {
    if (localStorage) {
      const data = localStorage.getItem(this._localStorageKey);
      let items: Type[] = [];
      if (data) {
        items = JSON.parse(data) as Type[];
      }
      const itemIndex = items.findIndex((i: any): boolean => i[keyName] === key);
      if (itemIndex === -1) {
        items.push(value);
      } else {
        items[itemIndex] = value;
      }
      localStorage.setItem(this._localStorageKey, JSON.stringify(items));
    }
  }

  /**
   * gets value from the local storage by given key
   * @param {string} key - key value
   * @param {string}  [keyName='id'] -  key name
   */

  async get(key: string, keyName = 'id'): Promise<Type | undefined> {
    const data = localStorage.getItem(this._localStorageKey);
    let parsedData: Type[] = [];
    if (data) {
      parsedData = JSON.parse(data) as Type[];
    }
    return parsedData.find((t: any) => t[keyName] === key);
  }

  /**
   * loads all from the local storage
   */
  async load(): Promise<Type[]> {
    const data = localStorage.getItem(this._localStorageKey);
    return data && JSON.parse(data);
  }
  /**
   * deletes item from the local storage
   * @param {string} key - key value
   * @param {string}  [keyName='id'] -  key name
   */
  async delete(key: string, keyName = 'id'): Promise<void> {
    const dataStr = localStorage.getItem(this._localStorageKey);
    let data: Type[] = [];
    if (dataStr) {
      data = JSON.parse(dataStr) as Type[];
    }
    const items = data.filter((i: any) => i[keyName] !== key);
    if (data.length === items.length) {
      throw new Error(`${StorageErrors.ItemNotFound} to delete: ${key}`);
    }
    localStorage.setItem(this._localStorageKey, JSON.stringify(items));
  }
}
