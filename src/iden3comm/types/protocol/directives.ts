import { PROTOCOL_MESSAGE_TYPE } from '../../constants';

export enum Iden3DirectiveType {
  TransparentPaymentDirective = 'TransparentPaymentDirective'
}

export type TransparentPaymentDirectivePayload = {
  credentials: {
    type: string;
    context: string;
  }[];
  paymentData: {
    recipient: string;
    amount: string;
    token?: string;
    expiration: string;
    nonce: string;
    metadata: string;
  }[];
  description?: string;
};

export type TransparentPaymentDirective = {
  type: Iden3DirectiveType.TransparentPaymentDirective;
  purpose?: (typeof PROTOCOL_MESSAGE_TYPE)[keyof typeof PROTOCOL_MESSAGE_TYPE];
  data: TransparentPaymentDirectivePayload[];
};

export enum Iden3AttachmentType {
  Iden3Directive = 'Iden3Directive'
}

export type Iden3Directive = TransparentPaymentDirective; // Union type if more directive types are added later

export type Iden3Directives = {
  type: Iden3AttachmentType;
  context?: string;
  directives: Iden3Directive[];
};

export type DirectiveAttachment = {
  data: Iden3Directives;
};
