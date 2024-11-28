import { BasicMessage, RequiredBasicMessage } from '../';
import { RevocationStatus } from '../../../verifiable';
import { PROTOCOL_MESSAGE_TYPE } from '../../constants';

/** RevocationStatusRequestMessage is struct the represents body for proof generation request */
export type RevocationStatusRequestMessage = BasicMessage & {
  body: RevocationStatusRequestMessageBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.REVOCATION_STATUS_REQUEST_MESSAGE_TYPE;
};

/** RevocationStatusRequestMessageBody is struct the represents request for revocation status */
export type RevocationStatusRequestMessageBody = {
  revocation_nonce: number;
};

/** RevocationStatusResponseMessage is struct the represents body for proof generation request */
export type RevocationStatusResponseMessage = RequiredBasicMessage & {
  body: RevocationStatusResponseMessageBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.REVOCATION_STATUS_RESPONSE_MESSAGE_TYPE;
};

/** RevocationStatusResponseMessageBody is struct the represents request for revocation status */
export type RevocationStatusResponseMessageBody = RevocationStatus;
