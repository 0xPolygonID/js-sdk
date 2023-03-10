import { StorageErrors } from '../errors';
import { IDataSource } from '../interfaces/data-source';

/**
 * Generic Memory Data Source
 *
 * @export
 * @beta
 * @class InMemoryDataSource - class
 * @template Type
 */
export class InMemoryDataSource<Type> implements IDataSource<Type> {
  private _data: Type[] = [];

  /** saves in the memory */
  async save(key: string, value: Type, keyName = 'id'): Promise<void> {
    const itemIndex = this._data.findIndex((i) => i[keyName] === key);
    if (itemIndex === -1) {
      this._data.push(value);
    } else {
      this._data[itemIndex] = value;
    }
  }

  /** updates in the memory */
  async patchData(value: Type[]): Promise<void> {
    this._data = value;
  }
  /** gets value from from the memory */
  async get(key: string, keyName = 'id'): Promise<Type | undefined> {
    return this._data.find((t) => t[keyName] === key);
  }
  /** loads from value from the memory */
  async load(): Promise<Type[]> {
    return this._data;
  }
  /** deletes from value from the memory */
  async delete(key: string, keyName = 'id'): Promise<void> {
    const newData = this._data.filter((i) => i[keyName] !== key);

    if (newData.length === this._data.length) {
      throw new Error(`${StorageErrors.ItemNotFound} to delete: ${key}`);
    }

    this._data = newData;
  }
}
