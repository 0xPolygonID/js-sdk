import { PROTOCOL_MESSAGE_TYPE } from '../../constants';

export enum Iden3DirectiveType {
  TransparentPaymentDirective = 'TransparentPaymentDirective'
}

export type TransparentPaymentCredential = {
  type: string;
  context: string;
};

export type TransparentPaymentRequestData = {
  recipient: string;
  amount: string;
  token?: string;
  expiration: string;
  nonce: string;
  metadata: string;
};

export type TransparentPaymentDirectivePayload = {
  credential: TransparentPaymentCredential;
  paymentData: TransparentPaymentRequestData;
  permitSignature: string;
  description?: string;
};

export type TransparentPaymentDirective = {
  type: Iden3DirectiveType.TransparentPaymentDirective;
  purpose?: (typeof PROTOCOL_MESSAGE_TYPE)[keyof typeof PROTOCOL_MESSAGE_TYPE];
  context?: string;
  data: TransparentPaymentDirectivePayload[];
};

export enum Iden3AttachmentType {
  Iden3Directive = 'Iden3Directive'
}

export type Iden3Directive = TransparentPaymentDirective; // Union type if more directive types are added later

export type Iden3Directives = {
  type: Iden3AttachmentType;
  directives: Iden3Directive[];
};

export type DirectiveAttachment = {
  data: Iden3Directives;
};
