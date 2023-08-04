"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectPosition = exports.MerklizedRootPosition = exports.ProofPurpose = exports.CredentialStatusType = exports.ProofType = exports.VerifiableConstants = void 0;
/** Verifiable constants */
exports.VerifiableConstants = Object.freeze({
    ERRORS: {
        FiELD_IS_EMPTY: 'fieldPath is empty',
        CONTEXT_TYPE_IS_EMPTY: 'ctxType is empty',
        // ErrStateNotFound issuer state is genesis state.
        IDENTITY_DOES_NOT_EXIST: 'Identity does not exist'
    },
    CREDENTIAL_TYPE: {
        // VerifiableCredential is a W3C verifiable credential type
        W3C_VERIFIABLE_CREDENTIAL: 'VerifiableCredential',
        W3C_VERIFIABLE_PRESENTATION: 'VerifiablePresentation'
    },
    CREDENTIAL_SUBJECT_PATH: 'https://www.w3.org/2018/credentials#credentialSubject',
    JSONLD_SCHEMA: {
        // JSONLDSchemaIden3Credential is a schema for context with Iden3Credential type
        IDEN3_CREDENTIAL: 'https://schema.iden3.io/core/jsonld/iden3proofs.jsonld',
        // JSONLDSchemaW3CCredential2018 is a schema for context with VerifiableCredential type
        W3C_CREDENTIAL_2018: 'https://www.w3.org/2018/credentials/v1'
    },
    // JsonSchema2023 JSON schema for verification of Iden3Credential
    JSON_SCHEMA_VALIDATOR: 'JsonSchema2023',
    SERVICE_TYPE: {
        // Iden3CommServiceType is service type for iden3comm protocol
        IDEN3_COMM: 'iden3-communication',
        // PushNotificationServiceType is service type for delivering push notifications to identity
        PUSH_NOTIFICATION: 'push-notification'
    },
    AUTH: {
        AUTH_BJJ_CREDENTAIL_HASH: '013fd3f623559d850fb5b02ff012d0e2',
        AUTH_BJJ_CREDENTIAL_SCHEMA_JSON_URL: 'https://schema.iden3.io/core/json/auth.json',
        AUTH_BJJ_CREDENTIAL_SCHEMA_JSONLD_URL: 'https://schema.iden3.io/core/jsonld/auth.jsonld',
        AUTH_BJJ_CREDENTIAL_TYPE: 'AuthBJJCredential',
        AUTH_BJJ_CREDENTIAL_SCHEMA_JSON: `{"$schema":"http://json-schema.org/draft-07/schema#","$metadata":{"uris":{"jsonLdContext":"https://schema.iden3.io/core/jsonld/auth.jsonld","jsonSchema":"https://schema.iden3.io/core/json/auth.json"},"serialization":{"indexDataSlotA":"x","indexDataSlotB":"y"}},"type":"object","required":["@context","id","type","issuanceDate","credentialSubject","credentialSchema","credentialStatus","issuer"],"properties":{"@context":{"type":["string","array","object"]},"id":{"type":"string"},"type":{"type":["string","array"],"items":{"type":"string"}},"issuer":{"type":["string","object"],"format":"uri","required":["id"],"properties":{"id":{"type":"string","format":"uri"}}},"issuanceDate":{"type":"string","format":"date-time"},"expirationDate":{"type":"string","format":"date-time"},"credentialSchema":{"type":"object","required":["id","type"],"properties":{"id":{"type":"string","format":"uri"},"type":{"type":"string"}}},"credentialSubject":{"type":"object","required":["x","y"],"properties":{"id":{"title":"Credential Subject ID","type":"string","format":"uri"},"x":{"type":"string"},"y":{"type":"string"}}}}}`
    }
});
/**
 * Proof type for Verifiable Credential supported by sdk
 *
 * @enum {number}
 */
var ProofType;
(function (ProofType) {
    // BJJSignatureProofType
    ProofType["BJJSignature"] = "BJJSignature2021";
    // Iden3SparseMerkleTreeProofType
    ProofType["Iden3SparseMerkleTreeProof"] = "Iden3SparseMerkleTreeProof";
})(ProofType = exports.ProofType || (exports.ProofType = {}));
/**
 * CredentialStatusType type for revocation type
 *
 * @enum {number}
 */
var CredentialStatusType;
(function (CredentialStatusType) {
    // SparseMerkleTreeProof is CredentialStatusType for standard MTP result handlers
    CredentialStatusType["SparseMerkleTreeProof"] = "SparseMerkleTreeProof";
    // Iden3ReverseSparseMerkleTreeProof is CredentialStatusType  for reverse iden3 algorithm
    CredentialStatusType["Iden3ReverseSparseMerkleTreeProof"] = "Iden3ReverseSparseMerkleTreeProof";
    // Iden3commRevocationStatusV1 is CredentialStatusType for iden3comm revocation status
    CredentialStatusType["Iden3commRevocationStatusV1"] = "Iden3commRevocationStatusV1.0";
    // Iden3OnсhainSparseMerkleTreeProof2023 is a proof type for MTP proofs with iden3 metadata from blockchain
    CredentialStatusType["Iden3OnchainSparseMerkleTreeProof2023"] = "Iden3OnchainSparseMerkleTreeProof2023";
})(CredentialStatusType = exports.CredentialStatusType || (exports.CredentialStatusType = {}));
/**
 * W3C Proof purpose
 *
 * @enum {number}
 */
var ProofPurpose;
(function (ProofPurpose) {
    ProofPurpose["Authentication"] = "Authentication";
})(ProofPurpose = exports.ProofPurpose || (exports.ProofPurpose = {}));
/**
 * Merklized Core.Claim root position for vc creation
 *
 * @enum {number}
 */
var MerklizedRootPosition;
(function (MerklizedRootPosition) {
    // PositionIndex merklized root is stored in index.
    MerklizedRootPosition["Index"] = "index";
    // Value merklized root is stored in value.
    MerklizedRootPosition["Value"] = "value";
    // None merklized root is not stored in the claim. By Default.
    MerklizedRootPosition["None"] = "";
})(MerklizedRootPosition = exports.MerklizedRootPosition || (exports.MerklizedRootPosition = {}));
/**
 * Subject Core.Claim position for vc creation
 *
 * @enum {number}
 */
var SubjectPosition;
(function (SubjectPosition) {
    // CredentialSubjectPositionNone is for self issued Iden3Credential
    SubjectPosition["None"] = "";
    // Index save subject in index part of claim. By default.
    SubjectPosition["Index"] = "index";
    // Value save subject in value part of claim.
    SubjectPosition["Value"] = "value";
})(SubjectPosition = exports.SubjectPosition || (exports.SubjectPosition = {}));
//# sourceMappingURL=constants.js.map