import { AcceptProfile } from './types';
/**
 * Constants for Iden3 protocol
 */
export declare const PROTOCOL_MESSAGE_TYPE: Readonly<{
    AUTHORIZATION_REQUEST_MESSAGE_TYPE: "https://iden3-communication.io/authorization/1.0/request";
    AUTHORIZATION_RESPONSE_MESSAGE_TYPE: "https://iden3-communication.io/authorization/1.0/response";
    CREDENTIAL_ISSUANCE_REQUEST_MESSAGE_TYPE: "https://iden3-communication.io/credentials/1.0/issuance-request";
    CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE: "https://iden3-communication.io/credentials/1.0/fetch-request";
    CREDENTIAL_OFFER_MESSAGE_TYPE: "https://iden3-communication.io/credentials/1.0/offer";
    CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE: "https://iden3-communication.io/credentials/1.0/issuance-response";
    CREDENTIAL_REFRESH_MESSAGE_TYPE: "https://iden3-communication.io/credentials/1.0/refresh";
    DEVICE_REGISTRATION_REQUEST_MESSAGE_TYPE: "https://iden3-communication.io/devices/1.0/registration";
    MESSAGE_FETCH_REQUEST_MESSAGE_TYPE: "https://iden3-communication.io/messages/1.0/fetch";
    PROOF_GENERATION_REQUEST_MESSAGE_TYPE: "https://iden3-communication.io/proofs/1.0/request";
    PROOF_GENERATION_RESPONSE_MESSAGE_TYPE: "https://iden3-communication.io/proofs/1.0/response";
    REVOCATION_STATUS_REQUEST_MESSAGE_TYPE: "https://iden3-communication.io/revocation/1.0/request-status";
    REVOCATION_STATUS_RESPONSE_MESSAGE_TYPE: "https://iden3-communication.io/revocation/1.0/status";
    CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE: "https://iden3-communication.io/proofs/1.0/contract-invoke-request";
    CONTRACT_INVOKE_RESPONSE_MESSAGE_TYPE: "https://iden3-communication.io/proofs/1.0/contract-invoke-response";
    CREDENTIAL_ONCHAIN_OFFER_MESSAGE_TYPE: "https://iden3-communication.io/credentials/1.0/onchain-offer";
    PROPOSAL_REQUEST_MESSAGE_TYPE: "https://iden3-communication.io/credentials/0.1/proposal-request";
    PROPOSAL_MESSAGE_TYPE: "https://iden3-communication.io/credentials/0.1/proposal";
    PAYMENT_REQUEST_MESSAGE_TYPE: "https://iden3-communication.io/credentials/0.1/payment-request";
    PAYMENT_MESSAGE_TYPE: "https://iden3-communication.io/credentials/0.1/payment";
    DISCOVERY_PROTOCOL_QUERIES_MESSAGE_TYPE: "https://didcomm.org/discover-features/2.0/queries";
    DISCOVERY_PROTOCOL_DISCLOSE_MESSAGE_TYPE: "https://didcomm.org/discover-features/2.0/disclose";
    PROBLEM_REPORT_MESSAGE_TYPE: "https://didcomm.org/report-problem/2.0/problem-report";
    /**
      @beta
      EncryptedCredentialIssuanceResponseMessageType is type for encrypted credential issuance
    */
    ENCRYPTED_CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE: "https://iden3-communication.io/credentials/0.1/encrypted-issuance-response";
}>;
/**
 * Media types for iden3 comm communication protocol
 *
 * @enum {number}
 */
export declare enum MediaType {
    ZKPMessage = "application/iden3-zkp-json",
    PlainMessage = "application/iden3comm-plain-json",
    SignedMessage = "application/iden3comm-signed-json",
    EncryptedMessage = "application/iden3comm-encrypted-json"
}
export declare const MEDIA_TYPE_TO_CONTENT_TYPE: Record<MediaType, string>;
export declare const SUPPORTED_PUBLIC_KEY_TYPES: {
    ES256K: string[];
    'ES256K-R': string[];
};
export declare enum ProtocolVersion {
    V1 = "iden3comm/v1"
}
export declare enum AcceptAuthCircuits {
    AuthV2 = "authV2",
    AuthV3 = "authV3",
    AuthV3_8_32 = "authV3-8-32"
}
export declare enum AcceptJwzAlgorithms {
    Groth16 = "groth16"
}
export declare enum AcceptJwsAlgorithms {
    ES256K = "ES256K",
    ES256KR = "ES256K-R"
}
export declare enum AcceptJweKEKAlgorithms {
    ECDH_ES_A256KW = "ECDH-ES+A256KW",
    RSA_OAEP_256 = "RSA-OAEP-256"
}
export declare enum CEKEncryption {
    A256GCM = "A256GCM",
    A256CBC_HS512 = "A256CBC-HS512"
}
export type VerificationMethodType = 'JsonWebKey2020' | 'Ed25519VerificationKey2020' | 'X25519KeyAgreementKey2020' | 'Bls12381G2Key2020' | 'P-256' | 'Multikey';
export declare const defaultAcceptProfile: AcceptProfile;
export declare const DEFAULT_PROOF_VERIFY_DELAY: number;
export declare const DEFAULT_AUTH_VERIFY_DELAY: number;
//# sourceMappingURL=constants.d.ts.map