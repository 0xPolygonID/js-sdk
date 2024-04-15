import { BasicMessage } from '../';
import { RevocationStatus } from '../../../verifiable';

/** RevocationStatusRequestMessage is struct the represents body for proof generation request */
export type RevocationStatusRequestMessage = BasicMessage & {
  body?: RevocationStatusRequestMessageBody;
};

/** RevocationStatusRequestMessageBody is struct the represents request for revocation status */
export type RevocationStatusRequestMessageBody = {
  revocation_nonce: number;
};

/** RevocationStatusResponseMessage is struct the represents body for proof generation request */
export type RevocationStatusResponseMessage = Required<BasicMessage> & {
  body?: RevocationStatusResponseMessageBody;
};

/** RevocationStatusResponseMessageBody is struct the represents request for revocation status */
export type RevocationStatusResponseMessageBody = RevocationStatus;
