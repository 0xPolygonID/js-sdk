import { Metadata } from '../entities/metadata';
import { IDataSource } from '../interfaces';
import { IMetadataStorage } from '../interfaces/metadata';
/**
 * Represents a storage for metadata.
 */
export class MetadataStorage implements IMetadataStorage {
  private static keyName = 'id';
  static readonly storageKey = 'metadata';

  /**
   * Creates an instance of MetadataStorage.
   * @param {IDataSource<Metadata>} _dataSource - The data source to store metadata.
   */
  constructor(private readonly _dataSource: IDataSource<Metadata>) {}

  /**
   * Retrieves all unprocessed metadata.
   * @returns {Promise<Metadata[]>} A promise that resolves to an array of unprocessed metadata.
   */
  async getUnprocessedMetadataForThreadIdAndPurpose(thid: string): Promise<Metadata[]> {
    const data = await this._dataSource.load();
    return data.filter((metadata) => metadata.status === 'pending' && metadata.thid === thid);
  }

  /**
   * Loads the metadata from the data source.
   * @returns {Promise<Metadata[]>} A promise that resolves to an array of metadata.
   */
  load(): Promise<Metadata[]> {
    return this._dataSource.load();
  }

  /**
   * Saves the metadata with the specified key.
   * @param {string} key - The key to save the metadata under.
   * @param {Metadata} value - The metadata to save.
   * @returns {Promise<void>} A promise that resolves when the metadata is saved.
   */
  save(key: string, value: Metadata): Promise<void> {
    return this._dataSource.save(key, value, MetadataStorage.keyName);
  }

  /**
   * Retrieves the metadata with the specified key.
   * @param {string} key - The key of the metadata to retrieve.
   * @returns {Promise<Metadata | undefined>} A promise that resolves to the retrieved metadata, or undefined if not found.
   */
  get(key: string): Promise<Metadata | undefined> {
    return this._dataSource.get(key, MetadataStorage.keyName);
  }

  /**
   * Deletes the metadata with the specified key.
   * @param {string} key - The key of the metadata to delete.
   * @returns {Promise<void>} A promise that resolves when the metadata is deleted.
   */
  delete(key: string): Promise<void> {
    return this._dataSource.delete(key, MetadataStorage.keyName);
  }
}
