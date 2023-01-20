import { StorageErrors } from '../errors';
import { IDataSource } from '../interfaces/data-source';

export class InMemoryDataSource<Type> implements IDataSource<Type> {
  private _data: Type[] = [];

  save(key: string, value: Type, keyName = 'id'): void {
    const itemIndex = this._data.findIndex((i) => i[keyName] === key);
    if (itemIndex === -1) {
      this._data.push(value);
    } else {
      this._data[itemIndex] = value;
    }
  }

  patchData(value: Type[]): void {
    this._data = value;
  }

  get(key: string, keyName = 'id'): Type | undefined {
    return this._data.find((t) => t[keyName] === key);
  }

  load(): Type[] {
    return this._data;
  }

  delete(key: string, keyName = 'id'): void {
    const newData = this._data.filter((i) => i[keyName] !== key);

    if (newData.length === this._data.length) {
      throw new Error(`${StorageErrors.ItemNotFound} to delete: ${key}`);
    }

    this._data = newData;
  }
}
