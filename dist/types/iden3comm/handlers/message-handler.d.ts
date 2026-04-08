import { BasicMessage, IPackageManager } from '../types';
import { AuthMessageHandlerOptions } from './auth';
import { RevocationStatusMessageHandlerOptions } from './revocation-status';
import { ContractMessageHandlerOptions } from './contract-request';
import { PaymentHandlerOptions, PaymentRequestMessageHandlerOptions } from './payment';
import { ProvingMethodAlg } from '@iden3/js-jwz';
import { DID } from '@iden3/js-iden3-core';
/**
 * Default proving method algorithm for ZKP messages
 */
export declare const defaultProvingMethodAlg: ProvingMethodAlg;
/**
 * iden3 Basic protocol message handler options
 */
export type BasicHandlerOptions = {
    allowExpiredMessages?: boolean;
    messageProvingMethodAlg?: ProvingMethodAlg;
    headers?: {
        [key: string]: string;
    };
};
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
    handle(message: BasicMessage, ctx: {
        [key: string]: unknown;
    }): Promise<BasicMessage | null>;
}
/**
 * Base implementation of protocol message handler
 *
 * @export
 * @abstract
 * @class AbstractMessageHandler
 * @implements {IProtocolMessageHandler}
 */
export declare abstract class AbstractMessageHandler implements IProtocolMessageHandler {
    nextMessageHandler?: AbstractMessageHandler;
    setNext(messageHandler: AbstractMessageHandler): AbstractMessageHandler;
    handle(message: BasicMessage, context: {
        [key: string]: unknown;
    }): Promise<BasicMessage | null>;
}
/**
 * Protocol message handler entry point
 */
export declare class MessageHandler {
    private readonly _params;
    private messageHandler?;
    /**
     * Creates an instance of MessageHandler.
     * @param {{
     *       messageHandlers: AbstractMessageHandler[];
     *       packageManager: IPackageManager;
     *     }} _params
     * @memberof MessageHandler
     */
    constructor(_params: {
        messageHandlers: AbstractMessageHandler[];
        packageManager: IPackageManager;
    });
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
    registerHandlers(handlersList: AbstractMessageHandler[]): void;
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
    handleMessage(bytes: Uint8Array, context: AuthMessageHandlerOptions | ContractMessageHandlerOptions | RevocationStatusMessageHandlerOptions | PaymentRequestMessageHandlerOptions | PaymentHandlerOptions | {
        senderDid?: DID;
        [key: string]: unknown;
    }): Promise<Uint8Array | null>;
}
/**
 * Get proving method algorithm from JWZ bytes
 * @param bytes - JWZ bytes
 * @returns Proving method algorithm
 **/
export declare function getProvingMethodAlgFromJWZ(bytes: Uint8Array): Promise<ProvingMethodAlg>;
//# sourceMappingURL=message-handler.d.ts.map