import { MediaType } from '../../constants';
import {
  AuthorizationMessageResponseBody,
  AuthorizationRequestMessageBody,
  ZeroKnowledgeProofRequest
} from './auth';
import { ContractInvokeRequestBody } from './contract-request';
import {
  CredentialFetchRequestMessageBody,
  CredentialIssuanceRequestMessageBody,
  CredentialRefreshMessageBody,
  CredentialsOfferMessageBody,
  CredentialsOnchainOfferMessageBody,
  IssuanceMessageBody
} from './credentials';
import { MessageFetchRequestMessageBody } from './messages';
import { ProofGenerationRequestMessageBody, ProofGenerationResponseMessageBody } from './proof';
import {
  RevocationStatusRequestMessageBody,
  RevocationStatusResponseMessageBody
} from './revocation';

export type BasicMessageBody =
  | CredentialIssuanceRequestMessageBody
  | CredentialsOfferMessageBody
  | CredentialsOnchainOfferMessageBody
  | IssuanceMessageBody
  | CredentialFetchRequestMessageBody
  | CredentialRefreshMessageBody
  | ContractInvokeRequestBody
  | ZeroKnowledgeProofRequest
  | AuthorizationMessageResponseBody
  | AuthorizationRequestMessageBody
  | MessageFetchRequestMessageBody
  | ProofGenerationRequestMessageBody
  | ProofGenerationResponseMessageBody
  | RevocationStatusRequestMessageBody
  | RevocationStatusResponseMessageBody;

export type BasicMessage = {
  id: string;
  typ?: MediaType;
  type: string;
  thid?: string;
  body?: BasicMessageBody;
  from?: string;
  to?: string;
};
