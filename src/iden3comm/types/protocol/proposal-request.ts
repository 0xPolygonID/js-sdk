import { BasicMessage, DIDDocument, JsonDocumentObject } from '../';
import { PROTOCOL_MESSAGE_TYPE } from '../../constants';
import { PaymentRequestInfo } from './payment';

export type Iden3MetadataType = 'Iden3Metadata';
export type Iden3MetadataItem = PaymentRequestInfo;
export type Iden3Metadata = {
  type: Iden3MetadataType;
  data: Iden3MetadataItem | Iden3MetadataItem[];
};

/** @beta ProposalRequestMessage is struct the represents proposal-request message */
export type ProposalRequestMessage = BasicMessage & {
  body: ProposalRequestMessageBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.PROPOSAL_REQUEST_MESSAGE_TYPE;
};

/** @beta ProposalRequestMessageBody is struct the represents body for proposal-request */
export type ProposalRequestMessageBody = {
  credentials: ProposalRequestCredential[];
  metadata?: {
    type: string;
    data: JsonDocumentObject | JsonDocumentObject[];
  };
  did_doc?: DIDDocument;
};

/** @beta  ProposalMessage is struct the represents proposal message */
export type ProposalMessage = BasicMessage & {
  body: ProposalMessageBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.PROPOSAL_MESSAGE_TYPE;
};

/** @beta  ProposalMessageBody is struct the represents body for proposal message */
export type ProposalMessageBody = {
  proposals: Proposal[];
};

/** @beta  ProposalRequestCredential is struct the represents proposal request credential */
export type ProposalRequestCredential = {
  type: string;
  context: string;
};

/** @beta Proposal is struct the represents proposal inside proposal protocol message */
export type Proposal = {
  credentials: ProposalRequestCredential[];
  type: string;
  url?: string;
  expiration?: string;
  description?: string;
};
