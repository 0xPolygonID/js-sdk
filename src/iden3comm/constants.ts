const IDEN3_PROTOCOL = 'https://iden3-communication.io/';

export const PROTOCOL_MESSAGE_TYPE = Object.freeze({
  // AuthorizationV2RequestMessageType defines auth V2 request type of the communication protocol
  AUTHORIZATION_V2_REQUEST_MESSAGE_TYPE: IDEN3_PROTOCOL + 'authorization/2.0/request',
  // AuthorizationResponseMessageType defines auth response type of the communication protocol
  AUTHORIZATION_RESPONSE_MESSAGE_TYPE: IDEN3_PROTOCOL + 'authorization/1.0/response',
  // CredentialIssuanceRequestMessageType accepts request for credential creation
  CREDENTIAL_ISSUANCE_REQUEST_MESSAGE_TYPE: IDEN3_PROTOCOL + 'credentials/1.0/issuance-request',
  // CredentialFetchRequestMessageType is type for request of credential generation
  CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE: IDEN3_PROTOCOL + 'credentials/1.0/fetch-request',
  // CredentialOfferMessageType is type of message with credential offering
  CREDENTIAL_OFFER_MESSAGE_TYPE: IDEN3_PROTOCOL + 'credentials/1.0/offer',
  // CredentialIssuanceResponseMessageType is type for message with a credential issuance
  CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE: IDEN3_PROTOCOL + 'credentials/1.0/issuance-response',
  // DeviceRegistrationRequestMessageType defines device registration request type of the communication protocol
  DEVICE_REGISTRATION_REQUEST_MESSAGE_TYPE: IDEN3_PROTOCOL + 'devices/1.0/registration',
  // MessageFetMessageFetchRequestMessageTypechRequestMessageType defines message fetch request type of the communication protocol.
  MESSAGE_FETCH_REQUEST_MESSAGE_TYPE: IDEN3_PROTOCOL + 'messages/1.0/fetch',
  // ProofGenerationRequestMessageType is type for request of proof generation
  PROOF_GENERATION_REQUEST_MESSAGE_TYPE: IDEN3_PROTOCOL + 'proofs/1.0/request',
  // ProofGenerationResponseMessageType is type for response of proof generation
  PROOF_GENERATION_RESPONSE_MESSAGE_TYPE: IDEN3_PROTOCOL + 'proofs/1.0/response',
  // RevocationStatusRequestMessageType is type for request of revocation status
  REVOCATION_STATUS_REQUEST_MESSAGE_TYPE: IDEN3_PROTOCOL + 'revocation/1.0/request-status',
  // RevocationStatusResponseMessageType is type for response with a revocation status
  REVOCATION_STATUS_RESPONSE_MESSAGE_TYPE: IDEN3_PROTOCOL + 'revocation/1.0/status'
});

export enum MEDIA_TYPE {
  MEDIA_TYPE_ZKP_MESSAGE = 'application/iden3-zkp-json'
}
