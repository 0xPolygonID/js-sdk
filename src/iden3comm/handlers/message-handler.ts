import { BasicMessage, Iden3AttachmentType, IPackageManager } from '../types';
import { AuthMessageHandlerOptions } from './auth';
import { RevocationStatusMessageHandlerOptions } from './revocation-status';
import { ContractMessageHandlerOptions } from './contract-request';
import { PaymentHandlerOptions, PaymentRequestMessageHandlerOptions } from './payment';
import { MediaType } from '../constants';
import { proving } from '@iden3/js-jwz';
import { DID } from '@iden3/js-iden3-core';
import { IMetadataStorage } from '../../storage';
import * as uuid from 'uuid';

/**
 * iden3  Protocol message handler interface
 */
export interface IProtocolMessageHandler {
  /**
   * Handel message implementation
   *
   * @param {BasicMessage} message
   * @param {{ [key: string]: unknown }} ctx context
   * @returns {(Promise<BasicMessage | null>)}
   * @memberof IProtocolMessageHandler
   */
  handle(message: BasicMessage, ctx: { [key: string]: unknown }): Promise<BasicMessage | null>;
}

/**
 * Base implementation of protocol message handler
 *
 * @export
 * @abstract
 * @class AbstractMessageHandler
 * @implements {IProtocolMessageHandler}
 */
export abstract class AbstractMessageHandler implements IProtocolMessageHandler {
  public nextMessageHandler?: AbstractMessageHandler;

  public setNext(messageHandler: AbstractMessageHandler): AbstractMessageHandler {
    this.nextMessageHandler = messageHandler;
    return messageHandler;
  }

  public async handle(
    message: BasicMessage,
    context: { [key: string]: unknown }
  ): Promise<BasicMessage | null> {
    if (this.nextMessageHandler) return this.nextMessageHandler.handle(message, context);
    return Promise.reject('Message handler not provided or message not supported');
  }

  public async processMessageAttachments(
    message: BasicMessage,
    opts?: { metadataStorage?: IMetadataStorage }
  ): Promise<void> {
    if (!message.attachments) {
      return;
    }
    const metadataStorage = opts?.metadataStorage;
    const threadId = message.thid;

    if (!threadId) {
      console.warn('message should contain thid to process attachments');
      return;
    }

    const directives = message.attachments.filter(
      (attachment) => attachment.data['type'] === Iden3AttachmentType.Iden3Directives
    ).flatMap((attachment) => attachment.data.directives);

    if (!directives.length) {
      return;
    }

    if (!metadataStorage) {
      console.warn('Metadata storage not provided but required for processing message attachments');
      return;
    }

    const metadataPromises = directives.map((directive) => {
      return metadataStorage.save(threadId, {
        id: uuid.v4(),
        thid: threadId,
        purpose: directive.purpose,
        date: new Date().toISOString(),
        type: 'directive',
        status: 'pending',
        jsonString: JSON.stringify(directive)
      });
    });

    await Promise.all(metadataPromises);
  }
}

/**
 * Protocol message handler entry point
 */
export class MessageHandler {
  private messageHandler?: AbstractMessageHandler;

  /**
   * Creates an instance of MessageHandler.
   * @param {{
   *       messageHandlers: AbstractMessageHandler[];
   *       packageManager: IPackageManager;
   *     }} _params
   * @memberof MessageHandler
   */
  constructor(
    private readonly _params: {
      messageHandlers: AbstractMessageHandler[];
      packageManager: IPackageManager;
    }
  ) {
    this.registerHandlers(_params.messageHandlers);
  }

  /**
   * Registers a list of message handlers and sets up the chain of responsibility.
   *
   * This method takes an array of `AbstractMessageHandler` instances and sets up a chain of responsibility
   * where each handler is linked to the next one in the array. The first handler in the array becomes the
   * main message handler for the `MessageHandler` class.
   *
   * @param {AbstractMessageHandler[]} handlersList - An array of `AbstractMessageHandler` instances to be registered.
   * @returns {void}
   */
  public registerHandlers(handlersList: AbstractMessageHandler[]): void {
    if (!handlersList.length) return;

    const [firstMessageHandler, ...restHandlersList] = handlersList;

    const tempHandler = firstMessageHandler;
    for (const currentHandler of restHandlersList) {
      let lastHandler = tempHandler;
      while (lastHandler.nextMessageHandler) {
        lastHandler = lastHandler.nextMessageHandler;
      }
      lastHandler.setNext(currentHandler);
    }

    if (!this.messageHandler) {
      this.messageHandler = firstMessageHandler;
    } else {
      this.messageHandler.setNext(firstMessageHandler);
    }
  }

  /**
   * Handles a message by unpacking it, passing it to the registered message handler, and packing the response.
   *
   * This method takes a Uint8Array of message bytes and a context object that contains information specific to the
   * type of message being handled (e.g. AuthMessageHandlerOptions, ContractMessageHandlerOptions, etc.).
   *
   * The method first unpacks the message using the provided package manager, then passes the unpacked message and
   * context to the registered message handler. If the message handler returns a response, the method packs the
   * response using the package manager and returns it. If the message handler does not return a response, the
   * method returns null.
   *
   * @param bytes - A Uint8Array of message bytes to be handled.
   * @param context - An object containing information specific to the type of message being handled.
   * @returns A Promise that resolves to a Uint8Array of the packed response, or null if no response was generated.
   */
  public async handleMessage(
    bytes: Uint8Array,
    context:
      | AuthMessageHandlerOptions
      | ContractMessageHandlerOptions
      | RevocationStatusMessageHandlerOptions
      | PaymentRequestMessageHandlerOptions
      | PaymentHandlerOptions
      | { senderDid?: DID; [key: string]: unknown }
  ): Promise<Uint8Array | null> {
    const { unpackedMediaType, unpackedMessage: message } =
      await this._params.packageManager.unpack(bytes);

    if (!this.messageHandler) {
      return Promise.reject(new Error('Message handler not provided'));
    }

    const response = await this.messageHandler.handle(message, context);

    if (!response) {
      return null;
    }

    let packerParams = {};
    const senderDid = (context as { senderDid?: DID })?.senderDid;
    if (unpackedMediaType === MediaType.ZKPMessage && senderDid) {
      packerParams = {
        senderDID: senderDid,
        provingMethodAlg: proving.provingMethodGroth16AuthV2Instance.methodAlg
      };
      return this._params.packageManager.packMessage(unpackedMediaType, response, packerParams);
    }

    return this._params.packageManager.packMessage(MediaType.PlainMessage, response, packerParams);
  }
}
