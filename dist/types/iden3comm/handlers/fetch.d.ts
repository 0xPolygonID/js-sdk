import { MediaType } from '../constants';
import { BasicMessage, IPackageManager } from '../types';
import { W3CCredential } from '../../verifiable';
import { ICredentialWallet } from '../../credentials';
import { AbstractMessageHandler, BasicHandlerOptions, IProtocolMessageHandler } from './message-handler';
import { HandlerPackerParams } from './common';
import { IOnchainIssuer } from '../../storage';
import { JoseService } from '../services/jose';
import { Options } from '@iden3/js-jsonld-merklization';
/**
 *
 * Options to pass to fetch handler
 *
 * @public
 * @interface FetchHandlerOptions
 */
export type FetchHandlerOptions = BasicHandlerOptions & {
    mediaType: MediaType;
    packerOptions?: HandlerPackerParams;
};
/**
 *
 * Options to pass to fetch request handler
 *
 * @public
 * @interface FetchRequestOptions
 */
export type FetchRequestOptions = BasicHandlerOptions;
/**
 *
 * Options to pass to issuance response handler
 *
 * @public
 * @interface IssuanceResponseOptions
 */
export type IssuanceResponseOptions = BasicHandlerOptions;
export type FetchMessageHandlerOptions = FetchHandlerOptions;
/**
 * Interface that allows the processing of the credential offer in the raw format for given identifier
 *
 * @public
 * @interface IFetchHandler
 */
export interface IFetchHandler {
    /**
     * unpacks authorization request
     * @public
     * @param {Uint8Array} offer - raw byte message
     * @param {FetchHandlerOptions} opts - FetchHandlerOptions
     * @returns `Promise<{
      token: string;
      authRequest: AuthorizationRequestMessage;
      authResponse: AuthorizationResponseMessage;
    }>`
     */
    handleCredentialOffer(offer: Uint8Array, opts?: FetchHandlerOptions): Promise<W3CCredential[]>;
    /**
     * Handles a credential fetch request.
     *
     * @param basicMessage - The basic message containing the fetch request.
     * @returns A promise that resolves to the response message.
     * @throws An error if the request is invalid or if the credential is not found.
     */
    handleCredentialFetchRequest(basicMessage: Uint8Array, opts?: FetchRequestOptions): Promise<Uint8Array>;
    /**
     * Handles the issuance response message.
     *
     * @param basicMessage - The basic message containing the issuance response.
     * @returns A promise that resolves to a Uint8Array.
     * @throws An error if the credential wallet is not provided in the options or if the credential is missing in the issuance response message.
     */
    handleIssuanceResponseMessage(basicMessage: Uint8Array, opts?: IssuanceResponseOptions): Promise<Uint8Array>;
}
/**
 *
 * Allows to handle Credential offer protocol message and return fetched credential
 *
 * @public

 * @class FetchHandler
 * @implements implements IFetchHandler interface
 */
export declare class FetchHandler extends AbstractMessageHandler implements IFetchHandler, IProtocolMessageHandler {
    private readonly _packerMgr;
    private readonly opts?;
    /**
     * Constructs a new instance of the FetchHandler class.
     *
     * @param _packerMgr The package manager used for packing and unpacking data.
     * @param opts Optional configuration options for the FetchHandler.
     * @param opts.credentialWallet The credential wallet used for managing credentials.
     */
    constructor(_packerMgr: IPackageManager, opts?: {
        credentialWallet?: ICredentialWallet;
        didResolverUrl?: string;
        merklizeOptions?: Options;
        onchainIssuer?: IOnchainIssuer;
        joseService?: JoseService;
    } | undefined);
    handle(message: BasicMessage, ctx: FetchMessageHandlerOptions): Promise<BasicMessage | null>;
    private handleOnchainOfferMessage;
    private handleOfferMessage;
    /**
     * Handles only messages with credentials/1.0/offer type
     *
     * @param {
     *     offer: Uint8Array; offer - raw offer message
     *     opts
     *   }) options how to fetch credential
     * @returns `Promise<W3CCredential[]>`
     */
    handleCredentialOffer(offer: Uint8Array, opts?: FetchHandlerOptions): Promise<W3CCredential[]>;
    /**
     * Handles only messages with credentials/1.0/onchain-offer type
     * @beta
     */
    handleOnchainOffer(offer: Uint8Array): Promise<W3CCredential[]>;
    private handleFetchRequest;
    /**
     * @inheritdoc IFetchHandler#handleCredentialFetchRequest
     */
    handleCredentialFetchRequest(envelope: Uint8Array, opts?: FetchRequestOptions): Promise<Uint8Array>;
    private handleEncryptedIssuanceResponseMessage;
    private handleIssuanceResponseMsg;
    /**
     * @inheritdoc IFetchHandler#handleIssuanceResponseMessage
     */
    handleIssuanceResponseMessage(envelop: Uint8Array, opts?: IssuanceResponseOptions): Promise<Uint8Array>;
    /**
     * @inheritdoc IFetchHandler#unpackMessage
     */
    static unpackMessage<T>(packerMgr: IPackageManager, envelope: Uint8Array, messageType: string): Promise<T>;
}
//# sourceMappingURL=fetch.d.ts.map