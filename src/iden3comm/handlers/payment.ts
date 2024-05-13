import { PROTOCOL_MESSAGE_TYPE } from '../constants';
import { MediaType } from '../constants';
import { BasicMessage, IPackageManager, PackerParams } from '../types';

import { DID } from '@iden3/js-iden3-core';
import * as uuid from 'uuid';
import { proving } from '@iden3/js-jwz';
import { byteEncoder } from '../../utils';
import { AbstractMessageHandler, IProtocolMessageHandler } from './message-handler';
import {
  PaymentInfo,
  PaymentMessage,
  PaymentRequestDataInfo,
  PaymentRequestInfo,
  PaymentRequestMessage
} from '../types/protocol/payment';
import { PaymentRequestDataType, PaymentRequestType, PaymentType } from '../../verifiable';

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
 * @param {PaymentInfo[]} payments - payments
 * @returns `PaymentMessage`
 */
export function createPayment(sender: DID, receiver: DID, payments: PaymentInfo[]): PaymentMessage {
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
    }
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
   * @returns {Promise<Uint8Array>} - payment message
   */
  handlePaymentRequest(
    request: Uint8Array,
    opts: PaymentRequestMessageHandlerOptions
  ): Promise<Uint8Array>;

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
  txParams: unknown[];
  paymentHandler: (data: PaymentRequestDataInfo, txParams: unknown[]) => Promise<string>;
};

/** @beta PaymentHandlerOptions represents payment handler options */
export type PaymentHandlerOptions = {
  paymentRequest: PaymentRequestMessage;
  checkPaymentHandler: (txId: string, data: PaymentRequestDataInfo) => Promise<void>;
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
        return (await this.handlePaymentRequestMessage(
          message as PaymentRequestMessage,
          context as PaymentRequestMessageHandlerOptions
        )) as BasicMessage;
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
    const paymentRequest = message as unknown as PaymentRequestMessage;
    if (message.type !== PROTOCOL_MESSAGE_TYPE.PAYMENT_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid media type');
    }
    return paymentRequest;
  }

  private async handlePaymentRequestMessage(
    paymentRequest: PaymentRequestMessage,
    ctx: PaymentRequestMessageHandlerOptions
  ): Promise<BasicMessage> {
    if (!paymentRequest.to) {
      throw new Error(`failed request. empty 'to' field`);
    }

    if (!paymentRequest.from) {
      throw new Error(`failed request. empty 'from' field`);
    }

    if (!paymentRequest.body?.payments?.length) {
      throw new Error(`failed request. no 'payments' in body`);
    }

    const senderDID = DID.parse(paymentRequest.from);
    const receiverDID = DID.parse(paymentRequest.to);

    const payments: PaymentInfo[] = [];
    for (let i = 0; i < paymentRequest.body.payments.length; i++) {
      const paymentReq = paymentRequest.body.payments[i];
      if (paymentReq.type !== PaymentRequestType.PaymentRequest) {
        throw new Error(`failed request. not supported '${paymentReq.type}' payment type `);
      }

      if (paymentReq.data.type !== PaymentRequestDataType.Iden3PaymentRequestCryptoV1) {
        throw new Error(`failed request. not supported '${paymentReq.data.type}' payment type `);
      }

      const txID = await ctx.paymentHandler(paymentReq.data, ctx.txParams);

      payments.push({
        id: paymentReq.data.id,
        type: PaymentType.Iden3PaymentCryptoV1,
        paymentData: {
          txID
        }
      });
    }

    const paymentMessage = createPayment(receiverDID, senderDID, payments);
    const responseEncoded = byteEncoder.encode(JSON.stringify(paymentMessage));
    const packerOpts =
      this._params.packerParams.mediaType === MediaType.SignedMessage
        ? this._params.packerParams.packerOptions
        : {
            provingMethodAlg: proving.provingMethodGroth16AuthV2Instance.methodAlg
          };
    const response = await this._packerMgr.pack(
      this._params.packerParams.mediaType,
      responseEncoded,
      {
        senderDID,
        ...packerOpts
      }
    );

    const agentResult = await fetch(paymentRequest.body.agent, {
      method: 'POST',
      body: response,
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    });

    const agentMessage = await agentResult.json();

    if (!agentMessage) {
      throw new Error('empty response from agent');
    }
    return agentMessage as BasicMessage;
  }

  /**
   * @inheritdoc IPaymentHandler#handlePaymentRequest
   */
  async handlePaymentRequest(
    request: Uint8Array,
    opts: PaymentRequestMessageHandlerOptions
  ): Promise<Uint8Array> {
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

    const agentMessage = await this.handlePaymentRequestMessage(paymentRequest, opts);

    const response = byteEncoder.encode(JSON.stringify(agentMessage));
    const packerOpts =
      this._params.packerParams.mediaType === MediaType.SignedMessage
        ? this._params.packerParams.packerOptions
        : {
            provingMethodAlg: proving.provingMethodGroth16AuthV2Instance.methodAlg
          };

    const senderDID = DID.parse(paymentRequest.from);
    return this._packerMgr.pack(this._params.packerParams.mediaType, response, {
      senderDID,
      ...packerOpts
    });
  }

  /**
   * @inheritdoc IPaymentHandler#handlePayment
   */
  async handlePayment(payment: PaymentMessage, opts: PaymentHandlerOptions) {
    if (opts.paymentRequest && opts.paymentRequest.from !== payment.to) {
      throw new Error(
        `sender of the request is not a target of response - expected ${opts.paymentRequest.from}, given ${payment.to}`
      );
    }

    if (!payment.body?.payments.length) {
      throw new Error(`failed request. empty 'payments' field in body`);
    }

    for (let i = 0; i < payment.body.payments.length; i++) {
      const p = payment.body?.payments[i];
      const paymentRequestData = opts.paymentRequest.body?.payments.find((r) => r.data.id === p.id);
      if (!paymentRequestData) {
        throw new Error(`can't find payment request for payment id ${p.id}`);
      }
      await opts.checkPaymentHandler(p.paymentData.txID, paymentRequestData.data);
    }
  }
}
