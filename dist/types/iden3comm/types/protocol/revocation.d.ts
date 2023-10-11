import { ProtocolMessage } from '../';
import { RevocationStatus } from '../../../verifiable';
import { MediaType } from '../../constants';
/** RevocationStatusRequestMessage is struct the represents body for proof generation request */
export type RevocationStatusRequestMessage = {
    id: string;
    typ?: MediaType;
    type: ProtocolMessage;
    thid?: string;
    body?: RevocationStatusRequestMessageBody;
    from?: string;
    to?: string;
};
/** RevocationStatusRequestMessageBody is struct the represents request for revocation status */
export type RevocationStatusRequestMessageBody = {
    revocation_nonce: number;
};
/** RevocationStatusResponseMessage is struct the represents body for proof generation request */
export type RevocationStatusResponseMessage = {
    id: string;
    typ?: MediaType;
    type: ProtocolMessage;
    thid?: string;
    body?: RevocationStatusResponseMessageBody;
    from?: string;
    to?: string;
};
/** RevocationStatusResponseMessageBody is struct the represents request for revocation status */
export type RevocationStatusResponseMessageBody = RevocationStatus;
