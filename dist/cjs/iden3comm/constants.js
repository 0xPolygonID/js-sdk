"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_PUBLIC_KEY_TYPES = exports.MediaType = exports.PROTOCOL_MESSAGE_TYPE = void 0;
const IDEN3_PROTOCOL = 'https://iden3-communication.io/';
/**
 * Constants for Iden3 protocol
 */
exports.PROTOCOL_MESSAGE_TYPE = Object.freeze({
    // AuthorizationV2RequestMessageType defines auth request type of the communication protocol
    AUTHORIZATION_REQUEST_MESSAGE_TYPE: IDEN3_PROTOCOL + 'authorization/1.0/request',
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
    // MessageFetMessageFetchRequestMessageType defines message fetch request type of the communication protocol.
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
/**
 * Media types for iden3 comm communication protocol
 *
 * @enum {number}
 */
var MediaType;
(function (MediaType) {
    MediaType["ZKPMessage"] = "application/iden3-zkp-json";
    MediaType["PlainMessage"] = "application/iden3comm-plain-json";
    MediaType["SignedMessage"] = "application/iden3comm-signed-json";
})(MediaType = exports.MediaType || (exports.MediaType = {}));
exports.SUPPORTED_PUBLIC_KEY_TYPES = {
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
//# sourceMappingURL=constants.js.map