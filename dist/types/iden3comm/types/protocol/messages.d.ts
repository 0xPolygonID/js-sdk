import { ProtocolMessage } from '../';
import { MediaType } from '../../constants';
/**  MessageFetchRequestMessage represent Iden3message for message fetch request. */
export type MessageFetchRequestMessage = {
    id: string;
    typ?: MediaType;
    type: ProtocolMessage;
    thid?: string;
    body?: MessageFetchRequestMessageBody;
    from?: string;
    to?: string;
};
/** MessageFetchRequestMessageBody is struct the represents body for message fetch request. */
export type MessageFetchRequestMessageBody = {
    id: string;
};
