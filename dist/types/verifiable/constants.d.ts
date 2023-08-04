/** Verifiable constants */
export declare const VerifiableConstants: Readonly<{
    ERRORS: {
        FiELD_IS_EMPTY: string;
        CONTEXT_TYPE_IS_EMPTY: string;
        IDENTITY_DOES_NOT_EXIST: string;
    };
    CREDENTIAL_TYPE: {
        W3C_VERIFIABLE_CREDENTIAL: string;
        W3C_VERIFIABLE_PRESENTATION: string;
    };
    CREDENTIAL_SUBJECT_PATH: "https://www.w3.org/2018/credentials#credentialSubject";
    JSONLD_SCHEMA: {
        IDEN3_CREDENTIAL: string;
        W3C_CREDENTIAL_2018: string;
    };
    JSON_SCHEMA_VALIDATOR: "JsonSchema2023";
    SERVICE_TYPE: {
        IDEN3_COMM: string;
        PUSH_NOTIFICATION: string;
    };
    AUTH: {
        AUTH_BJJ_CREDENTAIL_HASH: string;
        AUTH_BJJ_CREDENTIAL_SCHEMA_JSON_URL: string;
        AUTH_BJJ_CREDENTIAL_SCHEMA_JSONLD_URL: string;
        AUTH_BJJ_CREDENTIAL_TYPE: string;
        AUTH_BJJ_CREDENTIAL_SCHEMA_JSON: string;
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
