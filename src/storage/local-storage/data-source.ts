import { StorageErrors } from '../errors';
import { IDataSource } from '../interfaces/data-source';

export class BrowserDataSource<Type> implements IDataSource<Type> {
  constructor(private _localStorageKey: string) {
    const data = localStorage.getItem(this._localStorageKey);
    if (!data) {
      localStorage.setItem(_localStorageKey, JSON.stringify([]));
    }
  }

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

  patchData(value: Type[]): void {
    if (localStorage) {
      localStorage.setItem(this._localStorageKey, JSON.stringify(value));
    }
  }

  get(key: string, keyName = 'id'): Type | undefined {
    const data = localStorage.getItem(this._localStorageKey);
    const parsedData = data && (JSON.parse(data) as Type[]);
    return parsedData.find((t) => t[keyName] === key);
  }

  load(): Type[] {
    const data = localStorage.getItem(this._localStorageKey);
    return data && JSON.parse(data);
  }

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
