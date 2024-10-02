import { PROTOCOL_MESSAGE_TYPE } from '../constants';
import { MediaType } from '../constants';
import { BasicMessage, IPackageManager, PackerParams } from '../types';

import { DID, getChainId } from '@iden3/js-iden3-core';
import * as uuid from 'uuid';
import { proving } from '@iden3/js-jwz';
import { byteEncoder } from '../../utils';
import { AbstractMessageHandler, IProtocolMessageHandler } from './message-handler';
import {
  Iden3PaymentCryptoV1,
  Iden3PaymentRailsRequestV1,
  Iden3PaymentRailsResponseV1,
  Iden3PaymentRequestCryptoV1,
  PaymentMessage,
  PaymentMessageBody,
  PaymentRequestInfo,
  PaymentRequestMessage
} from '../types/protocol/payment';
import {
  PaymentRequestDataType,
  PaymentRequestType,
  PaymentType,
  SupportedPaymentProofType
} from '../../verifiable';

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
  payments: PaymentRequestInfo[]
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
    }
  };
  return request;
}

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
  body: PaymentMessageBody
): PaymentMessage {
  const uuidv4 = uuid.v4();
  const request: PaymentMessage = {
    id: uuidv4,
    thid: uuidv4,
    from: sender.string(),
    to: receiver.string(),
    typ: MediaType.PlainMessage,
    type: PROTOCOL_MESSAGE_TYPE.PAYMENT_MESSAGE_TYPE,
    body
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
}

/** @beta PaymentRequestMessageHandlerOptions represents payment-request handler options */
export type PaymentRequestMessageHandlerOptions = {
  paymentHandler: (
    data: Iden3PaymentRequestCryptoV1 | Iden3PaymentRailsRequestV1
  ) => Promise<string>;
  multichainSelectedChainId?: string;
};

/** @beta PaymentHandlerOptions represents payment handler options */
export type PaymentHandlerOptions = {
  paymentRequest: PaymentRequestMessage;
  paymentValidationHandler: (
    txId: string,
    data: Iden3PaymentRequestCryptoV1 | Iden3PaymentRailsRequestV1
  ) => Promise<void>;
};

/** @beta PaymentHandlerParams represents payment handler params */
export type PaymentHandlerParams = {
  packerParams: PackerParams;
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

    const payments: (Iden3PaymentCryptoV1 | Iden3PaymentRailsResponseV1)[] = [];
    for (let i = 0; i < paymentRequest.body.payments.length; i++) {
      const paymentReq = paymentRequest.body.payments[i];
      if (paymentReq.type !== PaymentRequestType.PaymentRequest) {
        throw new Error(`failed request. not supported '${paymentReq.type}' payment type `);
      }

      // if multichain request
      if (Array.isArray(paymentReq.data)) {
        const issuerId = DID.idFromDID(receiverDID);
        const issuerChainId = getChainId(
          DID.blockchainFromId(issuerId),
          DID.networkIdFromId(issuerId)
        );
        ctx.multichainSelectedChainId = ctx.multichainSelectedChainId || issuerChainId.toString();

        const selectedPayment = paymentReq.data.find((p) => {
          const proofs = Array.isArray(p.proof) ? p.proof : [p.proof];
          const eip712Signature2021Proof = proofs.filter(
            (p) => p.type === SupportedPaymentProofType.EthereumEip712Signature2021
          )[0];
          if (!eip712Signature2021Proof) {
            return false;
          }
          return eip712Signature2021Proof.eip712.domain.chainId === ctx.multichainSelectedChainId;
        });

        if (!selectedPayment) {
          throw new Error(
            `failed request. no payment in request for chain id ${ctx.multichainSelectedChainId}`
          );
        }

        if (selectedPayment.type !== PaymentRequestDataType.Iden3PaymentRailsRequestV1) {
          throw new Error(`failed request. not supported '${selectedPayment.type}' payment type `);
        }

        const txId = await ctx.paymentHandler(selectedPayment);

        payments.push({
          nonce: selectedPayment.nonce,
          type: PaymentType.Iden3PaymentRailsResponseV1,
          paymentData: {
            txId,
            chainId: ctx.multichainSelectedChainId
          }
        });

        continue;
      }

      if (paymentReq.data.type !== PaymentRequestDataType.Iden3PaymentRequestCryptoV1) {
        throw new Error(`failed request. not supported '${paymentReq.data.type}' payment type `);
      }

      const txId = await ctx.paymentHandler(paymentReq.data);

      payments.push({
        id: paymentReq.data.id,
        type: PaymentType.Iden3PaymentCryptoV1,
        paymentData: {
          txId
        }
      });
    }

    const paymentMessage = createPayment(senderDID, receiverDID, { payments });
    const response = await this.packMessage(paymentMessage, senderDID);

    const agentResult = await fetch(paymentRequest.body.agent, {
      method: 'POST',
      body: response,
      headers: {
        'Content-Type': 'application/octet-stream'
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

    const paymentRequest = await this.parsePaymentRequest(request);
    if (!paymentRequest.from) {
      throw new Error(`failed request. empty 'from' field`);
    }

    if (!paymentRequest.to) {
      throw new Error(`failed request. empty 'to' field`);
    }

    const agentMessage = await this.handlePaymentRequestMessage(paymentRequest, opts);
    if (!agentMessage) {
      return null;
    }

    const senderDID = DID.parse(paymentRequest.to);
    return this.packMessage(agentMessage, senderDID);
  }

  /**
   * @inheritdoc IPaymentHandler#handlePayment
   */
  async handlePayment(payment: PaymentMessage, opts: PaymentHandlerOptions) {
    if (opts.paymentRequest.from !== payment.to) {
      throw new Error(
        `sender of the request is not a target of response - expected ${opts.paymentRequest.from}, given ${payment.to}`
      );
    }

    if (!payment.body.payments.length) {
      throw new Error(`failed request. empty 'payments' field in body`);
    }

    for (let i = 0; i < payment.body.payments.length; i++) {
      const p = payment.body.payments[i];
      let data: Iden3PaymentRequestCryptoV1 | Iden3PaymentRailsRequestV1 | undefined;
      switch (p.type) {
        case PaymentType.Iden3PaymentCryptoV1: {
          data = opts.paymentRequest.body.payments.find(
            (r) => (r.data as Iden3PaymentRequestCryptoV1).id === p.id
          )?.data as Iden3PaymentRequestCryptoV1;
          if (!data) {
            throw new Error(`can't find payment request for payment id ${p.id}`);
          }
          break;
        }
        case PaymentType.Iden3PaymentRailsResponseV1: {
          for (let j = 0; j < opts.paymentRequest.body.payments.length; j++) {
            const paymentReq = opts.paymentRequest.body.payments[j];
            if (Array.isArray(paymentReq.data)) {
              const selectedPayment = paymentReq.data.find(
                (r) => (r as Iden3PaymentRailsRequestV1).nonce === p.nonce
              ) as Iden3PaymentRailsRequestV1;
              if (selectedPayment) {
                data = selectedPayment;
                break;
              }
            }
          }

          if (!data) {
            throw new Error(`can't find payment request for payment nonce ${p.nonce}`);
          }
          break;
        }
        default:
          throw new Error(`failed request. not supported '${p.type}' payment type `);
      }
      if (!opts.paymentValidationHandler) {
        throw new Error(`please provide payment validation handler in options`);
      }
      await opts.paymentValidationHandler(p.paymentData.txId, data);
    }
  }

  private async packMessage(message: BasicMessage, senderDID: DID): Promise<Uint8Array> {
    const responseEncoded = byteEncoder.encode(JSON.stringify(message));
    const packerOpts =
      this._params.packerParams.mediaType === MediaType.SignedMessage
        ? this._params.packerParams.packerOptions
        : {
            provingMethodAlg: proving.provingMethodGroth16AuthV2Instance.methodAlg
          };
    return await this._packerMgr.pack(this._params.packerParams.mediaType, responseEncoded, {
      senderDID,
      ...packerOpts
    });
  }
}
