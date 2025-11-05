import { AcceptProfile } from './types';

const IDEN3_PROTOCOL = 'https://iden3-communication.io/';
const DIDCOMM_PROTOCOL = 'https://didcomm.org/';
/**
 * Constants for Iden3 protocol
 */
export const PROTOCOL_MESSAGE_TYPE = Object.freeze({
  // AuthorizationV2RequestMessageType defines auth request type of the communication protocol
  AUTHORIZATION_REQUEST_MESSAGE_TYPE: `${IDEN3_PROTOCOL}authorization/1.0/request` as const,
  // AuthorizationResponseMessageType defines auth response type of the communication protocol
  AUTHORIZATION_RESPONSE_MESSAGE_TYPE: `${IDEN3_PROTOCOL}authorization/1.0/response` as const,
  // CredentialIssuanceRequestMessageType accepts request for credential creation
  CREDENTIAL_ISSUANCE_REQUEST_MESSAGE_TYPE:
    `${IDEN3_PROTOCOL}credentials/1.0/issuance-request` as const,
  // CredentialFetchRequestMessageType is type for request of credential generation
  CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE: `${IDEN3_PROTOCOL}credentials/1.0/fetch-request` as const,
  // CredentialOfferMessageType is type of message with credential offering
  CREDENTIAL_OFFER_MESSAGE_TYPE: `${IDEN3_PROTOCOL}credentials/1.0/offer` as const,
  // CredentialIssuanceResponseMessageType is type for message with a credential issuance
  CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE:
    `${IDEN3_PROTOCOL}credentials/1.0/issuance-response` as const,
  // CredentialRefreshMessageType is type for message with a credential issuance
  CREDENTIAL_REFRESH_MESSAGE_TYPE: `${IDEN3_PROTOCOL}credentials/1.0/refresh` as const,
  // DeviceRegistrationRequestMessageType defines device registration request type of the communication protocol
  DEVICE_REGISTRATION_REQUEST_MESSAGE_TYPE: `${IDEN3_PROTOCOL}devices/1.0/registration` as const,
  // MessageFetMessageFetchRequestMessageType defines message fetch request type of the communication protocol.
  MESSAGE_FETCH_REQUEST_MESSAGE_TYPE: `${IDEN3_PROTOCOL}messages/1.0/fetch` as const,
  // ProofGenerationRequestMessageType is type for request of proof generation
  PROOF_GENERATION_REQUEST_MESSAGE_TYPE: `${IDEN3_PROTOCOL}proofs/1.0/request` as const,
  // ProofGenerationResponseMessageType is type for response of proof generation
  PROOF_GENERATION_RESPONSE_MESSAGE_TYPE: `${IDEN3_PROTOCOL}proofs/1.0/response` as const,
  // RevocationStatusRequestMessageType is type for request of revocation status
  REVOCATION_STATUS_REQUEST_MESSAGE_TYPE: `${IDEN3_PROTOCOL}revocation/1.0/request-status` as const,
  // RevocationStatusResponseMessageType is type for response with a revocation status
  REVOCATION_STATUS_RESPONSE_MESSAGE_TYPE: `${IDEN3_PROTOCOL}revocation/1.0/status` as const,
  // ContractInvokeRequestMessageType is type for request of contract invoke request
  CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE:
    `${IDEN3_PROTOCOL}proofs/1.0/contract-invoke-request` as const,
  // ContractInvokeResponseMessageType is type for response of contract invoke request
  CONTRACT_INVOKE_RESPONSE_MESSAGE_TYPE:
    `${IDEN3_PROTOCOL}proofs/1.0/contract-invoke-response` as const,
  // CredentialOnchainOfferMessageType is type of message with credential onchain offering
  CREDENTIAL_ONCHAIN_OFFER_MESSAGE_TYPE: `${IDEN3_PROTOCOL}credentials/1.0/onchain-offer` as const,
  // ProposalRequestMessageType is type for proposal-request message
  PROPOSAL_REQUEST_MESSAGE_TYPE: `${IDEN3_PROTOCOL}credentials/0.1/proposal-request` as const,
  // ProposalMessageType is type for proposal message
  PROPOSAL_MESSAGE_TYPE: `${IDEN3_PROTOCOL}credentials/0.1/proposal` as const,
  // PaymentRequestMessageType is type for payment-request message
  PAYMENT_REQUEST_MESSAGE_TYPE: `${IDEN3_PROTOCOL}credentials/0.1/payment-request` as const,
  // PaymentMessageType is type for payment message
  PAYMENT_MESSAGE_TYPE: `${IDEN3_PROTOCOL}credentials/0.1/payment` as const,
  // DiscoveryProtocolQueriesMessageType is type for didcomm discovery protocol queries
  DISCOVERY_PROTOCOL_QUERIES_MESSAGE_TYPE:
    `${DIDCOMM_PROTOCOL}discover-features/2.0/queries` as const,
  // DiscoveryProtocolDiscloseMessageType is type for didcomm discovery protocol disclose
  DISCOVERY_PROTOCOL_DISCLOSE_MESSAGE_TYPE:
    `${DIDCOMM_PROTOCOL}discover-features/2.0/disclose` as const,
  // ProblemReportMessageType is type for didcomm problem report
  PROBLEM_REPORT_MESSAGE_TYPE: `${DIDCOMM_PROTOCOL}report-problem/2.0/problem-report` as const,
  /** 
    @beta
    EncryptedCredentialIssuanceResponseMessageType is type for encrypted credential issuance
  */
  ENCRYPTED_CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE:
    `${IDEN3_PROTOCOL}credentials/0.1/encrypted-issuance-response` as const
});

/**
 * Media types for iden3 comm communication protocol
 *
 * @enum {number}
 */
export enum MediaType {
  ZKPMessage = 'application/iden3-zkp-json',
  PlainMessage = 'application/iden3comm-plain-json',
  SignedMessage = 'application/iden3comm-signed-json',
  EncryptedMessage = 'application/iden3comm-encrypted-json'
}

export const SUPPORTED_PUBLIC_KEY_TYPES = {
  ES256K: [
    'EcdsaSecp256k1VerificationKey2019',
    /**
     * Equivalent to EcdsaSecp256k1VerificationKey2019 when key is an ethereumAddress
     */
    'EcdsaSecp256k1RecoveryMethod2020',
    'JsonWebKey2020'
  ],
  'ES256K-R': [
    'EcdsaSecp256k1VerificationKey2019',
    /**
     * Equivalent to EcdsaSecp256k1VerificationKey2019 when key is an ethereumAddress
     */
    'EcdsaSecp256k1RecoveryMethod2020',
    'JsonWebKey2020'
  ]
};

export enum ProtocolVersion {
  V1 = 'iden3comm/v1'
}

export enum AcceptAuthCircuits {
  AuthV2 = 'authV2',
  AuthV3 = 'authV3',
  AuthV3_8_32 = 'authV3-8-32'
}

export enum AcceptJwzAlgorithms {
  Groth16 = 'groth16'
}

export enum AcceptJwsAlgorithms {
  ES256K = 'ES256K',
  ES256KR = 'ES256K-R'
}

export enum AcceptJweKEKAlgorithms {
  ECDH_ES_A256KW = 'ECDH-ES+A256KW',
  RSA_OAEP_256 = 'RSA-OAEP-256'
}

export enum CEKEncryption {
  A256GCM = 'A256GCM',
  A256CBC_HS512 = 'A256CBC-HS512'
}

export type VerificationMethodType =
  | 'JsonWebKey2020'
  | 'Ed25519VerificationKey2020'
  | 'X25519KeyAgreementKey2020'
  | 'Bls12381G2Key2020'
  | 'P-256'
  // eslint-disable-next-line @cspell/spellchecker
  | 'Multikey';

export const defaultAcceptProfile: AcceptProfile = {
  protocolVersion: ProtocolVersion.V1,
  env: MediaType.ZKPMessage,
  circuits: [AcceptAuthCircuits.AuthV2],
  alg: [AcceptJwzAlgorithms.Groth16]
};

export const DEFAULT_PROOF_VERIFY_DELAY = 1 * 60 * 60 * 1000; // 1 hour
export const DEFAULT_AUTH_VERIFY_DELAY = 5 * 60 * 1000; // 5 minutes
