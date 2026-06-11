import { ZKProof } from '@iden3/js-jwz';
import { BasicMessage, JsonDocumentObject } from '../packer';
import { PROTOCOL_MESSAGE_TYPE } from '../../constants';
import { CredentialStatusType, ProofType } from '../../../verifiable';
import { CircuitId } from '../../../circuits';
import {
  DIDDocument as DidResolverDidDocument,
  VerificationMethod as DidResolverVerificationMethod
} from 'did-resolver';
import { RootInfo, StateInfo } from '../../../storage';
import { AuthProof, CrossChainProof } from './contract-request';

/** AuthorizationResponseMessage is struct the represents iden3message authorization response */
export type AuthorizationResponseMessage = BasicMessage & {
  body: AuthorizationMessageResponseBody;
  from: string;
  to: string;
  type: typeof PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE;
};

/** AuthorizationMessageResponseBody is struct the represents authorization response data */
export type AuthorizationMessageResponseBody = {
  did_doc?: DIDDocument;
  message?: string;
  scope: Array<ZeroKnowledgeProofResponse>;
};

/** AuthorizationRequestMessage is struct the represents iden3message authorization request */
export type AuthorizationRequestMessage = BasicMessage & {
  body: AuthorizationRequestMessageBody;
  from: string;
  type: typeof PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE;
};

/** AuthorizationRequestMessageBody is body for authorization request */
export type AuthorizationRequestMessageBody = {
  callbackUrl: string;
  reason?: string;
  message?: string;
  did_doc?: DIDDocument;
  scope: Array<ZeroKnowledgeProofRequest>;
  accept?: string[];
};

/** ZeroKnowledgeProofRequest represents structure of zkp request object */
export type ZeroKnowledgeProofRequest = {
  id: number | string;
  circuitId: CircuitId;
  optional?: boolean;
  query?: ZeroKnowledgeProofQuery;
  params?: {
    nullifierSessionId?: string | number;
    sender?: string;
    challenge?: string;
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

export type ZeroKnowledgeInvokeResponse = {
  responses: ZeroKnowledgeProofResponse[];
  crossChainProof?: CrossChainProof;
  authProof?: AuthProof;
};

/** ZeroKnowledgeProofResponse represents structure of zkp response */
export type ZeroKnowledgeProofResponse = {
  id: number | string;
  circuitId: string;
  vp?: VerifiablePresentation;
} & ZKProof;

/** ZeroKnowledgeProofAuthResponse represents structure of zkp auth response */
export type ZeroKnowledgeProofAuthResponse = Omit<ZeroKnowledgeProofResponse, 'id' | 'vp'>;

/** VerifiablePresentation represents structure of Verifiable Presentation */
export type VerifiablePresentation = {
  '@context': string | (string | object)[];
  type: string;
  verifiableCredential: {
    '@context': string | string[];
    type: string | string[];
    credentialSubject: JsonDocumentObject;
  };
};

/** ZKProofEntry represents a ZK proof linked to a specific request id, used inside VerifiablePresentationV2 */
export type ZKProofEntry = {
  requestId: number | string;
  circuitId: string;
} & ZKProof;

/** VerifiableCredentialV2 represents the disclosed credential inside a v2 VP */
export type VerifiableCredentialV2 = {
  '@context': string | string[];
  type: string | string[];
  credentialSubject: JsonDocumentObject;
  credentialStatus?: {
    id?: string;
    type?: CredentialStatusType;
    revocationNonce?: number;
    statusIssuer?: { id: string; type: CredentialStatusType; revocationNonce?: number };
  };
  expirationDate?: string;
  issuanceDate?: string;
};

/** VerifiablePresentationV2 groups one credential's disclosure with all its ZK proofs */
export type VerifiablePresentationV2 = {
  '@context': string | (string | object)[];
  type: string | string[];
  verifiableCredential: VerifiableCredentialV2;
  crossChainProof?: CrossChainProof;
  proofs: ZKProofEntry[];
};

/** AuthorizationMessageResponseBodyV2 replaces scope with a vp array */
export type AuthorizationMessageResponseBodyV2 = {
  did_doc?: DIDDocument;
  message?: string;
  vp: VerifiablePresentationV2[];
};

/** AuthorizationResponseMessageV2 uses vp array instead of scope */
export type AuthorizationResponseMessageV2 = BasicMessage & {
  body: AuthorizationMessageResponseBodyV2;
  from: string;
  to: string;
  type: typeof PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE_V2;
};

/** AuthorizationRequestMessageV2 uses same body as v1 but signals v2 response format */
export type AuthorizationRequestMessageV2 = BasicMessage & {
  body: AuthorizationRequestMessageBody;
  from: string;
  type: typeof PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE_V2;
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
