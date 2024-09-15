import { PaymentRequestInfo } from './payment';

export type Iden3MetadataType = 'Iden3Metadata';
export type Iden3MetadataItem = PaymentRequestInfo;
export type Iden3Metadata = {
  type: Iden3MetadataType;
  data: Iden3MetadataItem[];
};
