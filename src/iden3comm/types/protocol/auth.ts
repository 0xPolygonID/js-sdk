import { ZKProof } from '@iden3/js-jwz';
import { BasicMessage, JsonDocumentObject } from '../packer';
import { PROTOCOL_MESSAGE_TYPE } from '../../constants';
import { ProofType } from '../../../verifiable';
import { CircuitId } from '../../../circuits';
import {
  DIDDocument as DidResolverDidDocument,
  VerificationMethod as DidResolverVerificationMethod
} from 'did-resolver';
import { RootInfo, StateInfo } from '../../../storage';

/** AuthorizationResponseMessage is struct the represents iden3message authorization response */
export type AuthorizationResponseMessage = BasicMessage & {
  body: AuthorizationMessageResponseBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE;
  to: string;
};

/** AuthorizationMessageResponseBody is struct the represents authorization response data */
export type AuthorizationMessageResponseBody = BasicMessage['body'] & {
  did_doc?: DIDDocument;
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
  did_doc?: DIDDocument;
  scope: ZeroKnowledgeProofRequest[];
};

/** ZeroKnowledgeProofRequest represents structure of zkp request object */
export type ZeroKnowledgeProofRequest = {
  id: number;
  circuitId: CircuitId;
  optional?: boolean;
  query: ZeroKnowledgeProofQuery;
  params?: {
    nullifierSessionId?: string | number;
  };
};

/** ZeroKnowledgeProofQuery represents structure of zkp request query object */
export type ZeroKnowledgeProofQuery = {
  allowedIssuers: string[];
  context: string;
  credentialSubject?: JsonDocumentObject;
  proofType?: ProofType;
  skipClaimRevocationCheck?: boolean;
  groupId?: number;
  type: string;
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

/** DIDDocument represents structure of DID Document */
export type DIDDocument = DidResolverDidDocument & {
  verificationMethod?: VerificationMethod[];
};

/** VerificationMethod represents structure of Verification Method */
export type VerificationMethod = DidResolverVerificationMethod & {
  published?: boolean;
  info?: StateInfo;
  global?: RootInfo;
};
