import { JSONObject, ProtocolMessage } from '../';
import { MediaType } from '../../constants';

/** @beta ProposalRequestMessage is struct the represents proposal-request message */
export type ProposalRequestMessage = {
  id: string;
  typ?: MediaType;
  type: ProtocolMessage;
  thid?: string;
  body?: ProposalRequestMessageBody;
  from?: string;
  to?: string;
};

/** @beta ProposalRequestMessageBody is struct the represents body for proposal-request */
export type ProposalRequestMessageBody = {
  credentials?: ProposalRequestCredential[];
  metadata?: { type: string; did_doc?: JSONObject };
  did_doc?: JSONObject;
};

/** @beta  ProposalResponseMessage is struct the represents proposal message */
export type ProposalResponseMessage = {
  id: string;
  typ?: MediaType;
  type: ProtocolMessage;
  thid?: string;
  body?: ProposalResponseMessageBody;
  from?: string;
  to?: string;
};

/** @beta  ProposalResponseMessageBody is struct the represents body for proposal response */
export type ProposalResponseMessageBody = {
  proposals: Proposal[];
};

/** @beta  ProposalRequestCredential is struct the represents proposal request credential */
export type ProposalRequestCredential = {
  type: string;
  context: string;
};

/** @beta Proposal is struct the represents proposal inside proposal protocol message */
export type Proposal = {
  credentials?: ProposalRequestCredential[];
  type: string;
  url?: string;
  expiration?: string;
  description?: string;
};
