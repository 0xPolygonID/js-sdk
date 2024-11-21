import { PROTOCOL_MESSAGE_TYPE } from '../../constants';
import { PaymentRequestInfo } from './payment';

export enum Iden3DirectiveType {
  TransparentPaymentDirective = 'TransparentPaymentDirective'
}

export type TransparentPaymentDirective = {
  type: Iden3DirectiveType;
  purpose?: (typeof PROTOCOL_MESSAGE_TYPE)[keyof typeof PROTOCOL_MESSAGE_TYPE];
  paymentData: PaymentRequestInfo[];
};

export enum Iden3AttachmentType {
  Iden3Directives = 'Iden3Directives'
}

export type Iden3Directive = TransparentPaymentDirective; // Union type if more directive types are added later

export type Iden3Directives = {
  type: Iden3AttachmentType;
  context?: string;
  directives: Iden3Directive[];
};

export type Attachment = {
  data: Iden3Directives;
};