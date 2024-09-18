import { MessageModel } from '../entities/message-model';
import { IDataSource } from './data-source';

/**
 * Represents the interface for the Iden3 message storage.
 * Extends the IDataSource interface with additional methods for retrieving messages.
 */
export interface IIden3MessageStorage extends IDataSource<MessageModel> {
  /**
   * Retrieves messages by thread ID.
   * @param thid - The thread ID.
   * @param status - Optional. The status of the messages to retrieve.
   * @returns A promise that resolves to an array of MessageModel objects.
   */
  getMessageByThreadId(
    thid: string,
    status?: 'pending' | 'processed' | 'failed'
  ): Promise<MessageModel[]>;

  /**
   * Retrieves messages by correlation ID.
   * @param correlationId - The correlation ID.
   * @param status - Optional. The status of the messages to retrieve.
   * @returns A promise that resolves to an array of MessageModel objects.
   */
  getMessagesByCorrelationId(
    correlationId: string,
    status?: 'pending' | 'processed' | 'failed'
  ): Promise<MessageModel[]>;
}
