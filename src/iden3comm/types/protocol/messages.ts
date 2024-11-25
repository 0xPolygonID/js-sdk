import { RequiredBasicMessage } from '../';
import { PROTOCOL_MESSAGE_TYPE } from '../../constants';

/**  MessageFetchRequestMessage represent Iden3message for message fetch request. */
export type MessageFetchRequestMessage = RequiredBasicMessage & {
  body: MessageFetchRequestMessageBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE;
  to: string;
};

/** MessageFetchRequestMessageBody is struct the represents body for message fetch request. */
export type MessageFetchRequestMessageBody = {
  id: string;
};
