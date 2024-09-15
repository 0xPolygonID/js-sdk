import { ZKProof } from '@iden3/js-jwz';
import { BasicMessage, JsonDocumentObject } from '../packer';
import { PROTOCOL_MESSAGE_TYPE } from '../../constants';

/** AuthorizationResponseMessage is struct the represents iden3message authorization response */
export type AuthorizationResponseMessage = BasicMessage & {
  body: AuthorizationMessageResponseBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE;
  to: string;
};

/** AuthorizationMessageResponseBody is struct the represents authorization response data */
export type AuthorizationMessageResponseBody = BasicMessage['body'] & {
  did_doc?: JsonDocumentObject;
  message?: string;
  scope: ZeroKnowledgeProofResponse[];
};

/** AuthorizationRequestMessage is struct the represents iden3message authorization request */
export type AuthorizationRequestMessage = BasicMessage & {
  body: AuthorizationRequestMessageBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE;
};

/** AuthorizationRequestMessageBody is body for authorization request */
export type AuthorizationRequestMessageBody = BasicMessage['body'] & {
  callbackUrl: string;
  reason?: string;
  message?: string;
  did_doc?: JsonDocumentObject;
  scope: ZeroKnowledgeProofRequest[];
};

/** ZeroKnowledgeProofRequest represents structure of zkp request object */
export type ZeroKnowledgeProofRequest = {
  id: number;
  circuitId: string;
  optional?: boolean;
  query: JsonDocumentObject;
  params?: {
    nullifierSessionId?: string | number;
  };
};

/** ZeroKnowledgeProofResponse represents structure of zkp response */
export type ZeroKnowledgeProofResponse = {
  id: number;
  circuitId: string;
  vp?: VerifiablePresentation;
} & ZKProof;

/** VerifiablePresentation represents structure of Verifiable Presentation */
export type VerifiablePresentation = {
  '@context': string | (string | object)[];
  '@type': string;
  verifiableCredential: {
    '@context': string | string[];
    '@type': string | string[];
    credentialSubject: JsonDocumentObject;
  };
};
