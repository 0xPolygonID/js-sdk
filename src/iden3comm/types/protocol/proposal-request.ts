import { BasicMessage, DIDDocument } from '../';
import { PROTOCOL_MESSAGE_TYPE } from '../../constants';
import { CredentialSchemaInfo } from './common';

/** @beta ProposalRequestMessage is struct the represents proposal-request message */
export type ProposalRequestMessage = BasicMessage & {
  body: ProposalRequestMessageBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.PROPOSAL_REQUEST_MESSAGE_TYPE;
};

/** @beta  ProposalRequestCredential is struct the represents proposal request credential */
export type ProposalRequestCredential = CredentialSchemaInfo;

/** @beta ProposalRequestMessageBody is struct the represents body for proposal-request */
export type ProposalRequestMessageBody = {
  credentials: ProposalRequestCredential[];
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

/** @beta Proposal is struct the represents proposal inside proposal protocol message */
export type Proposal = {
  credentials: ProposalRequestCredential[];
  type: string;
  url?: string;
  expiration?: string;
  description?: string;
};
