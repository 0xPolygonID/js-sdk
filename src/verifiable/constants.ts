export const VerifiableConstants = Object.freeze({
  ERRORS: {
    FiELD_IS_EMPTY: 'fieldPath is empty',
    CONTEXT_TYPE_IS_EMPTY: 'ctxType is empty',
    // ErrStateNotFound issuer state is genesis state.
    ISSUER_STATE_NOT_FOUND: 'issuer state not found'
  },
  CREDENTIAL_TYPE: {
    // VerifiableCredential is a W3C verifiable credential type
    W3C_VERIFIABLE: 'VerifiableCredential'
  },
  JSONLD_SCHEMA: {
    // JSONLDSchemaIden3Credential is a schema for context with Iden3Credential type
    IDEN3_CREDENTIAL:
      'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/iden3credential-v2.json-ld',
    // JSONLDSchemaW3CCredential2018 is a schema for context with VerifiableCredential type
    W3C_CREDENTIAL_2018: 'https://www.w3.org/2018/credentials/v1'
  },
  // JSONSchemaValidator2018 JSON schema for verification of Iden3Credential
  JSON_SCHEMA_VALIDATOR: 'JsonSchemaValidator2018',
  SERVICE_TYPE: {
    // Iden3CommServiceType is service type for iden3comm protocol
    IDEN3_COMM: 'iden3-communication',
    // PushNotificationServiceType is service type for delivering push notifications to identity
    PUSH_NOTIFICATION: 'push-notification'
  }
});

export enum ProofType {
  // BJJSignatureProofType schema type
  BJJSignature = 'BJJSignature2021',
  // Iden3SparseMerkleProofType schema
  Iden3SparseMerkle = 'Iden3SparseMerkleProof'
}

// CredentialStatusType type for understanding revocation type
export enum CredentialStatusType {
  // SparseMerkleTreeProof is CredentialStatusType for standard MTP result handlers
  SparseMerkleTreeProof = 'SparseMerkleTreeProof',
  // Iden3ReverseSparseMerkleTreeProof is CredentialStatusType  for reverse iden3 algorithm
  Iden3ReverseSparseMerkleTreeProof = 'Iden3ReverseSparseMerkleTreeProof'
}

export enum ProofPurpose {
  Authentication = 'Authentication'
}

export enum MerklizedRootPosition {
  // PositionIndex merklized root is stored in index.
  Index = 'index',
  // Value merklized root is stored in value.
  Value = 'value',
  // None merklized root is not stored in the claim. By Default.
  None = ''
}

export enum SubjectPosition {
  // CredentialSubjectPositionNone is for self issued Iden3Credential
  None = '',
  // Index save subject in index part of claim. By default.
  Index = 'index',
  // Value save subject in value part of claim.
  Value = 'value'
}
