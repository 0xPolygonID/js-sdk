import { IDataSource } from '../interfaces/data-source';

export class InMemoryDataSource<Type> implements IDataSource<Type> {
  private _data: Map<string, Type[]>;

  constructor(private readonly _storageKey: string) {
    this._data = new Map<string, Type[]>();
    this._data.set(_storageKey, []);
  }
  delete(key: string, keyName = 'key'): void {
    let items = this._data.get(this._storageKey);
    items = items.filter((i) => i[keyName] !== key);
    this._data.set(this._storageKey, items);
  }

  load(): Type[] {
    return this._data.get(this._storageKey);
  }
  save(key: string, value: Type, keyName = 'key'): void {
    const items = this._data.get(this._storageKey);

    const itemIndex = items.findIndex((i) => i[keyName] === key);
    if (itemIndex === -1) {
      items.push(value);
    } else {
      items[itemIndex] = value;
    }
    // TODO: check if we can set only one item
    this._data.set(this._storageKey, items);
  }
  get(key: string, keyName = 'key'): Type | undefined {
    return this._data.get(this._storageKey).find((t) => t[keyName] === key);
  }
}
