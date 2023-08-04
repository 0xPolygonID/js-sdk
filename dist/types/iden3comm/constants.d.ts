/**
 * Constants for Iden3 protocol
 */
export declare const PROTOCOL_MESSAGE_TYPE: Readonly<{
    AUTHORIZATION_REQUEST_MESSAGE_TYPE: string;
    AUTHORIZATION_RESPONSE_MESSAGE_TYPE: string;
    CREDENTIAL_ISSUANCE_REQUEST_MESSAGE_TYPE: string;
    CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE: string;
    CREDENTIAL_OFFER_MESSAGE_TYPE: string;
    CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE: string;
    DEVICE_REGISTRATION_REQUEST_MESSAGE_TYPE: string;
    MESSAGE_FETCH_REQUEST_MESSAGE_TYPE: string;
    PROOF_GENERATION_REQUEST_MESSAGE_TYPE: string;
    PROOF_GENERATION_RESPONSE_MESSAGE_TYPE: string;
    REVOCATION_STATUS_REQUEST_MESSAGE_TYPE: string;
    REVOCATION_STATUS_RESPONSE_MESSAGE_TYPE: string;
}>;
/**
 * Media types for iden3 comm communication protocol
 *
 * @enum {number}
 */
export declare enum MediaType {
    ZKPMessage = "application/iden3-zkp-json",
    PlainMessage = "application/iden3comm-plain-json",
    SignedMessage = "application/iden3comm-signed-json"
}
export declare const SUPPORTED_PUBLIC_KEY_TYPES: {
    ES256K: string[];
    'ES256K-R': string[];
};
