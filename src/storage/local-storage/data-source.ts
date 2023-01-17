import { IDataSource } from '../interfaces/data-source';

export class BrowserDataSource<Type> implements IDataSource<Type> {
  constructor(private _localStorageKey: string) {
    const data = localStorage.getItem(this._localStorageKey);
    if (!data) {
      localStorage.setItem(_localStorageKey, JSON.stringify([]));
    }
  }
 
  save(key: string, value: Type, keyName = 'key'): void {
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
  get(key: string, keyName = key): Type | undefined {
    const data = localStorage.getItem(this._localStorageKey);
    const parsedData = data && (JSON.parse(data) as Type[]);
    return parsedData.find((t) => t[keyName] === key);
  }
  load(): Type[] {
    const data = localStorage.getItem(this._localStorageKey);
    return data && JSON.parse(data);
  }
  delete(key: string, keyName = 'key'): void {
    const data = localStorage.getItem(this._localStorageKey);
    let items = JSON.parse(data) as Type[];
    items = items.filter((i) => i[keyName] !== key);
    localStorage.set(this._localStorageKey, items);
  }
}
