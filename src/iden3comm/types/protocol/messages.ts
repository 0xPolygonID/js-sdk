import { BasicMessage } from '../';

/**  MessageFetchRequestMessage represent Iden3message for message fetch request. */
export type MessageFetchRequestMessage = Required<BasicMessage> & {
  body?: MessageFetchRequestMessageBody;
};

/** MessageFetchRequestMessageBody is struct the represents body for message fetch request. */
export type MessageFetchRequestMessageBody = {
  id: string;
};
