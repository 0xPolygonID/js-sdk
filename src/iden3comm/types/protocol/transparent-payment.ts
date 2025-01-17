// package protocol

import { PROTOCOL_MESSAGE_TYPE } from '../../constants';
import { RequiredBasicMessage } from '../packer';

export type TransparentPaymentInstructionMessage = RequiredBasicMessage & {
  body: TransparentPaymentInstructionMessageBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.TRANSPARENT_PAYMENT_INSTRUCTION_MESSAGE_TYPE;
};

export type TransparentPaymentInstructionMessageBody = {
  goal_code: string;
  did?: string;
  credentials: TransparentCredential[];
  paymentData: TransparentPaymentData;
};

export type TransparentCredential = {
  context: string;
  type: string;
};

export type TransparentPaymentData = {
  type: string;
  signature: string;
  recipient: string;
  amount: string;
  token?: string;
  expiration: number;
  nonce: number;
  metadata?: string;
};
