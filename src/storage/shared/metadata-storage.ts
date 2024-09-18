import { MessageModel } from '../entities/message-model';
import { IDataSource } from '../interfaces';
import { IIden3MessageStorage } from '../interfaces/message';
/**
 * Represents a storage for metadata.
 */
export class Iden3MessageStorage implements IIden3MessageStorage {
  private static keyName = 'id';
  static readonly storageKey = 'metadata';

  /**
   * Creates an instance of MetadataStorage.
   * @param {IDataSource<Metadata>} _dataSource - The data source to store metadata.
   */
  constructor(private readonly _dataSource: IDataSource<MessageModel>) {}

  /**
   * Retrieves all unprocessed metadata.
   * @returns {Promise<Metadata[]>} A promise that resolves to an array of unprocessed metadata.
   */
  async getMessageByThreadId(thid: string, status = 'pending'): Promise<MessageModel[]> {
    const data = await this._dataSource.load();
    return data.filter((metadata) => metadata.status === status && metadata.thid === thid);
  }

  /**
   * Retrieves messages by correlation ID and status.
   * @param correlationId - The correlation ID to filter messages by.
   * @param status - The status of the messages to filter by. Defaults to 'pending'.
   * @returns A promise that resolves to an array of MessageModel objects matching the specified correlation ID and status.
   */
  async getMessagesByCorrelationId(
    correlationId: string,
    status = 'pending'
  ): Promise<MessageModel[]> {
    const data = await this._dataSource.load();
    return data.filter(
      (metadata) => metadata.status === status && metadata.correlationId === correlationId
    );
  }

  /**
   * Loads the metadata from the data source.
   * @returns {Promise<Metadata[]>} A promise that resolves to an array of metadata.
   */
  load(): Promise<MessageModel[]> {
    return this._dataSource.load();
  }

  /**
   * Saves the metadata with the specified key.
   * @param {string} key - The key to save the metadata under.
   * @param {Metadata} value - The metadata to save.
   * @returns {Promise<void>} A promise that resolves when the metadata is saved.
   */
  save(key: string, value: MessageModel): Promise<void> {
    return this._dataSource.save(key, value, Iden3MessageStorage.keyName);
  }

  /**
   * Retrieves the metadata with the specified key.
   * @param {string} key - The key of the metadata to retrieve.
   * @returns {Promise<Metadata | undefined>} A promise that resolves to the retrieved metadata, or undefined if not found.
   */
  get(key: string): Promise<MessageModel | undefined> {
    return this._dataSource.get(key, Iden3MessageStorage.keyName);
  }

  /**
   * Deletes the metadata with the specified key.
   * @param {string} key - The key of the metadata to delete.
   * @returns {Promise<void>} A promise that resolves when the metadata is deleted.
   */
  delete(key: string): Promise<void> {
    return this._dataSource.delete(key, Iden3MessageStorage.keyName);
  }
}
