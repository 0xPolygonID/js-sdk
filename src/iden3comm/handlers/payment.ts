import { PROTOCOL_MESSAGE_TYPE } from '../constants';
import { MediaType } from '../constants';
import { BasicMessage, IPackageManager, PackerParams } from '../types';

import { DID, getUnixTimestamp } from '@iden3/js-iden3-core';
import * as uuid from 'uuid';
import { ProvingMethodAlg } from '@iden3/js-jwz';
import { buildSolanaPayment, byteEncoder, verifyIden3SolanaPaymentRequest } from '../../utils';
import {
  AbstractMessageHandler,
  BasicHandlerOptions,
  IProtocolMessageHandler,
  defaultProvingMethodAlg,
  getProvingMethodAlgFromJWZ
} from './message-handler';
import {
  Iden3PaymentCryptoV1,
  Iden3PaymentRailsERC20RequestV1,
  Iden3PaymentRailsERC20V1,
  Iden3PaymentRailsRequestV1,
  Iden3PaymentRailsSolanaRequestV1,
  Iden3PaymentRailsSolanaSPLRequestV1,
  Iden3PaymentRailsSolanaSPLV1,
  Iden3PaymentRailsSolanaV1,
  Iden3PaymentRailsV1,
  Iden3PaymentRequestCryptoV1,
  MultiChainPaymentConfig,
  PaymentMessage,
  PaymentRequestInfo,
  PaymentRequestMessage,
  PaymentRequestTypeUnion,
  PaymentTypeUnion
} from '../types/protocol/payment';
import { PaymentFeatures, PaymentRequestDataType, PaymentType } from '../../verifiable';
import { Signer } from 'ethers';
import { Resolvable } from 'did-resolver';
import { verifyExpiresTime } from './common';
import { Keypair } from '@solana/web3.js';
import { buildEvmPayment, verifyEIP712TypedData } from '../../utils/payments/evm';

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
export function createPaymentRequest(
  sender: DID,
  receiver: DID,
  agent: string,
  payments: PaymentRequestInfo[],
  opts?: PaymentRequestCreationOptions
): PaymentRequestMessage {
  const uuidv4 = uuid.v4();
  const request: PaymentRequestMessage = {
    id: uuidv4,
    thid: uuidv4,
    from: sender.string(),
    to: receiver.string(),
    typ: MediaType.PlainMessage,
    type: PROTOCOL_MESSAGE_TYPE.PAYMENT_REQUEST_MESSAGE_TYPE,
    body: {
      agent,
      payments
    },
    created_time: getUnixTimestamp(new Date()),
    expires_time: opts?.expires_time ? getUnixTimestamp(opts.expires_time) : undefined
  };
  return request;
}

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
export function createPayment(
  sender: DID,
  receiver: DID,
  payments: PaymentTypeUnion[],
  opts?: PaymentCreationOptions
): PaymentMessage {
  const uuidv4 = uuid.v4();
  const request: PaymentMessage = {
    id: uuidv4,
    thid: uuidv4,
    from: sender.string(),
    to: receiver.string(),
    typ: MediaType.PlainMessage,
    type: PROTOCOL_MESSAGE_TYPE.PAYMENT_MESSAGE_TYPE,
    body: {
      payments
    },
    created_time: getUnixTimestamp(new Date()),
    expires_time: opts?.expires_time ? getUnixTimestamp(opts.expires_time) : undefined
  };
  return request;
}

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
  handlePaymentRequest(
    request: Uint8Array,
    opts: PaymentRequestMessageHandlerOptions
  ): Promise<Uint8Array | null>;

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
  createPaymentRailsV1(
    sender: DID,
    receiver: DID,
    agent: string,
    signer: Signer, // the same as createOptions.ethSigner (for compatibility)
    payments: PaymentRailsInfo[],
    createOptions?: CreatePaymentRailsV1Options
  ): Promise<PaymentRequestMessage>;
}

/** @beta PaymentRequestMessageHandlerOptions represents payment-request handler options */
export type PaymentRequestMessageHandlerOptions = BasicHandlerOptions & {
  paymentHandler: (data: PaymentRequestTypeUnion) => Promise<string>;
  /*
   selected payment nonce (for Iden3PaymentRequestCryptoV1 type it should be equal to Payment id field)
  */
  nonce: string;
  erc20TokenApproveHandler?: (data: Iden3PaymentRailsERC20RequestV1) => Promise<string>;
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
  /*
   * allowed signers for payment request (if not provided, any signer is allowed)
   */
  allowedSigners?: string[];
};

/**
 *
 * Allows to process PaymentRequest protocol message
 * @beta
 * @class PaymentHandler
 * @implements implements IPaymentHandler interface
 */
export class PaymentHandler
  extends AbstractMessageHandler
  implements IPaymentHandler, IProtocolMessageHandler
{
  /**
   * @beta Creates an instance of PaymentHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   * @param {PaymentHandlerParams} _params - payment handler params
   *
   */

  constructor(
    private readonly _packerMgr: IPackageManager,
    private readonly _params: PaymentHandlerParams
  ) {
    super();
  }

  public async handle(
    message: BasicMessage,
    context: PaymentRequestMessageHandlerOptions | PaymentHandlerOptions
  ): Promise<BasicMessage | null> {
    switch (message.type) {
      case PROTOCOL_MESSAGE_TYPE.PAYMENT_REQUEST_MESSAGE_TYPE:
        return await this.handlePaymentRequestMessage(
          message as PaymentRequestMessage,
          context?.messageProvingMethodAlg || defaultProvingMethodAlg,
          context as PaymentRequestMessageHandlerOptions
        );
      case PROTOCOL_MESSAGE_TYPE.PAYMENT_MESSAGE_TYPE:
        await this.handlePayment(message as PaymentMessage, context as PaymentHandlerOptions);
        return null;
      default:
        return super.handle(message, context as { [key: string]: unknown });
    }
  }

  /**
   * @inheritdoc IPaymentHandler#parsePaymentRequest
   */
  async parsePaymentRequest(request: Uint8Array): Promise<PaymentRequestMessage> {
    const { unpackedMessage: message } = await this._packerMgr.unpack(request);
    const paymentRequest = message as PaymentRequestMessage;
    if (message.type !== PROTOCOL_MESSAGE_TYPE.PAYMENT_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid media type');
    }
    return paymentRequest;
  }

  private async handlePaymentRequestMessage(
    paymentRequest: PaymentRequestMessage,
    provingMethodAlg: ProvingMethodAlg,
    ctx: PaymentRequestMessageHandlerOptions
  ): Promise<BasicMessage | null> {
    if (!paymentRequest.to) {
      throw new Error(`failed request. empty 'to' field`);
    }

    if (!paymentRequest.from) {
      throw new Error(`failed request. empty 'from' field`);
    }

    if (!paymentRequest.body.payments?.length) {
      throw new Error(`failed request. no 'payments' in body`);
    }

    if (!ctx.paymentHandler) {
      throw new Error(`please provide payment handler in context`);
    }

    const senderDID = DID.parse(paymentRequest.to);
    const receiverDID = DID.parse(paymentRequest.from);

    const payments: PaymentTypeUnion[] = [];
    for (let i = 0; i < paymentRequest.body.payments.length; i++) {
      const { data } = paymentRequest.body.payments[i];
      const selectedPayment = Array.isArray(data)
        ? data.find((p) => {
            return p.type === PaymentRequestDataType.Iden3PaymentRequestCryptoV1
              ? p.id === ctx.nonce
              : p.nonce === ctx.nonce;
          })
        : data;

      if (!selectedPayment) {
        throw new Error(`failed request. no payment in request for nonce ${ctx.nonce}`);
      }

      switch (selectedPayment.type) {
        case PaymentRequestDataType.Iden3PaymentRequestCryptoV1:
          payments.push(
            await this.handleIden3PaymentRequestCryptoV1(selectedPayment, ctx.paymentHandler)
          );
          break;
        case PaymentRequestDataType.Iden3PaymentRailsRequestV1:
          payments.push(
            await this.handleIden3PaymentRailsRequestV1(selectedPayment, ctx.paymentHandler)
          );
          break;
        case PaymentRequestDataType.Iden3PaymentRailsERC20RequestV1:
          payments.push(
            await this.handleIden3PaymentRailsERC20RequestV1(
              selectedPayment,
              ctx.paymentHandler,
              ctx.erc20TokenApproveHandler
            )
          );
          break;
        case PaymentRequestDataType.Iden3PaymentRailsSolanaRequestV1:
          payments.push(
            await this.handleIden3PaymentRailsSolanaRequestV1(selectedPayment, ctx.paymentHandler)
          );
          break;
        case PaymentRequestDataType.Iden3PaymentRailsSolanaSPLRequestV1:
          payments.push(
            await this.handleIden3PaymentRailsSolanaSPLRequestV1(
              {
                ...selectedPayment,
                type: PaymentRequestDataType.Iden3PaymentRailsSolanaSPLRequestV1
              },
              ctx.paymentHandler
            )
          );
          break;
      }
    }

    const paymentMessage = createPayment(senderDID, receiverDID, payments);
    const response = await this.packMessage(paymentMessage, senderDID, provingMethodAlg);

    const agentResult = await fetch(paymentRequest.body.agent, {
      method: 'POST',
      body: response.buffer as ArrayBuffer,
      headers: {
        'Content-Type':
          this._params.packerParams.mediaType === MediaType.PlainMessage
            ? 'application/json'
            : 'application/octet-stream'
      }
    });

    const arrayBuffer = await agentResult.arrayBuffer();
    if (!arrayBuffer.byteLength) {
      return null;
    }
    const { unpackedMessage } = await this._packerMgr.unpack(new Uint8Array(arrayBuffer));
    return unpackedMessage;
  }

  /**
   * @inheritdoc IPaymentHandler#handlePaymentRequest
   */
  async handlePaymentRequest(
    request: Uint8Array,
    opts: PaymentRequestMessageHandlerOptions
  ): Promise<Uint8Array | null> {
    if (
      this._params.packerParams.mediaType === MediaType.SignedMessage &&
      !this._params.packerParams.packerOptions
    ) {
      throw new Error(`jws packer options are required for ${MediaType.SignedMessage}`);
    }

    const provingMethodAlg = await getProvingMethodAlgFromJWZ(request);

    const paymentRequest = await this.parsePaymentRequest(request);
    if (!paymentRequest.from) {
      throw new Error(`failed request. empty 'from' field`);
    }

    if (!paymentRequest.to) {
      throw new Error(`failed request. empty 'to' field`);
    }
    if (!opts?.allowExpiredMessages) {
      verifyExpiresTime(paymentRequest);
    }
    const agentMessage = await this.handlePaymentRequestMessage(
      paymentRequest,
      provingMethodAlg,
      opts
    );
    if (!agentMessage) {
      return null;
    }

    const senderDID = DID.parse(paymentRequest.to);
    return this.packMessage(agentMessage, senderDID, provingMethodAlg);
  }

  /**
   * @inheritdoc IPaymentHandler#handlePayment
   */
  async handlePayment(payment: PaymentMessage, params: PaymentHandlerOptions) {
    if (!params?.allowExpiredMessages) {
      verifyExpiresTime(payment);
    }
    if (params.paymentRequest.from !== payment.to) {
      throw new Error(
        `sender of the request is not a target of response - expected ${params.paymentRequest.from}, given ${payment.to}`
      );
    }

    if (!payment.body.payments.length) {
      throw new Error(`failed request. empty 'payments' field in body`);
    }

    if (!params.paymentValidationHandler) {
      throw new Error(`please provide payment validation handler in options`);
    }

    for (let i = 0; i < payment.body.payments.length; i++) {
      const p = payment.body.payments[i];
      const nonce = p.type === PaymentType.Iden3PaymentCryptoV1 ? p.id : p.nonce;
      const requestDataArr = params.paymentRequest.body.payments
        .map((r) => (Array.isArray(r.data) ? r.data : [r.data]))
        .flat();
      const requestData = requestDataArr.find((r) =>
        r.type === PaymentRequestDataType.Iden3PaymentRequestCryptoV1
          ? r.id === nonce
          : r.nonce === nonce
      );
      if (!requestData) {
        throw new Error(
          `can't find payment request for payment ${
            p.type === PaymentType.Iden3PaymentCryptoV1 ? 'id' : 'nonce'
          } ${nonce}`
        );
      }
      await params.paymentValidationHandler(p.paymentData.txId, requestData);
    }
  }

  /**
   * @inheritdoc IPaymentHandler#createPaymentRailsV1
   */
  async createPaymentRailsV1(
    sender: DID,
    receiver: DID,
    agent: string,
    signer: Signer,
    payments: PaymentRailsInfo[],
    createOptions?: CreatePaymentRailsV1Options
  ): Promise<PaymentRequestMessage> {
    const paymentRequestInfo: PaymentRequestInfo[] = [];
    for (let i = 0; i < payments.length; i++) {
      const { credentials, description } = payments[i];
      const dataArr: (
        | Iden3PaymentRailsRequestV1
        | Iden3PaymentRailsERC20RequestV1
        | Iden3PaymentRailsSolanaRequestV1
        | Iden3PaymentRailsSolanaSPLRequestV1
      )[] = [];
      for (let j = 0; j < payments[i].options.length; j++) {
        const { nonce, amount, chainId, optionId, expirationDate } = payments[i].options[j];

        const multiChainConfig = this._params.multiChainPaymentConfig?.find(
          (c) => c.chainId === chainId
        );
        if (!multiChainConfig) {
          throw new Error(`failed request. no config for chain ${chainId}`);
        }
        const { recipient, paymentRails, options } = multiChainConfig;

        const option = options.find((t) => t.id === optionId);
        if (!option) {
          throw new Error(`failed request. no option for id ${optionId}`);
        }
        if (
          (option.type === PaymentRequestDataType.Iden3PaymentRailsERC20RequestV1 ||
            option.type === PaymentRequestDataType.Iden3PaymentRailsSolanaSPLRequestV1) &&
          !option.contractAddress
        ) {
          throw new Error(`failed request. no token address for option id ${optionId}`);
        }
        const expirationDateRequired =
          expirationDate ?? new Date(new Date().setHours(new Date().getHours() + 1));

        if (
          option.type === PaymentRequestDataType.Iden3PaymentRailsSolanaRequestV1 ||
          option.type === PaymentRequestDataType.Iden3PaymentRailsSolanaSPLRequestV1
        ) {
          if (!createOptions?.solSigner) {
            throw new Error(
              `please provide solana signer in context for ${option.type} payment type`
            );
          }

          const payment = await buildSolanaPayment(
            createOptions.solSigner,
            option,
            chainId,
            paymentRails,
            recipient,
            BigInt(amount),
            expirationDateRequired,
            nonce
          );
          dataArr.push(payment);
        } else {
          const payment = await buildEvmPayment(
            signer,
            option,
            chainId,
            paymentRails,
            recipient,
            BigInt(amount),
            expirationDateRequired,
            nonce
          );
          dataArr.push(payment);
        }
      }

      paymentRequestInfo.push({
        data: dataArr,
        credentials,
        description
      });
    }
    return createPaymentRequest(sender, receiver, agent, paymentRequestInfo);
  }

  private async packMessage(
    message: BasicMessage,
    senderDID: DID,
    provingMethodAlg = defaultProvingMethodAlg
  ): Promise<Uint8Array> {
    const responseEncoded = byteEncoder.encode(JSON.stringify(message));
    const packerOpts =
      this._params.packerParams.mediaType === MediaType.SignedMessage
        ? this._params.packerParams.packerOptions
        : {
            provingMethodAlg
          };
    return await this._packerMgr.pack(this._params.packerParams.mediaType, responseEncoded, {
      senderDID,
      ...packerOpts
    });
  }

  private async handleIden3PaymentRequestCryptoV1(
    data: Iden3PaymentRequestCryptoV1,
    paymentHandler: (data: Iden3PaymentRequestCryptoV1) => Promise<string>
  ): Promise<Iden3PaymentCryptoV1> {
    if (data.expiration && new Date(data.expiration) < new Date()) {
      throw new Error(`failed request. expired request`);
    }
    const txId = await paymentHandler(data);

    return {
      id: data.id,
      '@context': 'https://schema.iden3.io/core/jsonld/payment.jsonld#Iden3PaymentCryptoV1',
      type: PaymentType.Iden3PaymentCryptoV1,
      paymentData: {
        txId
      }
    };
  }

  private async handleIden3PaymentRailsRequestV1(
    data: Iden3PaymentRailsRequestV1,
    paymentHandler: (data: Iden3PaymentRailsRequestV1) => Promise<string>
  ): Promise<Iden3PaymentRailsV1> {
    if (data.expirationDate && new Date(data.expirationDate) < new Date()) {
      throw new Error(`failed request. expired request`);
    }
    const signer = await verifyEIP712TypedData(data, this._params.documentResolver);
    if (this._params.allowedSigners && !this._params.allowedSigners.includes(signer)) {
      throw new Error(`failed request. signer is not in the allowed signers list`);
    }
    const txId = await paymentHandler(data);
    const proof = Array.isArray(data.proof) ? data.proof[0] : data.proof;
    return {
      nonce: data.nonce,
      type: PaymentType.Iden3PaymentRailsV1,
      '@context': 'https://schema.iden3.io/core/jsonld/payment.jsonld#Iden3PaymentRailsV1',
      paymentData: {
        txId,
        chainId: proof.eip712.domain.chainId
      }
    };
  }

  private async handleIden3PaymentRailsSolanaRequestV1(
    data: Iden3PaymentRailsSolanaRequestV1,
    paymentHandler: (data: Iden3PaymentRailsSolanaRequestV1) => Promise<string>
  ): Promise<Iden3PaymentRailsSolanaV1> {
    if (data.expirationDate && new Date(data.expirationDate) < new Date()) {
      throw new Error(`failed request. expired request`);
    }
    const isValid = await verifyIden3SolanaPaymentRequest(data, this._params.documentResolver);
    if (!isValid) {
      throw new Error(`failed request. invalid Solana payment request signature`);
    }
    const proof = Array.isArray(data.proof) ? data.proof[0] : data.proof;
    const signer = proof.verificationMethod.split(':').slice(-1)[0];
    if (this._params.allowedSigners && !this._params.allowedSigners.includes(signer)) {
      throw new Error(`failed request. signer is not in the allowed signers list`);
    }
    const txId = await paymentHandler(data);
    return {
      nonce: data.nonce,
      type: PaymentType.Iden3PaymentRailsSolanaV1,
      '@context': 'https://schema.iden3.io/core/jsonld/payment.jsonld#Iden3PaymentRailsSolanaV1',
      paymentData: {
        txId,
        chainId: proof.domain.chainId
      }
    };
  }

  private async handleIden3PaymentRailsSolanaSPLRequestV1(
    data: Iden3PaymentRailsSolanaSPLRequestV1,
    paymentHandler: (data: Iden3PaymentRailsSolanaSPLRequestV1) => Promise<string>
  ): Promise<Iden3PaymentRailsSolanaSPLV1> {
    if (data.expirationDate && new Date(data.expirationDate) < new Date()) {
      throw new Error(`failed request. expired request`);
    }
    const isValid = await verifyIden3SolanaPaymentRequest(data, this._params.documentResolver);
    if (!isValid) {
      throw new Error(`failed request. invalid Solana payment request signature`);
    }
    const proof = Array.isArray(data.proof) ? data.proof[0] : data.proof;
    const signer = proof.verificationMethod.split(':').slice(-1)[0];
    if (this._params.allowedSigners && !this._params.allowedSigners.includes(signer)) {
      throw new Error(`failed request. signer is not in the allowed signers list`);
    }
    const txId = await paymentHandler(data);
    return {
      nonce: data.nonce,
      type: PaymentType.Iden3PaymentRailsSolanaSPLV1,
      '@context': 'https://schema.iden3.io/core/jsonld/payment.jsonld#Iden3PaymentRailsSolanaSPLV1',
      paymentData: {
        txId,
        chainId: proof.domain.chainId,
        tokenAddress: data.tokenAddress
      }
    };
  }

  private async handleIden3PaymentRailsERC20RequestV1(
    data: Iden3PaymentRailsERC20RequestV1,
    paymentHandler: (data: Iden3PaymentRailsERC20RequestV1) => Promise<string>,
    approveHandler?: (data: Iden3PaymentRailsERC20RequestV1) => Promise<string>
  ): Promise<Iden3PaymentRailsERC20V1> {
    if (data.expirationDate && new Date(data.expirationDate) < new Date()) {
      throw new Error(`failed request. expired request`);
    }

    const signer = await verifyEIP712TypedData(data, this._params.documentResolver);
    if (this._params.allowedSigners && !this._params.allowedSigners.includes(signer)) {
      throw new Error(`failed request. signer is not in the allowed signers list`);
    }
    if (!data.features?.includes(PaymentFeatures.EIP_2612) && !approveHandler) {
      throw new Error(`please provide erc20TokenApproveHandler in context for ERC-20 payment type`);
    }

    if (approveHandler) {
      await approveHandler(data);
    }

    const txId = await paymentHandler(data);
    const proof = Array.isArray(data.proof) ? data.proof[0] : data.proof;
    return {
      nonce: data.nonce,
      type: PaymentType.Iden3PaymentRailsERC20V1,
      '@context': 'https://schema.iden3.io/core/jsonld/payment.jsonld#Iden3PaymentRailsERC20V1',
      paymentData: {
        txId,
        chainId: proof.eip712.domain.chainId,
        tokenAddress: data.tokenAddress
      }
    };
  }
}
