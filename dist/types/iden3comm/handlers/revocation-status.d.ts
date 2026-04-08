import { MediaType } from '../constants';
import { BasicMessage, IPackageManager, RevocationStatusRequestMessage } from '../types';
import { DID } from '@iden3/js-iden3-core';
import { TreeState } from '../../circuits';
import { IIdentityWallet } from '../../identity';
import { AbstractMessageHandler, BasicHandlerOptions, IProtocolMessageHandler } from './message-handler';
import { HandlerPackerParams } from './common';
/**
 * Defines the options for a RevocationStatusMessageHandler.
 * @property senderDid - The DID (Decentralized Identifier) to be used.
 * @property mediaType - The media type to be used.
 * @property packerOptions - Optional parameters for the JWS packer.
 * @property treeState - Optional tree state to be used.
 */
export type RevocationStatusMessageHandlerOptions = BasicHandlerOptions & {
    senderDid: DID;
    mediaType: MediaType;
    packerOptions?: HandlerPackerParams;
    treeState?: TreeState;
};
/**
 * Interface that allows the processing of the revocation status
 *
 * @interface IRevocationStatusHandler
 */
export interface IRevocationStatusHandler {
    /**
     * unpacks revocation status request
     * @param {Uint8Array} request - raw byte message
     * @returns `Promise<RevocationStatusRequestMessage>`
     */
    parseRevocationStatusRequest(request: Uint8Array): Promise<RevocationStatusRequestMessage>;
    /**
     * handle revocation status request
     * @param {did} did  - sender DID
     * @param {Uint8Array} request - raw byte message
     * @param {RevocationStatusHandlerOptions} opts - handler options
     * @returns {Promise<Uint8Array>}` - revocation status response message
     */
    handleRevocationStatusRequest(did: DID, request: Uint8Array, opts?: RevocationStatusHandlerOptions): Promise<Uint8Array>;
}
/** RevocationStatusHandlerOptions represents revocation status handler options */
export type RevocationStatusHandlerOptions = BasicHandlerOptions & {
    mediaType: MediaType;
    packerOptions?: HandlerPackerParams;
    treeState?: TreeState;
};
/**
 *
 * Allows to process RevocationStatusRequest protocol message
 *

 * @class RevocationStatusHandler
 * @implements implements IRevocationStatusHandler interface
 */
export declare class RevocationStatusHandler extends AbstractMessageHandler implements IRevocationStatusHandler, IProtocolMessageHandler {
    private readonly _packerMgr;
    private readonly _identityWallet;
    /**
     * Creates an instance of RevocationStatusHandler.
     * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
     * @param {IIdentityWallet} _identityWallet - identity wallet
     *
     */
    constructor(_packerMgr: IPackageManager, _identityWallet: IIdentityWallet);
    handle(message: BasicMessage, context: RevocationStatusMessageHandlerOptions): Promise<BasicMessage | null>;
    private handleRevocationStatusRequestMessage;
    /**
     * @inheritdoc IRevocationStatusHandler#parseRevocationStatusRequest
     */
    parseRevocationStatusRequest(request: Uint8Array): Promise<RevocationStatusRequestMessage>;
    /**
     * @inheritdoc IRevocationStatusHandler#handleRevocationStatusRequest
     */
    handleRevocationStatusRequest(did: DID, request: Uint8Array, opts?: RevocationStatusHandlerOptions): Promise<Uint8Array>;
}
//# sourceMappingURL=revocation-status.d.ts.map