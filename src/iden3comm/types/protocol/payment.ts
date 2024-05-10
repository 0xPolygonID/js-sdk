import { BasicMessage } from '../';
import { PaymentRequestDataType, PaymentRequestType, PaymentType } from '../../../verifiable';

/** @beta PaymentRequestMessage is struct the represents payment-request message */
export type PaymentRequestMessage = BasicMessage & {
  body?: PaymentRequestMessageBody;
};

/** @beta PaymentRequestMessageBody is struct the represents body for payment-request */
export type PaymentRequestMessageBody = {
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
  agent: string;
  expiration: number;
  description: string;
};

/** @beta PaymentRequestDataInfo is struct the represents payment data info for payment-request */
export type PaymentRequestDataInfo = {
  type: PaymentRequestDataType;
  amount: string;
  id: number;
  chainID: number;
  address: string;
  signature?: string;
};

/** @beta  PaymentMessage is struct the represents payment message */
export type PaymentMessage = BasicMessage & {
  body?: PaymentMessageBody;
};

/** @beta  PaymentMessageBody is struct the represents body for payment message */
export type PaymentMessageBody = {
  payments: PaymentInfo[];
};

/** @beta PaymentInfo is struct the represents payment info for payment */
export type PaymentInfo = {
  id: number;
  type: PaymentType;
  paymentData: {
    txID: string;
  };
};
