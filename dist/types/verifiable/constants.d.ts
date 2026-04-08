/** Verifiable constants */
export declare const VerifiableConstants: Readonly<{
    ERRORS: {
        FiELD_IS_EMPTY: string;
        CONTEXT_TYPE_IS_EMPTY: string;
        IDENTITY_DOES_NOT_EXIST: string;
        IDENTITY_DOES_NOT_EXIST_CUSTOM_ERROR: string;
        NO_AUTH_CRED_FOUND: string;
        STATE_DOES_NOT_EXIST: string;
        STATE_DOES_NOT_EXIST_CUSTOM_ERROR: string;
        ROOT_DOES_NOT_EXIST: string;
        ROOT_DOES_NOT_EXIST_CUSTOM_ERROR: string;
        ID_WALLET_NO_CREDENTIAL_SATISFIED_QUERY: string;
        ID_WALLET_SIGNER_IS_REQUIRED: string;
        ID_WALLET_PROVER_IS_REQUIRED: string;
        ID_WALLET_CORE_CLAIM_REQUIRED_IN_SIG_PROOF: string;
        ID_WALLET_CORE_CLAIM_REQUIRED_IN_ANY_PROOF: string;
        ID_WALLET_CORE_CLAIM_MISMATCH: string;
        ID_WALLET_CORE_CLAIM_IS_NOT_SET: string;
        ID_WALLET_PROFILE_OR_IDENTITY_NOT_FOUND: string;
        ID_WALLET_PROFILE_ALREADY_EXISTS: string;
        ID_WALLET_PROFILE_ALREADY_EXISTS_VERIFIER_TAGS: string;
        ID_WALLET_ISSUER_AUTH_BJJ_CRED_MUST_HAVE_ANY_PROOF: string;
        ID_WALLET_ISSUER_AUTH_BJJ_CRED_MUST_HAVE_MTP_PROOF: string;
        PROOF_SERVICE_NO_CREDENTIAL_FOR_IDENTITY_OR_PROFILE: string;
        PROOF_SERVICE_NO_CREDENTIAL_FOR_QUERY: string;
        PROOF_SERVICE_PROFILE_GENESIS_DID_MISMATCH: string;
        PROOF_SERVICE_NO_QUERIES_IN_ZKP_REQUEST: string;
        PROOF_SERVICE_CREDENTIAL_IS_EXPIRED: string;
        CREDENTIAL_WALLET_ALL_CREDENTIALS_ARE_REVOKED: string;
    };
    CREDENTIAL_TYPE: {
        W3C_VERIFIABLE_CREDENTIAL: string;
        W3C_VERIFIABLE_PRESENTATION: string;
    };
    CREDENTIAL_SUBJECT_PATH: "https://www.w3.org/2018/credentials#credentialSubject";
    JSONLD_SCHEMA: {
        IDEN3_CREDENTIAL: string;
        IDEN3_DISPLAY_METHOD: string;
        W3C_CREDENTIAL_2018: string;
        W3C_VC_DOCUMENT_2018: string;
        IDEN3_PROOFS_DEFINITION_DOCUMENT: string;
        IDEN3_DISPLAY_METHOD_DEFINITION_DOCUMENT: string;
    };
    JSON_SCHEMA_VALIDATOR: "JsonSchema2023";
    SERVICE_TYPE: {
        IDEN3_COMM: string;
        PUSH_NOTIFICATION: string;
    };
    AUTH: {
        AUTH_BJJ_CREDENTIAL_HASH: string;
        AUTH_BJJ_CREDENTIAL_SCHEMA_JSON_URL: string;
        AUTH_BJJ_CREDENTIAL_SCHEMA_JSONLD_URL: string;
        AUTH_BJJ_CREDENTIAL_TYPE: string;
        AUTH_BJJ_CREDENTIAL_SCHEMA_JSON: string;
        AUTH_BJJ_CREDENTIAL_SCHEMA_JSONLD: string;
    };
}>;
/**
 * Proof type for Verifiable Credential supported by sdk
 *
 * @enum {number}
 */
export declare enum ProofType {
    BJJSignature = "BJJSignature2021",
    Iden3SparseMerkleTreeProof = "Iden3SparseMerkleTreeProof"
}
/**
 * CredentialStatusType type for revocation type
 *
 * @enum {number}
 */
export declare enum CredentialStatusType {
    SparseMerkleTreeProof = "SparseMerkleTreeProof",
    Iden3ReverseSparseMerkleTreeProof = "Iden3ReverseSparseMerkleTreeProof",
    Iden3commRevocationStatusV1 = "Iden3commRevocationStatusV1.0",
    Iden3OnchainSparseMerkleTreeProof2023 = "Iden3OnchainSparseMerkleTreeProof2023"
}
/**
 * W3C Proof purpose
 *
 * @enum {number}
 */
export declare enum ProofPurpose {
    Authentication = "Authentication"
}
/**
 * Merklized Core.Claim root position for vc creation
 *
 * @enum {number}
 */
export declare enum MerklizedRootPosition {
    Index = "index",
    Value = "value",
    None = ""
}
/**
 * Subject Core.Claim position for vc creation
 *
 * @enum {number}
 */
export declare enum SubjectPosition {
    None = "",
    Index = "index",
    Value = "value"
}
/**
 * RefreshServiceType type for refreshService
 *
 * @enum {string}
 */
export declare enum RefreshServiceType {
    Iden3RefreshService2023 = "Iden3RefreshService2023"
}
/**
 * PaymentRequestDataType type for payment requests
 * @beta
 * @enum {string}
 */
export declare enum PaymentRequestDataType {
    Iden3PaymentRequestCryptoV1 = "Iden3PaymentRequestCryptoV1",
    Iden3PaymentRailsRequestV1 = "Iden3PaymentRailsRequestV1",
    Iden3PaymentRailsERC20RequestV1 = "Iden3PaymentRailsERC20RequestV1",
    Iden3PaymentRailsSolanaRequestV1 = "Iden3PaymentRailsSolanaRequestV1",
    Iden3PaymentRailsSolanaSPLRequestV1 = "Iden3PaymentRailsSolanaSPLRequestV1"
}
/**
 * PaymentType type for payment responses
 * @beta
 * @enum {string}
 */
export declare enum PaymentType {
    Iden3PaymentCryptoV1 = "Iden3PaymentCryptoV1",
    Iden3PaymentRailsV1 = "Iden3PaymentRailsV1",
    Iden3PaymentRailsERC20V1 = "Iden3PaymentRailsERC20V1",
    Iden3PaymentRailsSolanaV1 = "Iden3PaymentRailsSolanaV1",
    Iden3PaymentRailsSolanaSPLV1 = "Iden3PaymentRailsSolanaSPLV1"
}
/**
 * SupportedPaymentProofType type for payment proofs
 * @beta
 * @enum {string}
 */
export declare enum SupportedPaymentProofType {
    EthereumEip712Signature2021 = "EthereumEip712Signature2021",
    SolanaEd25519Signature2025 = "SolanaEd25519Signature2025"
}
/**
 * Media types for Payment supported currencies
 * @beta
 * @deprecated
 * @enum {string}
 */
export declare enum SupportedCurrencies {
    ETH = "ETH",
    ETH_WEI = "ETHWEI",
    ETH_GWEI = "ETHGWEI",
    MATIC = "MATIC",
    POL = "POL"
}
/**
 * Supported features for payment-request
 * @beta
 * @enum {string}
 */
export declare enum PaymentFeatures {
    EIP_2612 = "EIP-2612"
}
/**
 * DisplayMethodType type for display method
 *
 * @enum {string}
 */
export declare enum DisplayMethodType {
    Iden3BasicDisplayMethodV1 = "Iden3BasicDisplayMethodV1"
}
/**
 * Default cache max size for in-memory cache
 */
export declare const DEFAULT_CACHE_MAX_SIZE = 10000;
/**
 * Solana chain reference
 */
export declare const SOLANA_CHAIN_REF: Readonly<{
    DEVNET: "EtWTRABZaYq6iMfeYKouRu166VU2xqa1";
    TESTNET: "4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z";
    MAINNET: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp";
}>;
//# sourceMappingURL=constants.d.ts.map