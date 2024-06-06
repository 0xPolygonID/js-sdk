import { ZKProof } from '@iden3/js-jwz';
import { BasicMessage, JSONObject } from '../packer';
import { DID } from '@iden3/js-iden3-core';

/** AuthorizationResponseMessage is struct the represents iden3message authorization response */
export type AuthorizationResponseMessage = BasicMessage & {
  body: AuthorizationMessageResponseBody;
  from: string;
  to: string;
};

/** AuthorizationMessageResponseBody is struct the represents authorization response data */
export type AuthorizationMessageResponseBody = {
  did_doc?: JSONObject;
  message?: string;
  scope: Array<ZeroKnowledgeProofResponse>;
};

/** AuthorizationRequestMessage is struct the represents iden3message authorization request */
export type AuthorizationRequestMessage = BasicMessage & {
  body: AuthorizationRequestMessageBody;
  from: string;
};

/** AuthorizationRequestMessageBody is body for authorization request */
export type AuthorizationRequestMessageBody = {
  callbackUrl: string;
  reason?: string;
  message?: string;
  did_doc?: JSONObject;
  scope: Array<ZeroKnowledgeProofRequest>;
};

/** ZeroKnowledgeProofRequest represents structure of zkp request object */
export type ZeroKnowledgeProofRequest = {
  id: number;
  circuitId: string;
  optional?: boolean;
  query: JSONObject;
  params?: {
    nullifierSessionId?: string | number;
  };
};

/** ZeroKnowledgeProofResponse represents structure of zkp response */
export type ZeroKnowledgeProofResponse = {
  id: number;
  circuitId: string;
  vp?: object;
} & ZKProof;
