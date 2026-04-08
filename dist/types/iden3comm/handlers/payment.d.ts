import { MediaType } from '../constants';
import { BasicMessage, IPackageManager, PackerParams } from '../types';
import { DID } from '@iden3/js-iden3-core';
import { AbstractMessageHandler, BasicHandlerOptions, IProtocolMessageHandler } from './message-handler';
import { Iden3PaymentRailsERC20RequestV1, MultiChainPaymentConfig, PaymentMessage, PaymentRequestInfo, PaymentRequestMessage, PaymentRequestTypeUnion, PaymentTypeUnion } from '../types/protocol/payment';
import { Signer } from 'ethers';
import { Resolvable } from 'did-resolver';
import { HandlerPackerParams } from './common';
import { Keypair } from '@solana/web3.js';
/** @beta PaymentRequestCreationOptions represents payment-request creation options */
export type PaymentRequestCreationOptions = {
    expires_time?: Date;
};
/** @beta PaymentCreationOptions represents payment creation options */
export type PaymentCreationOptions = {
    expires_time?: Date;
};
/** @beta CreatePaymentRailsV1Options holds options for PaymentRailsV1 creation */
export type CreatePaymentRailsV1Options = {
    ethSigner?: Signer;
    solSigner?: Keypair;
};
/**
 * @beta
 * createPaymentRequest is a function to create protocol payment-request message
 * @param {DID} sender - sender did
 * @param {DID} receiver - receiver did
 * @param {string} agent - agent URL
 * @param {PaymentRequestInfo[]} payments - payments
 * @returns `PaymentRequestMessage`
 */
export declare function createPaymentRequest(sender: DID, receiver: DID, agent: string, payments: PaymentRequestInfo[], opts?: PaymentRequestCreationOptions): PaymentRequestMessage;
/**
 * @beta
 * PaymentRailsInfo represents payment info for payment rails
 */
export type PaymentRailsInfo = {
    credentials: {
        type: string;
        context: string;
    }[];
    description?: string;
    options: PaymentRailsOptionInfo[];
};
/**
 * @beta
 * PaymentRailsOptionInfo represents option info for payment rails
 */
export type PaymentRailsOptionInfo = {
    optionId: string;
    chainId: string;
    nonce: bigint;
    amount: string;
    expirationDate?: Date;
};
/**
 * @beta
 * createPayment is a function to create protocol payment message
 * @param {DID} sender - sender did
 * @param {DID} receiver - receiver did
 * @param {PaymentMessageBody} body - payments
 * @returns `PaymentMessage`
 */
export declare function createPayment(sender: DID, receiver: DID, payments: PaymentTypeUnion[], opts?: PaymentCreationOptions): PaymentMessage;
/**
 * @beta
 * Interface that allows the processing of the payment-request and payment protocol messages
 *
 * @interface IPaymentHandler
 */
export interface IPaymentHandler {
    /**
     * @beta
     * unpacks payment-request
     * @param {Uint8Array} request - raw byte message
     * @returns `Promise<PaymentRequestMessage>`
     */
    parsePaymentRequest(request: Uint8Array): Promise<PaymentRequestMessage>;
    /**
     *  @beta
     * handle payment-request
     * @param {Uint8Array} request - raw byte message
     * @param {PaymentRequestMessageHandlerOptions} opts - handler options
     * @returns {Promise<Uint8Array>} - agent message or null
     */
    handlePaymentRequest(request: Uint8Array, opts: PaymentRequestMessageHandlerOptions): Promise<Uint8Array | null>;
    /**
     * @beta
     * handle payment protocol message
     * @param {PaymentMessage} payment  - payment message
     * @param {PaymentHandlerOptions} opts - options
     * @returns `Promise<void>`
     */
    handlePayment(payment: PaymentMessage, opts: PaymentHandlerOptions): Promise<void>;
    /**
     * @beta
     * createPaymentRailsV1 is a function to create protocol payment message
     * @param {DID} sender - sender did
     * @param {DID} receiver - receiver did
     * @param {string} agent - agent URL
     * @param {Signer} signer - ETH signer
     * @param payments - payment options
     * @param {CreatePaymentRailsV1Options} createOptions - options for payment rails creation
     * @returns {Promise<PaymentRequestMessage>}
     */
    createPaymentRailsV1(sender: DID, receiver: DID, agent: string, signer: Signer, // the same as createOptions.ethSigner (for compatibility)
    payments: PaymentRailsInfo[], createOptions?: CreatePaymentRailsV1Options): Promise<PaymentRequestMessage>;
}
/** @beta PaymentRequestMessageHandlerOptions represents payment-request handler options */
export type PaymentRequestMessageHandlerOptions = BasicHandlerOptions & {
    paymentHandler: (data: PaymentRequestTypeUnion) => Promise<string>;
    nonce: string;
    erc20TokenApproveHandler?: (data: Iden3PaymentRailsERC20RequestV1) => Promise<string>;
    packerOptions?: HandlerPackerParams;
    mediaType?: MediaType;
};
/** @beta PaymentHandlerOptions represents payment handler options */
export type PaymentHandlerOptions = BasicHandlerOptions & {
    paymentRequest: PaymentRequestMessage;
    paymentValidationHandler: (txId: string, data: PaymentRequestTypeUnion) => Promise<void>;
};
/** @beta PaymentHandlerParams represents payment handler params */
export type PaymentHandlerParams = {
    packerParams: PackerParams;
    documentResolver: Resolvable;
    multiChainPaymentConfig?: MultiChainPaymentConfig[];
    allowedSigners?: string[];
};
/**
 *
 * Allows to process PaymentRequest protocol message
 * @beta
 * @class PaymentHandler
 * @implements implements IPaymentHandler interface
 */
export declare class PaymentHandler extends AbstractMessageHandler implements IPaymentHandler, IProtocolMessageHandler {
    private readonly _packerMgr;
    private readonly _params;
    /**
     * @beta Creates an instance of PaymentHandler.
     * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
     * @param {PaymentHandlerParams} _params - payment handler params
     *
     */
    constructor(_packerMgr: IPackageManager, _params: PaymentHandlerParams);
    handle(message: BasicMessage, context: PaymentRequestMessageHandlerOptions | PaymentHandlerOptions): Promise<BasicMessage | null>;
    /**
     * @inheritdoc IPaymentHandler#parsePaymentRequest
     */
    parsePaymentRequest(request: Uint8Array): Promise<PaymentRequestMessage>;
    private handlePaymentRequestMessage;
    /**
     * @inheritdoc IPaymentHandler#handlePaymentRequest
     */
    handlePaymentRequest(request: Uint8Array, opts: PaymentRequestMessageHandlerOptions): Promise<Uint8Array | null>;
    /**
     * @inheritdoc IPaymentHandler#handlePayment
     */
    handlePayment(payment: PaymentMessage, params: PaymentHandlerOptions): Promise<void>;
    /**
     * @inheritdoc IPaymentHandler#createPaymentRailsV1
     */
    createPaymentRailsV1(sender: DID, receiver: DID, agent: string, signer: Signer, payments: PaymentRailsInfo[], createOptions?: CreatePaymentRailsV1Options): Promise<PaymentRequestMessage>;
    private packMessage;
    private handleIden3PaymentRequestCryptoV1;
    private handleIden3PaymentRailsRequestV1;
    private handleIden3PaymentRailsSolanaRequestV1;
    private handleIden3PaymentRailsSolanaSPLRequestV1;
    private handleIden3PaymentRailsERC20RequestV1;
}
//# sourceMappingURL=payment.d.ts.map