/* eslint-disable @typescript-eslint/no-explicit-any */
import { StorageErrors } from '../errors';
import { IDataSource } from '../interfaces/data-source';

/**
 * Generic Memory Data Source
 *
 * @public
 * @class InMemoryDataSource - class
 * @template Type
 */
export class InMemoryDataSource<Type> implements IDataSource<Type> {
  private _data: Type[] = [];

  /** saves in the memory */
  async save(key: string, value: Type, keyName = 'id'): Promise<void> {
    const itemIndex = this._data.findIndex((i: any) => i[keyName] === key);
    if (itemIndex === -1) {
      this._data.push(value);
    } else {
      this._data[itemIndex] = value;
    }
  }

  /** gets value from from the memory */
  async get(key: string, keyName = 'id'): Promise<Type | undefined> {
    return this._data.find((t: any) => t[keyName] === key);
  }

  /** loads from value from the memory */
  async load(): Promise<Type[]> {
    return Array.from(this._data.values());
  }

  /** deletes from value from the memory */
  async delete(key: string, keyName = 'id'): Promise<void> {
    const newData = this._data.filter((i: any) => i[keyName] !== key);

    if (newData.length === this._data.length) {
      throw new Error(`${StorageErrors.ItemNotFound} to delete: ${key}`);
    }

    this._data = newData;
  }
}
