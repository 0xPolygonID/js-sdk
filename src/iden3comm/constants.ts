const IDEN3_PROTOCOL = 'https://iden3-communication.io/';
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
  PAYMENT_MESSAGE_TYPE: `${IDEN3_PROTOCOL}credentials/0.1/payment` as const
});

/**
 * Media types for iden3 comm communication protocol
 *
 * @enum {number}
 */
export enum MediaType {
  ZKPMessage = 'application/iden3-zkp-json',
  PlainMessage = 'application/iden3comm-plain-json',
  SignedMessage = 'application/iden3comm-signed-json'
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

export const DEFAULT_PROOF_VERIFY_DELAY = 1 * 60 * 60 * 1000; // 1 hour
export const DEFAULT_AUTH_VERIFY_DELAY = 5 * 60 * 1000; // 5 minutes
