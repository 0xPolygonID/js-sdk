import { W3CCredential } from '../../../verifiable';
import { BasicMessage, JSONObject } from '../packer';
import { ContractInvokeTransactionData } from './contract-request';

/** CredentialIssuanceRequestMessageBody represents data for credential issuance request */
export type CredentialIssuanceRequestMessageBody = {
  schema: Schema;
  data: JSONObject;
  expiration: number;
};

/** CredentialIssuanceRequestMessage represent Iden3message for credential request */
export type CredentialIssuanceRequestMessage = Required<BasicMessage> & {
  body: CredentialIssuanceRequestMessageBody;
};

/** CredentialsOfferMessage represent Iden3message for credential offer */
export type CredentialsOfferMessage = Required<BasicMessage> & {
  body: CredentialsOfferMessageBody;
};

/** CredentialsOfferMessageBody is struct the represents offer message */
export type CredentialsOfferMessageBody = {
  url: string;
  credentials: CredentialOffer[];
};

/** CredentialsOnchainOfferMessage represent Iden3message for credential onhcain offer message */
export type CredentialsOnchainOfferMessage = Required<BasicMessage> & {
  body: CredentialsOnchainOfferMessageBody;
};

/** CredentialsOnchainOfferMessageBody is struct the represents onchain offer message body */
export type CredentialsOnchainOfferMessageBody = {
  credentials: CredentialOffer[];
  transaction_data: ContractInvokeTransactionData;
};

/** CredentialOffer is structure to fetch credential */
export type CredentialOffer = {
  id: string;
  description: string;
};

/** CredentialIssuanceMessage represent Iden3message for credential issuance */
export type CredentialIssuanceMessage = Required<BasicMessage> & {
  body: IssuanceMessageBody;
};

/** IssuanceMessageBody is struct the represents message when credential is issued */
export type IssuanceMessageBody = {
  credential: W3CCredential;
};

/** CredentialFetchRequestMessage represent Iden3message for credential fetch request */
export type CredentialFetchRequestMessage = BasicMessage & {
  body?: CredentialFetchRequestMessageBody;
};

/** CredentialFetchRequestMessageBody is msg body for fetch request */
export type CredentialFetchRequestMessageBody = {
  id: string;
};

/** Schema represents location and type where it's stored */
export type Schema = {
  hash?: string;
  url: string;
  type: string;
};

/** CredentialRefreshMessage represent Iden3message for credential refresh request */
export type CredentialRefreshMessage = Required<BasicMessage> & {
  body?: CredentialRefreshMessageBody;
};

/** CredentialRefreshMessageBody is msg body for refresh request */
export type CredentialRefreshMessageBody = {
  id: string;
  reason: string;
};
