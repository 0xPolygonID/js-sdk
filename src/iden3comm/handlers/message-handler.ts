import { BasicMessage, IPackageManager } from '../types';
import { AuthMessageHandlerOptions } from './auth';
import { RevocationStatusMessageHandlerOptions } from './revocation-status';
import { ContractMessageHandlerOptions } from './contract-request';

export interface IProtocolMessageHandler {
  handle(message: BasicMessage, ctx: { [key: string]: unknown }): Promise<BasicMessage | null>;
}

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
}

export class MessageHandler {
  public messageHandler?: AbstractMessageHandler;

  constructor(
    private readonly _params: {
      messageHandlers: AbstractMessageHandler[];
      packageManager: IPackageManager;
    }
  ) {
    const [firstMessageHandler, ...restMessageHandlers] = _params.messageHandlers;
    this.messageHandler = firstMessageHandler;
    for (const messageHandler of restMessageHandlers) {
      let lastHandler = this.messageHandler;
      while (lastHandler.nextMessageHandler !== undefined) {
        lastHandler = lastHandler.nextMessageHandler;
      }
      lastHandler.setNext(messageHandler);
    }
  }

  public async handleMessage(
    bytes: Uint8Array,
    context:
      | AuthMessageHandlerOptions
      | ContractMessageHandlerOptions
      | RevocationStatusMessageHandlerOptions
      | ContractMessageHandlerOptions
  ): Promise<Uint8Array | null> {
    const { unpackedMediaType, unpackedMessage: message } =
      await this._params.packageManager.unpack(bytes);

    if (!this.messageHandler) {
      return Promise.reject(new Error('Message handler not provided'));
    }

    const response = await this.messageHandler.handle(message, context);

    if (response) {
      return this._params.packageManager.packMessage(unpackedMediaType, response, {});
    }

    return null;
  }
}
