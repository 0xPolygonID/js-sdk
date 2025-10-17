import { FlattenedJWE, GeneralJWE } from 'jose';
import { W3CCredential } from '../../../verifiable';
import { PROTOCOL_MESSAGE_TYPE } from '../../constants';
import { BasicMessage, JsonDocumentObject, RequiredBasicMessage } from '../packer';
import { ContractInvokeTransactionData } from './contract-request';

/** CredentialIssuanceRequestMessageBody represents data for credential issuance request */
export type CredentialIssuanceRequestMessageBody = {
  schema: Schema;
  data: JsonDocumentObject;
  expiration: number;
};

/** CredentialIssuanceRequestMessage represent Iden3message for credential request */
export type CredentialIssuanceRequestMessage = RequiredBasicMessage & {
  body: CredentialIssuanceRequestMessageBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ISSUANCE_REQUEST_MESSAGE_TYPE;
};

/** CredentialsOfferMessage represent Iden3message for credential offer */
export type CredentialsOfferMessage = RequiredBasicMessage & {
  body: CredentialsOfferMessageBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE;
};

/** CredentialsOfferMessageBody is struct the represents offer message */
export type CredentialsOfferMessageBody = {
  url: string;
  credentials: CredentialOffer[];
};

/** CredentialsOnchainOfferMessage represent Iden3message for credential onchain offer message */
export type CredentialsOnchainOfferMessage = RequiredBasicMessage & {
  body: CredentialsOnchainOfferMessageBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ONCHAIN_OFFER_MESSAGE_TYPE;
};

/** CredentialsOnchainOfferMessageBody is struct the represents onchain offer message body */
export type CredentialsOnchainOfferMessageBody = {
  credentials: CredentialOffer[];
  transaction_data: ContractInvokeTransactionData;
};

/** CredentialOfferStatus is list of possible statuses for credential offer message */
export enum CredentialOfferStatus {
  Pending = 'pending',
  Completed = 'completed',
  Rejected = 'rejected'
}

/** CredentialOffer is structure to fetch credential */
export type CredentialOffer = {
  id: string;
  description: string;
  status?: CredentialOfferStatus;
};

/** CredentialIssuanceMessage represent Iden3message for credential issuance */
export type CredentialIssuanceMessage = RequiredBasicMessage & {
  body: IssuanceMessageBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE;
};

/** IssuanceMessageBody is struct the represents message when credential is issued */
export type IssuanceMessageBody = {
  credential: W3CCredential;
};

/** CredentialFetchRequestMessage represent Iden3message for credential fetch request */
export type CredentialFetchRequestMessage = BasicMessage & {
  body: CredentialFetchRequestMessageBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE;
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
export type CredentialRefreshMessage = RequiredBasicMessage & {
  body: CredentialRefreshMessageBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.CREDENTIAL_REFRESH_MESSAGE_TYPE;
};

/** CredentialRefreshMessageBody is msg body for refresh request */
export type CredentialRefreshMessageBody = {
  id: string;
  reason: string;
};

/** EncryptedCredentialIssuanceMessage represent Iden3message for encrypted credential issuance */
export type EncryptedCredentialIssuanceMessage = RequiredBasicMessage & {
  body: EncryptedIssuanceMessageBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.ENCRYPTED_CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE;
};

/** EncryptedIssuanceMessageBody is struct the represents message when encrypted credential is issued */
export type EncryptedIssuanceMessageBody = {
  id: string;
  data: GeneralJWE | FlattenedJWE;
  type: string;
  context: string;
  proof: object | unknown[];
};
