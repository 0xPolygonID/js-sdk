import { ZKProof } from '@iden3/js-jwz';
import { MediaType } from '../../constants';
import { JSONObject, ProtocolMessage } from '../packer';
import { DID } from '@iden3/js-iden3-core';

/** AuthorizationResponseMessage is struct the represents iden3message authorization response */
export type AuthorizationResponseMessage = {
  id: string;
  typ?: MediaType;
  type: ProtocolMessage;
  thid?: string;
  body: AuthorizationMessageResponseBody;
  from?: string;
  to?: string;
};

/** AuthorizationMessageResponseBody is struct the represents authorization response data */
export type AuthorizationMessageResponseBody = {
  did_doc?: JSONObject;
  message?: string;
  scope: ZeroKnowledgeProofResponse[];
};

/** AuthorizationRequestMessage is struct the represents iden3message authorization request */
export type AuthorizationRequestMessage = {
  id: string;
  typ: MediaType;
  type: ProtocolMessage;
  thid?: string;
  body: AuthorizationRequestMessageBody;
  from: string;
  to?: string;
};

/** AuthorizationRequestMessageBody is body for authorization request */
export type AuthorizationRequestMessageBody = {
  callbackUrl: string;
  reason?: string;
  message?: string;
  did_doc?: JSONObject;
  scope: ZeroKnowledgeProofRequest[];
};

/** ZeroKnowledgeProofRequest represents structure of zkp request object */
export type ZeroKnowledgeProofRequest = {
  id: number;
  circuitId: string;
  optional?: boolean;
  query: JSONObject;
  params?: {
    nullifierSessionId?: string | number;
    verifierDid?: DID;
  };
};

/** ZeroKnowledgeProofResponse represents structure of zkp response */
export type ZeroKnowledgeProofResponse = {
  id: number;
  circuitId: string;
  vp?: object;
} & ZKProof;
