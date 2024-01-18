import { W3CCredential } from '../../../verifiable';
import { MediaType } from '../../constants';
import { JSONObject, ProtocolMessage } from '../packer';

/** CredentialIssuanceRequestMessageBody represents data for credential issuance request */
export type CredentialIssuanceRequestMessageBody = {
  schema: Schema;
  data: JSONObject;
  expiration: number;
};

/** CredentialIssuanceRequestMessage represent Iden3message for credential request */
export type CredentialIssuanceRequestMessage = {
  id: string;
  typ: MediaType;
  type: ProtocolMessage;
  thid?: string;
  body: CredentialIssuanceRequestMessageBody;
  from: string;
  to: string;
};

/** CredentialsOfferMessage represent Iden3message for credential offer */
export type CredentialsOfferMessage = {
  id: string;
  typ: MediaType;
  type: ProtocolMessage;
  thid?: string;
  body: CredentialsOfferMessageBody;
  from: string;
  to: string;
};

/** CredentialsOfferMessageBody is struct the represents offer message */
export type CredentialsOfferMessageBody = {
  url: string;
  credentials: Array<CredentialOffer>;
};

/** CredentialOffer is structure to fetch credential */
export type CredentialOffer = {
  id: string;
  description: string;
};

/** CredentialIssuanceMessage represent Iden3message for credential issuance */
export type CredentialIssuanceMessage = {
  id: string;
  typ?: MediaType;
  type: ProtocolMessage;
  threadID?: string;
  body?: IssuanceMessageBody;
  from?: string;
  to?: string;
};

/** IssuanceMessageBody is struct the represents message when credential is issued */
export type IssuanceMessageBody = {
  credential: W3CCredential;
};

/** CredentialFetchRequestMessage represent Iden3message for credential fetch request */
export type CredentialFetchRequestMessage = {
  id: string;
  typ?: MediaType;
  type: ProtocolMessage;
  thid?: string;
  body?: CredentialFetchRequestMessageBody;
  from?: string;
  to?: string;
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
export type CredentialRefreshMessage = {
  id: string;
  typ?: MediaType;
  type: ProtocolMessage;
  thid?: string;
  body?: CredentialRefreshMessageBody;
  from?: string;
  to?: string;
};

/** CredentialRefreshMessageBody is msg body for refresh request */
export type CredentialRefreshMessageBody = {
  id: string;
  reason: string;
};
