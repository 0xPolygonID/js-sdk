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
  save(key: string, value: Type, keyName = 'id'): void {
    if (localStorage) {
      const data = localStorage.getItem(this._localStorageKey);
      const items = JSON.parse(data) as Type[];
      const itemIndex = items.findIndex((i) => i[keyName] === key);
      if (itemIndex === -1) {
        items.push(value);
      } else {
        items[itemIndex] = value;
      }
      localStorage.setItem(this._localStorageKey, JSON.stringify(items));
    }
  }

  /**
   * updates data with a total reset
   *
   * @param {Type[]} value - value array to update
   */
  patchData(value: Type[]): void {
    if (localStorage) {
      localStorage.setItem(this._localStorageKey, JSON.stringify(value));
    }
  }

  /**
   * gets value from the local storage by given key
   * @param {string} key - key value
   * @param {string}  [keyName='id'] -  key name
   */

  get(key: string, keyName = 'id'): Type | undefined {
    const data = localStorage.getItem(this._localStorageKey);
    const parsedData = data && (JSON.parse(data) as Type[]);
    return parsedData.find((t) => t[keyName] === key);
  }

  /**
   * loads all from the local storage
   */
  load(): Type[] {
    const data = localStorage.getItem(this._localStorageKey);
    return data && JSON.parse(data);
  }
  /**
   * deletes item from the local storage
   * @param {string} key - key value
   * @param {string}  [keyName='id'] -  key name
   */
  delete(key: string, keyName = 'id'): void {
    const dataStr = localStorage.getItem(this._localStorageKey);
    const data = JSON.parse(dataStr) as Type[];
    const items = data.filter((i) => i[keyName] !== key);
    if (data.length === items.length) {
      throw new Error(`${StorageErrors.ItemNotFound} to delete: ${key}`);
    }
    localStorage.setItem(this._localStorageKey, JSON.stringify(items));
  }
}
