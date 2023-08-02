/* eslint-disable @typescript-eslint/no-explicit-any */
import { IDataSource } from '../interfaces/data-source';
import { EncryptOptions } from '../../encryption/encryption-options';
import { EncryptionService, IEncryptionService } from '../../encryption';

/**
 * Generic Encrypted Data Source
 *
 * @public
 * @class EncryptedDataSource - class
 * @template Type
 */
export class EncryptedDataSource<Type> implements IDataSource<Type> {
  private readonly _dataSource: IDataSource<string>;
  private readonly _encryptionService: IEncryptionService<Type>;

  constructor(dataSource: IDataSource<string>, opts: EncryptOptions) {
    this._dataSource = dataSource;
    this._encryptionService = new EncryptionService(opts);
  }

  /** saves in the memory */
  async save(key: string, value: Type, keyName = 'id'): Promise<void> {
    const encryptedValue = await this._encryptionService.encrypt(value);
    // console.log('Encrypted:' + encryptedValue);
    this._dataSource.save(key, encryptedValue, keyName);
  }

  /**
   * gets value from the local storage by given key
   * @param {string} key - key value
   * @param {string}  [keyName='id'] -  key name
   */

  async get(key: string, keyName = 'id'): Promise<Type | undefined> {
    let valueString = await this._dataSource.get(key, keyName);
    console.log('DECRYPT:' + valueString);
    console.log('DECRYPT key:' + key + ' || ' + keyName);
    if (!valueString) {
      return undefined;
    }
    return await this._encryptionService.decrypt(valueString);
  }

  /**
   * loads all from the local storage
   */
  async load(): Promise<Type[]> {
    const data = await this._dataSource.load();
    const decryptedData: Type[] = [];
    await Promise.all(data.map(async (item) => {
      decryptedData.push(await this._encryptionService.decrypt(item));
    }));
    // console.log('LOAD decr arr' + JSON.stringify(decryptedData));
    return decryptedData;
  }

  /**
   * deletes item from the local storage
   * @param {string} key - key value
   * @param {string}  [keyName='id'] -  key name
   */
  async delete(key: string, keyName = 'id'): Promise<void> {
    return this._dataSource.delete(key, keyName);
  }
}
