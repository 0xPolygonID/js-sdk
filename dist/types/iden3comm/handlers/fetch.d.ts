import { MediaType } from '../constants';
import { IPackageManager, JWSPackerParams } from '../types';
import { W3CCredential } from '../../verifiable';
/**
 *
 * Options to pass to fetch handler
 *
 * @public
 * @interface FetchHandlerOptions
 */
export interface FetchHandlerOptions {
    mediaType: MediaType;
    packerOptions?: JWSPackerParams;
    headers?: {
        [key: string]: string;
    };
}
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
}
/**
 *
 * Allows to handle Credential offer protocol message and return fetched credential
 *
 * @public

 * @class FetchHandler
 * @implements implements IFetchHandler interface
 */
export declare class FetchHandler implements IFetchHandler {
    private readonly _packerMgr;
    /**
     * Creates an instance of AuthHandler.
     * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
     */
    constructor(_packerMgr: IPackageManager);
    /**
     * Handles only messages with credentials/1.0/offer type
     *
     * @param {
     *     offer: Uint8Array; offer - raw offer message
     *     opts
     *   }) options how to fetch credential
     * @returns `Promise<W3CCredential>`
     */
    handleCredentialOffer(offer: Uint8Array, opts?: FetchHandlerOptions): Promise<W3CCredential[]>;
}
