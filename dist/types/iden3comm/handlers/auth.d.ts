import { MediaType } from '../constants';
import { IProofService } from '../../proof/proof-service';
import { StateVerificationOpts, AuthorizationRequestMessage, AuthorizationResponseMessage, BasicMessage, IPackageManager, ZeroKnowledgeProofRequest, Attachment } from '../types';
import { DID } from '@iden3/js-iden3-core';
import { ProvingMethodAlg } from '@iden3/js-jwz';
import { HandlerPackerParams } from './common';
import { AbstractMessageHandler, BasicHandlerOptions, IProtocolMessageHandler } from './message-handler';
/**
 * Options to pass to createAuthorizationRequest function
 * @public
 */
export type AuthorizationRequestCreateOptions = {
    accept?: string[];
    scope?: ZeroKnowledgeProofRequest[];
    expires_time?: Date;
    attachments?: Attachment[];
};
/**
 *  createAuthorizationRequest is a function to create protocol authorization request
 * @param {string} reason - reason to request proof
 * @param {string} sender - sender did
 * @param {string} callbackUrl - callback that user should use to send response
 * @param {AuthorizationRequestCreateOptions} opts - authorization request options
 * @returns `Promise<AuthorizationRequestMessage>`
 */
export declare function createAuthorizationRequest(reason: string, sender: string, callbackUrl: string, opts?: AuthorizationRequestCreateOptions): AuthorizationRequestMessage;
/**
 *  createAuthorizationRequestWithMessage is a function to create protocol authorization request with explicit message to sign
 * @param {string} reason - reason to request proof
 * @param {string} message - message to sign in the response
 * @param {string} sender - sender did
 * @param {string} callbackUrl - callback that user should use to send response
 * @param {AuthorizationRequestCreateOptions} opts - authorization request options
 * @returns `Promise<AuthorizationRequestMessage>`
 */
export declare function createAuthorizationRequestWithMessage(reason: string, message: string, sender: string, callbackUrl: string, opts?: AuthorizationRequestCreateOptions): AuthorizationRequestMessage;
/**
 *
 * Options to pass to auth response handler
 *
 * @public
 */
export type AuthResponseHandlerOptions = StateVerificationOpts & BasicHandlerOptions & {
    acceptedProofGenerationDelay?: number;
};
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
    /**
       * handle authorization response
       * @public
       * @param {AuthorizationResponseMessage} response  - auth response
       * @param {AuthorizationRequestMessage} request  - auth request
       * @param {AuthResponseHandlerOptions} opts - options
       * @returns `Promise<{
        request: AuthorizationRequestMessage;
        response: AuthorizationResponseMessage;
      }>`
       */
    handleAuthorizationResponse(response: AuthorizationResponseMessage, request: AuthorizationRequestMessage, opts?: AuthResponseHandlerOptions): Promise<{
        request: AuthorizationRequestMessage;
        response: AuthorizationResponseMessage;
    }>;
}
type AuthReqOptions = {
    senderDid: DID;
    mediaType?: MediaType;
    bypassProofsCache?: boolean;
    allowExpiredCredentials?: boolean;
};
type AuthRespOptions = {
    request: AuthorizationRequestMessage;
    acceptedStateTransitionDelay?: number;
    acceptedProofGenerationDelay?: number;
};
export type AuthMessageHandlerOptions = BasicHandlerOptions & (AuthReqOptions | AuthRespOptions);
/**
 *
 * Options to pass to auth handler
 *
 * @public
 * @interface AuthHandlerOptions
 */
export type AuthHandlerOptions = BasicHandlerOptions & {
    mediaType: MediaType;
    packerOptions?: HandlerPackerParams;
    preferredAuthProvingMethod?: ProvingMethodAlg;
    bypassProofsCache?: boolean;
    allowExpiredCredentials?: boolean;
};
/**
 *
 * Allows to process AuthorizationRequest protocol message and produce JWZ response.
 *
 * @public

 * @class AuthHandler
 * @implements implements IAuthHandler interface
 */
export declare class AuthHandler extends AbstractMessageHandler implements IAuthHandler, IProtocolMessageHandler {
    private readonly _packerMgr;
    private readonly _proofService;
    private readonly _supportedCircuits;
    /**
     * Creates an instance of AuthHandler.
     * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
     * @param {IProofService} _proofService -  proof service to verify zk proofs
     *
     */
    constructor(_packerMgr: IPackageManager, _proofService: IProofService);
    handle(message: BasicMessage, ctx: AuthMessageHandlerOptions): Promise<BasicMessage | null>;
    /**
     * @inheritdoc IAuthHandler#parseAuthorizationRequest
     */
    parseAuthorizationRequest(request: Uint8Array): Promise<AuthorizationRequestMessage>;
    private handleAuthRequest;
    /**
     * @inheritdoc IAuthHandler#handleAuthorizationRequest
     */
    handleAuthorizationRequest(did: DID, request: Uint8Array, opts?: AuthHandlerOptions): Promise<{
        token: string;
        authRequest: AuthorizationRequestMessage;
        authResponse: AuthorizationResponseMessage;
    }>;
    private handleAuthResponse;
    /**
     * @inheritdoc IAuthHandler#handleAuthorizationResponse
     */
    handleAuthorizationResponse(response: AuthorizationResponseMessage, request: AuthorizationRequestMessage, opts?: AuthResponseHandlerOptions | undefined): Promise<{
        request: AuthorizationRequestMessage;
        response: AuthorizationResponseMessage;
    }>;
    private verifyAuthRequest;
    private getSupportedMediaTypeByProfile;
    private getDefaultProvingMethodAlg;
}
export {};
//# sourceMappingURL=auth.d.ts.map