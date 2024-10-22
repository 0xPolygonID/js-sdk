import { BasicMessage } from '../';
import {
  PaymentRequestDataType,
  PaymentRequestType,
  PaymentType,
  SupportedCurrencies
} from '../../../verifiable';
import { PROTOCOL_MESSAGE_TYPE } from '../../constants';

/** @beta PaymentRequestMessage is struct the represents payment-request message */
export type PaymentRequestMessage = BasicMessage & {
  body: PaymentRequestMessageBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.PAYMENT_REQUEST_MESSAGE_TYPE;
  to: string;
};

/** @beta PaymentRequestMessageBody is struct the represents body for payment-request */
export type PaymentRequestMessageBody = {
  agent: string;
  payments: PaymentRequestInfo[];
};

/** @beta PaymentRequestInfo is struct the represents payment info for payment-request */
export type PaymentRequestInfo = {
  credentials: {
    type: string;
    context: string;
  }[];
  type: PaymentRequestType;
  data: PaymentRequestDataInfo;
  expiration?: string;
  description?: string;
};

/** @beta PaymentRequestDataInfo is struct the represents payment data info for payment-request */
export type PaymentRequestDataInfo = {
  type: PaymentRequestDataType;
  amount: string;
  id: string;
  chainId: string;
  address: string;
  currency: SupportedCurrencies;
  signature?: string;
};

/** @beta  PaymentMessage is struct the represents payment message */
export type PaymentMessage = BasicMessage & {
  body: PaymentMessageBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.PAYMENT_MESSAGE_TYPE;
};

/** @beta  PaymentMessageBody is struct the represents body for payment message */
export type PaymentMessageBody = {
  payments: PaymentInfo[];
};

/** @beta PaymentInfo is struct the represents payment info for payment */
export type PaymentInfo = {
  id: string;
  type: PaymentType;
  paymentData: {
    txId: string;
  };
};
