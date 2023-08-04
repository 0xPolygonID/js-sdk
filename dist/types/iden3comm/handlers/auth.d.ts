import { MediaType } from '../constants';
import { IProofService } from '../../proof/proof-service';
import { AuthorizationRequestMessage, AuthorizationResponseMessage, IPackageManager, JWSPackerParams } from '../types';
import { DID } from '@iden3/js-iden3-core';
/**
 * Interface that allows the processing of the authorization request in the raw format for given identifier
 *
 * @public
 * @interface IAuthHandler
 */
export interface IAuthHandler {
    /**
     * unpacks authorization request
     * @public
     * @param {Uint8Array} request - raw byte message
     * @returns `Promise<AuthorizationRequestMessage>`
     */
    parseAuthorizationRequest(request: Uint8Array): Promise<AuthorizationRequestMessage>;
    /**
     * unpacks authorization request
     * @public
     * @param {did} did  - sender DID
     * @param {Uint8Array} request - raw byte message
     * @returns `Promise<{
      token: string;
      authRequest: AuthorizationRequestMessage;
      authResponse: AuthorizationResponseMessage;
    }>`
     */
    handleAuthorizationRequest(did: DID, request: Uint8Array, opts?: AuthHandlerOptions): Promise<{
        token: string;
        authRequest: AuthorizationRequestMessage;
        authResponse: AuthorizationResponseMessage;
    }>;
}
/**
 *
 * Options to pass to auth handler
 *
 * @public
 * @interface AuthHandlerOptions
 */
export interface AuthHandlerOptions {
    mediaType: MediaType;
    packerOptions?: JWSPackerParams;
}
/**
 *
 * Allows to process AuthorizationRequest protocol message and produce JWZ response.
 *
 * @public

 * @class AuthHandler
 * @implements implements IAuthHandler interface
 */
export declare class AuthHandler implements IAuthHandler {
    private readonly _packerMgr;
    private readonly _proofService;
    /**
     * Creates an instance of AuthHandler.
     * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
     * @param {IProofService} _proofService -  proof service to verify zk proofs
     *
     */
    constructor(_packerMgr: IPackageManager, _proofService: IProofService);
    /**
     * unpacks authorization request
     * @public
     * @param {Uint8Array} request - raw byte message
     * @returns `Promise<AuthorizationRequestMessage>`
     */
    parseAuthorizationRequest(request: Uint8Array): Promise<AuthorizationRequestMessage>;
    /**
     * unpacks authorization request and packs authorization response
     * @public
     * @param {did} did  - sender DID
     * @param {Uint8Array} request - raw byte message
     * @returns `Promise<{
      token: string;
      authRequest: AuthorizationRequestMessage;
      authResponse: AuthorizationResponseMessage;
    }>`
     */
    handleAuthorizationRequest(did: DID, request: Uint8Array, opts?: AuthHandlerOptions): Promise<{
        token: string;
        authRequest: AuthorizationRequestMessage;
        authResponse: AuthorizationResponseMessage;
    }>;
}
