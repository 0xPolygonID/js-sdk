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
  save(key: string, value: Type, keyName = 'id'): void {
    const itemIndex = this._data.findIndex((i) => i[keyName] === key);
    if (itemIndex === -1) {
      this._data.push(value);
    } else {
      this._data[itemIndex] = value;
    }
  }

  /** updates in the memory */
  patchData(value: Type[]): void {
    this._data = value;
  }
  /** gets value from from the memory */
  get(key: string, keyName = 'id'): Type | undefined {
    return this._data.find((t) => t[keyName] === key);
  }
  /** loads from value from the memory */
  load(): Type[] {
    return this._data;
  }
  /** deletes from value from the memory */
  delete(key: string, keyName = 'id'): void {
    const newData = this._data.filter((i) => i[keyName] !== key);

    if (newData.length === this._data.length) {
      throw new Error(`${StorageErrors.ItemNotFound} to delete: ${key}`);
    }

    this._data = newData;
  }
}
