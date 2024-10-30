import { PROTOCOL_MESSAGE_TYPE } from '../constants';
import { MediaType } from '../constants';
import { BasicMessage, IPackageManager, PackerParams } from '../types';

import { DID } from '@iden3/js-iden3-core';
import * as uuid from 'uuid';
import { proving } from '@iden3/js-jwz';
import { byteEncoder } from '../../utils';
import { AbstractMessageHandler, IProtocolMessageHandler } from './message-handler';
import {
  Iden3PaymentCryptoV1,
  Iden3PaymentRailsERC20RequestV1,
  Iden3PaymentRailsERC20V1,
  Iden3PaymentRailsRequestV1,
  Iden3PaymentRailsV1,
  Iden3PaymentRequestCryptoV1,
  PaymentMessage,
  PaymentRequestInfo,
  PaymentRequestMessage
} from '../types/protocol/payment';
import {
  PaymentFeatures,
  PaymentRequestDataType,
  PaymentType,
  SupportedCurrencies,
  SupportedPaymentProofType
} from '../../verifiable';
import { Contract, Signer } from 'ethers';

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
 * PaymentRailsChainInfo represents chain info for payment rails
 */
export type PaymentRailsChainInfo = {
  nonce: bigint;
  amount: bigint;
  currency: SupportedCurrencies;
  chainId: string;
  recipient: string;
  verifyingContract: string;
  expirationDate?: Date;
};

/**
 * @beta
 * ERC20PaymentRailsChainInfo represents chain info for ERC-20 payment rails
 */
export type ERC20PaymentRailsChainInfo = PaymentRailsChainInfo & {
  tokenAddress: string;
  features?: PaymentFeatures[];
};

/**
 * @beta
 * createPaymentRailsV1 is a function to create protocol payment message
 * @param {DID} sender - sender did
 * @param {DID} receiver - receiver did
 * @param {Signer} signer - receiver did
 * @param {string} agent - agent URL
 * @param opts - payment options
 * @returns {Promise<PaymentRequestMessage>}
 */
export async function createPaymentRailsV1(
  sender: DID,
  receiver: DID,
  agent: string,
  signer: Signer,
  opts: {
    payments: [
      {
        credentials: {
          type: string;
          context: string;
        }[];
        description?: string;
        chains: PaymentRailsChainInfo[];
      }
    ];
  }
): Promise<PaymentRequestMessage> {
  const payments: PaymentRequestInfo[] = [];
  for (let i = 0; i < opts.payments.length; i++) {
    const { credentials, description } = opts.payments[i];
    const dataArr: Iden3PaymentRailsRequestV1[] = [];
    for (let j = 0; j < opts.payments[i].chains.length; j++) {
      const { nonce, amount, currency, chainId, recipient, verifyingContract, expirationDate } =
        opts.payments[i].chains[j];

      if (recipient !== (await signer.getAddress())) {
        throw new Error('recipient is not the signer');
      }
      const typeUrl = 'https://schema.iden3.io/core/json/Iden3PaymentRailsRequestV1.json';
      const typesFetchResult = await fetch(typeUrl);
      const types = await typesFetchResult.json();
      delete types.EIP712Domain;
      const paymentData = {
        recipient,
        amount,
        expirationDate: expirationDate?.getTime() ?? 0,
        nonce,
        metadata: '0x'
      };

      const domain = {
        name: 'MCPayment',
        version: '1.0.0',
        chainId,
        verifyingContract
      };
      const signature = await signer.signTypedData(domain, types, paymentData);
      dataArr.push({
        type: PaymentRequestDataType.Iden3PaymentRailsRequestV1,
        '@context': [
          'https://schema.iden3.io/core/jsonld/payment.jsonld#Iden3PaymentRailsRequestV1',
          'https://w3id.org/security/suites/eip712sig-2021/v1'
        ],
        recipient,
        amount: amount.toString(),
        currency,
        expirationDate: expirationDate?.toISOString() ?? '',
        nonce: nonce.toString(),
        metadata: '0x',
        proof: [
          {
            type: SupportedPaymentProofType.EthereumEip712Signature2021,
            proofPurpose: 'assertionMethod',
            proofValue: signature,
            verificationMethod: `did:pkh:eip155:${chainId}:${recipient}#blockchainAccountId`,
            created: new Date().toISOString(),
            eip712: {
              types: typeUrl,
              primaryType: 'Iden3PaymentRailsRequestV1',
              domain
            }
          }
        ]
      });
    }
    payments.push({
      data: dataArr,
      credentials,
      description
    });
  }
  return createPaymentRequest(sender, receiver, agent, payments);
}

/**
 * @beta
 * createPaymentRailsV1 is a function to create protocol payment message
 * @param {DID} sender - sender did
 * @param {DID} receiver - receiver did
 * @param {Signer} signer - receiver did
 * @param {string} agent - agent URL
 * @param opts - payment options
 * @returns {Promise<PaymentRequestMessage>}
 */
export async function createERC20PaymentRailsV1(
  sender: DID,
  receiver: DID,
  agent: string,
  signer: Signer,
  opts: {
    payments: [
      {
        credentials: {
          type: string;
          context: string;
        }[];
        description?: string;
        chains: ERC20PaymentRailsChainInfo[];
      }
    ];
  }
): Promise<PaymentRequestMessage> {
  const payments: PaymentRequestInfo[] = [];
  for (let i = 0; i < opts.payments.length; i++) {
    const { credentials, description } = opts.payments[i];
    const dataArr: Iden3PaymentRailsERC20RequestV1[] = [];
    for (let j = 0; j < opts.payments[i].chains.length; j++) {
      const {
        tokenAddress,
        features,
        nonce,
        amount,
        currency,
        chainId,
        recipient,
        verifyingContract,
        expirationDate
      } = opts.payments[i].chains[j];

      if (recipient !== (await signer.getAddress())) {
        throw new Error('recipient is not the signer');
      }
      const typeUrl = 'https://schema.iden3.io/core/json/Iden3PaymentRailsERC20RequestV1.json';
      const typesFetchResult = await fetch(typeUrl);
      const types = await typesFetchResult.json();
      delete types.EIP712Domain;
      const paymentData = {
        tokenAddress,
        recipient,
        amount,
        expirationDate: expirationDate?.getTime() ?? 0,
        nonce,
        metadata: '0x'
      };

      const domain = {
        name: 'MCPayment',
        version: '1.0.0',
        chainId,
        verifyingContract
      };
      const signature = await signer.signTypedData(domain, types, paymentData);
      dataArr.push({
        type: PaymentRequestDataType.Iden3PaymentRailsERC20RequestV1,
        '@context': [
          'https://schema.iden3.io/core/jsonld/payment.jsonld#Iden3PaymentRailsERC20RequestV1',
          'https://w3id.org/security/suites/eip712sig-2021/v1'
        ],
        features: features || [],
        tokenAddress,
        recipient,
        amount: amount.toString(),
        currency,
        expirationDate: expirationDate?.toISOString() ?? '',
        nonce: nonce.toString(),
        metadata: '0x',
        proof: [
          {
            type: SupportedPaymentProofType.EthereumEip712Signature2021,
            proofPurpose: 'assertionMethod',
            proofValue: signature,
            verificationMethod: `did:pkh:eip155:${chainId}:${recipient}#blockchainAccountId`,
            created: new Date().toISOString(),
            eip712: {
              types: typeUrl,
              primaryType: 'Iden3PaymentRailsRequestV1',
              domain
            }
          }
        ]
      });
    }
    payments.push({
      data: dataArr,
      credentials,
      description
    });
  }
  return createPaymentRequest(sender, receiver, agent, payments);
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
  payments: (Iden3PaymentCryptoV1 | Iden3PaymentRailsV1 | Iden3PaymentRailsERC20V1)[]
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
    data: Iden3PaymentRequestCryptoV1 | Iden3PaymentRailsRequestV1 | Iden3PaymentRailsERC20RequestV1
  ) => Promise<string>;
  /*
   selected payment nonce (for Iden3PaymentRequestCryptoV1 type it should be equal to Payment id field)
  */
  nonce: string;
  erc20TokenApproveHandler?: (data: Iden3PaymentRailsERC20RequestV1) => Promise<string>;
};

/** @beta PaymentHandlerOptions represents payment handler options */
export type PaymentHandlerOptions = {
  paymentRequest: PaymentRequestMessage;
  paymentValidationHandler: (
    txId: string,
    data: Iden3PaymentRequestCryptoV1 | Iden3PaymentRailsRequestV1 | Iden3PaymentRailsERC20RequestV1
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

    const payments: (Iden3PaymentCryptoV1 | Iden3PaymentRailsV1 | Iden3PaymentRailsERC20V1)[] = [];
    for (let i = 0; i < paymentRequest.body.payments.length; i++) {
      const paymentReq = paymentRequest.body.payments[i];
      const dataArray = Array.isArray(paymentReq.data) ? paymentReq.data : [paymentReq.data];
      const selectedPayment =
        dataArray.length === 1
          ? dataArray[0]
          : dataArray.find((p) => {
              return p.type === PaymentRequestDataType.Iden3PaymentRequestCryptoV1
                ? p.id === ctx.nonce
                : p.nonce === ctx.nonce;
            });

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
      }
    }

    const paymentMessage = createPayment(senderDID, receiverDID, payments);
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
  async handlePayment(payment: PaymentMessage, params: PaymentHandlerOptions) {
    if (params.paymentRequest.from !== payment.to) {
      throw new Error(
        `sender of the request is not a target of response - expected ${params.paymentRequest.from}, given ${payment.to}`
      );
    }

    if (!payment.body.payments.length) {
      throw new Error(`failed request. empty 'payments' field in body`);
    }

    for (let i = 0; i < payment.body.payments.length; i++) {
      const p = payment.body.payments[i];
      let data:
        | Iden3PaymentRequestCryptoV1
        | Iden3PaymentRailsRequestV1
        | Iden3PaymentRailsERC20RequestV1
        | undefined;
      switch (p.type) {
        case PaymentType.Iden3PaymentCryptoV1: {
          data = params.paymentRequest.body.payments.find(
            (r) => (r.data as Iden3PaymentRequestCryptoV1).id === p.id
          )?.data as Iden3PaymentRequestCryptoV1;
          if (!data) {
            throw new Error(`can't find payment request for payment id ${p.id}`);
          }
          break;
        }
        case PaymentType.Iden3PaymentRailsV1:
        case PaymentType.Iden3PaymentRailsERC20V1: {
          for (let j = 0; j < params.paymentRequest.body.payments.length; j++) {
            const paymentReq = params.paymentRequest.body.payments[j];
            if (Array.isArray(paymentReq.data)) {
              const selectedPayment = paymentReq.data.find(
                (r) => (r as { nonce: string }).nonce === p.nonce
              );
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
      if (!params.paymentValidationHandler) {
        throw new Error(`please provide payment validation handler in options`);
      }
      await params.paymentValidationHandler(p.paymentData.txId, data);
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
      '@context': 'https://schema.iden3.io/core/jsonld/payment.jsonld',
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
    const txId = await paymentHandler(data);
    const proof = Array.isArray(data.proof) ? data.proof[0] : data.proof;
    return {
      nonce: data.nonce,
      type: PaymentType.Iden3PaymentRailsV1,
      '@context': 'https://schema.iden3.io/core/jsonld/payment.jsonld',
      paymentData: {
        txId,
        chainId: proof.eip712.domain.chainId
      }
    };
  }

  private async handleIden3PaymentRailsERC20RequestV1(
    data: Iden3PaymentRailsERC20RequestV1,
    paymentHandler: (data: Iden3PaymentRailsERC20RequestV1) => Promise<string>,
    approveHandler?: (data: Iden3PaymentRailsERC20RequestV1) => Promise<string>
  ): Promise<Iden3PaymentRailsERC20V1> {
    if (!data.features?.includes(PaymentFeatures.EIP_2612)) {
      if (!approveHandler) {
        throw new Error(
          `please provide erc20TokenApproveHandler in context for ERC-20 payment type`
        );
      }

      await approveHandler(data);
    }

    const txId = await paymentHandler(data);
    const proof = Array.isArray(data.proof) ? data.proof[0] : data.proof;
    return {
      nonce: data.nonce,
      type: PaymentType.Iden3PaymentRailsERC20V1,
      '@context': 'https://schema.iden3.io/core/jsonld/payment.jsonld',
      paymentData: {
        txId,
        chainId: proof.eip712.domain.chainId,
        tokenAddress: data.tokenAddress
      }
    };
  }
}
