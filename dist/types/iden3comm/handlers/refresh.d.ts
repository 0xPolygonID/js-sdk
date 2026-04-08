import { MediaType } from '../constants';
import { IPackageManager } from '../types';
import { W3CCredential } from '../../verifiable';
import { ICredentialWallet } from '../../credentials';
import { HandlerPackerParams } from './common';
/**
 * RefreshHandlerOptions contains options for RefreshHandler
 * @public
 * @interface   RefreshHandlerOptions
 */
export interface RefreshHandlerOptions {
    packageManager: IPackageManager;
    credentialWallet?: ICredentialWallet;
}
/**
 *
 * RefreshOptions contains options for refreshCredential call
 *
 * @public
 * @interface RefreshOptions
 */
export interface RefreshOptions {
    reason?: string;
    packerOptions?: HandlerPackerParams;
    mediaType?: MediaType;
}
/**
 * Interface to work with credential refresh handler
 *
 * @public
 * @interface IRefreshHandler
 */
export interface IRefreshHandler {
    /**
     * refresh credential
     *
     * @param {W3CCredential} credential - credential to refresh
     * @param {RefreshOptions} opts - options
     * @returns {Promise<W3CCredential>}
     */
    refreshCredential(credential: W3CCredential, opts?: RefreshOptions): Promise<W3CCredential>;
}
/**
 *
 * Allows to refresh credential from refresh service and return refreshed credential
 *
 * @public

 * @class RefreshHandler
 * @implements implements RefreshHandler interface
 */
export declare class RefreshHandler implements IRefreshHandler {
    private readonly _options;
    /**
     * Creates an instance of RefreshHandler.
     * @param {RefreshHandlerOptions} _options - refresh handler options
     */
    constructor(_options: RefreshHandlerOptions);
    refreshCredential(credential: W3CCredential, opts?: RefreshOptions): Promise<W3CCredential>;
}
//# sourceMappingURL=refresh.d.ts.map