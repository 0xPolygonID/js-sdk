"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AbstractMessageHandler: () => AbstractMessageHandler,
  AbstractPrivateKeyStore: () => AbstractPrivateKeyStore,
  AgentResolver: () => AgentResolver,
  AnonCryptPacker: () => AnonCryptPacker,
  AtomicQueryMTPV2Inputs: () => AtomicQueryMTPV2Inputs,
  AtomicQueryMTPV2OnChainInputs: () => AtomicQueryMTPV2OnChainInputs,
  AtomicQueryMTPV2OnChainPubSignals: () => AtomicQueryMTPV2OnChainPubSignals,
  AtomicQueryMTPV2PubSignals: () => AtomicQueryMTPV2PubSignals,
  AtomicQuerySigV2Inputs: () => AtomicQuerySigV2Inputs,
  AtomicQuerySigV2OnChainCircuitInputs: () => AtomicQuerySigV2OnChainCircuitInputs,
  AtomicQuerySigV2OnChainInputs: () => AtomicQuerySigV2OnChainInputs,
  AtomicQuerySigV2OnChainPubSignals: () => AtomicQuerySigV2OnChainPubSignals,
  AtomicQuerySigV2PubSignals: () => AtomicQuerySigV2PubSignals,
  AtomicQueryV3Inputs: () => AtomicQueryV3Inputs,
  AtomicQueryV3OnChainInputs: () => AtomicQueryV3OnChainInputs,
  AtomicQueryV3OnChainPubSignals: () => AtomicQueryV3OnChainPubSignals,
  AtomicQueryV3PubSignals: () => AtomicQueryV3PubSignals,
  AuthHandler: () => AuthHandler,
  AuthMethod: () => AuthMethod,
  AuthV2Inputs: () => AuthV2Inputs,
  AuthV2PubSignals: () => AuthV2PubSignals,
  AuthV3Inputs: () => AuthV3Inputs,
  AuthV3PubSignals: () => AuthV3PubSignals,
  BJJSignatureProof2021: () => BJJSignatureProof2021,
  BaseConfig: () => BaseConfig,
  BjjProvider: () => BjjProvider,
  BrowserDataSource: () => BrowserDataSource,
  CACHE_KEY_VERSION: () => CACHE_KEY_VERSION,
  CircuitClaim: () => CircuitClaim,
  CircuitError: () => CircuitError,
  CircuitId: () => CircuitId,
  CircuitLoadMode: () => CircuitLoadMode,
  CircuitStorage: () => CircuitStorage,
  ContractRequestHandler: () => ContractRequestHandler,
  CredentialOfferStatus: () => CredentialOfferStatus,
  CredentialProposalHandler: () => CredentialProposalHandler,
  CredentialStatusPublisherRegistry: () => CredentialStatusPublisherRegistry,
  CredentialStatusResolverRegistry: () => CredentialStatusResolverRegistry,
  CredentialStatusType: () => CredentialStatusType,
  CredentialStorage: () => CredentialStorage,
  CredentialWallet: () => CredentialWallet,
  DEFAULT_CACHE_MAX_SIZE: () => DEFAULT_CACHE_MAX_SIZE,
  DEFAULT_DID_CONTEXT: () => DEFAULT_DID_CONTEXT,
  DIDDocumentBuilder: () => DIDDocumentBuilder,
  DIDDocumentJSONSchema: () => DIDDocumentJSONSchema,
  DIDDocumentSignature: () => DIDDocumentSignature,
  DataPrepareHandlerFunc: () => DataPrepareHandlerFunc,
  DefaultKMSKeyResolver: () => DefaultKMSKeyResolver,
  DefaultZKPPacker: () => DefaultZKPPacker,
  DidDocumentCredentialStatusResolver: () => DidDocumentCredentialStatusResolver,
  DidResolverStateReadonlyStorage: () => DidResolverStateReadonlyStorage,
  DiscoverFeatureQueryType: () => DiscoverFeatureQueryType,
  DiscoveryProtocolFeatureType: () => DiscoveryProtocolFeatureType,
  DiscoveryProtocolHandler: () => DiscoveryProtocolHandler,
  DisplayMethodType: () => DisplayMethodType,
  Ed25519Provider: () => Ed25519Provider,
  ErrorEmptyAuthClaimNonRevProof: () => ErrorEmptyAuthClaimNonRevProof,
  ErrorEmptyAuthClaimProof: () => ErrorEmptyAuthClaimProof,
  ErrorEmptyChallengeSignature: () => ErrorEmptyChallengeSignature,
  ErrorEmptyClaimNonRevProof: () => ErrorEmptyClaimNonRevProof,
  ErrorEmptyClaimProof: () => ErrorEmptyClaimProof,
  ErrorEmptyClaimSignature: () => ErrorEmptyClaimSignature,
  ErrorEmptyIssuerAuthClaimNonRevProof: () => ErrorEmptyIssuerAuthClaimNonRevProof,
  ErrorEmptyIssuerAuthClaimProof: () => ErrorEmptyIssuerAuthClaimProof,
  ErrorUserStateInRelayClaimProof: () => ErrorUserStateInRelayClaimProof,
  EthStateStorage: () => EthStateStorage,
  FSCircuitStorage: () => FSCircuitStorage,
  FetchHandler: () => FetchHandler,
  FilterQuery: () => FilterQuery,
  FunctionSignatures: () => FunctionSignatures,
  Iden3OnchainSmtCredentialStatusPublisher: () => Iden3OnchainSmtCredentialStatusPublisher,
  Iden3SmtRhsCredentialStatusPublisher: () => Iden3SmtRhsCredentialStatusPublisher,
  Iden3SparseMerkleTreeProof: () => Iden3SparseMerkleTreeProof,
  IdentityStorage: () => IdentityStorage,
  IdentityWallet: () => IdentityWallet,
  InMemoryDataSource: () => InMemoryDataSource,
  InMemoryMerkleTreeStorage: () => InMemoryMerkleTreeStorage,
  InMemoryPrivateKeyStore: () => InMemoryPrivateKeyStore,
  InMemoryProofStorage: () => InMemoryProofStorage,
  IndexedDBDataSource: () => IndexedDBDataSource,
  IndexedDBPrivateKeyStore: () => IndexedDBPrivateKeyStore,
  InputGenerator: () => InputGenerator,
  IssuerResolver: () => IssuerResolver,
  JSON_SCHEMA_VALIDATORS_REGISTRY: () => JSON_SCHEMA_VALIDATORS_REGISTRY,
  JWK2020_CONTEXT_V1: () => JWK2020_CONTEXT_V1,
  JWSPacker: () => JWSPacker,
  JoseService: () => JoseService,
  JsonSchemaValidator: () => JsonSchemaValidator,
  Jwk2020VerificationMethodBuilder: () => Jwk2020VerificationMethodBuilder,
  KMS: () => KMS,
  KmsKeyType: () => KmsKeyType,
  LDParser: () => LDParser,
  LinkedMultiQueryInputs: () => LinkedMultiQueryInputs,
  LinkedMultiQueryPubSignals: () => LinkedMultiQueryPubSignals,
  LocalStoragePrivateKeyStore: () => LocalStoragePrivateKeyStore,
  MERKLE_TREE_TYPES: () => MERKLE_TREE_TYPES,
  MerkleTreeIndexedDBStorage: () => MerkleTreeIndexedDBStorage,
  MerkleTreeLocalStorage: () => MerkleTreeLocalStorage,
  MerkleTreeType: () => MerkleTreeType,
  MerklizedRootPosition: () => MerklizedRootPosition,
  MessageBus: () => MessageBus,
  MessageHandler: () => MessageHandler,
  NativeProver: () => NativeProver,
  OnChainResolver: () => OnChainResolver,
  OnChainRevocationStorage: () => OnChainRevocationStorage,
  OnChainZKPVerifier: () => OnChainZKPVerifier,
  OnchainIssuer: () => OnchainIssuer,
  Operators: () => Operators,
  P384Provider: () => P384Provider,
  PROTOCOL_CONSTANTS: () => constants_exports,
  PackageManager: () => PackageManager,
  Parser: () => Parser,
  PaymentFeatures: () => PaymentFeatures,
  PaymentHandler: () => PaymentHandler,
  PaymentRequestDataType: () => PaymentRequestDataType,
  PaymentType: () => PaymentType,
  PlainPacker: () => PlainPacker,
  ProofNode: () => ProofNode,
  ProofPurpose: () => ProofPurpose,
  ProofService: () => ProofService,
  ProofType: () => ProofType,
  PubSignalsVerifier: () => PubSignalsVerifier,
  Query: () => Query,
  QueryOperators: () => QueryOperators,
  RHSResolver: () => RHSResolver,
  RefreshHandler: () => RefreshHandler,
  RefreshServiceType: () => RefreshServiceType,
  RevocationStatusHandler: () => RevocationStatusHandler,
  RsaOAEPKeyProvider: () => RsaOAEPKeyProvider,
  SDK_EVENTS: () => SDK_EVENTS,
  SOLANA_CHAIN_REF: () => SOLANA_CHAIN_REF,
  Scalar: () => Scalar,
  SearchError: () => SearchError,
  Sec256k1Provider: () => Sec256k1Provider,
  SolanaNativePaymentRequest: () => SolanaNativePaymentRequest,
  SolanaNativePaymentSchema: () => SolanaNativePaymentSchema,
  SolanaPaymentInstruction: () => SolanaPaymentInstruction,
  SolanaPaymentInstructionSchema: () => SolanaPaymentInstructionSchema,
  SolanaSplPaymentRequest: () => SolanaSplPaymentRequest,
  SolanaSplPaymentSchema: () => SolanaSplPaymentSchema,
  StandardJSONCredentialsQueryFilter: () => StandardJSONCredentialsQueryFilter,
  StateTransitionInputs: () => StateTransitionInputs,
  StateTransitionPubSignals: () => StateTransitionPubSignals,
  SubjectPosition: () => SubjectPosition,
  SupportedCurrencies: () => SupportedCurrencies,
  SupportedDataFormat: () => SupportedDataFormat,
  SupportedPaymentProofType: () => SupportedPaymentProofType,
  TransactionService: () => TransactionService,
  ValueProof: () => ValueProof,
  Vector: () => Vector,
  VerifiableConstants: () => VerifiableConstants,
  VerificationHandlerFunc: () => VerificationHandlerFunc,
  W3CCredential: () => W3CCredential,
  XSDNS: () => XSDNS,
  ZKPPacker: () => ZKPPacker,
  acceptHasProvingMethodAlg: () => acceptHasProvingMethodAlg,
  availableTypesOperators: () => availableTypesOperators,
  base58ToBytes: () => base58ToBytes,
  base64ToBytes: () => base64ToBytes,
  base64UrlToBytes: () => base64UrlToBytes,
  bigIntArrayToStringArray: () => bigIntArrayToStringArray,
  bigIntCompare: () => bigIntCompare,
  buildAccept: () => buildAccept,
  buildAcceptFromProvingMethodAlg: () => buildAcceptFromProvingMethodAlg,
  buildDIDFromEthAddress: () => buildDIDFromEthAddress,
  buildDIDFromEthPubKey: () => buildDIDFromEthPubKey,
  buildEvmPayment: () => buildEvmPayment,
  buildFieldPath: () => buildFieldPath,
  buildSolanaPayment: () => buildSolanaPayment,
  buildTreeState: () => buildTreeState,
  buildVerifierId: () => buildVerifierId,
  byteDecoder: () => byteDecoder,
  byteEncoder: () => byteEncoder,
  bytesToBase58: () => bytesToBase58,
  bytesToBase64: () => bytesToBase64,
  bytesToBase64url: () => bytesToBase64url,
  bytesToHex: () => bytesToHex,
  cacheLoader: () => cacheLoader,
  calcChallengeAuth: () => calcChallengeAuth,
  calculateCoreSchemaHash: () => calculateCoreSchemaHash,
  calculateGroupId: () => calculateGroupId,
  calculateMultiRequestId: () => calculateMultiRequestId,
  calculateQueryHashV2: () => calculateQueryHashV2,
  calculateQueryHashV3: () => calculateQueryHashV3,
  calculateRequestId: () => calculateRequestId,
  checkCircuitOperator: () => checkCircuitOperator,
  checkCircuitQueriesLength: () => checkCircuitQueriesLength,
  checkDataInField: () => checkDataInField,
  checkQueryRequest: () => checkQueryRequest,
  circuitValidator: () => circuitValidator,
  comparatorOptions: () => comparatorOptions,
  core: () => core,
  createAuthorizationRequest: () => createAuthorizationRequest,
  createAuthorizationRequestWithMessage: () => createAuthorizationRequestWithMessage,
  createDiscoveryFeatureDiscloseMessage: () => createDiscoveryFeatureDiscloseMessage,
  createDiscoveryFeatureQueryMessage: () => createDiscoveryFeatureQueryMessage,
  createInMemoryCache: () => createInMemoryCache,
  createMerkleTreeMetaInfo: () => createMerkleTreeMetaInfo,
  createPayment: () => createPayment,
  createPaymentRequest: () => createPaymentRequest,
  createProblemReport: () => createProblemReport,
  createProblemReportMessage: () => createProblemReportMessage,
  createProposal: () => createProposal,
  createProposalRequest: () => createProposalRequest,
  createSchemaHash: () => createSchemaHash,
  createVerifiablePresentation: () => createVerifiablePresentation,
  createZkpRequestCacheKey: () => createZkpRequestCacheKey,
  credentialSubjectKey: () => credentialSubjectKey2,
  dataFillsSlot: () => dataFillsSlot,
  decodeBase64url: () => decodeBase64url,
  defaultEthConnectionConfig: () => defaultEthConnectionConfig,
  defaultMTLevels: () => defaultMTLevels,
  defaultMTLevelsClaim: () => defaultMTLevelsClaim,
  defaultMTLevelsOnChain: () => defaultMTLevelsOnChain,
  defaultProvingMethodAlg: () => defaultProvingMethodAlg,
  defaultRSAOaepKmsIdPathGeneratingFunction: () => defaultRSAOaepKmsIdPathGeneratingFunction,
  defaultValueArraySize: () => defaultValueArraySize,
  defineMerklizedRootPosition: () => defineMerklizedRootPosition,
  encodeBase64url: () => encodeBase64url,
  existenceToInt: () => existenceToInt,
  extractProof: () => extractProof,
  extractPublicKeyBytes: () => extractPublicKeyBytes,
  factoryComparer: () => factoryComparer,
  fieldToByteArray: () => fieldToByteArray,
  fieldValueFromVerifiablePresentation: () => fieldValueFromVerifiablePresentation,
  fillCoreClaimSlot: () => fillCoreClaimSlot,
  fillSlot: () => fillSlot,
  findCredentialType: () => findCredentialType,
  findValue: () => findValue,
  generateProfileDID: () => generateProfileDID,
  getChallengeFromEthAddress: () => getChallengeFromEthAddress,
  getCircuitIdsWithSubVersions: () => getCircuitIdsWithSubVersions,
  getERC20Decimals: () => getERC20Decimals,
  getFieldSlotIndex: () => getFieldSlotIndex,
  getFirstSupportedProfile: () => getFirstSupportedProfile,
  getGroupedCircuitIdsWithSubVersions: () => getGroupedCircuitIdsWithSubVersions,
  getIsGenesisStateById: () => getIsGenesisStateById,
  getKMSIdByAuthCredential: () => getKMSIdByAuthCredential,
  getNodeAuxValue: () => getNodeAuxValue,
  getNodesRepresentation: () => getNodesRepresentation,
  getOperatorNameByValue: () => getOperatorNameByValue,
  getPermitSignature: () => getPermitSignature,
  getProperties: () => getProperties,
  getProvingMethodAlgFromJWZ: () => getProvingMethodAlgFromJWZ,
  getRecipientsJWKs: () => getRecipientsJWKs,
  getSerializationAttrFromContext: () => getSerializationAttrFromContext,
  getSerializationAttrFromParsedContext: () => getSerializationAttrFromParsedContext,
  getUnmarshallerForCircuitId: () => getUnmarshallerForCircuitId,
  getUserDIDFromCredential: () => getUserDIDFromCredential,
  hexToBytes: () => hexToBytes,
  initDefaultPackerOptions: () => initDefaultPackerOptions,
  isAuthCircuit: () => isAuthCircuit,
  isEthereumIdentity: () => isEthereumIdentity,
  isGenesisState: () => isGenesisState,
  isGenesisStateId: () => isGenesisStateId,
  isIdentityDoesNotExistError: () => isIdentityDoesNotExistError,
  isIssuerGenesis: () => isIssuerGenesis,
  isRootDoesNotExistError: () => isRootDoesNotExistError,
  isStateDoesNotExistError: () => isStateDoesNotExistError,
  isValidOperation: () => isValidOperation,
  jsonLDMerklizer: () => jsonLDMerklizer,
  keyPath: () => keyPath,
  mergeObjects: () => mergeObjects,
  notification: () => notifications_exports,
  packEthIdentityProof: () => packEthIdentityProof,
  packMetadatas: () => packMetadatas,
  packZkpProof: () => packZkpProof,
  parseAcceptProfile: () => parseAcceptProfile,
  parseCoreClaimSlots: () => parseCoreClaimSlots,
  parseCredentialSubject: () => parseCredentialSubject,
  parseQueriesMetadata: () => parseQueriesMetadata,
  parseQueryMetadata: () => parseQueryMetadata,
  parseSerializationAttr: () => parseSerializationAttr,
  prepareCircuitArrayValues: () => prepareCircuitArrayValues,
  prepareSiblingsStr: () => prepareSiblingsStr,
  prepareZkpProof: () => prepareZkpProof,
  processProofAuth: () => processProofAuth,
  processProofResponse: () => processProofResponse,
  processZeroKnowledgeProofRequests: () => processZeroKnowledgeProofRequests,
  pushHashesToRHS: () => pushHashesToRHS,
  resolveDIDDocumentAuth: () => resolveDIDDocumentAuth,
  resolveDidDocument: () => resolveDidDocument,
  resolvePath: () => resolvePath,
  resolveVerificationMethods: () => resolveVerificationMethods,
  serializeSolanaPaymentInstruction: () => serializeSolanaPaymentInstruction,
  strMTHex: () => strMTHex,
  stringByPath: () => stringByPath,
  subjectPositionIndex: () => subjectPositionIndex,
  swapEndianness: () => swapEndianness,
  toClaimNonRevStatus: () => toClaimNonRevStatus,
  toGISTProof: () => toGISTProof,
  toPublicKeyJwk: () => toPublicKeyJwk,
  toRevocationStatus: () => toRevocationStatus,
  toTxDataArgs: () => toTxDataArgs,
  transformQueryValueToBigInts: () => transformQueryValueToBigInts,
  userStateError: () => userStateError,
  validateDIDDocumentAuth: () => validateDIDDocumentAuth,
  validateDisclosureNativeSDSupport: () => validateDisclosureNativeSDSupport,
  validateDisclosureV2Circuit: () => validateDisclosureV2Circuit,
  validateEmptyCredentialSubjectNoopNativeSupport: () => validateEmptyCredentialSubjectNoopNativeSupport,
  validateEmptyCredentialSubjectV2Circuit: () => validateEmptyCredentialSubjectV2Circuit,
  validateOperators: () => validateOperators,
  validateTreeState: () => validateTreeState,
  verifyEIP712TypedData: () => verifyEIP712TypedData,
  verifyExpiresTime: () => verifyExpiresTime,
  verifyFieldValueInclusionNativeExistsSupport: () => verifyFieldValueInclusionNativeExistsSupport,
  verifyFieldValueInclusionV2: () => verifyFieldValueInclusionV2,
  verifyIden3SolanaPaymentRequest: () => verifyIden3SolanaPaymentRequest,
  witnessBuilder: () => witnessBuilder
});
module.exports = __toCommonJS(index_exports);

// src/kms/kms.ts
var KMS = class {
  _registry = /* @__PURE__ */ new Map();
  /**
   * register key provider in the KMS
   *
   * @param {KmsKeyType} keyType - kms key type
   * @param {IKeyProvider} keyProvider - key provider implementation
   */
  registerKeyProvider(keyType, keyProvider) {
    if (this._registry.get(keyType)) {
      throw new Error("present keyType");
    }
    this._registry.set(keyType, keyProvider);
  }
  /**
   * generates a new key and returns it kms key id
   *
   * @param {KmsKeyType} keyType
   * @param {Uint8Array} bytes
   * @returns kms key id
   */
  async createKeyFromSeed(keyType, bytes) {
    const keyProvider = this._registry.get(keyType);
    if (!keyProvider) {
      throw new Error(`keyProvider not found for: ${keyType}`);
    }
    return keyProvider.newPrivateKeyFromSeed(bytes);
  }
  async createKey(keyType) {
    const keyProvider = this._registry.get(keyType);
    if (!keyProvider) {
      throw new Error(`keyProvider not found for: ${keyType}`);
    }
    return keyProvider.newPrivateKey();
  }
  /**
   * gets public key for key id
   *
   * @param {KmsKeyId} keyId -- key id
   * @returns public key
   */
  async publicKey(keyId) {
    const keyProvider = this._registry.get(keyId.type);
    if (!keyProvider) {
      throw new Error(`keyProvider not found for: ${keyId.type}`);
    }
    return keyProvider.publicKey(keyId);
  }
  /**
   * sign Uint8Array with giv KmsKeyIden
   *
   * @param {KmsKeyId} keyId - key id
   * @param {Uint8Array} data - prepared data bytes
   * @returns `Promise<Uint8Array>` - return signature
   */
  async sign(keyId, data, opts) {
    const keyProvider = this._registry.get(keyId.type);
    if (!keyProvider) {
      throw new Error(`keyProvider not found for: ${keyId.type}`);
    }
    return keyProvider.sign(keyId, data, opts);
  }
  /**
   * Verifies a signature against the provided data and key ID.
   *
   * @param data - The data to verify the signature against.
   * @param signatureHex - The signature to verify, in hexadecimal format.
   * @param keyId - The key ID to use for verification.
   * @returns A promise that resolves to a boolean indicating whether the signature is valid.
   */
  verify(data, signatureHex, keyId) {
    const keyProvider = this._registry.get(keyId.type);
    if (!keyProvider) {
      throw new Error(`keyProvider not found for: ${keyId.type}`);
    }
    return keyProvider.verify(data, signatureHex, keyId);
  }
  /**
   * get all keys by key type
   *
   * @param keyType - Key type
   * @returns list of keys
   */
  list(keyType) {
    const keyProvider = this._registry.get(keyType);
    if (!keyProvider) {
      throw new Error(`keyProvider not found for: ${keyType}`);
    }
    return keyProvider.list();
  }
  /**
   * get key provider by key type
   *
   * @param keyType - Key type
   * @returns key provider
   */
  getKeyProvider(keyType) {
    return this._registry.get(keyType);
  }
};

// src/kms/key-providers/bjj-provider.ts
var import_js_crypto6 = require("@iden3/js-crypto");
var import_js_iden3_core8 = require("@iden3/js-iden3-core");

// src/kms/store/abstract-key-store.ts
var AbstractPrivateKeyStore = class {
};

// src/kms/store/memory-key-store.ts
var InMemoryPrivateKeyStore = class {
  _data;
  constructor() {
    this._data = /* @__PURE__ */ new Map();
  }
  list() {
    return Promise.resolve(Array.from(this._data).map(([alias, key]) => ({ alias, key })));
  }
  async get(args) {
    const privateKey = this._data.get(args.alias);
    if (!privateKey) {
      throw new Error("no key under given alias");
    }
    return privateKey;
  }
  async importKey(args) {
    this._data.set(args.alias, args.key);
  }
};

// src/kms/store/types.ts
var KmsKeyType = /* @__PURE__ */ ((KmsKeyType2) => {
  KmsKeyType2["BabyJubJub"] = "BJJ";
  KmsKeyType2["Secp256k1"] = "Secp256k1";
  KmsKeyType2["Ed25519"] = "Ed25519";
  KmsKeyType2["RsaOaep256"] = "RSA-OAEP-256";
  KmsKeyType2["P384"] = "P-384";
  return KmsKeyType2;
})(KmsKeyType || {});

// src/kms/store/local-storage-key-store.ts
var LocalStoragePrivateKeyStore = class _LocalStoragePrivateKeyStore {
  static storageKey = "keystore";
  /**
   * get all keys
   *
   * @abstract
   * @returns `Promise<{ alias: string; key: string }[]>`
   */
  list() {
    const dataStr = localStorage.getItem(_LocalStoragePrivateKeyStore.storageKey);
    if (!dataStr) {
      throw new Error("no key under given alias");
    }
    const data = JSON.parse(dataStr);
    return data.map((i) => ({ alias: i.id, key: i.value }));
  }
  /**
   * Gets key from the local storage
   *
   * @param {{ alias: string }} args
   * @returns hex string
   */
  async get(args) {
    const dataStr = localStorage.getItem(_LocalStoragePrivateKeyStore.storageKey);
    if (!dataStr) {
      throw new Error("no key under given alias");
    }
    const data = JSON.parse(dataStr);
    const privateKey = data.find((d) => d.id === args.alias);
    if (!privateKey) {
      throw new Error("no key under given alias");
    }
    return privateKey.value;
  }
  /**
   * Import key to the local storage
   *
   * @param {{ alias: string; key: string }} args - alias and private key in the hex
   * @returns void
   */
  async importKey(args) {
    const dataStr = localStorage.getItem(_LocalStoragePrivateKeyStore.storageKey);
    let data = [];
    if (dataStr) {
      data = JSON.parse(dataStr);
    }
    const index = data.findIndex((d) => d.id === args.alias);
    if (index > -1) {
      data[index].value = args.key;
    } else {
      data.push({ id: args.alias, value: args.key });
    }
    localStorage.setItem(_LocalStoragePrivateKeyStore.storageKey, JSON.stringify(data));
  }
};

// src/kms/store/indexed-db-key-store.ts
var import_idb_keyval = require("idb-keyval");
var IndexedDBPrivateKeyStore = class _IndexedDBPrivateKeyStore {
  static storageKey = "keystore";
  _store;
  constructor() {
    this._store = (0, import_idb_keyval.createStore)(
      `${_IndexedDBPrivateKeyStore.storageKey}-db`,
      _IndexedDBPrivateKeyStore.storageKey
    );
  }
  /**
   * get all keys
   *
   * @abstract
   * @returns `Promise<{ alias: string; key: string }[]>`
   */
  async list() {
    const allEntries = await (0, import_idb_keyval.entries)(this._store);
    return allEntries.map(([alias, key]) => ({ alias, key: key.value }));
  }
  /**
   * Gets key from the indexed db storage
   *
   * @param {{ alias: string }} args
   * @returns hex string
   */
  async get(args) {
    const key = await (0, import_idb_keyval.get)(args.alias, this._store);
    if (!key) {
      throw new Error("no key under given alias");
    }
    return key.value;
  }
  /**
   * Import key to the indexed db storage
   *
   * @param {{ alias: string; key: string }} args - alias and private key in the hex
   * @returns void
   */
  async importKey(args) {
    await (0, import_idb_keyval.set)(args.alias, { value: args.key }, this._store);
  }
};

// src/kms/provider-helpers.ts
function keyPath(keyType, keyID) {
  const basePath = "";
  return basePath + String(keyType) + ":" + keyID;
}

// src/utils/encoding.ts
var import_js_crypto = require("@iden3/js-crypto");
var import_rfc4648 = require("rfc4648");
var byteEncoder = new TextEncoder();
var byteDecoder = new TextDecoder();
function bytesToBase64url(b, opts = { pad: false }) {
  return import_rfc4648.base64url.stringify(b, opts);
}
function base64ToBytes(s, opts = { loose: true }) {
  return import_rfc4648.base64.parse(s, opts);
}
function bytesToBase64(b, opts = { pad: false }) {
  return import_rfc4648.base64.stringify(b, opts);
}
function base64UrlToBytes(s, opts = { loose: true }) {
  const inputBase64Url = s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return import_rfc4648.base64url.parse(inputBase64Url, opts);
}
function base58ToBytes(s) {
  return (0, import_js_crypto.base58ToBytes)(s);
}
function bytesToBase58(b) {
  return (0, import_js_crypto.base58FromBytes)(b);
}
function hexToBytes(s) {
  const input = s.startsWith("0x") ? s.substring(2) : s;
  return import_js_crypto.Hex.decodeString(input.toLowerCase());
}
function encodeBase64url(s, opts = { pad: false }) {
  return import_rfc4648.base64url.stringify(byteEncoder.encode(s), opts);
}
function decodeBase64url(s, opts = { loose: true }) {
  return byteDecoder.decode(import_rfc4648.base64url.parse(s, opts));
}
function bytesToHex(b) {
  return import_js_crypto.Hex.encodeString(b);
}

// src/utils/object.ts
function mergeObjects(credSubject = {}, otherCredSubject = {}) {
  credSubject = credSubject ?? {};
  otherCredSubject = otherCredSubject ?? {};
  let result = {};
  const credSubjectKeys = Object.keys(credSubject);
  for (const key of credSubjectKeys) {
    if (typeof otherCredSubject[key] !== "undefined") {
      if (typeof credSubject[key] !== "object" && typeof otherCredSubject[key] !== "object") {
        throw new Error("Invalid query");
      }
      const subjectProperty = credSubject[key];
      const otherSubjectProperty = otherCredSubject[key];
      const propertyOperators = Object.keys(subjectProperty);
      const subjectPropertyResult = {};
      for (const operatorKey of propertyOperators) {
        if (typeof otherSubjectProperty[operatorKey] !== "undefined") {
          const operatorValue1 = subjectProperty[operatorKey];
          const operatorValue2 = otherSubjectProperty[operatorKey];
          subjectPropertyResult[operatorKey] = [
            .../* @__PURE__ */ new Set([
              ...subjectPropertyResult[operatorKey] ?? [],
              operatorValue1,
              ...Array.isArray(operatorValue2) ? operatorValue2 : [operatorValue2]
            ])
          ];
        } else {
          subjectPropertyResult[operatorKey] = subjectProperty[operatorKey];
        }
      }
      result[key] = {
        ...otherCredSubject[key],
        ...subjectPropertyResult
      };
    }
  }
  result = { ...credSubject, ...otherCredSubject, ...result };
  return result;
}

// src/utils/did-helper.ts
var import_js_crypto2 = require("@iden3/js-crypto");
var import_js_iden3_core = require("@iden3/js-iden3-core");
var import_js_merkletree = require("@iden3/js-merkletree");
var import_ethers = require("ethers");
var DIDDocumentSignature = /* @__PURE__ */ ((DIDDocumentSignature2) => {
  DIDDocumentSignature2["EthereumEip712Signature2021"] = "EthereumEip712Signature2021";
  return DIDDocumentSignature2;
})(DIDDocumentSignature || {});
function isGenesisState(did, state) {
  if (typeof state === "string") {
    state = import_js_merkletree.Hash.fromHex(state).bigInt();
  }
  const id = import_js_iden3_core.DID.idFromDID(did);
  return getIsGenesisStateById(id, state);
}
function getIsGenesisStateById(id, state) {
  const { method, blockchain, networkId } = import_js_iden3_core.DID.decodePartsFromId(id);
  const type = (0, import_js_iden3_core.buildDIDType)(method, blockchain, networkId);
  const idFromState = import_js_iden3_core.Id.idGenesisFromIdenState(type, state);
  return id.bigInt().toString() === idFromState.bigInt().toString();
}
function isEthereumIdentity(did) {
  const issuerId = import_js_iden3_core.DID.idFromDID(did);
  try {
    import_js_iden3_core.Id.ethAddressFromId(issuerId);
    return true;
  } catch {
    return false;
  }
}
var buildVerifierId = (address, info) => {
  address = address.replace("0x", "");
  const ethAddrBytes = import_js_crypto2.Hex.decodeString(address);
  const ethAddr = ethAddrBytes.slice(0, 20);
  const genesis = (0, import_js_iden3_core.genesisFromEthAddress)(ethAddr);
  const tp = (0, import_js_iden3_core.buildDIDType)(info.method, info.blockchain, info.networkId);
  return new import_js_iden3_core.Id(tp, genesis);
};
var validateDIDDocumentAuth = async (did, resolverURL, state) => {
  const vm = await resolveDIDDocumentAuth(did, resolverURL, state);
  if (!vm) {
    throw new Error(`can't resolve DID document`);
  }
  if (!vm.published && !isGenesisState(did, state.bigInt())) {
    throw new Error(`issuer state not published and not genesis`);
  }
};
var resolveDIDDocumentAuth = async (did, resolveURL, state) => {
  let url = `${resolveURL}/${encodeURIComponent(did.string())}`;
  if (state) {
    url += `?state=${state.hex()}`;
  }
  const resp = await fetch(url);
  const didResolutionRes = await resp.json();
  return didResolutionRes.didDocument?.verificationMethod?.find(
    (i) => i.type === "Iden3StateInfo2023"
  );
};
function emptyStateDID(did) {
  const id = import_js_iden3_core.DID.idFromDID(did);
  const didType = (0, import_js_iden3_core.buildDIDType)(
    import_js_iden3_core.DID.methodFromId(id),
    import_js_iden3_core.DID.blockchainFromId(id),
    import_js_iden3_core.DID.networkIdFromId(id)
  );
  const identifier = import_js_iden3_core.Id.idGenesisFromIdenState(didType, 0n);
  const emptyDID = import_js_iden3_core.DID.parseFromId(identifier);
  return emptyDID;
}
var resolveDidDocument = async (did, resolverUrl, opts) => {
  let didString = encodeURIComponent(did.string());
  const isGistRequest = opts?.gist && !opts.state;
  if (isGistRequest) {
    didString = encodeURIComponent(emptyStateDID(did).string());
  }
  let url = `${resolverUrl}/1.0/identifiers/${didString}`;
  if (opts?.signature) {
    url += `?signature=${opts.signature}`;
  }
  if (opts?.state) {
    url += `${url.includes("?") ? "&" : "?"}state=${opts.state.hex()}`;
  }
  if (opts?.gist) {
    url += `${url.includes("?") ? "&" : "?"}gist=${opts.gist.hex()}`;
  }
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    return data;
  } catch (e) {
    throw new Error(`Failed to resolve DID document for ${did} ${e}`);
  }
};
var _buildDIDFromEthAddress = (didType, ethAddress) => {
  const genesis = (0, import_js_iden3_core.genesisFromEthAddress)(ethAddress);
  const identifier = new import_js_iden3_core.Id(didType, genesis);
  return import_js_iden3_core.DID.parseFromId(identifier);
};
var buildDIDFromEthPubKey = (didType, pubKeyEth) => {
  const hashOfPublicKey = (0, import_ethers.keccak256)(hexToBytes(pubKeyEth));
  const ethAddressBuffer = hexToBytes(hashOfPublicKey);
  const ethAddr = ethAddressBuffer.slice(-20);
  return _buildDIDFromEthAddress(didType, ethAddr);
};
var buildDIDFromEthAddress = (didType, ethAddress) => {
  return _buildDIDFromEthAddress(didType, hexToBytes(ethAddress));
};
var getChallengeFromEthAddress = (address) => {
  if ((0, import_ethers.isAddress)(address)) {
    return import_js_iden3_core.BytesHelper.bytesToInt(hexToBytes(address));
  }
  throw new Error(`Invalid Ethereum address: ${address}`);
};

// src/utils/message-bus.ts
var import_pubsub_js = __toESM(require("pubsub-js"), 1);
var SDK_EVENTS = {
  TX_RECEIPT_ACCEPTED: "TX_RECEIPT_ACCEPTED"
};
var MessageBus = class _MessageBus {
  /**
   * The singleton instance of the MessageBus class.
   */
  static instance;
  /**
   * Private constructor for the MessageBus class.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {
  }
  /**
   * Returns the singleton instance of the MessageBus class.
   * If the instance doesn't exist, it creates a new one.
   * @returns The singleton instance of the MessageBus class.
   */
  static getInstance() {
    if (!_MessageBus.instance) {
      _MessageBus.instance = new _MessageBus();
    }
    return _MessageBus.instance;
  }
  /**
   * Publishes a message to the specified topic.
   *
   * @template T - The type of data being published.
   * @param {SdkTopic} topic - The topic to publish the message to.
   * @param {T} data - The data to be published.
   * @returns {boolean} - Returns true if the message was successfully published, false otherwise.
   */
  publish(topic, data) {
    return import_pubsub_js.default.publish(topic.toString(), data);
  }
  /**
   * Subscribes to a specific topic and registers a callback function to be executed when a message is published.
   *
   * @param topic - The topic to subscribe to.
   * @param callback - The callback function to be executed when a message is published.
   */
  subscribe(topic, callback) {
    return import_pubsub_js.default.subscribe(topic.toString(), (_, data) => callback(data));
  }
  /**
   * Subscribes to a specific topic and registers a callback function to be executed when a message is published.
   * The callback function is executed only once.
   *
   * @param topic - The topic to subscribe to.
   * @param callback - The callback function to be executed when a message is published.
   */
  subscribeOnce(topic, callback) {
    import_pubsub_js.default.subscribeOnce(topic.toString(), (_, data) => callback(data));
  }
  /**
   * Unsubscribes from a specific topic in the message bus.
   *
   * @param topic - The topic to unsubscribe from.
   * @returns A string or boolean indicating the success of the unsubscribe operation.
   */
  unsubscribe(topic) {
    return import_pubsub_js.default.unsubscribe(topic.toString());
  }
};

// src/utils/compare-func.ts
var bigIntCompare = (a, b) => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

// src/utils/payments/solana.ts
var import_borsh = require("borsh");
var import_ed25519 = require("@noble/curves/ed25519.js");

// src/verifiable/proof.ts
var import_js_merkletree2 = require("@iden3/js-merkletree");

// src/verifiable/constants.ts
var VerifiableConstants = Object.freeze({
  ERRORS: {
    FiELD_IS_EMPTY: "fieldPath is empty",
    CONTEXT_TYPE_IS_EMPTY: "ctxType is empty",
    // ErrStateNotFound issuer state is genesis state.
    IDENTITY_DOES_NOT_EXIST: "Identity does not exist",
    IDENTITY_DOES_NOT_EXIST_CUSTOM_ERROR: "IdentityDoesNotExist",
    NO_AUTH_CRED_FOUND: "no auth credentials found",
    STATE_DOES_NOT_EXIST: "State does not exist",
    STATE_DOES_NOT_EXIST_CUSTOM_ERROR: "StateDoesNotExist",
    ROOT_DOES_NOT_EXIST: "Root does not exist",
    ROOT_DOES_NOT_EXIST_CUSTOM_ERROR: "RootDoesNotExist",
    // identity wallet
    ID_WALLET_NO_CREDENTIAL_SATISFIED_QUERY: "no credential satisfied query",
    ID_WALLET_SIGNER_IS_REQUIRED: "Ethereum signer is required to create Ethereum identities in order to transit state",
    ID_WALLET_PROVER_IS_REQUIRED: "prover is required to generate proofs for non ethereum identities",
    ID_WALLET_CORE_CLAIM_REQUIRED_IN_SIG_PROOF: "credential must have coreClaim representation in the signature proof",
    ID_WALLET_CORE_CLAIM_REQUIRED_IN_ANY_PROOF: "credential must have coreClaim representation in proofs",
    ID_WALLET_CORE_CLAIM_MISMATCH: "core claim representations is set in both proofs but they are not equal",
    ID_WALLET_CORE_CLAIM_IS_NOT_SET: "core claim is not set in credential proofs",
    ID_WALLET_PROFILE_OR_IDENTITY_NOT_FOUND: "profile or identity not found",
    ID_WALLET_PROFILE_ALREADY_EXISTS: "profile with given nonce or verifier already exists",
    ID_WALLET_PROFILE_ALREADY_EXISTS_VERIFIER_TAGS: "profile with given verifier and tags already exists",
    ID_WALLET_ISSUER_AUTH_BJJ_CRED_MUST_HAVE_ANY_PROOF: "issuer auth credential must have proof",
    ID_WALLET_ISSUER_AUTH_BJJ_CRED_MUST_HAVE_MTP_PROOF: "mtp is required for auth bjj key to issue new credentials",
    // proof service
    PROOF_SERVICE_NO_CREDENTIAL_FOR_IDENTITY_OR_PROFILE: "no credentials belong to did or its profiles",
    PROOF_SERVICE_NO_CREDENTIAL_FOR_QUERY: "credential not found for query",
    PROOF_SERVICE_PROFILE_GENESIS_DID_MISMATCH: "subject and auth profiles are not derived from the same did",
    PROOF_SERVICE_NO_QUERIES_IN_ZKP_REQUEST: "no queries in zkp request",
    PROOF_SERVICE_CREDENTIAL_IS_EXPIRED: "credential is expired",
    // credential wallet
    CREDENTIAL_WALLET_ALL_CREDENTIALS_ARE_REVOKED: "all claims are revoked"
  },
  CREDENTIAL_TYPE: {
    // VerifiableCredential is a W3C verifiable credential type
    W3C_VERIFIABLE_CREDENTIAL: "VerifiableCredential",
    W3C_VERIFIABLE_PRESENTATION: "VerifiablePresentation"
  },
  CREDENTIAL_SUBJECT_PATH: "https://www.w3.org/2018/credentials#credentialSubject",
  JSONLD_SCHEMA: {
    // JSONLDSchemaIden3Credential is a schema for context with Iden3Credential type
    IDEN3_CREDENTIAL: "https://schema.iden3.io/core/jsonld/iden3proofs.jsonld",
    // JSONLDSchemaIden3DisplayMethod is a schema for context with Iden3BasicDisplayMethodV1 type
    IDEN3_DISPLAY_METHOD: "https://schema.iden3.io/core/jsonld/displayMethod.jsonld",
    // JSONLDSchemaW3CCredential2018 is a schema for context with VerifiableCredential type
    W3C_CREDENTIAL_2018: "https://www.w3.org/2018/credentials/v1",
    W3C_VC_DOCUMENT_2018: `{"@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","VerifiableCredential":{"@id":"https://www.w3.org/2018/credentials#VerifiableCredential","@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","cred":"https://www.w3.org/2018/credentials#","sec":"https://w3id.org/security#","xsd":"http://www.w3.org/2001/XMLSchema#","credentialSchema":{"@id":"cred:credentialSchema","@type":"@id","@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","cred":"https://www.w3.org/2018/credentials#","JsonSchemaValidator2018":"cred:JsonSchemaValidator2018"}},"credentialStatus":{"@id":"cred:credentialStatus","@type":"@id"},"credentialSubject":{"@id":"cred:credentialSubject","@type":"@id"},"evidence":{"@id":"cred:evidence","@type":"@id"},"expirationDate":{"@id":"cred:expirationDate","@type":"xsd:dateTime"},"holder":{"@id":"cred:holder","@type":"@id"},"issued":{"@id":"cred:issued","@type":"xsd:dateTime"},"issuer":{"@id":"cred:issuer","@type":"@id"},"issuanceDate":{"@id":"cred:issuanceDate","@type":"xsd:dateTime"},"proof":{"@id":"sec:proof","@type":"@id","@container":"@graph"},"refreshService":{"@id":"cred:refreshService","@type":"@id","@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","cred":"https://www.w3.org/2018/credentials#","ManualRefreshService2018":"cred:ManualRefreshService2018"}},"termsOfUse":{"@id":"cred:termsOfUse","@type":"@id"},"validFrom":{"@id":"cred:validFrom","@type":"xsd:dateTime"},"validUntil":{"@id":"cred:validUntil","@type":"xsd:dateTime"}}},"VerifiablePresentation":{"@id":"https://www.w3.org/2018/credentials#VerifiablePresentation","@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","cred":"https://www.w3.org/2018/credentials#","sec":"https://w3id.org/security#","holder":{"@id":"cred:holder","@type":"@id"},"proof":{"@id":"sec:proof","@type":"@id","@container":"@graph"},"verifiableCredential":{"@id":"cred:verifiableCredential","@type":"@id","@container":"@graph"}}},"EcdsaSecp256k1Signature2019":{"@id":"https://w3id.org/security#EcdsaSecp256k1Signature2019","@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","sec":"https://w3id.org/security#","xsd":"http://www.w3.org/2001/XMLSchema#","challenge":"sec:challenge","created":{"@id":"http://purl.org/dc/terms/created","@type":"xsd:dateTime"},"domain":"sec:domain","expires":{"@id":"sec:expiration","@type":"xsd:dateTime"},"jws":"sec:jws","nonce":"sec:nonce","proofPurpose":{"@id":"sec:proofPurpose","@type":"@vocab","@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","sec":"https://w3id.org/security#","assertionMethod":{"@id":"sec:assertionMethod","@type":"@id","@container":"@set"},"authentication":{"@id":"sec:authenticationMethod","@type":"@id","@container":"@set"}}},"proofValue":"sec:proofValue","verificationMethod":{"@id":"sec:verificationMethod","@type":"@id"}}},"EcdsaSecp256r1Signature2019":{"@id":"https://w3id.org/security#EcdsaSecp256r1Signature2019","@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","sec":"https://w3id.org/security#","xsd":"http://www.w3.org/2001/XMLSchema#","challenge":"sec:challenge","created":{"@id":"http://purl.org/dc/terms/created","@type":"xsd:dateTime"},"domain":"sec:domain","expires":{"@id":"sec:expiration","@type":"xsd:dateTime"},"jws":"sec:jws","nonce":"sec:nonce","proofPurpose":{"@id":"sec:proofPurpose","@type":"@vocab","@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","sec":"https://w3id.org/security#","assertionMethod":{"@id":"sec:assertionMethod","@type":"@id","@container":"@set"},"authentication":{"@id":"sec:authenticationMethod","@type":"@id","@container":"@set"}}},"proofValue":"sec:proofValue","verificationMethod":{"@id":"sec:verificationMethod","@type":"@id"}}},"Ed25519Signature2018":{"@id":"https://w3id.org/security#Ed25519Signature2018","@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","sec":"https://w3id.org/security#","xsd":"http://www.w3.org/2001/XMLSchema#","challenge":"sec:challenge","created":{"@id":"http://purl.org/dc/terms/created","@type":"xsd:dateTime"},"domain":"sec:domain","expires":{"@id":"sec:expiration","@type":"xsd:dateTime"},"jws":"sec:jws","nonce":"sec:nonce","proofPurpose":{"@id":"sec:proofPurpose","@type":"@vocab","@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","sec":"https://w3id.org/security#","assertionMethod":{"@id":"sec:assertionMethod","@type":"@id","@container":"@set"},"authentication":{"@id":"sec:authenticationMethod","@type":"@id","@container":"@set"}}},"proofValue":"sec:proofValue","verificationMethod":{"@id":"sec:verificationMethod","@type":"@id"}}},"RsaSignature2018":{"@id":"https://w3id.org/security#RsaSignature2018","@context":{"@version":1.1,"@protected":true,"challenge":"sec:challenge","created":{"@id":"http://purl.org/dc/terms/created","@type":"xsd:dateTime"},"domain":"sec:domain","expires":{"@id":"sec:expiration","@type":"xsd:dateTime"},"jws":"sec:jws","nonce":"sec:nonce","proofPurpose":{"@id":"sec:proofPurpose","@type":"@vocab","@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","sec":"https://w3id.org/security#","assertionMethod":{"@id":"sec:assertionMethod","@type":"@id","@container":"@set"},"authentication":{"@id":"sec:authenticationMethod","@type":"@id","@container":"@set"}}},"proofValue":"sec:proofValue","verificationMethod":{"@id":"sec:verificationMethod","@type":"@id"}}},"proof":{"@id":"https://w3id.org/security#proof","@type":"@id","@container":"@graph"}}}`,
    IDEN3_PROOFS_DEFINITION_DOCUMENT: `{"@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","Iden3SparseMerkleTreeProof":{"@id":"https://schema.iden3.io/core/jsonld/iden3proofs.jsonld#Iden3SparseMerkleTreeProof","@context":{"@version":1.1,"@protected":true,"@propagate":true,"id":"@id","type":"@type","sec":"https://w3id.org/security#","@vocab":"https://schema.iden3.io/core/vocab/Iden3SparseMerkleTreeProof.md#","xsd":"http://www.w3.org/2001/XMLSchema#","mtp":{"@id":"https://schema.iden3.io/core/jsonld/iden3proofs.jsonld#SparseMerkleTreeProof","@type":"SparseMerkleTreeProof"},"coreClaim":{"@id":"coreClaim","@type":"xsd:string"},"issuerData":{"@id":"issuerData","@context":{"@version":1.1,"state":{"@id":"state","@context":{"txId":{"@id":"txId","@type":"xsd:string"},"blockTimestamp":{"@id":"blockTimestamp","@type":"xsd:integer"},"blockNumber":{"@id":"blockNumber","@type":"xsd:integer"},"rootOfRoots":{"@id":"rootOfRoots","@type":"xsd:string"},"claimsTreeRoot":{"@id":"claimsTreeRoot","@type":"xsd:string"},"revocationTreeRoot":{"@id":"revocationTreeRoot","@type":"xsd:string"},"authCoreClaim":{"@id":"authCoreClaim","@type":"xsd:string"},"value":{"@id":"value","@type":"xsd:string"}}}}}}},"SparseMerkleTreeProof":{"@id":"https://schema.iden3.io/core/jsonld/iden3proofs.jsonld#SparseMerkleTreeProof","@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","sec":"https://w3id.org/security#","smt-proof-vocab":"https://schema.iden3.io/core/vocab/SparseMerkleTreeProof.md#","xsd":"http://www.w3.org/2001/XMLSchema#","existence":{"@id":"smt-proof-vocab:existence","@type":"xsd:boolean"},"revocationNonce":{"@id":"smt-proof-vocab:revocationNonce","@type":"xsd:number"},"siblings":{"@id":"smt-proof-vocab:siblings","@container":"@list"},"nodeAux":"@nest","hIndex":{"@id":"smt-proof-vocab:hIndex","@nest":"nodeAux","@type":"xsd:string"},"hValue":{"@id":"smt-proof-vocab:hValue","@nest":"nodeAux","@type":"xsd:string"}}},"BJJSignature2021":{"@id":"https://schema.iden3.io/core/jsonld/iden3proofs.jsonld#BJJSignature2021","@context":{"@version":1.1,"@protected":true,"id":"@id","@vocab":"https://schema.iden3.io/core/vocab/BJJSignature2021.md#","@propagate":true,"type":"@type","xsd":"http://www.w3.org/2001/XMLSchema#","coreClaim":{"@id":"coreClaim","@type":"xsd:string"},"issuerData":{"@id":"issuerData","@context":{"@version":1.1,"authCoreClaim":{"@id":"authCoreClaim","@type":"xsd:string"},"mtp":{"@id":"https://schema.iden3.io/core/jsonld/iden3proofs.jsonld#SparseMerkleTreeProof","@type":"SparseMerkleTreeProof"},"revocationStatus":{"@id":"revocationStatus","@type":"@id"},"state":{"@id":"state","@context":{"@version":1.1,"rootOfRoots":{"@id":"rootOfRoots","@type":"xsd:string"},"claimsTreeRoot":{"@id":"claimsTreeRoot","@type":"xsd:string"},"revocationTreeRoot":{"@id":"revocationTreeRoot","@type":"xsd:string"},"value":{"@id":"value","@type":"xsd:string"}}}}},"signature":{"@id":"signature","@type":"https://w3id.org/security#multibase"},"domain":"https://w3id.org/security#domain","creator":{"@id":"creator","@type":"http://www.w3.org/2001/XMLSchema#string"},"challenge":"https://w3id.org/security#challenge","created":{"@id":"created","@type":"http://www.w3.org/2001/XMLSchema#dateTime"},"expires":{"@id":"https://w3id.org/security#expiration","@type":"http://www.w3.org/2001/XMLSchema#dateTime"},"nonce":"https://w3id.org/security#nonce","proofPurpose":{"@id":"https://w3id.org/security#proofPurpose","@type":"@vocab","@context":{"@protected":true,"id":"@id","type":"@type","assertionMethod":{"@id":"https://w3id.org/security#assertionMethod","@type":"@id","@container":"@set"},"authentication":{"@id":"https://w3id.org/security#authenticationMethod","@type":"@id","@container":"@set"},"capabilityInvocation":{"@id":"https://w3id.org/security#capabilityInvocationMethod","@type":"@id","@container":"@set"},"capabilityDelegation":{"@id":"https://w3id.org/security#capabilityDelegationMethod","@type":"@id","@container":"@set"},"keyAgreement":{"@id":"https://w3id.org/security#keyAgreementMethod","@type":"@id","@container":"@set"}}},"proofValue":{"@id":"https://w3id.org/security#proofValue","@type":"https://w3id.org/security#multibase"},"verificationMethod":{"@id":"https://w3id.org/security#verificationMethod","@type":"@id"}}},"Iden3ReverseSparseMerkleTreeProof":{"@id":"https://schema.iden3.io/core/jsonld/iden3proofs.jsonld#Iden3ReverseSparseMerkleTreeProof","@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","iden3-reverse-sparse-merkle-tree-proof-vocab":"https://schema.iden3.io/core/vocab/Iden3ReverseSparseMerkleTreeProof.md#","xsd":"http://www.w3.org/2001/XMLSchema#","revocationNonce":{"@id":"iden3-reverse-sparse-merkle-tree-proof-vocab:revocationNonce","@type":"xsd:integer"},"statusIssuer":{"@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type"},"@id":"iden3-reverse-sparse-merkle-tree-proof-vocab:statusIssuer"}}},"Iden3commRevocationStatusV1.0":{"@id":"https://schema.iden3.io/core/jsonld/iden3proofs.jsonld#Iden3commRevocationStatusV1.0","@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","iden3-comm-revocation-statusV1.0-vocab":"https://schema.iden3.io/core/vocab/Iden3commRevocationStatusV1.0.md#","xsd":"http://www.w3.org/2001/XMLSchema#","revocationNonce":{"@id":"iden3-comm-revocation-statusV1.0-vocab:revocationNonce","@type":"xsd:integer"},"statusIssuer":{"@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type"},"@id":"iden3-comm-revocation-statusV1.0-vocab:statusIssuer"}}},"Iden3OnchainSparseMerkleTreeProof2023":{"@id":"https://schema.iden3.io/core/jsonld/iden3proofs.jsonld#Iden3OnchainSparseMerkleTreeProof2023","@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","iden3-onchain-sparse-merkle-tree-proof-2023-vocab":"https://schema.iden3.io/core/vocab/Iden3OnchainSparseMerkleTreeProof2023.md#","xsd":"http://www.w3.org/2001/XMLSchema#","revocationNonce":{"@id":"iden3-onchain-sparse-merkle-tree-proof-2023-vocab:revocationNonce","@type":"xsd:integer"},"statusIssuer":{"@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type"},"@id":"iden3-onchain-sparse-merkle-tree-proof-2023-vocab:statusIssuer"}}},"JsonSchema2023":"https://www.w3.org/ns/credentials#JsonSchema2023","Iden3RefreshService2023":"https://schema.iden3.io/core/jsonld/iden3proofs.jsonld#Iden3RefreshService2023"}}`,
    IDEN3_DISPLAY_METHOD_DEFINITION_DOCUMENT: `{"@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","displayMethod":{"@id":"https://schema.iden3.io/core/vocab/displayMethod.md#displayMethod","@type":"@id","@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","Iden3BasicDisplayMethodV1":"https://schema.iden3.io/core/vocab/displayMethod.md#Iden3BasicDisplayMethodV1"}}}}`
  },
  // JsonSchema2023 JSON schema for verification of Iden3Credential
  JSON_SCHEMA_VALIDATOR: "JsonSchema2023",
  SERVICE_TYPE: {
    // Iden3CommServiceType is service type for iden3comm protocol
    IDEN3_COMM: "iden3-communication",
    // PushNotificationServiceType is service type for delivering push notifications to identity
    PUSH_NOTIFICATION: "push-notification"
  },
  AUTH: {
    AUTH_BJJ_CREDENTIAL_HASH: "013fd3f623559d850fb5b02ff012d0e2",
    AUTH_BJJ_CREDENTIAL_SCHEMA_JSON_URL: "https://schema.iden3.io/core/json/auth.json",
    AUTH_BJJ_CREDENTIAL_SCHEMA_JSONLD_URL: "https://schema.iden3.io/core/jsonld/auth.jsonld",
    AUTH_BJJ_CREDENTIAL_TYPE: "AuthBJJCredential",
    AUTH_BJJ_CREDENTIAL_SCHEMA_JSON: `{"$schema":"http://json-schema.org/draft-07/schema#","$metadata":{"uris":{"jsonLdContext":"https://schema.iden3.io/core/jsonld/auth.jsonld","jsonSchema":"https://schema.iden3.io/core/json/auth.json"},"serialization":{"indexDataSlotA":"x","indexDataSlotB":"y"}},"type":"object","required":["@context","id","type","issuanceDate","credentialSubject","credentialSchema","credentialStatus","issuer"],"properties":{"@context":{"type":["string","array","object"]},"id":{"type":"string"},"type":{"type":["string","array"],"items":{"type":"string"}},"issuer":{"type":["string","object"],"format":"uri","required":["id"],"properties":{"id":{"type":"string","format":"uri"}}},"issuanceDate":{"type":"string","format":"date-time"},"expirationDate":{"type":"string","format":"date-time"},"credentialSchema":{"type":"object","required":["id","type"],"properties":{"id":{"type":"string","format":"uri"},"type":{"type":"string"}}},"credentialSubject":{"type":"object","required":["x","y"],"properties":{"id":{"title":"Credential Subject ID","type":"string","format":"uri"},"x":{"type":"string"},"y":{"type":"string"}}}}}`,
    AUTH_BJJ_CREDENTIAL_SCHEMA_JSONLD: `{"@context":[{"@version":1.1,"@protected":true,"id":"@id","type":"@type","AuthBJJCredential":{"@id":"https://schema.iden3.io/core/jsonld/auth.jsonld#AuthBJJCredential","@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","iden3_serialization":"iden3:v1:slotIndexA=x&slotIndexB=y","xsd":"http://www.w3.org/2001/XMLSchema#","auth-vocab":"https://schema.iden3.io/core/vocab/auth.md#","x":{"@id":"auth-vocab:x","@type":"xsd:positiveInteger"},"y":{"@id":"auth-vocab:y","@type":"xsd:positiveInteger"}}},"Iden3StateInfo2023":{"@id":"https://schema.iden3.io/core/jsonld/auth.jsonld#Iden3StateInfo2023","@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","xsd":"http://www.w3.org/2001/XMLSchema#","@vocab":"https://schema.iden3.io/core/vocab/state-info.md#","@propagate":true,"stateContractAddress":{"@id":"stateContractAddress","@type":"xsd:string"},"published":{"@id":"published","@type":"xsd:boolean"},"info":{"@id":"info","@type":"@id","@context":{"@protected":true,"id":{"@id":"id","@type":"xsd:string"},"state":{"@id":"state","@type":"xsd:string"},"replacedByState":{"@id":"replacedByState","@type":"xsd:string"},"createdAtTimestamp":{"@id":"createdAtTimestamp","@type":"xsd:string"},"replacedAtTimestamp":{"@id":"replacedAtTimestamp","@type":"xsd:string"},"createdAtBlock":{"@id":"createdAtBlock","@type":"xsd:string"},"replacedAtBlock":{"@id":"replacedAtBlock","@type":"xsd:string"}}},"global":{"@id":"global","@type":"@id","@context":{"@protected":true,"sec":"https://w3id.org/security#","root":{"@id":"root","@type":"xsd:string"},"replacedByRoot":{"@id":"replacedByRoot","@type":"xsd:string"},"createdAtTimestamp":{"@id":"createdAtTimestamp","@type":"xsd:string"},"replacedAtTimestamp":{"@id":"replacedAtTimestamp","@type":"xsd:string"},"createdAtBlock":{"@id":"createdAtBlock","@type":"xsd:string"},"replacedAtBlock":{"@id":"replacedAtBlock","@type":"xsd:string"},"proof":{"@id":"sec:proof","@type":"@id","@container":"@graph"}}}}}}]}`
  }
});
var ProofType = /* @__PURE__ */ ((ProofType2) => {
  ProofType2["BJJSignature"] = "BJJSignature2021";
  ProofType2["Iden3SparseMerkleTreeProof"] = "Iden3SparseMerkleTreeProof";
  return ProofType2;
})(ProofType || {});
var CredentialStatusType = /* @__PURE__ */ ((CredentialStatusType2) => {
  CredentialStatusType2["SparseMerkleTreeProof"] = "SparseMerkleTreeProof";
  CredentialStatusType2["Iden3ReverseSparseMerkleTreeProof"] = "Iden3ReverseSparseMerkleTreeProof";
  CredentialStatusType2["Iden3commRevocationStatusV1"] = "Iden3commRevocationStatusV1.0";
  CredentialStatusType2["Iden3OnchainSparseMerkleTreeProof2023"] = "Iden3OnchainSparseMerkleTreeProof2023";
  return CredentialStatusType2;
})(CredentialStatusType || {});
var ProofPurpose = /* @__PURE__ */ ((ProofPurpose2) => {
  ProofPurpose2["Authentication"] = "Authentication";
  return ProofPurpose2;
})(ProofPurpose || {});
var MerklizedRootPosition = /* @__PURE__ */ ((MerklizedRootPosition4) => {
  MerklizedRootPosition4["Index"] = "index";
  MerklizedRootPosition4["Value"] = "value";
  MerklizedRootPosition4["None"] = "";
  return MerklizedRootPosition4;
})(MerklizedRootPosition || {});
var SubjectPosition = /* @__PURE__ */ ((SubjectPosition2) => {
  SubjectPosition2["None"] = "";
  SubjectPosition2["Index"] = "index";
  SubjectPosition2["Value"] = "value";
  return SubjectPosition2;
})(SubjectPosition || {});
var RefreshServiceType = /* @__PURE__ */ ((RefreshServiceType2) => {
  RefreshServiceType2["Iden3RefreshService2023"] = "Iden3RefreshService2023";
  return RefreshServiceType2;
})(RefreshServiceType || {});
var PaymentRequestDataType = /* @__PURE__ */ ((PaymentRequestDataType2) => {
  PaymentRequestDataType2["Iden3PaymentRequestCryptoV1"] = "Iden3PaymentRequestCryptoV1";
  PaymentRequestDataType2["Iden3PaymentRailsRequestV1"] = "Iden3PaymentRailsRequestV1";
  PaymentRequestDataType2["Iden3PaymentRailsERC20RequestV1"] = "Iden3PaymentRailsERC20RequestV1";
  PaymentRequestDataType2["Iden3PaymentRailsSolanaRequestV1"] = "Iden3PaymentRailsSolanaRequestV1";
  PaymentRequestDataType2["Iden3PaymentRailsSolanaSPLRequestV1"] = "Iden3PaymentRailsSolanaSPLRequestV1";
  return PaymentRequestDataType2;
})(PaymentRequestDataType || {});
var PaymentType = /* @__PURE__ */ ((PaymentType2) => {
  PaymentType2["Iden3PaymentCryptoV1"] = "Iden3PaymentCryptoV1";
  PaymentType2["Iden3PaymentRailsV1"] = "Iden3PaymentRailsV1";
  PaymentType2["Iden3PaymentRailsERC20V1"] = "Iden3PaymentRailsERC20V1";
  PaymentType2["Iden3PaymentRailsSolanaV1"] = "Iden3PaymentRailsSolanaV1";
  PaymentType2["Iden3PaymentRailsSolanaSPLV1"] = "Iden3PaymentRailsSolanaSPLV1";
  return PaymentType2;
})(PaymentType || {});
var SupportedPaymentProofType = /* @__PURE__ */ ((SupportedPaymentProofType2) => {
  SupportedPaymentProofType2["EthereumEip712Signature2021"] = "EthereumEip712Signature2021";
  SupportedPaymentProofType2["SolanaEd25519Signature2025"] = "SolanaEd25519Signature2025";
  return SupportedPaymentProofType2;
})(SupportedPaymentProofType || {});
var SupportedCurrencies = /* @__PURE__ */ ((SupportedCurrencies2) => {
  SupportedCurrencies2["ETH"] = "ETH";
  SupportedCurrencies2["ETH_WEI"] = "ETHWEI";
  SupportedCurrencies2["ETH_GWEI"] = "ETHGWEI";
  SupportedCurrencies2["MATIC"] = "MATIC";
  SupportedCurrencies2["POL"] = "POL";
  return SupportedCurrencies2;
})(SupportedCurrencies || {});
var PaymentFeatures = /* @__PURE__ */ ((PaymentFeatures2) => {
  PaymentFeatures2["EIP_2612"] = "EIP-2612";
  return PaymentFeatures2;
})(PaymentFeatures || {});
var DisplayMethodType = /* @__PURE__ */ ((DisplayMethodType2) => {
  DisplayMethodType2["Iden3BasicDisplayMethodV1"] = "Iden3BasicDisplayMethodV1";
  return DisplayMethodType2;
})(DisplayMethodType || {});
var DEFAULT_CACHE_MAX_SIZE = 1e4;
var SOLANA_CHAIN_REF = Object.freeze({
  DEVNET: "EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
  TESTNET: "4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z",
  MAINNET: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"
});

// src/verifiable/proof.ts
var import_js_crypto3 = require("@iden3/js-crypto");
var import_js_iden3_core2 = require("@iden3/js-iden3-core");
var Iden3SparseMerkleTreeProof = class _Iden3SparseMerkleTreeProof {
  type;
  issuerData;
  mtp;
  coreClaim;
  /**
   * Creates an instance of Iden3SparseMerkleTreeProof.
   * @param {object} obj
   */
  constructor(obj) {
    this.coreClaim = obj.coreClaim;
    this.issuerData = obj.issuerData;
    this.type = "Iden3SparseMerkleTreeProof" /* Iden3SparseMerkleTreeProof */;
    this.mtp = obj.mtp;
  }
  /**
   *
   *
   * @returns `json object in serialized presentation`
   */
  toJSON() {
    const issuerId = this.issuerData.id;
    return {
      issuerData: {
        id: issuerId.string(),
        state: {
          ...this.issuerData.state,
          rootOfRoots: this.issuerData.state.rootOfRoots.hex(),
          claimsTreeRoot: this.issuerData.state.claimsTreeRoot.hex(),
          revocationTreeRoot: this.issuerData.state.revocationTreeRoot.hex(),
          value: this.issuerData.state.value.hex()
        }
      },
      type: this.type,
      coreClaim: this.coreClaim.hex(),
      mtp: this.mtp.toJSON()
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJSON(obj) {
    let mtp;
    if (obj?.mtp?.notEmpties && obj?.mtp?.depth && obj?.mtp?.siblings) {
      const ne = obj?.mtp?.notEmpties;
      const notEmpties = ne instanceof Uint8Array ? ne : new Uint8Array(Object.values(ne));
      const siblingsHashes = obj?.mtp?.siblings.map(
        (h) => import_js_merkletree2.Hash.fromString(JSON.stringify(h))
      );
      const allSiblings = import_js_merkletree2.Proof.buildAllSiblings(obj?.mtp?.depth, notEmpties, siblingsHashes);
      let nodeAux = obj.mtp.nodeAux || obj.mtp.node_aux;
      if (nodeAux) {
        nodeAux = {
          key: import_js_merkletree2.Hash.fromString(JSON.stringify(nodeAux.key)),
          value: import_js_merkletree2.Hash.fromString(JSON.stringify(nodeAux.value))
        };
      }
      mtp = new import_js_merkletree2.Proof({ existence: obj?.mtp.existence, nodeAux, siblings: allSiblings });
    } else {
      mtp = import_js_merkletree2.Proof.fromJSON(obj.mtp);
    }
    return new _Iden3SparseMerkleTreeProof({
      coreClaim: new import_js_iden3_core2.Claim().fromHex(obj.coreClaim),
      mtp,
      issuerData: {
        id: import_js_iden3_core2.DID.parse(obj.issuerData.id),
        state: {
          ...obj.issuerData.state,
          rootOfRoots: import_js_merkletree2.Hash.fromHex(obj.issuerData.state.rootOfRoots),
          claimsTreeRoot: import_js_merkletree2.Hash.fromHex(obj.issuerData.state.claimsTreeRoot),
          revocationTreeRoot: import_js_merkletree2.Hash.fromHex(obj.issuerData.state.revocationTreeRoot),
          value: import_js_merkletree2.Hash.fromHex(obj.issuerData.state.value)
        }
      }
    });
  }
};
var BJJSignatureProof2021 = class _BJJSignatureProof2021 {
  type;
  issuerData;
  signature;
  coreClaim;
  constructor(obj) {
    this.type = "BJJSignature2021" /* BJJSignature */;
    this.issuerData = obj.issuerData;
    this.coreClaim = obj.coreClaim;
    this.signature = obj.signature;
  }
  /**
   * toJSON is a method to serialize BJJSignatureProof2021 to json
   *
   * @returns `json object in serialized presentation`
   */
  toJSON() {
    return {
      issuerData: {
        id: this.issuerData.id.string(),
        state: {
          ...this.issuerData.state,
          rootOfRoots: this.issuerData.state.rootOfRoots.hex(),
          claimsTreeRoot: this.issuerData.state.claimsTreeRoot.hex(),
          revocationTreeRoot: this.issuerData.state.revocationTreeRoot.hex(),
          value: this.issuerData.state.value.hex()
        },
        mtp: this.issuerData.mtp.toJSON(),
        authCoreClaim: this.issuerData.authCoreClaim.hex(),
        credentialStatus: this.issuerData.credentialStatus
      },
      type: this.type,
      coreClaim: this.coreClaim.hex(),
      signature: import_js_crypto3.Hex.encodeString(this.signature.compress())
    };
  }
  /**
   * fromJSON is a method to deserialize BJJSignatureProof2021 from json
   * @param obj
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJSON(obj) {
    return new _BJJSignatureProof2021({
      issuerData: {
        id: import_js_iden3_core2.DID.parse(obj.issuerData.id),
        mtp: import_js_merkletree2.Proof.fromJSON(obj.issuerData.mtp),
        state: {
          ...obj.issuerData.state,
          rootOfRoots: import_js_merkletree2.Hash.fromHex(obj.issuerData.state.rootOfRoots),
          claimsTreeRoot: import_js_merkletree2.Hash.fromHex(obj.issuerData.state.claimsTreeRoot),
          revocationTreeRoot: import_js_merkletree2.Hash.fromHex(obj.issuerData.state.revocationTreeRoot),
          value: import_js_merkletree2.Hash.fromHex(obj.issuerData.state.value)
        },
        credentialStatus: obj.issuerData.credentialStatus,
        authCoreClaim: new import_js_iden3_core2.Claim().fromHex(obj.issuerData.authCoreClaim)
      },
      coreClaim: new import_js_iden3_core2.Claim().fromHex(obj.coreClaim),
      signature: import_js_crypto3.Signature.newFromCompressed(
        Uint8Array.from(import_js_crypto3.Hex.decodeString(obj.signature)).slice(0, 64)
      )
    });
  }
};

// src/verifiable/credential.ts
var import_js_iden3_core5 = require("@iden3/js-iden3-core");
var import_js_merkletree3 = require("@iden3/js-merkletree");
var import_js_jsonld_merklization2 = require("@iden3/js-jsonld-merklization");
var import_js_crypto5 = require("@iden3/js-crypto");

// src/credentials/utils.ts
var import_js_iden3_core3 = require("@iden3/js-iden3-core");
var import_js_crypto4 = require("@iden3/js-crypto");
var getUserDIDFromCredential = (issuerDID, credential) => {
  if (!credential.credentialSubject.id) {
    return issuerDID;
  }
  if (typeof credential.credentialSubject.id !== "string") {
    throw new Error("credential subject `id` is not a string");
  }
  return import_js_iden3_core3.DID.parse(credential.credentialSubject.id);
};
var getKMSIdByAuthCredential = (credential) => {
  if (!credential.type.includes("AuthBJJCredential")) {
    throw new Error("can't sign with not AuthBJJCredential credential");
  }
  const x = credential.credentialSubject["x"];
  const y = credential.credentialSubject["y"];
  const pb = new import_js_crypto4.PublicKey([BigInt(x), BigInt(y)]);
  const kp = keyPath("BJJ" /* BabyJubJub */, pb.hex());
  return { type: "BJJ" /* BabyJubJub */, id: kp };
};

// src/verifiable/core-utils.ts
var import_js_iden3_core4 = require("@iden3/js-iden3-core");
var import_js_jsonld_merklization = require("@iden3/js-jsonld-merklization");
var import_jsonld = __toESM(require("jsonld"), 1);
var import_ethers2 = require("ethers");
var credentialSubjectKey = "credentialSubject";
var contextFullKey = "@context";
var serializationFullKey = "iden3_serialization";
var fieldPrefix = "iden3:v1:";
var credentialSubjectFullKey = "https://www.w3.org/2018/credentials#credentialSubject";
var verifiableCredentialFullKey = "https://www.w3.org/2018/credentials#VerifiableCredential";
var typeFullKey = "@type";
var getFieldSlotIndex = async (field, typeName, schemaBytes) => {
  let ctxDoc = JSON.parse(byteDecoder.decode(schemaBytes));
  ctxDoc = ctxDoc[contextFullKey];
  if (ctxDoc === void 0) {
    throw new Error("document has no @context");
  }
  const ldCtx = await import_jsonld.default.processContext(
    await import_jsonld.default.processContext(null, null, {}),
    ctxDoc,
    {}
  );
  const serAttr = await getSerializationAttrFromParsedContext(
    ldCtx,
    typeName
  );
  if (!serAttr) {
    throw new Error("serialization attribute is not set");
  }
  const sPaths = parseSerializationAttr(serAttr);
  switch (field) {
    case sPaths.indexAPath:
      return 2;
    case sPaths.indexBPath:
      return 3;
    case sPaths.valueAPath:
      return 6;
    case sPaths.valueBPath:
      return 7;
    default:
      throw new Error(`field ${field} not specified in serialization info`);
  }
};
var fillCoreClaimSlot = async (slotData, mz, path) => {
  if (!path) {
    return;
  }
  path = credentialSubjectKey + "." + path;
  try {
    const p = await mz.resolveDocPath(path, mz.options);
    const entry = await mz.entry(p);
    const intVal = await entry.getValueMtEntry();
    const bytesVal = import_js_iden3_core4.BytesHelper.intToBytes(intVal);
    slotData.set(bytesVal, 0);
  } catch (err) {
    if (err.toString().includes("entry not found")) {
      throw new Error(`field not found in credential ${path}`);
    }
    throw err;
  }
};
var getSerializationAttrFromContext = async (context, opts, tp) => {
  const ldCtx = await import_jsonld.default.processContext(
    await import_jsonld.default.processContext(null, null, {}),
    context,
    opts
  );
  return getSerializationAttrFromParsedContext(ldCtx, tp);
};
var getSerializationAttrFromParsedContext = async (ldCtx, tp) => {
  const termDef = ldCtx.mappings;
  if (!termDef) {
    throw new Error("terms definitions is not of correct type");
  }
  const term = termDef.get(tp) ?? [...termDef.values()].find((value) => value["@id"] === tp);
  if (!term) {
    return "";
  }
  const termCtx = term[contextFullKey];
  if (!termCtx) {
    throw new Error("type @context is not of correct type");
  }
  const serStr = termCtx[serializationFullKey] ?? "";
  return serStr;
};
var parseSerializationAttr = (serAttr) => {
  if (!serAttr.startsWith(fieldPrefix)) {
    throw new Error("serialization attribute does not have correct prefix");
  }
  const parts = serAttr.slice(fieldPrefix.length).split("&");
  if (parts.length > 4) {
    throw new Error("serialization attribute has too many parts");
  }
  const paths = {};
  for (const part of parts) {
    const kv = part.split("=");
    if (kv.length !== 2) {
      throw new Error("serialization attribute part does not have correct format");
    }
    switch (kv[0]) {
      case "slotIndexA":
        paths.indexAPath = kv[1];
        break;
      case "slotIndexB":
        paths.indexBPath = kv[1];
        break;
      case "slotValueA":
        paths.valueAPath = kv[1];
        break;
      case "slotValueB":
        paths.valueBPath = kv[1];
        break;
      default:
        throw new Error("unknown serialization attribute slot");
    }
  }
  return paths;
};
var findCredentialType = (mz) => {
  const opts = mz.options;
  try {
    const path1 = new import_js_jsonld_merklization.Path([credentialSubjectFullKey, typeFullKey], opts.hasher);
    const e = mz.rawValue(path1);
    return e;
  } catch (err) {
    const path2 = new import_js_jsonld_merklization.Path([typeFullKey], opts.hasher);
    const topLevelTypes = mz.rawValue(path2);
    if (!Array.isArray(topLevelTypes)) {
      throw new Error("top level @type expected to be an array");
    }
    if (topLevelTypes.length !== 2) {
      throw new Error("top level @type expected to be of length 2");
    }
    switch (verifiableCredentialFullKey) {
      case topLevelTypes[0]:
        return topLevelTypes[1];
      case topLevelTypes[1]:
        return topLevelTypes[0];
      default:
        throw new Error("@type(s) are expected to contain VerifiableCredential type");
    }
  }
};
var parseCoreClaimSlots = async (ldCtx, mz, credentialType) => {
  const slots = {
    indexA: new Uint8Array(32),
    indexB: new Uint8Array(32),
    valueA: new Uint8Array(32),
    valueB: new Uint8Array(32)
  };
  const serAttr = await getSerializationAttrFromParsedContext(ldCtx, credentialType);
  if (!serAttr) {
    return { slots, nonMerklized: false };
  }
  const sPaths = parseSerializationAttr(serAttr);
  const isSPathEmpty = !Object.values(sPaths).some(Boolean);
  if (isSPathEmpty) {
    return { slots, nonMerklized: true };
  }
  await fillCoreClaimSlot(slots.indexA, mz, sPaths.indexAPath);
  await fillCoreClaimSlot(slots.indexB, mz, sPaths.indexBPath);
  await fillCoreClaimSlot(slots.valueA, mz, sPaths.valueAPath);
  await fillCoreClaimSlot(slots.valueB, mz, sPaths.valueBPath);
  return { slots, nonMerklized: true };
};
var calculateCoreSchemaHash = (schemaId) => {
  const sHash = hexToBytes((0, import_ethers2.keccak256)(schemaId));
  return new import_js_iden3_core4.SchemaHash(sHash.slice(sHash.length - 16, sHash.length));
};

// src/verifiable/credential.ts
var import_jsonld2 = __toESM(require("jsonld"), 1);
var W3CCredential = class _W3CCredential {
  id = "";
  "@context" = [];
  type = [];
  expirationDate;
  refreshService;
  displayMethod;
  issuanceDate;
  credentialSubject = {};
  credentialStatus;
  issuer = "";
  credentialSchema;
  proof;
  /**
   *
   * @param issuer - DID of the issuer
   * @param request - Credential request
   * @returns - W3C Credential
   */
  static fromCredentialRequest(issuer, request) {
    if (!request.id) {
      throw new Error("Credential id is required");
    }
    if (!request.context) {
      throw new Error("Credential context is required");
    }
    const context = [
      VerifiableConstants.JSONLD_SCHEMA.W3C_CREDENTIAL_2018,
      VerifiableConstants.JSONLD_SCHEMA.IDEN3_CREDENTIAL,
      ...request.context
    ];
    const credentialType = [
      VerifiableConstants.CREDENTIAL_TYPE.W3C_VERIFIABLE_CREDENTIAL,
      request.type
    ];
    const credentialSubject = request.credentialSubject;
    credentialSubject["type"] = request.type;
    const cr = new _W3CCredential();
    cr.id = request.id;
    cr["@context"] = context;
    cr.type = credentialType;
    cr.credentialSubject = credentialSubject;
    cr.issuer = issuer.string();
    cr.credentialSchema = {
      id: request.credentialSchema,
      type: VerifiableConstants.JSON_SCHEMA_VALIDATOR
    };
    cr.credentialStatus = _W3CCredential.buildCredentialStatus(request, issuer);
    request.expiration && (cr.expirationDate = new Date(request.expiration).toISOString());
    request.refreshService && (cr.refreshService = request.refreshService);
    request.displayMethod && (cr.displayMethod = request.displayMethod);
    request.issuanceDate && (cr.issuanceDate = new Date(request.issuanceDate).toISOString());
    return cr;
  }
  /**
   * Builds credential status
   * @param {CredentialRequest} request
   * @returns `CredentialStatus`
   */
  static buildCredentialStatus(request, issuer) {
    const credentialStatus = {
      id: request.revocationOpts.id,
      type: request.revocationOpts.type,
      revocationNonce: request.revocationOpts.nonce
    };
    switch (request.revocationOpts.type) {
      case "SparseMerkleTreeProof" /* SparseMerkleTreeProof */:
        return {
          ...credentialStatus,
          id: `${credentialStatus.id.replace(/\/$/, "")}/${credentialStatus.revocationNonce}`
        };
      case "Iden3ReverseSparseMerkleTreeProof" /* Iden3ReverseSparseMerkleTreeProof */:
        return {
          ...credentialStatus,
          id: request.revocationOpts.issuerState ? `${credentialStatus.id.replace(/\/$/, "")}/node?state=${request.revocationOpts.issuerState}` : `${credentialStatus.id.replace(/\/$/, "")}`
        };
      case "Iden3OnchainSparseMerkleTreeProof2023" /* Iden3OnchainSparseMerkleTreeProof2023 */: {
        const issuerId = import_js_iden3_core5.DID.idFromDID(issuer);
        const chainId = (0, import_js_iden3_core5.getChainId)(import_js_iden3_core5.DID.blockchainFromId(issuerId), import_js_iden3_core5.DID.networkIdFromId(issuerId));
        const searchParams = [
          ["revocationNonce", request.revocationOpts.nonce?.toString() || ""],
          ["contractAddress", `${chainId}:${request.revocationOpts.id}`],
          ["state", request.revocationOpts.issuerState || ""]
        ].filter(([, value]) => Boolean(value)).map(([key, value]) => `${key}=${value}`).join("&");
        return {
          ...credentialStatus,
          // `[did]:[methodid]:[chain]:[network]:[id]/credentialStatus?(revocationNonce=value)&[contractAddress=[chainID]:[contractAddress]]&(state=issuerState)`
          id: `${issuer.string()}/credentialStatus?${searchParams}`
        };
      }
      default:
        return credentialStatus;
    }
  }
  toJSON() {
    return {
      ...this,
      proof: Array.isArray(this.proof) ? this.proof.map(this.proofToJSON) : this.proofToJSON(this.proof)
    };
  }
  proofToJSON(p) {
    if (!p) {
      return p;
    }
    if (!p["type"]) {
      throw new Error("proof must have type property");
    }
    switch (p.type) {
      case "Iden3SparseMerkleTreeProof" /* Iden3SparseMerkleTreeProof */:
      case "BJJSignature2021" /* BJJSignature */:
        return p.toJSON();
      default:
        return p;
    }
  }
  static proofFromJSON = (p) => {
    if (!p) {
      return p;
    }
    if (!p["type"]) {
      throw new Error("proof must have type property");
    }
    switch (p.type) {
      case "Iden3SparseMerkleTreeProof" /* Iden3SparseMerkleTreeProof */:
        return Iden3SparseMerkleTreeProof.fromJSON(p);
      case "BJJSignature2021" /* BJJSignature */:
        return BJJSignatureProof2021.fromJSON(p);
      default:
        return p;
    }
  };
  static fromJSON(obj) {
    const w = new _W3CCredential();
    Object.assign(w, structuredClone(obj));
    w.proof = Array.isArray(w.proof) ? w.proof.map(_W3CCredential.proofFromJSON) : _W3CCredential.proofFromJSON(w.proof);
    return w;
  }
  /**
   * merklization of the verifiable credential
   *
   * @returns `Promise<Merklizer>`
   */
  async merklize(opts) {
    const credential = { ...this };
    delete credential.proof;
    return await import_js_jsonld_merklization2.Merklizer.merklizeJSONLD(JSON.stringify(credential), opts);
  }
  /**
   * gets core claim representation from credential proof
   *
   * @param {ProofType} proofType
   * @returns {*}  {(Claim | undefined)}
   */
  getCoreClaimFromProof(proofType) {
    if (Array.isArray(this.proof)) {
      for (const proof of this.proof) {
        const { claim, proofType: extractedProofType } = extractProof(proof);
        if (proofType === extractedProofType) {
          return claim;
        }
      }
    } else if (typeof this.proof === "object") {
      const { claim, proofType: extractedProofType } = extractProof(this.proof);
      if (extractedProofType == proofType) {
        return claim;
      }
    }
    return void 0;
  }
  /**
   * gets core claim representation from W3CCredential
   *
   * @param {CoreClaimParsingOptions} [opts] - options to create core claim
   * @returns {*}  {(Promise<Claim>)}
   */
  async toCoreClaim(opts) {
    if (!opts) {
      opts = {
        revNonce: 0,
        version: 0,
        subjectPosition: "index" /* Index */,
        merklizedRootPosition: "" /* None */,
        updatable: false,
        merklizeOpts: {}
      };
    }
    const mz = await this.merklize(opts.merklizeOpts);
    const credentialType = findCredentialType(mz);
    const subjectId = this.credentialSubject["id"];
    const ldCtx = await import_jsonld2.default.processContext(
      await import_jsonld2.default.processContext(null, null, {}),
      this["@context"],
      mz.options
    );
    const { slots, nonMerklized } = await parseCoreClaimSlots(
      ldCtx,
      mz,
      credentialType
    );
    if (nonMerklized && opts.merklizedRootPosition !== "" /* None */) {
      throw new Error("merklized root position is not supported for non-merklized claims");
    }
    if (!nonMerklized && opts.merklizedRootPosition === "" /* None */) {
      opts.merklizedRootPosition = "index" /* Index */;
    }
    const schemaHash = calculateCoreSchemaHash(byteEncoder.encode(credentialType));
    const claim = import_js_iden3_core5.Claim.newClaim(
      schemaHash,
      import_js_iden3_core5.ClaimOptions.withIndexDataBytes(slots.indexA, slots.indexB),
      import_js_iden3_core5.ClaimOptions.withValueDataBytes(slots.valueA, slots.valueB),
      import_js_iden3_core5.ClaimOptions.withRevocationNonce(BigInt(opts.revNonce)),
      import_js_iden3_core5.ClaimOptions.withVersion(opts.version)
    );
    if (opts.updatable) {
      claim.setFlagUpdatable(opts.updatable);
    }
    if (this.expirationDate) {
      claim.setExpirationDate(new Date(this.expirationDate));
    }
    if (subjectId) {
      const did = import_js_iden3_core5.DID.parse(subjectId.toString());
      const id = import_js_iden3_core5.DID.idFromDID(did);
      switch (opts.subjectPosition) {
        case "":
        case "index" /* Index */:
          claim.setIndexId(id);
          break;
        case "value" /* Value */:
          claim.setValueId(id);
          break;
        default:
          throw new Error("unknown subject position");
      }
    }
    switch (opts.merklizedRootPosition) {
      case "index" /* Index */: {
        const mk = await this.merklize(opts.merklizeOpts);
        claim.setIndexMerklizedRoot((await mk.root()).bigInt());
        break;
      }
      case "value" /* Value */: {
        const mk = await this.merklize(opts.merklizeOpts);
        claim.setValueMerklizedRoot((await mk.root()).bigInt());
        break;
      }
      case "" /* None */:
        break;
      default:
        throw new Error("unknown merklized root position");
    }
    return claim;
  }
  /**
   * checks BJJSignatureProof2021 in W3C VC
   *
   * @returns BJJSignatureProof2021 | undefined
   */
  getBJJSignature2021Proof() {
    const proof = this.getProofByType("BJJSignature2021" /* BJJSignature */);
    if (proof) {
      return proof;
    }
    return void 0;
  }
  /**
   * checks Iden3SparseMerkleTreeProof in W3C VC
   *
   * @returns {*}  {(Iden3SparseMerkleTreeProof | undefined)}
   */
  getIden3SparseMerkleTreeProof() {
    const proof = this.getProofByType("Iden3SparseMerkleTreeProof" /* Iden3SparseMerkleTreeProof */);
    if (proof) {
      return proof;
    }
    return void 0;
  }
  /**
   * Verify credential proof
   *
   * @returns {*}  {(boolean)}
   */
  async verifyProof(proofType, resolverURL, opts) {
    const proof = this.getProofByType(proofType);
    if (!proof) {
      throw new Error("proof not found");
    }
    const coreClaim = this.getCoreClaimFromProof(proofType);
    if (!coreClaim) {
      throw new Error(`can't get core claim`);
    }
    await this.verifyCoreClaimMatch(coreClaim, opts?.merklizeOptions);
    switch (proofType) {
      case "BJJSignature2021" /* BJJSignature */: {
        if (!opts?.credStatusResolverRegistry) {
          throw new Error("please provide credential status resolver registry");
        }
        const bjjProof = proof;
        const userDID = getUserDIDFromCredential(bjjProof.issuerData.id, this);
        return this.verifyBJJSignatureProof(
          bjjProof,
          coreClaim,
          resolverURL,
          userDID,
          opts.credStatusResolverRegistry
        );
      }
      case "Iden3SparseMerkleTreeProof" /* Iden3SparseMerkleTreeProof */: {
        return this.verifyIden3SparseMerkleTreeProof(
          proof,
          coreClaim,
          resolverURL
        );
      }
      default: {
        throw new Error("invalid proof type");
      }
    }
  }
  /**
   * Verify credential proofs
   *
   * @returns {*}  {(boolean)}
   */
  async verifyProofs(resolverURL, opts) {
    const proofsValidPromises = [];
    if (Array.isArray(this.proof)) {
      for (const proof of this.proof) {
        proofsValidPromises.push(this.verifyProof(proof["type"], resolverURL, opts));
      }
    } else {
      proofsValidPromises.push(
        this.verifyProof(
          this.proof["type"],
          resolverURL,
          opts
        )
      );
    }
    const proofsValid = await Promise.all(proofsValidPromises);
    return proofsValid.every((v) => v);
  }
  async verifyCoreClaimMatch(coreClaim, merklizeOpts) {
    let merklizedRootPosition = "";
    const merklizedPosition = coreClaim.getMerklizedPosition();
    switch (merklizedPosition) {
      case import_js_iden3_core5.MerklizedRootPosition.None:
        merklizedRootPosition = "" /* None */;
        break;
      case import_js_iden3_core5.MerklizedRootPosition.Index:
        merklizedRootPosition = "index" /* Index */;
        break;
      case import_js_iden3_core5.MerklizedRootPosition.Value:
        merklizedRootPosition = "value" /* Value */;
        break;
    }
    let subjectPosition = "";
    const idPosition = coreClaim.getIdPosition();
    switch (idPosition) {
      case import_js_iden3_core5.IdPosition.None:
        subjectPosition = "" /* None */;
        break;
      case import_js_iden3_core5.IdPosition.Index:
        subjectPosition = "index" /* Index */;
        break;
      case import_js_iden3_core5.IdPosition.Value:
        subjectPosition = "value" /* Value */;
        break;
    }
    const coreClaimOpts = {
      revNonce: Number(coreClaim.getRevocationNonce()),
      version: coreClaim.getVersion(),
      merklizedRootPosition,
      subjectPosition,
      updatable: coreClaim.getFlagUpdatable(),
      merklizeOpts
    };
    const credentialCoreClaim = await this.toCoreClaim(coreClaimOpts);
    if (coreClaim.hex() != credentialCoreClaim.hex()) {
      throw new Error("proof generated for another credential");
    }
  }
  async verifyBJJSignatureProof(proof, coreClaim, resolverURL, userDID, credStatusResolverRegistry) {
    const authClaim = proof.issuerData.authCoreClaim;
    const rawSlotsInt = authClaim.rawSlotsAsInts();
    const pubKey = new import_js_crypto5.PublicKey([rawSlotsInt[2], rawSlotsInt[3]]);
    const { hi, hv } = coreClaim.hiHv();
    const claimHash = import_js_crypto5.poseidon.hash([hi, hv]);
    const bjjValid = pubKey.verifyPoseidon(claimHash, proof.signature);
    if (!bjjValid) {
      throw new Error("signature is not valid");
    }
    await validateDIDDocumentAuth(proof.issuerData.id, resolverURL, proof.issuerData.state.value);
    const credStatusType = proof.issuerData.credentialStatus.type;
    const credStatusResolver = await credStatusResolverRegistry.get(credStatusType);
    if (!credStatusResolver) {
      throw new Error(`please register credential status resolver for ${credStatusType} type`);
    }
    const credStatus = await credStatusResolver.resolve(proof.issuerData.credentialStatus, {
      issuerDID: proof.issuerData.id,
      userDID
    });
    const stateValid = validateTreeState(credStatus.issuer);
    if (!stateValid) {
      throw new Error(
        "signature proof: invalid tree state of the issuer while checking credential status of singing key"
      );
    }
    const revocationNonce = BigInt(proof.issuerData.credentialStatus.revocationNonce || 0);
    if (revocationNonce !== proof.issuerData.authCoreClaim.getRevocationNonce()) {
      throw new Error(
        `revocation nonce mismatch: revocation nonce from core representation of auth credential is not the same as in its credential`
      );
    }
    const proofValid = await (0, import_js_merkletree3.verifyProof)(
      import_js_merkletree3.Hash.fromHex(credStatus.issuer.revocationTreeRoot),
      credStatus.mtp,
      revocationNonce,
      BigInt(0)
    );
    if (!proofValid) {
      throw new Error(`proof validation failed. revNonce=${revocationNonce}`);
    }
    if (credStatus.mtp.existence) {
      throw new Error("signature proof: singing key of the issuer is revoked");
    }
    return true;
  }
  async verifyIden3SparseMerkleTreeProof(proof, coreClaim, resolverURL) {
    await validateDIDDocumentAuth(proof.issuerData.id, resolverURL, proof.issuerData.state.value);
    const { hi, hv } = coreClaim.hiHv();
    const rootFromProofValue = await (0, import_js_merkletree3.rootFromProof)(proof.mtp, hi, hv);
    if (!rootFromProofValue.equals(proof.issuerData.state.claimsTreeRoot)) {
      throw new Error(
        "verifyIden3SparseMerkleTreeProof: root from proof not equal to issuer data claims tree root"
      );
    }
    return true;
  }
  getProofByType(proofType) {
    if (Array.isArray(this.proof)) {
      for (const proof of this.proof) {
        if (proof?.type === proofType) {
          return proof;
        }
      }
    } else if (this.proof?.type == proofType) {
      return this.proof;
    }
    return void 0;
  }
};
function extractProof(proof) {
  if (proof instanceof Iden3SparseMerkleTreeProof) {
    return {
      claim: proof.coreClaim,
      proofType: "Iden3SparseMerkleTreeProof" /* Iden3SparseMerkleTreeProof */
    };
  }
  if (proof instanceof BJJSignatureProof2021) {
    return { claim: proof.coreClaim, proofType: "BJJSignature2021" /* BJJSignature */ };
  }
  if (typeof proof === "object") {
    const p = proof;
    const defaultProofType = p.type;
    if (!defaultProofType) {
      throw new Error("proof type is not specified");
    }
    if (!p.coreClaim) {
      throw new Error(`coreClaim field is not defined in proof type ${defaultProofType}`);
    }
    const coreClaim = p.coreClaim instanceof import_js_iden3_core5.Claim ? p.coreClaim : new import_js_iden3_core5.Claim().fromHex(p.coreClaim);
    return { claim: coreClaim, proofType: defaultProofType };
  }
  throw new Error("proof format is not supported");
}
function validateTreeState(treeState) {
  const ctrHash = treeState.claimsTreeRoot ? import_js_merkletree3.Hash.fromHex(treeState.claimsTreeRoot) : new import_js_merkletree3.Hash();
  const rtrHash = treeState.revocationTreeRoot ? import_js_merkletree3.Hash.fromHex(treeState.revocationTreeRoot) : new import_js_merkletree3.Hash();
  const rorHash = treeState.rootOfRoots ? import_js_merkletree3.Hash.fromHex(treeState.rootOfRoots) : new import_js_merkletree3.Hash();
  const wantState = import_js_crypto5.poseidon.hash([ctrHash.bigInt(), rtrHash.bigInt(), rorHash.bigInt()]);
  const stateHash = treeState.state ? import_js_merkletree3.Hash.fromHex(treeState.state) : new import_js_merkletree3.Hash();
  return wantState === stateHash.bigInt();
}

// src/verifiable/presentation.ts
var import_js_jsonld_merklization3 = require("@iden3/js-jsonld-merklization");
var stringByPath = (obj, path) => {
  const parts = path.split(".");
  let value = obj;
  for (let index = 0; index < parts.length; index++) {
    const key = parts[index];
    if (!key) {
      throw new Error("path is empty");
    }
    value = value[key];
    if (value === void 0) {
      throw new Error("path not found");
    }
  }
  return value.toString();
};
var buildFieldPath = async (ldSchema, contextType, field, opts) => {
  let path = new import_js_jsonld_merklization3.Path();
  if (field) {
    path = await import_js_jsonld_merklization3.Path.getContextPathKey(ldSchema, contextType, field, opts);
  }
  path.prepend([VerifiableConstants.CREDENTIAL_SUBJECT_PATH]);
  return path;
};
var findValue = (fieldName, credential) => {
  const [first, ...rest] = fieldName.split(".");
  let v = credential.credentialSubject[first];
  for (const part of rest) {
    v = v[part];
  }
  return v;
};
var createVerifiablePresentation = (context, tp, credential, queries) => {
  const baseContext = [VerifiableConstants.JSONLD_SCHEMA.W3C_CREDENTIAL_2018];
  const ldContext = baseContext[0] === context ? baseContext : [...baseContext, context];
  const vc = VerifiableConstants.CREDENTIAL_TYPE.W3C_VERIFIABLE_CREDENTIAL;
  const vcTypes = [vc];
  if (tp !== vc) {
    vcTypes.push(tp);
  }
  const skeleton = {
    "@context": baseContext,
    type: VerifiableConstants.CREDENTIAL_TYPE.W3C_VERIFIABLE_PRESENTATION,
    verifiableCredential: {
      "@context": ldContext,
      type: vcTypes,
      credentialSubject: {
        type: tp
      }
    }
  };
  let result = {};
  for (const query of queries) {
    const parts = query.fieldName.split(".");
    const current = parts.reduceRight(
      (acc, part) => {
        if (result[part]) {
          return { [part]: { ...result[part], ...acc } };
        }
        return { [part]: acc };
      },
      findValue(query.fieldName, credential)
    );
    result = { ...result, ...current };
  }
  skeleton.verifiableCredential.credentialSubject = {
    ...skeleton.verifiableCredential.credentialSubject,
    ...result
  };
  return skeleton;
};

// src/verifiable/schema.ts
var DIDDocumentJSONSchema = `{
  "type": "object",
  "$defs": {
    "serviceEndpoint": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "type": {
          "type": "string"
        },
        "serviceEndpoint": {
          "type": "string"
        },
        "metadata": {
          "type": "object"
        }
      },
      "required": [
        "id",
        "type",
        "serviceEndpoint"
      ]
    },
    "jsonWebKey": {
      "type": "object",
      "properties": {
        "alg": {
          "type": "string"
        },
        "crv": {
          "type": "string"
        },
        "e": {
          "type": "string"
        },
        "ext": {
          "type": "boolean"
        },
        "key_ops": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "kid": {
          "type": "string"
        },
        "kty": {
          "type": "string"
        },
        "n": {
          "type": "string"
        },
        "use": {
          "type": "string"
        },
        "x": {
          "type": "string"
        },
        "y": {
          "type": "string"
        }
      },
      "required": [
        "kty"
      ],
      "description": "Public parts of JSON web key"
    },
    "verificationMethod": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "type": {
          "type": "string"
        },
        "controller": {
          "type": "string"
        },
        "publicKeyBase58": {
          "type": "string"
        },
        "publicKeyBase64": {
          "type": "string"
        },
        "publicKeyJwk": {
          "$ref": "#/$defs/jsonWebKey"
        },
        "publicKeyHex": {
          "type": "string"
        },
        "publicKeyMultibase": {
          "type": "string"
        },
        "blockchainAccountId": {
          "type": "string"
        },
        "ethereumAddress": {
          "type": "string"
        }
      },
      "required": [
        "id",
        "type",
        "controller"
      ]
    }
  },
  "properties": {
    "authentication": {
      "type": "array",
      "items": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "$ref": "#/$defs/verificationMethod"
          }
        ]
      }
    },
    "assertionMethod": {
      "type": "array",
      "items": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "$ref": "#/$defs/verificationMethod"
          }
        ]
      }
    },
    "keyAgreement": {
      "type": "array",
      "items": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "$ref": "#/$defs/verificationMethod"
          }
        ]
      }
    },
    "capabilityInvocation": {
      "type": "array",
      "items": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "$ref": "#/$defs/verificationMethod"
          }
        ]
      }
    },
    "capabilityDelegation": {
      "type": "array",
      "items": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "$ref": "#/$defs/verificationMethod"
          }
        ]
      }
    },
    "@context": {
      "anyOf": [
        {
          "type": "string",
          "const": "https://www.w3.org/ns/did/v1"
        },
        {
          "type": "string"
        },
        {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      ]
    },
    "id": {
      "type": "string"
    },
    "alsoKnownAs": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "controller": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      ]
    },
    "verificationMethod": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/verificationMethod"
      }
    },
    "service": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/serviceEndpoint"
      }
    },
    "publicKey": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/verificationMethod"
      },
      "deprecated": true
    }
  },
  "required": [
    "id"
  ]
}`;

// src/utils/payments/solana.ts
var import_js_iden3_core6 = require("@iden3/js-iden3-core");
var import_web3 = require("@solana/web3.js");
var SolanaNativePaymentRequest = class {
  version;
  chainId;
  verifyingContract;
  recipient;
  amount;
  expirationDate;
  nonce;
  metadata;
  constructor(fields) {
    this.version = fields.version;
    this.chainId = fields.chainId;
    this.verifyingContract = fields.verifyingContract;
    this.recipient = fields.recipient;
    this.amount = fields.amount;
    this.expirationDate = fields.expirationDate;
    this.nonce = fields.nonce;
    this.metadata = fields.metadata;
  }
};
var SolanaSplPaymentRequest = class {
  version;
  chainId;
  verifyingContract;
  tokenAddress;
  recipient;
  amount;
  expirationDate;
  nonce;
  metadata;
  constructor(fields) {
    this.version = fields.version;
    this.chainId = fields.chainId;
    this.verifyingContract = fields.verifyingContract;
    this.tokenAddress = fields.tokenAddress;
    this.recipient = fields.recipient;
    this.amount = fields.amount;
    this.expirationDate = fields.expirationDate;
    this.nonce = fields.nonce;
    this.metadata = fields.metadata;
  }
};
var SolanaNativePaymentSchema = /* @__PURE__ */ new Map([
  [
    SolanaNativePaymentRequest,
    {
      kind: "struct",
      fields: [
        ["version", ["u8"]],
        ["chainId", "u64"],
        ["verifyingContract", ["u8", 32]],
        ["recipient", ["u8", 32]],
        ["amount", "u64"],
        ["expirationDate", "u64"],
        ["nonce", "u64"],
        ["metadata", ["u8"]]
      ]
    }
  ]
]);
var SolanaSplPaymentSchema = /* @__PURE__ */ new Map([
  [
    SolanaSplPaymentRequest,
    {
      kind: "struct",
      fields: [
        ["version", ["u8"]],
        ["chainId", "u64"],
        ["verifyingContract", ["u8", 32]],
        ["tokenAddress", ["u8", 32]],
        ["recipient", ["u8", 32]],
        ["amount", "u64"],
        ["expirationDate", "u64"],
        ["nonce", "u64"],
        ["metadata", ["u8"]]
      ]
    }
  ]
]);
var SolanaPaymentInstruction = class {
  recipient;
  amount;
  expiration_date;
  nonce;
  metadata;
  signature;
  constructor(fields) {
    this.recipient = fields.recipient;
    this.amount = fields.amount;
    this.expiration_date = fields.expiration_date;
    this.nonce = fields.nonce;
    this.metadata = fields.metadata;
    this.signature = fields.signature;
  }
};
var SolanaPaymentInstructionSchema = /* @__PURE__ */ new Map([
  [
    SolanaPaymentInstruction,
    {
      kind: "struct",
      fields: [
        ["recipient", ["u8", 32]],
        ["amount", "u64"],
        ["expiration_date", "u64"],
        ["nonce", "u64"],
        ["metadata", ["u8"]],
        ["signature", [64]]
      ]
    }
  ]
]);
var buildSolanaPayment = async (solSigner, option, chainId, paymentRails, recipient, amount, expirationDate, nonce) => {
  let serialized;
  const proofVersion = option.type === "Iden3PaymentRailsSolanaRequestV1" /* Iden3PaymentRailsSolanaRequestV1 */ ? "SolanaEd25519NativeV1" : "SolanaEd25519SPLV1";
  let chainRef = chainId;
  switch (chainId) {
    case "101":
      chainRef = SOLANA_CHAIN_REF.DEVNET;
      break;
    case "102":
      chainRef = SOLANA_CHAIN_REF.TESTNET;
      break;
    case "103":
      chainRef = SOLANA_CHAIN_REF.MAINNET;
      break;
  }
  if (option.type === "Iden3PaymentRailsSolanaRequestV1" /* Iden3PaymentRailsSolanaRequestV1 */) {
    const request = new SolanaNativePaymentRequest({
      version: byteEncoder.encode(proofVersion),
      chainId: BigInt(chainId),
      verifyingContract: new import_web3.PublicKey(paymentRails).toBytes(),
      recipient: new import_web3.PublicKey(recipient).toBytes(),
      amount: BigInt(amount),
      expirationDate: BigInt((0, import_js_iden3_core6.getUnixTimestamp)(expirationDate)),
      nonce,
      metadata: byteEncoder.encode("0x")
    });
    serialized = (0, import_borsh.serialize)(SolanaNativePaymentSchema, request);
  } else {
    if (!option.contractAddress) {
      throw new Error(`failed request. no contract address for ${option.type} payment type`);
    }
    const request = new SolanaSplPaymentRequest({
      version: byteEncoder.encode(proofVersion),
      chainId: BigInt(chainId),
      verifyingContract: new import_web3.PublicKey(paymentRails).toBytes(),
      tokenAddress: new import_web3.PublicKey(option.contractAddress).toBytes(),
      recipient: new import_web3.PublicKey(recipient).toBytes(),
      amount: BigInt(amount),
      expirationDate: BigInt((0, import_js_iden3_core6.getUnixTimestamp)(expirationDate)),
      nonce,
      metadata: byteEncoder.encode("0x")
    });
    serialized = (0, import_borsh.serialize)(SolanaSplPaymentSchema, request);
  }
  const privateKey = solSigner.secretKey.slice(0, 32);
  const signature = await import_ed25519.ed25519.sign(serialized, privateKey);
  const proof = [
    {
      type: "SolanaEd25519Signature2025" /* SolanaEd25519Signature2025 */,
      proofPurpose: "assertionMethod",
      proofValue: bytesToHex(signature),
      created: (/* @__PURE__ */ new Date()).toISOString(),
      verificationMethod: `did:pkh:solana:${chainRef}:${solSigner.publicKey.toBase58()}`,
      domain: {
        version: proofVersion,
        chainId,
        verifyingContract: paymentRails
      }
    }
  ];
  const d = {
    type: "Iden3PaymentRailsSolanaRequestV1" /* Iden3PaymentRailsSolanaRequestV1 */,
    "@context": [
      `https://schema.iden3.io/core/jsonld/payment.jsonld#${option.type}`,
      "https://schema.iden3.io/core/jsonld/solanaEd25519.jsonld"
    ],
    recipient,
    amount: amount.toString(),
    expirationDate: expirationDate.toISOString(),
    nonce: nonce.toString(),
    metadata: "0x",
    proof
  };
  if (option.type === "Iden3PaymentRailsSolanaRequestV1" /* Iden3PaymentRailsSolanaRequestV1 */) {
    return d;
  }
  return {
    ...d,
    type: option.type,
    tokenAddress: option.contractAddress || "",
    features: option.features || []
  };
};
var serializeSolanaPaymentInstruction = (data) => {
  let serialized;
  const proof = Array.isArray(data.proof) ? data.proof[0] : data.proof;
  const proofVersion = data.type === "Iden3PaymentRailsSolanaRequestV1" /* Iden3PaymentRailsSolanaRequestV1 */ ? "SolanaEd25519NativeV1" : "SolanaEd25519SPLV1";
  if (data.type === "Iden3PaymentRailsSolanaRequestV1" /* Iden3PaymentRailsSolanaRequestV1 */) {
    const request = new SolanaNativePaymentRequest({
      version: byteEncoder.encode(proofVersion),
      chainId: BigInt(proof.domain.chainId),
      verifyingContract: new import_web3.PublicKey(proof.domain.verifyingContract).toBytes(),
      recipient: new import_web3.PublicKey(data.recipient).toBytes(),
      amount: BigInt(data.amount),
      expirationDate: BigInt((0, import_js_iden3_core6.getUnixTimestamp)(new Date(data.expirationDate))),
      nonce: BigInt(data.nonce),
      metadata: byteEncoder.encode("0x")
    });
    serialized = (0, import_borsh.serialize)(SolanaNativePaymentSchema, request);
  } else {
    const request = new SolanaSplPaymentRequest({
      version: byteEncoder.encode(proofVersion),
      chainId: BigInt(proof.domain.chainId),
      verifyingContract: new import_web3.PublicKey(proof.domain.verifyingContract).toBytes(),
      tokenAddress: new import_web3.PublicKey(data.tokenAddress).toBytes(),
      recipient: new import_web3.PublicKey(data.recipient).toBytes(),
      amount: BigInt(data.amount),
      expirationDate: BigInt((0, import_js_iden3_core6.getUnixTimestamp)(new Date(data.expirationDate))),
      nonce: BigInt(data.nonce),
      metadata: byteEncoder.encode("0x")
    });
    serialized = (0, import_borsh.serialize)(SolanaSplPaymentSchema, request);
  }
  return serialized;
};
var verifyIden3SolanaPaymentRequest = async (data, resolver) => {
  const proof = Array.isArray(data.proof) ? data.proof[0] : data.proof;
  let serialized;
  if (data.type === "Iden3PaymentRailsSolanaRequestV1" /* Iden3PaymentRailsSolanaRequestV1 */) {
    const request = new SolanaNativePaymentRequest({
      version: byteEncoder.encode(proof.domain.version),
      chainId: BigInt(proof.domain.chainId),
      verifyingContract: new import_web3.PublicKey(proof.domain.verifyingContract).toBytes(),
      recipient: new import_web3.PublicKey(data.recipient).toBytes(),
      amount: BigInt(data.amount),
      expirationDate: BigInt((0, import_js_iden3_core6.getUnixTimestamp)(new Date(data.expirationDate))),
      nonce: BigInt(data.nonce),
      metadata: byteEncoder.encode("0x")
    });
    serialized = (0, import_borsh.serialize)(SolanaNativePaymentSchema, request);
  } else {
    const request = new SolanaSplPaymentRequest({
      version: byteEncoder.encode(proof.domain.version),
      chainId: BigInt(proof.domain.chainId),
      verifyingContract: new import_web3.PublicKey(proof.domain.verifyingContract).toBytes(),
      tokenAddress: new import_web3.PublicKey(data.tokenAddress).toBytes(),
      recipient: new import_web3.PublicKey(data.recipient).toBytes(),
      amount: BigInt(data.amount),
      expirationDate: BigInt((0, import_js_iden3_core6.getUnixTimestamp)(new Date(data.expirationDate))),
      nonce: BigInt(data.nonce),
      metadata: byteEncoder.encode("0x")
    });
    serialized = (0, import_borsh.serialize)(SolanaSplPaymentSchema, request);
  }
  const { didDocument } = await resolver.resolve(proof.verificationMethod);
  let publicKeyMultibase;
  if (didDocument?.verificationMethod) {
    for (const verificationMethod of didDocument.verificationMethod) {
      if (verificationMethod.type === "Ed25519VerificationKey2020") {
        publicKeyMultibase = verificationMethod.publicKeyMultibase;
      }
    }
  }
  if (!publicKeyMultibase) {
    throw new Error("No Ed25519VerificationKey2020 found in DID document");
  }
  return import_ed25519.ed25519.verify(
    hexToBytes(proof.proofValue),
    serialized,
    new import_web3.PublicKey(publicKeyMultibase).toBytes()
  );
};

// src/utils/payments/evm.ts
var import_ethers3 = require("ethers");
var import_js_iden3_core7 = require("@iden3/js-iden3-core");
var buildEvmPayment = async (signer, option, chainId, paymentRails, recipient, amount, expirationDateRequired, nonce) => {
  const typeUrl = `https://schema.iden3.io/core/json/${option.type}.json`;
  const typesFetchResult = await fetch(typeUrl);
  const types = await typesFetchResult.json();
  delete types.EIP712Domain;
  const paymentData = option.type === "Iden3PaymentRailsRequestV1" /* Iden3PaymentRailsRequestV1 */ ? {
    recipient,
    amount,
    expirationDate: (0, import_js_iden3_core7.getUnixTimestamp)(expirationDateRequired),
    nonce,
    metadata: "0x"
  } : {
    tokenAddress: option.contractAddress,
    recipient,
    amount,
    expirationDate: (0, import_js_iden3_core7.getUnixTimestamp)(expirationDateRequired),
    nonce,
    metadata: "0x"
  };
  const domain = {
    name: "MCPayment",
    version: "1.0.0",
    chainId,
    verifyingContract: paymentRails
  };
  const signature = await signer.signTypedData(domain, types, paymentData);
  const proof = [
    {
      type: "EthereumEip712Signature2021" /* EthereumEip712Signature2021 */,
      proofPurpose: "assertionMethod",
      proofValue: signature,
      verificationMethod: `did:pkh:eip155:${chainId}:${await signer.getAddress()}`,
      created: (/* @__PURE__ */ new Date()).toISOString(),
      eip712: {
        types: typeUrl,
        primaryType: "Iden3PaymentRailsRequestV1",
        domain
      }
    }
  ];
  const d = {
    type: "Iden3PaymentRailsRequestV1" /* Iden3PaymentRailsRequestV1 */,
    "@context": [
      `https://schema.iden3.io/core/jsonld/payment.jsonld#${option.type}`,
      "https://w3id.org/security/suites/eip712sig-2021/v1"
    ],
    recipient,
    amount: amount.toString(),
    expirationDate: expirationDateRequired.toISOString(),
    nonce: nonce.toString(),
    metadata: "0x",
    proof
  };
  if (option.type === "Iden3PaymentRailsRequestV1" /* Iden3PaymentRailsRequestV1 */) {
    return d;
  }
  return {
    ...d,
    type: option.type,
    tokenAddress: option.contractAddress || "",
    features: option.features || []
  };
};
async function verifyEIP712TypedData(data, resolver) {
  const paymentData = data.type === "Iden3PaymentRailsRequestV1" /* Iden3PaymentRailsRequestV1 */ ? {
    recipient: data.recipient,
    amount: data.amount,
    expirationDate: (0, import_js_iden3_core7.getUnixTimestamp)(new Date(data.expirationDate)),
    nonce: data.nonce,
    metadata: "0x"
  } : {
    tokenAddress: data.tokenAddress,
    recipient: data.recipient,
    amount: data.amount,
    expirationDate: (0, import_js_iden3_core7.getUnixTimestamp)(new Date(data.expirationDate)),
    nonce: data.nonce,
    metadata: "0x"
  };
  const proof = Array.isArray(data.proof) ? data.proof[0] : data.proof;
  const typesFetchResult = await fetch(proof.eip712.types);
  const types = await typesFetchResult.json();
  delete types.EIP712Domain;
  const recovered = import_ethers3.ethers.verifyTypedData(
    proof.eip712.domain,
    types,
    paymentData,
    proof.proofValue
  );
  const { didDocument } = await resolver.resolve(proof.verificationMethod);
  if (didDocument?.verificationMethod) {
    for (const verificationMethod of didDocument.verificationMethod) {
      if (verificationMethod.blockchainAccountId?.split(":").slice(-1)[0].toLowerCase() === recovered.toLowerCase()) {
        return recovered;
      }
    }
  } else {
    throw new Error("failed request. issuer DIDDocument does not contain any verificationMethods");
  }
  throw new Error(`failed request. no matching verificationMethod`);
}

// src/kms/key-providers/bjj-provider.ts
var BjjProvider = class {
  /**
   * key type that is handled by BJJ Provider
   * @type {KmsKeyType}
   */
  keyType;
  keyStore;
  /**
   * Creates an instance of BjjProvider.
   * @param {KmsKeyType} keyType - kms key type
   * @param {AbstractPrivateKeyStore} keyStore - key store for kms
   */
  constructor(keyType, keyStore) {
    if (keyType !== "BJJ" /* BabyJubJub */) {
      throw new Error("Key type must be BabyJubJub");
    }
    this.keyType = keyType;
    this.keyStore = keyStore;
  }
  /**
   * get private key store
   *
   * @returns private key store
   */
  async getPkStore() {
    return this.keyStore;
  }
  /**
   * get all keys
   * @returns list of keys
   */
  async list() {
    const allKeysFromKeyStore = await this.keyStore.list();
    return allKeysFromKeyStore.filter((key) => key.alias.startsWith(this.keyType));
  }
  /**
   * generates a baby jub jub key from a seed phrase
   * @param {Uint8Array} seed - byte array seed
   * @returns kms key identifier
   */
  async newPrivateKeyFromSeed(seed) {
    const newKey = new Uint8Array(32);
    newKey.set(Uint8Array.from(seed), 0);
    newKey.fill(seed.length, 32, 0);
    const privateKey = new import_js_crypto6.PrivateKey(seed);
    const publicKey = privateKey.public();
    const kmsId = {
      type: this.keyType,
      id: keyPath(this.keyType, publicKey.hex())
    };
    await this.keyStore.importKey({ alias: kmsId.id, key: privateKey.hex() });
    return kmsId;
  }
  async newPrivateKey() {
    const seed = globalThis.crypto.getRandomValues(new Uint8Array(32));
    return this.newPrivateKeyFromSeed(seed);
  }
  /**
   * Gets public key by kmsKeyId
   *
   * @param {KmsKeyId} keyId - key identifier
   */
  async publicKey(keyId) {
    const privateKey = await this.privateKey(keyId);
    return privateKey.public().hex();
  }
  /**
   * signs prepared payload of size,
   * with a key id
   *
   * @param {KmsKeyId} keyId  - key identifier
   * @param {Uint8Array} data - data to sign (32 bytes)
   * @returns Uint8Array signature
   */
  async sign(keyId, data) {
    if (data.length != 32) {
      throw new Error("data to sign is too large");
    }
    const i = import_js_iden3_core8.BytesHelper.bytesToInt(data);
    if (!(0, import_js_iden3_core8.checkBigIntInField)(i)) {
      throw new Error("data to sign is too large");
    }
    const privateKey = await this.privateKey(keyId);
    const signature = privateKey.signPoseidon(i);
    return signature.compress();
  }
  async privateKey(keyId) {
    const privateKeyHex = await this.keyStore.get({ alias: keyId.id });
    return new import_js_crypto6.PrivateKey(import_js_crypto6.Hex.decodeString(privateKeyHex));
  }
  async verify(message, signatureHex, keyId) {
    const publicKey = await this.publicKey(keyId);
    return import_js_crypto6.PublicKey.newFromCompressed(hexToBytes(publicKey)).verifyPoseidon(
      import_js_iden3_core8.BytesHelper.bytesToInt(message),
      import_js_crypto6.Signature.newFromCompressed(hexToBytes(signatureHex))
    );
  }
};

// src/kms/key-providers/ed25519-provider.ts
var import_ed255192 = require("@noble/curves/ed25519.js");
var Ed25519Provider = class {
  /**
   * Creates an instance of Ed25519Provider.
   * @param {KmsKeyType} keyType - kms key type
   * @param {AbstractPrivateKeyStore} keyStore - key store for kms
   */
  constructor(keyType, _keyStore) {
    this.keyType = keyType;
    this._keyStore = _keyStore;
  }
  /**
   * get all keys
   * @returns list of keys
   */
  async list() {
    const allKeysFromKeyStore = await this._keyStore.list();
    return allKeysFromKeyStore.filter((key) => key.alias.startsWith(this.keyType));
  }
  /**
   * get private key store
   *
   * @returns private key store
   */
  async getPkStore() {
    return this._keyStore;
  }
  /**
   * generates a ed25519 key from a seed phrase
   * @param {Uint8Array} seed - byte array seed
   * @returns {Promise<KmsKeyId>} kms key identifier
   */
  async newPrivateKeyFromSeed(seed) {
    if (seed.length !== 32) {
      throw new Error("Seed should be 32 bytes");
    }
    const publicKey = import_ed255192.ed25519.getPublicKey(seed);
    const kmsId = {
      type: this.keyType,
      id: keyPath(this.keyType, bytesToHex(publicKey))
    };
    await this._keyStore.importKey({
      alias: kmsId.id,
      key: bytesToHex(seed)
    });
    return kmsId;
  }
  async newPrivateKey() {
    const seed = globalThis.crypto.getRandomValues(new Uint8Array(32));
    return this.newPrivateKeyFromSeed(seed);
  }
  /**
   * Gets public key by kmsKeyId
   * @param {KmsKeyId} keyId - key identifier
   * @returns {Promise<string>} Public key as a hex string
   */
  async publicKey(keyId) {
    const privateKeyHex = await this.privateKey(keyId);
    const publicKey = import_ed255192.ed25519.getPublicKey(hexToBytes(privateKeyHex));
    return bytesToHex(publicKey);
  }
  /**
   * signs prepared payload of size,
   * with a key id
   * @param {KmsKeyId} keyId  - key identifier
   * @param {Uint8Array} digest - data to sign (32 bytes)
   * @returns {Promise<Uint8Array>} signature
   */
  async sign(keyId, digest) {
    const privateKeyHex = await this.privateKey(keyId);
    return import_ed255192.ed25519.sign(digest, hexToBytes(privateKeyHex));
  }
  /**
   * Verifies a signature for the given message and key identifier.
   * @param digest - The message to verify the signature against.
   * @param signatureHex - The signature to verify, as a hexadecimal string.
   * @param keyId - The key identifier to use for verification.
   * @returns A Promise that resolves to a boolean indicating whether the signature is valid.
   */
  async verify(digest, signatureHex, keyId) {
    const publicKeyHex = await this.publicKey(keyId);
    return import_ed255192.ed25519.verify(hexToBytes(signatureHex), digest, hexToBytes(publicKeyHex));
  }
  /**
   * Retrieves the private key for a given keyId from the key store.
   * @param {KmsKeyId} keyId - The identifier of the key to retrieve.
   * @returns {Promise<string>} The private key associated with the keyId.
   */
  async privateKey(keyId) {
    return this._keyStore.get({ alias: keyId.id });
  }
};

// src/kms/key-providers/secp256k1-provider.ts
var import_secp256k1 = require("@noble/curves/secp256k1.js");
var import_js_crypto7 = require("@iden3/js-crypto");
var import_did_jwt = require("did-jwt");
var Sec256k1Provider = class {
  /**
   * key type that is handled by BJJ Provider
   * @type {KmsKeyType}
   */
  keyType;
  _keyStore;
  /**
   * Creates an instance of BjjProvider.
   * @param {KmsKeyType} keyType - kms key type
   * @param {AbstractPrivateKeyStore} keyStore - key store for kms
   */
  constructor(keyType, keyStore) {
    if (keyType !== "Secp256k1" /* Secp256k1 */) {
      throw new Error("Key type must be Secp256k1");
    }
    this.keyType = keyType;
    this._keyStore = keyStore;
  }
  /**
   * get all keys
   * @returns list of keys
   */
  async list() {
    const allKeysFromKeyStore = await this._keyStore.list();
    return allKeysFromKeyStore.filter((key) => key.alias.startsWith(this.keyType));
  }
  /**
   * generates a baby jub jub key from a seed phrase
   * @param {Uint8Array} seed - byte array seed
   * @returns kms key identifier
   */
  async newPrivateKeyFromSeed(seed) {
    if (seed.length !== 32) {
      throw new Error("Seed should be 32 bytes");
    }
    const publicKey = import_secp256k1.secp256k1.getPublicKey(seed);
    const kmsId = {
      type: this.keyType,
      id: keyPath(this.keyType, bytesToHex(publicKey))
    };
    await this._keyStore.importKey({
      alias: kmsId.id,
      key: bytesToHex(seed).padStart(64, "0")
    });
    return kmsId;
  }
  async newPrivateKey() {
    const seed = globalThis.crypto.getRandomValues(new Uint8Array(32));
    return this.newPrivateKeyFromSeed(seed);
  }
  /**
   * Gets public key by kmsKeyId
   *
   * @param {KmsKeyId} keyId - key identifier
   */
  async publicKey(keyId) {
    const privateKeyHex = await this.privateKey(keyId);
    const publicKey = import_secp256k1.secp256k1.getPublicKey((0, import_did_jwt.hexToBytes)(privateKeyHex), false);
    return bytesToHex(publicKey);
  }
  /**
   * Signs the given data using the private key associated with the specified key identifier.
   * @param keyId - The key identifier to use for signing.
   * @param data - The data to sign.
   * @param opts - Signing options, such as the algorithm to use.
   * @returns A Promise that resolves to the signature as a Uint8Array.
   */
  async sign(keyId, data, opts = { alg: "ES256K" }) {
    const privateKeyHex = await this.privateKey(keyId);
    const signatureBase64 = await (0, import_did_jwt.ES256KSigner)(
      (0, import_did_jwt.hexToBytes)(privateKeyHex),
      opts.alg === "ES256K-R"
    )(data);
    if (typeof signatureBase64 !== "string") {
      throw new Error("signatureBase64 must be a string");
    }
    return base64UrlToBytes(signatureBase64);
  }
  /**
   * get private key store
   *
   * @returns private key store
   */
  async getPkStore() {
    return this._keyStore;
  }
  /**
   * Verifies a signature for the given message and key identifier.
   * @param message - The message to verify the signature against.
   * @param signatureHex - The signature to verify, as a hexadecimal string.
   * @param keyId - The key identifier to use for verification.
   * @returns A Promise that resolves to a boolean indicating whether the signature is valid.
   */
  async verify(message, signatureHex, keyId) {
    const publicKeyHex = await this.publicKey(keyId);
    return import_secp256k1.secp256k1.verify((0, import_did_jwt.hexToBytes)(signatureHex), (0, import_js_crypto7.sha256)(message), (0, import_did_jwt.hexToBytes)(publicKeyHex));
  }
  async privateKey(keyId) {
    return this._keyStore.get({ alias: keyId.id });
  }
};

// src/kms/key-providers/rsa-oaep-key-provider.ts
var import_ethers4 = require("ethers");
var { subtle } = globalThis.crypto;
var defaultParams = {
  name: "RSA-OAEP",
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  // 65537
  hash: "SHA-256"
};
var defaultRSAOaepKmsIdPathGeneratingFunction = (publicKey) => {
  const pathBytes = byteEncoder.encode(publicKey.n + publicKey.e);
  return import_ethers4.ethers.keccak256(pathBytes);
};
var RsaOAEPKeyProvider = class {
  constructor(_keyStore, _params = defaultParams, _kmsIdPathGeneratingFunction = defaultRSAOaepKmsIdPathGeneratingFunction) {
    this._keyStore = _keyStore;
    this._params = _params;
    this._kmsIdPathGeneratingFunction = _kmsIdPathGeneratingFunction;
  }
  _capabilities = ["encrypt", "decrypt", "wrapKey", "unwrapKey"];
  keyType = "RSA-OAEP-256" /* RsaOaep256 */;
  /**
   * get private key store
   *
   * @returns private key store
   */
  async getPkStore() {
    return this._keyStore;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async newPrivateKeyFromSeed(seed) {
    throw new Error("Not implemented for RSA OAEP, use newPrivateKey instead");
  }
  async newPrivateKey() {
    const keyPair = await subtle.generateKey(
      this._params,
      true,
      this._capabilities
    );
    const jwk = await subtle.exportKey("jwk", keyPair.privateKey);
    const publicKey = await this.publicKeyFromPrivateKey(jwk);
    const kmsId = {
      type: this.keyType,
      id: keyPath(this.keyType, this._kmsIdPathGeneratingFunction(publicKey))
    };
    await this._keyStore.importKey({
      alias: kmsId.id,
      key: JSON.stringify(jwk)
    });
    return kmsId;
  }
  async publicKey(keyId) {
    const privateKey = await this._keyStore.get({ alias: keyId.id });
    const privateKeyJwk = JSON.parse(privateKey);
    const publicKey = {
      kty: privateKeyJwk.kty,
      // Key type (RSA)
      n: privateKeyJwk.n,
      // Modulus component
      e: privateKeyJwk.e,
      // Exponent
      alg: "RSA-OAEP-256",
      // Algorithm
      ext: true
    };
    return Promise.resolve(JSON.stringify(publicKey));
  }
  async publicKeyFromPrivateKey(privateKey) {
    const publicKey = {
      kty: privateKey.kty,
      n: privateKey.n,
      e: privateKey.e,
      alg: privateKey.alg,
      ext: true
    };
    return publicKey;
  }
  list() {
    return this._keyStore.list();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sign(keyId, data) {
    throw new Error("Sign is not supported by RSA OAEP");
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async verify(message, signatureHex, keyId) {
    throw new Error("Signature verification is not supported by RSA OAEP");
  }
};

// src/kms/key-providers/p384-provider.ts
var import_nist = require("@noble/curves/nist.js");
var P384Provider = class {
  /**
   * Creates an instance of P384 Provider.
   * @param {AbstractPrivateKeyStore} keyStore - key store for kms
   */
  constructor(_keyStore) {
    this._keyStore = _keyStore;
  }
  keyType = "P-384" /* P384 */;
  /**
   * get all keys
   * @returns list of keys
   */
  async list() {
    const allKeysFromKeyStore = await this._keyStore.list();
    return allKeysFromKeyStore.filter((key) => key.alias.startsWith(this.keyType));
  }
  /**
   * get private key store
   *
   * @returns private key store
   */
  async getPkStore() {
    return this._keyStore;
  }
  /**
   * generates a p384  key from a seed phrase
   * @param {Uint8Array} seed - byte array seed
   * @returns {Promise<KmsKeyId>} kms key identifier
   */
  async newPrivateKeyFromSeed(seed) {
    if (seed.length !== 48) {
      throw new Error("Seed should be 48 bytes");
    }
    const publicKey = import_nist.p384.getPublicKey(seed);
    const kmsId = {
      type: this.keyType,
      id: keyPath(this.keyType, bytesToHex(publicKey))
    };
    await this._keyStore.importKey({
      alias: kmsId.id,
      key: bytesToHex(seed)
    });
    return kmsId;
  }
  async newPrivateKey() {
    const seed = globalThis.crypto.getRandomValues(new Uint8Array(48));
    return this.newPrivateKeyFromSeed(seed);
  }
  /**
   * Gets public key by kmsKeyId
   * @param {KmsKeyId} keyId - key identifier
   * @returns {Promise<string>} Public key as a hex string
   */
  async publicKey(keyId) {
    const privateKeyHex = await this.privateKey(keyId);
    const publicKey = import_nist.p384.getPublicKey(hexToBytes(privateKeyHex));
    return bytesToHex(publicKey);
  }
  /**
   * signs prepared payload of size,
   * with a key id
   * @param {KmsKeyId} keyId  - key identifier
   * @param {Uint8Array} digest - data to sign (32 bytes)
   * @returns {Promise<Uint8Array>} signature
   */
  async sign(keyId, digest) {
    const privateKeyHex = await this.privateKey(keyId);
    return import_nist.p384.sign(digest, hexToBytes(privateKeyHex));
  }
  /**
   * Verifies a signature for the given message and key identifier.
   * @param digest - The message to verify the signature against.
   * @param signatureHex - The signature to verify, as a hexadecimal string.
   * @param keyId - The key identifier to use for verification.
   * @returns A Promise that resolves to a boolean indicating whether the signature is valid.
   */
  async verify(digest, signatureHex, keyId) {
    const publicKeyHex = await this.publicKey(keyId);
    return import_nist.p384.verify(hexToBytes(signatureHex), digest, hexToBytes(publicKeyHex));
  }
  /**
   * Retrieves the private key for a given keyId from the key store.
   * @param {KmsKeyId} keyId - The identifier of the key to retrieve.
   * @returns {Promise<string>} The private key associated with the keyId.
   */
  async privateKey(keyId) {
    return this._keyStore.get({ alias: keyId.id });
  }
};

// src/identity/identity-wallet.ts
var import_js_iden3_core43 = require("@iden3/js-iden3-core");
var import_js_crypto12 = require("@iden3/js-crypto");
var import_js_merkletree29 = require("@iden3/js-merkletree");

// src/identity/common.ts
var import_js_iden3_core9 = require("@iden3/js-iden3-core");
var subjectPositionIndex = (idPosition) => {
  switch (idPosition) {
    case import_js_iden3_core9.IdPosition.Index:
      return "index" /* Index */;
    case import_js_iden3_core9.IdPosition.Value:
      return "value" /* Value */;
    default:
      return "" /* None */;
  }
};
var defineMerklizedRootPosition = (metadata, position) => {
  if (!metadata?.serialization) {
    return import_js_iden3_core9.MerklizedRootPosition.None;
  }
  if (position != null && position !== import_js_iden3_core9.MerklizedRootPosition.None) {
    return position;
  }
  return import_js_iden3_core9.MerklizedRootPosition.Index;
};
var generateProfileDID = (did, profileNonce) => {
  const id = import_js_iden3_core9.DID.idFromDID(did);
  profileNonce = profileNonce ?? 0;
  if (!isBigInt(profileNonce)) {
    throw new Error("profile must be number or decimal string");
  }
  const profile = import_js_iden3_core9.Id.profileId(id, BigInt(profileNonce));
  return import_js_iden3_core9.DID.parseFromId(profile);
};
var isBigInt = (x) => {
  try {
    return BigInt(x).toString() === x.toString();
  } catch {
    return false;
  }
};

// src/identity/identity-wallet.ts
var uuid14 = __toESM(require("uuid"), 1);

// src/schema-processor/utils.ts
var import_js_iden3_core10 = require("@iden3/js-iden3-core");
var swapEndianness = (buf) => buf.reverse();
function fieldToByteArray(field) {
  let bigIntField;
  if (typeof field === "string") {
    bigIntField = BigInt(field);
  } else if (typeof field === "number") {
    bigIntField = BigInt(Math.trunc(field));
  } else {
    throw new Error("field type is not supported");
  }
  return import_js_iden3_core10.BytesHelper.intToBytes(bigIntField);
}
function dataFillsSlot(slot, newData) {
  return (0, import_js_iden3_core10.checkBigIntInField)(import_js_iden3_core10.BytesHelper.bytesToInt(Uint8Array.from([...slot, ...newData])));
}
function checkDataInField(data) {
  return (0, import_js_iden3_core10.checkBigIntInField)(import_js_iden3_core10.BytesHelper.bytesToInt(data));
}
var createSchemaHash = (schemaId) => {
  return calculateCoreSchemaHash(schemaId);
};
var fillSlot = async (slotData, mz, path) => {
  return fillCoreClaimSlot(slotData, mz, path);
};
var credentialSubjectKey2 = "credentialSubject";

// src/schema-processor/json/parser.ts
var import_jsonld3 = __toESM(require("jsonld"), 1);
var Parser = class {
  /**
   *  @deprecated The method should not be used. Use credential.toCoreClaim instead.
   *  ParseClaim creates core.Claim object from W3CCredential
   *
   * @param {W3CCredential} credential - Verifiable Credential
   * @param {CoreClaimOptions} [opts] - options to parse core claim
   * @returns `Promise<CoreClaim>`
   */
  static async parseClaim(credential, opts) {
    return credential.toCoreClaim(opts);
  }
  /**
   * @deprecated The method should not be used. Use findCredentialType from verifiable.
   */
  static findCredentialType(mz) {
    return findCredentialType(mz);
  }
  /**
   *  @deprecated The method should not be used. Use credential.getSerializationAttr instead.
   *
   *  Get `iden3_serialization` attr definition from context document either using
   *  type name like DeliverAddressMultiTestForked or by type id like
   *  urn:uuid:ac2ede19-b3b9-454d-b1a9-a7b3d5763100.
   *  */
  static async getSerializationAttr(credential, opts, tp) {
    const ldCtx = await import_jsonld3.default.processContext(
      await import_jsonld3.default.processContext(null, null, {}),
      credential["@context"],
      opts
    );
    return getSerializationAttrFromParsedContext(
      ldCtx,
      tp
    );
  }
  /**
   * @deprecated The method should not be used. Use getSerializationAttrFromContext from verifiable.
   *
   *  Get `iden3_serialization` attr definition from context document either using
   *  type name like DeliverAddressMultiTestForked or by type id like
   *  urn:uuid:ac2ede19-b3b9-454d-b1a9-a7b3d5763100.
   *
   */
  static async getSerializationAttrFromContext(context, opts, tp) {
    return getSerializationAttrFromContext(context, opts, tp);
  }
  /**
   * @deprecated The method should not be used. Use getSerializationAttrFromParsedContext from verifiable.
   *
   * */
  static async getSerializationAttrFromParsedContext(ldCtx, tp) {
    return getSerializationAttrFromParsedContext(ldCtx, tp);
  }
  /**
   * @deprecated The method should not be used. Use parseSerializationAttr from verifiable.
   *
   */
  static parseSerializationAttr(serAttr) {
    return parseSerializationAttr(serAttr);
  }
  /**
   *
   * @deprecated The method should not be used. Use credential.parseSlots instead.
   * ParseSlots converts payload to claim slots using provided schema
   *
   * @param {Merklizer} mz - Merklizer
   * @param {W3CCredential} credential - Verifiable Credential
   * @param {string} credentialType - credential type
   * @returns `ParsedSlots`
   */
  static async parseSlots(mz, credential, credentialType) {
    const ldCtx = await import_jsonld3.default.processContext(
      await import_jsonld3.default.processContext(null, null, {}),
      credential["@context"],
      mz.options
    );
    return parseCoreClaimSlots(
      ldCtx,
      mz,
      credentialType
    );
  }
  /**
   * @deprecated The method should not be used. Use getFieldSlotIndex from verifiable.
   *
   * GetFieldSlotIndex return index of slot from 0 to 7 (each claim has by default 8 slots) for non-merklized claims
   *
   * @param {string} field - field name
   * @param {Uint8Array} schemaBytes -json schema bytes
   * @returns `number`
   */
  static async getFieldSlotIndex(field, typeName, schemaBytes) {
    return getFieldSlotIndex(field, typeName, schemaBytes);
  }
  /**
   * ExtractCredentialSubjectProperties return credential subject types from JSON schema
   *
   * @param {string | JSON} schema - JSON schema
   * @returns `Promise<Array<string>>`
   */
  static async extractCredentialSubjectProperties(schema) {
    const parsedSchema = typeof schema === "string" ? JSON.parse(schema) : schema;
    const props = parsedSchema.properties?.credentialSubject?.properties;
    if (!props) {
      throw new Error("properties.credentialSubject.properties is not set");
    }
    delete props["id"];
    return Object.keys(props);
  }
  // /**
  //  * GetLdPrefixesByJSONSchema return possible credential types for JSON schema
  //  *
  //  * @param {string} schema  - JSON schema
  //  * @returns `Promise<Map<string, string>>`
  //  */
  // public static async getLdPrefixesByJSONSchema(schema: string): Promise<Map<string, string>> {
  //   const metadata = Parser.extractMetadata(schema);
  //   const ldURL = metadata.uris['jsonLdContext'];
  //   if (!ldURL) {
  //     throw new Error('jsonLdContext is not set');
  //   }
  //   const props = await Parser.extractCredentialSubjectProperties(schema);
  //   let jsonLdContext;
  //   try {
  //     const response = await fetch(ldURL);
  //     jsonLdContext = await response.json();
  //   } catch (e) {
  //     throw new Error(`failed to fetch jsonLdContext ${e}`);
  //   }
  //   let prefixes;
  //   try {
  //     prefixes = await LDParser.getPrefixes(jsonLdContext, false, props);
  //   } catch (e) {
  //     throw new Error(`failed to extract terms from jsonLdContext ${e}`);
  //   }
  //   return prefixes;
  // }
};

// src/schema-processor/json/validator.ts
var import_ajv = __toESM(require("ajv"), 1);
var import__ = __toESM(require("ajv/dist/2020.js"), 1);
var import__2 = __toESM(require("ajv/dist/2019.js"), 1);
var import_ajv_formats = __toESM(require("ajv-formats"), 1);
var defaultOpts = { verbose: true, strict: false };
var defaultJSONSchemaValidator = new import_ajv.default(defaultOpts);
var JSON_SCHEMA_VALIDATORS_REGISTRY = {
  "http://json-schema.org/draft-07/schema": defaultJSONSchemaValidator,
  "https://json-schema.org/draft/2019-09/schema": new import__2.default(defaultOpts),
  "https://json-schema.org/draft/2020-12/schema": new import__.default(defaultOpts)
};
var JsonSchemaValidator = class {
  /**
   * Validate data according to the given schema
   *
   * @param {Uint8Array} dataBytes - payload to validate
   * @param {Uint8Array} schemaBytes - schema to process
   * @returns `Promise<boolean>`
   */
  async validate(dataBytes, schemaBytes) {
    const schema = JSON.parse(byteDecoder.decode(schemaBytes));
    const data = JSON.parse(byteDecoder.decode(dataBytes));
    const draft = schema["$schema"]?.replaceAll("#", "");
    let validator;
    if (!draft) {
      validator = defaultJSONSchemaValidator;
    }
    const ajv = JSON_SCHEMA_VALIDATORS_REGISTRY[draft];
    validator = ajv ?? defaultJSONSchemaValidator;
    if (validator.formats && !Object.keys(validator.formats).length) {
      (0, import_ajv_formats.default)(validator);
      addCustomFormats(validator);
    }
    const validate = (schema.$id ? validator.getSchema(schema.$id) : void 0) || validator.compile(schema);
    const valid = validate(data);
    if (!valid) {
      throw new Error(validate.errors?.map((e) => e.message).join(", "));
    }
    return true;
  }
};
function addCustomFormats(validator) {
  validator.addFormat("positive-integer", {
    type: "string",
    validate: (positiveIntegerStr) => /^[1-9]\d*$/.test(positiveIntegerStr)
  });
  validator.addFormat("non-negative-integer", {
    type: "string",
    validate: (nonNegativeIntegerStr) => /^(0|[1-9]\d*)$/.test(nonNegativeIntegerStr)
  });
}

// src/schema-processor/jsonld/parser.ts
var import_jsonld4 = __toESM(require("jsonld"), 1);
var LDParser = class {
  /**
   * ExtractTerms returns the terms definitions from the JSON-LD context
   *
   * @param {string} context - JSONLD context
   * @returns Promise<Map<string, string>>
   */
  static async extractTerms(context) {
    let data;
    let res;
    try {
      data = typeof context === "string" ? JSON.parse(context) : context;
      res = await import_jsonld4.default.processContext(await import_jsonld4.default.processContext(null, null, {}), data, {});
    } catch (e) {
      throw new Error(`Failed process LD context. Error ${e}`);
    }
    const terms = res.mappings;
    return terms;
  }
  /**
   * GetPrefixes returns a map of potential RDF prefixes based on the JSON-LD Term Definitions
   * in this context. No guarantees of the prefixes are given, beyond that it will not contain ":".
   *
   * onlyCommonPrefixes: If true, the result will not include "not so useful" prefixes, such as
   * "term1": "http://example.com/term1", e.g. all IRIs will end with "/" or "#".
   * If false, all potential prefixes are returned.
   * @param {string | JSON} context - JSONLD context
   * @param {boolean} onlyCommonPrefixes - only common prefixes
   * @param {Array<string>} properties - available properties in type definition
   * @returns Promise<<Map<string, string>>
   */
  static async getPrefixes(context, onlyCommonPrefixes, properties) {
    const prefixes = /* @__PURE__ */ new Map();
    const data = await this.extractTerms(context);
    for (const [term, termDefinition] of data) {
      if (term.includes(":")) {
        continue;
      }
      if (!termDefinition) {
        continue;
      }
      const termDefinitionMap = termDefinition;
      const id = termDefinitionMap["@id"];
      if (!id) {
        continue;
      }
      if (term.startsWith("@") || id.startsWith("@")) {
        continue;
      }
      if (!onlyCommonPrefixes || id.endsWith("/") || id.endsWith("#")) {
        prefixes.set(term, id);
      }
      if (properties) {
        const c = termDefinitionMap["@context"];
        if (!c) {
          prefixes.delete(term);
          continue;
        }
        if (!this.isKeysInMap(properties, c)) {
          prefixes.delete(term);
          continue;
        }
      }
    }
    return prefixes;
  }
  static isKeysInMap(keys, rec) {
    for (const key of keys) {
      if (!rec[key]) {
        return false;
      }
    }
    return true;
  }
};

// src/schema-processor/jsonld/cache.ts
var import_js_jsonld_merklization4 = require("@iden3/js-jsonld-merklization");
var doc = JSON.parse(VerifiableConstants.JSONLD_SCHEMA.W3C_VC_DOCUMENT_2018);
var docIden3Proofs = JSON.parse(
  VerifiableConstants.JSONLD_SCHEMA.IDEN3_PROOFS_DEFINITION_DOCUMENT
);
var docIden3DisplayMethod = JSON.parse(
  VerifiableConstants.JSONLD_SCHEMA.IDEN3_DISPLAY_METHOD_DEFINITION_DOCUMENT
);
var docIden3AuthBJJ = JSON.parse(VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_SCHEMA_JSONLD);
var cacheLoader = (opts) => {
  const cache = /* @__PURE__ */ new Map();
  cache.set(VerifiableConstants.JSONLD_SCHEMA.W3C_CREDENTIAL_2018, {
    document: doc,
    documentUrl: VerifiableConstants.JSONLD_SCHEMA.W3C_CREDENTIAL_2018
  });
  cache.set(VerifiableConstants.JSONLD_SCHEMA.IDEN3_CREDENTIAL, {
    document: docIden3Proofs,
    documentUrl: VerifiableConstants.JSONLD_SCHEMA.IDEN3_PROOFS_DEFINITION_DOCUMENT
  });
  cache.set(VerifiableConstants.JSONLD_SCHEMA.IDEN3_DISPLAY_METHOD, {
    document: docIden3DisplayMethod,
    documentUrl: VerifiableConstants.JSONLD_SCHEMA.IDEN3_DISPLAY_METHOD_DEFINITION_DOCUMENT
  });
  cache.set(VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_SCHEMA_JSONLD_URL, {
    document: docIden3AuthBJJ,
    documentUrl: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_SCHEMA_JSONLD
  });
  return async (url) => {
    let remoteDoc = cache.get(url);
    if (remoteDoc) {
      return remoteDoc;
    }
    remoteDoc = await (0, import_js_jsonld_merklization4.getDocumentLoader)(opts)(url);
    cache.set(url, remoteDoc);
    return remoteDoc;
  };
};

// src/storage/interfaces/circuits.ts
var CircuitLoadMode = /* @__PURE__ */ ((CircuitLoadMode2) => {
  CircuitLoadMode2["Proving"] = "proving";
  CircuitLoadMode2["Verification"] = "verification";
  CircuitLoadMode2["Full"] = "full";
  return CircuitLoadMode2;
})(CircuitLoadMode || {});

// src/storage/blockchain/state.ts
var import_ethers9 = require("ethers");

// src/circuits/common.ts
var import_js_crypto8 = require("@iden3/js-crypto");
var import_js_merkletree4 = require("@iden3/js-merkletree");
var defaultMTLevels = 40;
var defaultValueArraySize = 64;
var defaultMTLevelsOnChain = 64;
var defaultMTLevelsClaim = 32;
var ErrorEmptyAuthClaimProof = "empty auth claim mtp proof";
var ErrorEmptyAuthClaimNonRevProof = "empty auth claim non-revocation mtp proof";
var ErrorEmptyChallengeSignature = "empty challenge signature";
var ErrorEmptyClaimSignature = "empty claim signature";
var ErrorEmptyClaimProof = "empty claim mtp proof";
var ErrorEmptyClaimNonRevProof = "empty claim non-revocation mtp proof";
var ErrorUserStateInRelayClaimProof = "empty user state in relay claim non-revocation mtp proof";
var ErrorEmptyIssuerAuthClaimProof = "empty issuer auth claim mtp proof";
var ErrorEmptyIssuerAuthClaimNonRevProof = "empty issuer auth claim non-revocation mtp proof";
var BaseConfig = class {
  mtLevel;
  // Max levels of MT
  maxValueArraySize;
  // Size if( value array in identity circuit)s
  mtLevelOnChain;
  mtLevelClaim;
  // Max level of JSONLD claim
  /**
   *  getMTLevel max circuit MT levels
   *
   * @returns number
   */
  getMTLevel() {
    return this.mtLevel ? this.mtLevel : defaultMTLevels;
  }
  /**
   *  GetMTLevelsClaim max jsonld Claim levels
   *
   * @returns number
   */
  getMTLevelsClaim() {
    return this.mtLevelClaim ? this.mtLevelClaim : defaultMTLevelsClaim;
  }
  /**
   * GetValueArrSize return size of circuits value array size
   *
   * @returns number
   */
  getValueArrSize() {
    return this.maxValueArraySize ? this.maxValueArraySize : defaultValueArraySize;
  }
  /**
   * getMTLevelOnChain return level on chain for given circuit
   *
   * @returns number
   */
  getMTLevelOnChain() {
    return this.mtLevelOnChain ? this.mtLevelOnChain : defaultMTLevelsOnChain;
  }
  setMTLevel(mtLevel) {
    this.mtLevel = mtLevel;
  }
  setMTLevelOnChain(mtLevelOnChain) {
    this.mtLevelOnChain = mtLevelOnChain;
  }
  setMTLevelClaim(mtLevelClaim) {
    this.mtLevelClaim = mtLevelClaim;
  }
  setMaxValueArraySize(maxValueArraySize) {
    this.maxValueArraySize = maxValueArraySize;
  }
};
var strMTHex = (s) => {
  if (!s) {
    return import_js_merkletree4.ZERO_HASH;
  }
  const h = new import_js_merkletree4.Hash();
  h.value = (0, import_js_merkletree4.swapEndianness)(import_js_crypto8.Hex.decodeString(s));
  return h;
};
var buildTreeState = (state, claimsTreeRoot, revocationTreeRoot, rootOfRoots) => ({
  state: import_js_merkletree4.Hash.fromHex(state),
  claimsRoot: import_js_merkletree4.Hash.fromHex(claimsTreeRoot),
  revocationRoot: import_js_merkletree4.Hash.fromHex(revocationTreeRoot),
  rootOfRoots: import_js_merkletree4.Hash.fromHex(rootOfRoots)
});
var prepareSiblingsStr = (proof, levels) => {
  const siblings = proof.allSiblings();
  for (let i = siblings.length; i < levels; i++) {
    siblings.push(import_js_merkletree4.ZERO_HASH);
  }
  return siblings.map((s) => s.bigInt().toString());
};
var prepareCircuitArrayValues = (arr, size) => {
  if (!arr) {
    arr = [];
  }
  if (arr.length > size) {
    throw new Error(`array size ${arr.length} is bigger max expected size ${size}`);
  }
  for (let i = arr.length; i < size; i++) {
    arr.push(BigInt(0));
  }
  return arr;
};
var bigIntArrayToStringArray = (arr) => {
  return arr.map((a) => a.toString());
};
var getNodeAuxValue = (p) => {
  if (p?.existence) {
    return {
      key: import_js_merkletree4.ZERO_HASH,
      value: import_js_merkletree4.ZERO_HASH,
      noAux: "0"
    };
  }
  if (p?.nodeAux?.value !== void 0 && p?.nodeAux?.key !== void 0) {
    return {
      key: p.nodeAux.key,
      value: p.nodeAux.value,
      noAux: "0"
    };
  }
  return {
    key: import_js_merkletree4.ZERO_HASH,
    value: import_js_merkletree4.ZERO_HASH,
    noAux: "1"
  };
};
var existenceToInt = (b) => b ? 0 : 1;
function getProperties(obj) {
  const result = {};
  for (const property in obj) {
    if (obj.hasOwnProperty(property) && !property.startsWith("_")) {
      result[property] = obj[property];
    }
  }
  return result;
}

// src/circuits/models.ts
var import_js_merkletree5 = require("@iden3/js-merkletree");

// src/circuits/comparer.ts
var XSDNS = /* @__PURE__ */ ((XSDNS2) => {
  XSDNS2["Boolean"] = "http://www.w3.org/2001/XMLSchema#boolean";
  XSDNS2["Integer"] = "http://www.w3.org/2001/XMLSchema#integer";
  XSDNS2["NonNegativeInteger"] = "http://www.w3.org/2001/XMLSchema#nonNegativeInteger";
  XSDNS2["NonPositiveInteger"] = "http://www.w3.org/2001/XMLSchema#nonPositiveInteger";
  XSDNS2["NegativeInteger"] = "http://www.w3.org/2001/XMLSchema#negativeInteger";
  XSDNS2["PositiveInteger"] = "http://www.w3.org/2001/XMLSchema#positiveInteger";
  XSDNS2["DateTime"] = "http://www.w3.org/2001/XMLSchema#dateTime";
  XSDNS2["Double"] = "http://www.w3.org/2001/XMLSchema#double";
  XSDNS2["String"] = "http://www.w3.org/2001/XMLSchema#string";
  return XSDNS2;
})(XSDNS || {});
var Operators = /* @__PURE__ */ ((Operators2) => {
  Operators2[Operators2["NOOP"] = 0] = "NOOP";
  Operators2[Operators2["EQ"] = 1] = "EQ";
  Operators2[Operators2["LT"] = 2] = "LT";
  Operators2[Operators2["GT"] = 3] = "GT";
  Operators2[Operators2["IN"] = 4] = "IN";
  Operators2[Operators2["NIN"] = 5] = "NIN";
  Operators2[Operators2["NE"] = 6] = "NE";
  Operators2[Operators2["LTE"] = 7] = "LTE";
  Operators2[Operators2["GTE"] = 8] = "GTE";
  Operators2[Operators2["BETWEEN"] = 9] = "BETWEEN";
  Operators2[Operators2["NONBETWEEN"] = 10] = "NONBETWEEN";
  Operators2[Operators2["EXISTS"] = 11] = "EXISTS";
  Operators2[Operators2["SD"] = 16] = "SD";
  Operators2[Operators2["NULLIFY"] = 17] = "NULLIFY";
  return Operators2;
})(Operators || {});
var QueryOperators = {
  $noop: 0 /* NOOP */,
  $eq: 1 /* EQ */,
  $lt: 2 /* LT */,
  $gt: 3 /* GT */,
  $in: 4 /* IN */,
  $nin: 5 /* NIN */,
  $ne: 6 /* NE */,
  $lte: 7 /* LTE */,
  $gte: 8 /* GTE */,
  $between: 9 /* BETWEEN */,
  $nonbetween: 10 /* NONBETWEEN */,
  $exists: 11 /* EXISTS */,
  $sd: 16 /* SD */,
  $nullify: 17 /* NULLIFY */
};
var getOperatorNameByValue = (operator) => {
  const ops = Object.entries(QueryOperators).find(([, queryOp]) => queryOp === operator);
  return ops ? ops[0] : "unknown";
};
var allOperations = Object.values(QueryOperators);
var availableTypesOperators = /* @__PURE__ */ new Map([
  [
    "http://www.w3.org/2001/XMLSchema#boolean" /* Boolean */,
    [QueryOperators.$eq, QueryOperators.$ne, QueryOperators.$sd, QueryOperators.$exists]
  ],
  ["http://www.w3.org/2001/XMLSchema#integer" /* Integer */, allOperations],
  ["http://www.w3.org/2001/XMLSchema#nonNegativeInteger" /* NonNegativeInteger */, allOperations],
  ["http://www.w3.org/2001/XMLSchema#positiveInteger" /* PositiveInteger */, allOperations],
  [
    "http://www.w3.org/2001/XMLSchema#double" /* Double */,
    [
      QueryOperators.$eq,
      QueryOperators.$ne,
      QueryOperators.$in,
      QueryOperators.$nin,
      QueryOperators.$sd,
      QueryOperators.$exists
    ]
  ],
  [
    "http://www.w3.org/2001/XMLSchema#string" /* String */,
    [
      QueryOperators.$eq,
      QueryOperators.$ne,
      QueryOperators.$in,
      QueryOperators.$nin,
      QueryOperators.$sd,
      QueryOperators.$exists
    ]
  ],
  ["http://www.w3.org/2001/XMLSchema#dateTime" /* DateTime */, allOperations]
]);
var isValidOperation = (datatype, op) => {
  if (op === 0 /* NOOP */) {
    return true;
  }
  if (!availableTypesOperators.has(datatype)) {
    return false;
  }
  const ops = availableTypesOperators.get(datatype);
  if (!ops) {
    return false;
  }
  return ops.includes(op);
};
var Scalar = class {
  /**
   * Creates an instance of Scalar.
   * @param {bigint} x - val x
   * @param {bigint} y - val y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  /**
   * compares two  scalar values
   *
   * @param {Operators} operator - EQ / LT / GT
   * @returns boolean
   */
  compare(operator) {
    switch (operator) {
      case 1 /* EQ */:
        return this.x === this.y;
      case 2 /* LT */:
        return this.x < this.y;
      case 3 /* GT */:
        return this.x > this.y;
      case 6 /* NE */:
        return this.x !== this.y;
      default:
        throw new Error("unknown compare type for scalar");
    }
  }
};
var Vector = class {
  /**
   * Creates an instance of Vector.
   * @param {bigint} x - val x
   * @param {bigint[]} y - array values y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  /**
   *
   *
   * @param {Operators} operator - IN / NIN
   * @returns boolean
   */
  compare(operator) {
    switch (operator) {
      case 4 /* IN */:
        return this.y.includes(this.x);
      case 5 /* NIN */:
        return !this.y.includes(this.x);
      case 9 /* BETWEEN */:
        if (this.y.length !== 2) {
          return false;
        }
        return this.x >= this.y[0] && this.x <= this.y[1];
      case 10 /* NONBETWEEN */:
        if (this.y.length !== 2) {
          return false;
        }
        return this.x < this.y[0] || this.x > this.y[1];
      default:
        throw new Error("unknown compare type for vector");
    }
  }
};
var factoryComparer = (x, y, operator) => {
  switch (operator) {
    case 1 /* EQ */:
    case 2 /* LT */:
    case 3 /* GT */:
    case 6 /* NE */:
      if (y.length !== 1) {
        throw new Error("currently we support only one value for scalar comparison");
      }
      return new Scalar(x, y[0]);
    case 4 /* IN */:
    case 5 /* NIN */:
    case 9 /* BETWEEN */:
    case 10 /* NONBETWEEN */:
      return new Vector(x, y);
    default:
      throw new Error("unknown compare type");
  }
};

// src/circuits/models.ts
var Query = class {
  slotIndex;
  values;
  operator;
  valueProof;
  /**
   * Validates Query instance
   *
   */
  validate() {
    if (this.operator !== QueryOperators.$noop && this.operator !== QueryOperators.$sd && this.values?.some((v) => typeof v !== "bigint"))
      throw new Error("empty query value" /* EmptyQueryValue */);
  }
  validateValueArraySize(maxArrSize) {
    if ([0 /* NOOP */, 16 /* SD */, 17 /* NULLIFY */].includes(this.operator) && this.values.length !== 0) {
      throw new Error("invalid query Values array size" /* InvalidValuesArrSize */);
    } else if ([
      1 /* EQ */,
      2 /* LT */,
      3 /* GT */,
      6 /* NE */,
      7 /* LTE */,
      8 /* GTE */,
      11 /* EXISTS */
    ].includes(this.operator) && this.values.length !== 1) {
      throw new Error("invalid query Values array size" /* InvalidValuesArrSize */);
    } else if ([9 /* BETWEEN */, 10 /* NONBETWEEN */].includes(this.operator) && this.values.length !== 2) {
      throw new Error("invalid query Values array size" /* InvalidValuesArrSize */);
    } else if ([4 /* IN */, 5 /* NIN */].includes(this.operator) && this.values.length > maxArrSize) {
      throw new Error("invalid query Values array size" /* InvalidValuesArrSize */);
    }
  }
};
var CircuitId = /* @__PURE__ */ ((CircuitId2) => {
  CircuitId2["AuthV2"] = "authV2";
  CircuitId2["AuthV3"] = "authV3";
  CircuitId2["AuthV3_8_32"] = "authV3-8-32";
  CircuitId2["StateTransition"] = "stateTransition";
  CircuitId2["AtomicQueryMTPV2"] = "credentialAtomicQueryMTPV2";
  CircuitId2["AtomicQueryMTPV2OnChain"] = "credentialAtomicQueryMTPV2OnChain";
  CircuitId2["AtomicQuerySigV2"] = "credentialAtomicQuerySigV2";
  CircuitId2["AtomicQuerySigV2OnChain"] = "credentialAtomicQuerySigV2OnChain";
  CircuitId2["AtomicQueryV3"] = "credentialAtomicQueryV3-beta.1";
  CircuitId2["AtomicQueryV3OnChain"] = "credentialAtomicQueryV3OnChain-beta.1";
  CircuitId2["LinkedMultiQuery10"] = "linkedMultiQuery10-beta.1";
  CircuitId2["AtomicQueryV3Stable"] = "credentialAtomicQueryV3";
  CircuitId2["AtomicQueryV3OnChainStable"] = "credentialAtomicQueryV3OnChain";
  CircuitId2["LinkedMultiQueryStable"] = "linkedMultiQuery";
  return CircuitId2;
})(CircuitId || {});
var CircuitClaim = class {
  issuerId;
  claim;
  treeState;
  proof;
  nonRevProof;
  // Claim non revocation proof
  signatureProof;
};
var CircuitError = /* @__PURE__ */ ((CircuitError2) => {
  CircuitError2["EmptyAuthClaimProof"] = "empty auth claim mtp proof";
  CircuitError2["EmptyAuthClaimProofInTheNewState"] = "empty auth claim mtp proof in the new state";
  CircuitError2["EmptyAuthClaimNonRevProof"] = "empty auth claim non-revocation mtp proof";
  CircuitError2["EmptyChallengeSignature"] = "empty challenge signature";
  CircuitError2["EmptyClaimSignature"] = "empty claim signature";
  CircuitError2["EmptyClaimProof"] = "empty claim mtp proof";
  CircuitError2["EmptyClaimNonRevProof"] = "empty claim non-revocation mtp proof";
  CircuitError2["EmptyIssuerAuthClaimProof"] = "empty issuer auth claim mtp proof";
  CircuitError2["EmptyIssuerAuthClaimNonRevProof"] = "empty issuer auth claim non-revocation mtp proof";
  CircuitError2["EmptyJsonLDQueryProof"] = "empty JSON-LD query mtp proof";
  CircuitError2["EmptyJsonLDQueryValue"] = "empty JSON-LD query value";
  CircuitError2["EmptyJsonLDQueryPath"] = "empty JSON-LD query path";
  CircuitError2["EmptyQueryValue"] = "empty query value";
  CircuitError2["EmptyJsonLDQueryValues"] = "empty JSON-LD query values";
  CircuitError2["EmptyId"] = "empty Id";
  CircuitError2["EmptyChallenge"] = "empty challenge";
  CircuitError2["EmptyGISTProof"] = "empty GIST merkle tree proof";
  CircuitError2["EmptyTreeState"] = "empty tree state";
  CircuitError2["EmptyRequestID"] = "empty request ID";
  CircuitError2["InvalidProofType"] = "invalid proof type";
  CircuitError2["InvalidValuesArrSize"] = "invalid query Values array size";
  CircuitError2["InvalidOperationType"] = "invalid operation type";
  return CircuitError2;
})(CircuitError || {});
var ValueProof = class {
  path;
  value;
  mtp;
  /**
   * Creates an instance of ValueProof.
   */
  constructor() {
    this.path = BigInt(0);
    this.value = BigInt(0);
    this.mtp = new import_js_merkletree5.Proof();
  }
  /**
   * validates instance of ValueProof
   *
   */
  validate() {
    if (typeof this.path !== "bigint") {
      throw new Error("empty JSON-LD query path" /* EmptyJsonLDQueryPath */);
    }
    if (typeof this.value !== "bigint") {
      throw new Error("empty JSON-LD query value" /* EmptyJsonLDQueryValue */);
    }
    if (!this.mtp) {
      throw new Error("empty JSON-LD query mtp proof" /* EmptyJsonLDQueryProof */);
    }
  }
};

// src/circuits/atomic-query-mtp-v2.ts
var import_js_iden3_core11 = require("@iden3/js-iden3-core");
var import_js_merkletree6 = require("@iden3/js-merkletree");
var AtomicQueryMTPV2Inputs = class extends BaseConfig {
  // auth
  id;
  profileNonce;
  claimSubjectProfileNonce;
  // claim issued for user
  claim;
  skipClaimRevocationCheck;
  requestID;
  currentTimeStamp;
  // query
  query;
  /**
   * Validate AtomicQueryMTPV2 inputs
   *
   */
  validate() {
    if (!this.requestID) {
      throw new Error("empty request ID" /* EmptyRequestID */);
    }
  }
  /**
   *
   * Inputs marshalling
   * @returns {Uint8Array}
   */
  inputsMarshal() {
    this.validate();
    if (this.query.valueProof) {
      this.query.validate();
      this.query.valueProof.validate();
    }
    const valueProof = this.query.valueProof ?? new ValueProof();
    const s = {
      requestID: this.requestID.toString(),
      userGenesisID: this.id.bigInt().toString(),
      profileNonce: this.profileNonce?.toString(),
      claimSubjectProfileNonce: this.claimSubjectProfileNonce?.toString(),
      issuerID: this.claim.issuerID?.bigInt().toString(),
      issuerClaim: this.claim.claim?.marshalJson(),
      issuerClaimMtp: this.claim.incProof?.proof && prepareSiblingsStr(this.claim.incProof.proof, this.getMTLevel()),
      issuerClaimClaimsTreeRoot: this.claim.incProof?.treeState?.claimsRoot?.bigInt().toString(),
      issuerClaimRevTreeRoot: this.claim.incProof?.treeState?.revocationRoot?.bigInt().toString(),
      issuerClaimRootsTreeRoot: this.claim.incProof?.treeState?.rootOfRoots?.bigInt().toString(),
      issuerClaimIdenState: this.claim.incProof?.treeState?.state?.bigInt().toString(),
      issuerClaimNonRevMtp: this.claim.nonRevProof?.proof && prepareSiblingsStr(this.claim.nonRevProof.proof, this.getMTLevel()),
      issuerClaimNonRevClaimsTreeRoot: this.claim.nonRevProof?.treeState?.claimsRoot?.bigInt().toString(),
      issuerClaimNonRevRevTreeRoot: this.claim.nonRevProof?.treeState?.revocationRoot?.bigInt().toString(),
      issuerClaimNonRevRootsTreeRoot: this.claim.nonRevProof?.treeState?.rootOfRoots?.bigInt().toString(),
      issuerClaimNonRevState: this.claim.nonRevProof?.treeState?.state?.bigInt().toString(),
      claimSchema: this.claim.claim?.getSchemaHash().bigInt().toString(),
      claimPathMtp: prepareSiblingsStr(valueProof.mtp, this.getMTLevelsClaim()),
      claimPathValue: valueProof.value.toString(),
      operator: this.query.operator,
      slotIndex: this.query.slotIndex,
      timestamp: this.currentTimeStamp
    };
    const nodeAux = getNodeAuxValue(this.claim.nonRevProof?.proof);
    s.issuerClaimNonRevMtpAuxHi = nodeAux?.key.bigInt().toString();
    s.issuerClaimNonRevMtpAuxHv = nodeAux?.value.bigInt().toString();
    s.issuerClaimNonRevMtpNoAux = nodeAux?.noAux;
    s.claimPathNotExists = existenceToInt(valueProof.mtp.existence);
    const nodAuxJSONLD = getNodeAuxValue(valueProof.mtp);
    s.claimPathMtpNoAux = nodAuxJSONLD.noAux;
    s.claimPathMtpAuxHi = nodAuxJSONLD.key.bigInt().toString();
    s.claimPathMtpAuxHv = nodAuxJSONLD.value.bigInt().toString();
    s.claimPathKey = valueProof.path.toString();
    if (this.skipClaimRevocationCheck) {
      s.isRevocationChecked = 0;
    } else {
      s.isRevocationChecked = 1;
    }
    const values2 = this.query.values && prepareCircuitArrayValues(this.query.values, this.getValueArrSize());
    s.value = bigIntArrayToStringArray(values2);
    return byteEncoder.encode(JSON.stringify(s));
  }
};
var AtomicQueryMTPV2PubSignals = class extends BaseConfig {
  requestID;
  userID;
  issuerID;
  issuerClaimIdenState;
  issuerClaimNonRevState;
  claimSchema;
  slotIndex;
  operator;
  value = [];
  timestamp;
  merklized;
  claimPathKey;
  // 0 for inclusion, 1 for non-inclusion
  claimPathNotExists;
  // 0 revocation not check, // 1 for check revocation
  isRevocationChecked;
  /**
   * PubSignalsUnmarshal unmarshal credentialAtomicQueryMTP.circom public signals array to AtomicQueryMTPPubSignals
   *
   * @param {Uint8Array} data
   * @returns AtomicQueryMTPV2PubSignals
   */
  pubSignalsUnmarshal(data) {
    const fieldLength = 13;
    const sVals = JSON.parse(byteDecoder.decode(data));
    if (sVals.length !== fieldLength + this.getValueArrSize()) {
      throw new Error(
        `invalid number of Output values expected ${fieldLength + this.getValueArrSize()} got ${sVals.length}`
      );
    }
    let fieldIdx = 0;
    this.merklized = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    this.userID = import_js_iden3_core11.Id.fromBigInt(BigInt(sVals[fieldIdx]));
    fieldIdx++;
    this.requestID = BigInt(sVals[fieldIdx]);
    fieldIdx++;
    this.issuerID = import_js_iden3_core11.Id.fromBigInt(BigInt(sVals[fieldIdx]));
    fieldIdx++;
    this.issuerClaimIdenState = import_js_merkletree6.Hash.fromString(sVals[fieldIdx]);
    fieldIdx++;
    this.isRevocationChecked = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    this.issuerClaimNonRevState = import_js_merkletree6.Hash.fromString(sVals[fieldIdx]);
    fieldIdx++;
    this.timestamp = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    this.claimSchema = import_js_iden3_core11.SchemaHash.newSchemaHashFromInt(BigInt(sVals[fieldIdx]));
    fieldIdx++;
    this.claimPathNotExists = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    this.claimPathKey = BigInt(sVals[fieldIdx]);
    fieldIdx++;
    this.slotIndex = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    this.operator = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    for (let index = 0; index < this.getValueArrSize(); index++) {
      this.value.push(BigInt(sVals[fieldIdx]));
      fieldIdx++;
    }
    return this;
  }
};

// src/circuits/atomic-query-mtp-v2-on-chain.ts
var import_js_iden3_core12 = require("@iden3/js-iden3-core");
var import_js_merkletree7 = require("@iden3/js-merkletree");
var AtomicQueryMTPV2OnChainInputs = class extends BaseConfig {
  // auth
  id;
  profileNonce;
  claimSubjectProfileNonce;
  // claim issued for user
  claim;
  skipClaimRevocationCheck;
  requestID;
  currentTimeStamp;
  authClaim;
  authClaimIncMtp;
  authClaimNonRevMtp;
  treeState;
  gistProof;
  signature;
  challenge;
  // query
  query;
  /**
   *  Validate inputs
   *
   */
  validate() {
    if (!this.requestID) {
      throw new Error("empty request ID" /* EmptyRequestID */);
    }
    if (!this.authClaimIncMtp) {
      throw new Error("empty auth claim mtp proof" /* EmptyAuthClaimProof */);
    }
    if (!this.authClaimNonRevMtp) {
      throw new Error("empty auth claim non-revocation mtp proof" /* EmptyAuthClaimNonRevProof */);
    }
    if (!this.gistProof.proof) {
      throw new Error("empty GIST merkle tree proof" /* EmptyGISTProof */);
    }
    if (!this.signature) {
      throw new Error("empty challenge signature" /* EmptyChallengeSignature */);
    }
    if (this.challenge === null || this.challenge === void 0) {
      throw new Error("empty challenge" /* EmptyChallenge */);
    }
  }
  /**
   * marshal inputs
   *
   * @returns Uint8Array
   */
  inputsMarshal() {
    this.validate();
    if (this.query.valueProof) {
      this.query.validate();
      this.query.valueProof.validate();
    }
    const valueProof = this.query.valueProof ?? new ValueProof();
    const s = {
      requestID: this.requestID.toString(),
      userGenesisID: this.id.bigInt().toString(),
      profileNonce: this.profileNonce.toString(),
      claimSubjectProfileNonce: this.claimSubjectProfileNonce?.toString(),
      issuerID: this.claim.issuerID?.bigInt().toString(),
      issuerClaim: this.claim.claim?.marshalJson(),
      issuerClaimMtp: this.claim.incProof?.proof && prepareSiblingsStr(this.claim.incProof.proof, this.getMTLevel()),
      issuerClaimClaimsTreeRoot: this.claim.incProof?.treeState?.claimsRoot?.string(),
      issuerClaimRevTreeRoot: this.claim.incProof?.treeState?.revocationRoot?.string(),
      issuerClaimRootsTreeRoot: this.claim.incProof?.treeState?.rootOfRoots?.string(),
      issuerClaimIdenState: this.claim.incProof?.treeState?.state?.string(),
      issuerClaimNonRevMtp: this.claim.nonRevProof?.proof && prepareSiblingsStr(this.claim.nonRevProof?.proof, this.getMTLevel()),
      issuerClaimNonRevClaimsTreeRoot: this.claim.nonRevProof?.treeState?.claimsRoot?.string(),
      issuerClaimNonRevRevTreeRoot: this.claim.nonRevProof?.treeState?.revocationRoot?.string(),
      issuerClaimNonRevRootsTreeRoot: this.claim.nonRevProof?.treeState?.rootOfRoots?.string(),
      issuerClaimNonRevState: this.claim.nonRevProof?.treeState?.state?.string(),
      claimSchema: this.claim.claim?.getSchemaHash().bigInt().toString(),
      claimPathMtp: prepareSiblingsStr(valueProof.mtp, this.getMTLevelsClaim()),
      claimPathValue: valueProof.value.toString(),
      operator: this.query.operator,
      slotIndex: this.query.slotIndex,
      timestamp: this.currentTimeStamp ?? void 0,
      isRevocationChecked: 1,
      authClaim: this.authClaim.marshalJson(),
      authClaimIncMtp: this.authClaimIncMtp && prepareSiblingsStr(this.authClaimIncMtp, this.getMTLevel()),
      authClaimNonRevMtp: this.authClaimNonRevMtp && prepareSiblingsStr(this.authClaimNonRevMtp, this.getMTLevel()),
      challenge: this.challenge.toString(),
      challengeSignatureR8x: this.signature.R8[0].toString(),
      challengeSignatureR8y: this.signature.R8[1].toString(),
      challengeSignatureS: this.signature.S.toString(),
      userClaimsTreeRoot: this.treeState.claimsRoot?.string(),
      userRevTreeRoot: this.treeState.revocationRoot?.string(),
      userRootsTreeRoot: this.treeState.rootOfRoots?.string(),
      userState: this.treeState.state?.string(),
      gistRoot: this.gistProof.root?.string(),
      gistMtp: this.gistProof && prepareSiblingsStr(this.gistProof.proof, this.getMTLevelOnChain())
    };
    if (this.skipClaimRevocationCheck) {
      s.isRevocationChecked = 0;
    }
    const nodeAuxNonRev = this.claim.nonRevProof?.proof && getNodeAuxValue(this.claim.nonRevProof.proof);
    s.issuerClaimNonRevMtpAuxHi = nodeAuxNonRev?.key.bigInt().toString();
    s.issuerClaimNonRevMtpAuxHv = nodeAuxNonRev?.value.bigInt().toString();
    s.issuerClaimNonRevMtpNoAux = nodeAuxNonRev?.noAux;
    s.claimPathNotExists = existenceToInt(valueProof.mtp.existence);
    const nodAuxJSONLD = getNodeAuxValue(valueProof.mtp);
    s.claimPathMtpNoAux = nodAuxJSONLD.noAux;
    s.claimPathMtpAuxHi = nodAuxJSONLD.key.bigInt().toString();
    s.claimPathMtpAuxHv = nodAuxJSONLD.value.bigInt().toString();
    s.claimPathKey = valueProof.path.toString();
    const values2 = this.query.values && prepareCircuitArrayValues(this.query.values, this.getValueArrSize());
    s.value = values2 && bigIntArrayToStringArray(values2);
    const nodeAuxAuth = this.authClaimNonRevMtp && getNodeAuxValue(this.authClaimNonRevMtp);
    s.authClaimNonRevMtpAuxHi = nodeAuxAuth.key.string();
    s.authClaimNonRevMtpAuxHv = nodeAuxAuth.value.string();
    s.authClaimNonRevMtpNoAux = nodeAuxAuth.noAux;
    const globalNodeAux = this.gistProof && getNodeAuxValue(this.gistProof.proof);
    s.gistMtpAuxHi = globalNodeAux.key.string();
    s.gistMtpAuxHv = globalNodeAux.value.string();
    s.gistMtpNoAux = globalNodeAux.noAux;
    return byteEncoder.encode(JSON.stringify(s));
  }
};
var AtomicQueryMTPV2OnChainPubSignals = class extends BaseConfig {
  requestID;
  userID;
  issuerID;
  issuerClaimIdenState;
  issuerClaimNonRevState;
  timestamp;
  merklized;
  isRevocationChecked;
  // 0 revocation not check, // 1 for check revocation
  circuitQueryHash;
  challenge;
  gistRoot;
  /**
   *
   * // PubSignalsUnmarshal unmarshal credentialAtomicQueryMTPV2OnChain.circom public signals array to AtomicQueryMTPPubSignals
   * @param {Uint8Array} data
   * @returns AtomicQuerySigV2PubSignals
   */
  pubSignalsUnmarshal(data) {
    const sVals = JSON.parse(byteDecoder.decode(data));
    let fieldIdx = 0;
    this.merklized = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    this.userID = import_js_iden3_core12.Id.fromBigInt(BigInt(sVals[fieldIdx]));
    fieldIdx++;
    this.circuitQueryHash = BigInt(sVals[fieldIdx]);
    fieldIdx++;
    this.requestID = BigInt(sVals[fieldIdx]);
    fieldIdx++;
    this.challenge = BigInt(sVals[fieldIdx]);
    fieldIdx++;
    this.gistRoot = import_js_merkletree7.Hash.fromString(sVals[fieldIdx]);
    fieldIdx++;
    this.issuerID = import_js_iden3_core12.Id.fromBigInt(BigInt(sVals[fieldIdx]));
    fieldIdx++;
    this.issuerClaimIdenState = import_js_merkletree7.Hash.fromString(sVals[fieldIdx]);
    fieldIdx++;
    this.isRevocationChecked = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    this.issuerClaimNonRevState = import_js_merkletree7.Hash.fromString(sVals[fieldIdx]);
    fieldIdx++;
    this.timestamp = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    return this;
  }
  /** {@inheritDoc IStateInfoPubSignals.getStatesInfo} */
  getStatesInfo() {
    return {
      states: [
        { id: this.issuerID, state: this.issuerClaimIdenState },
        { id: this.issuerID, state: this.issuerClaimNonRevState }
      ],
      gists: [{ id: this.userID, root: this.gistRoot }]
    };
  }
};

// src/circuits/atomic-query-sig-v2.ts
var import_js_iden3_core13 = require("@iden3/js-iden3-core");
var import_js_merkletree8 = require("@iden3/js-merkletree");
var AtomicQuerySigV2Inputs = class extends BaseConfig {
  requestID;
  // auth
  id;
  profileNonce;
  claimSubjectProfileNonce;
  // claim issued for user
  claim;
  skipClaimRevocationCheck;
  currentTimeStamp;
  // query
  query;
  /**
   *  Validate inputs
   *
   */
  validate() {
    if (!this.requestID) {
      throw new Error("empty request ID" /* EmptyRequestID */);
    }
    if (!this.claim.nonRevProof?.proof) {
      throw new Error("empty claim non-revocation mtp proof" /* EmptyClaimNonRevProof */);
    }
    if (!this.claim.signatureProof?.issuerAuthIncProof.proof) {
      throw new Error("empty issuer auth claim mtp proof" /* EmptyIssuerAuthClaimProof */);
    }
    if (!this.claim.signatureProof.issuerAuthNonRevProof.proof) {
      throw new Error("empty issuer auth claim non-revocation mtp proof" /* EmptyIssuerAuthClaimNonRevProof */);
    }
    if (!this.claim.signatureProof.signature) {
      throw new Error("empty claim signature" /* EmptyClaimSignature */);
    }
    if (!this.query.values && this.query.operator !== QueryOperators.$noop) {
      throw new Error("empty query value" /* EmptyQueryValue */);
    }
  }
  /**
   * marshal inputs
   *
   * @returns Uint8Array
   */
  inputsMarshal() {
    this.validate();
    if (this.query.valueProof) {
      this.query.validate();
      this.query.valueProof.validate();
    }
    const valueProof = this.query.valueProof ?? new ValueProof();
    const treeState = this.skipClaimRevocationCheck ? this.claim.signatureProof?.issuerAuthNonRevProof.treeState : this.claim.nonRevProof?.treeState;
    const s = {
      requestID: this.requestID.toString(),
      userGenesisID: this.id.bigInt().toString(),
      profileNonce: this.profileNonce.toString(),
      claimSubjectProfileNonce: this.claimSubjectProfileNonce?.toString(),
      issuerID: this.claim.issuerID?.bigInt().toString(),
      issuerClaim: this.claim.claim?.marshalJson(),
      issuerClaimNonRevClaimsTreeRoot: treeState?.claimsRoot.bigInt().toString(),
      issuerClaimNonRevRevTreeRoot: treeState?.revocationRoot.bigInt().toString(),
      issuerClaimNonRevRootsTreeRoot: treeState?.rootOfRoots.bigInt().toString(),
      issuerClaimNonRevState: treeState?.state.bigInt().toString(),
      issuerClaimNonRevMtp: this.claim.nonRevProof?.proof && prepareSiblingsStr(this.claim.nonRevProof.proof, this.getMTLevel()),
      issuerClaimSignatureR8x: this.claim.signatureProof?.signature.R8[0].toString(),
      issuerClaimSignatureR8y: this.claim.signatureProof?.signature.R8[1].toString(),
      issuerClaimSignatureS: this.claim.signatureProof?.signature.S.toString(),
      issuerAuthClaim: this.claim.signatureProof?.issuerAuthClaim?.marshalJson(),
      issuerAuthClaimMtp: this.claim.signatureProof?.issuerAuthIncProof?.proof && prepareSiblingsStr(this.claim.signatureProof.issuerAuthIncProof.proof, this.getMTLevel()),
      issuerAuthClaimsTreeRoot: this.claim.signatureProof?.issuerAuthIncProof.treeState?.claimsRoot.bigInt().toString(),
      issuerAuthRevTreeRoot: this.claim.signatureProof?.issuerAuthIncProof?.treeState?.revocationRoot.bigInt().toString(),
      issuerAuthRootsTreeRoot: this.claim.signatureProof?.issuerAuthIncProof?.treeState?.rootOfRoots.bigInt().toString(),
      issuerAuthClaimNonRevMtp: this.claim.signatureProof?.issuerAuthNonRevProof?.proof && prepareSiblingsStr(
        this.claim.signatureProof.issuerAuthNonRevProof.proof,
        this.getMTLevel()
      ),
      claimSchema: this.claim.claim?.getSchemaHash().bigInt().toString(),
      claimPathMtp: prepareSiblingsStr(valueProof.mtp, this.getMTLevelsClaim()),
      claimPathValue: valueProof.value.toString(),
      operator: this.query.operator,
      timestamp: this.currentTimeStamp,
      // value in this path in merklized json-ld document
      slotIndex: this.query.slotIndex
    };
    if (this.skipClaimRevocationCheck) {
      s.isRevocationChecked = 0;
    } else {
      s.isRevocationChecked = 1;
    }
    const nodeAuxNonRev = getNodeAuxValue(this.claim.nonRevProof?.proof);
    s.issuerClaimNonRevMtpAuxHi = nodeAuxNonRev?.key.bigInt().toString();
    s.issuerClaimNonRevMtpAuxHv = nodeAuxNonRev?.value.bigInt().toString();
    s.issuerClaimNonRevMtpNoAux = nodeAuxNonRev?.noAux;
    const nodeAuxIssuerAuthNonRev = this.claim.signatureProof && getNodeAuxValue(this.claim.signatureProof.issuerAuthNonRevProof.proof);
    s.issuerAuthClaimNonRevMtpAuxHi = nodeAuxIssuerAuthNonRev?.key.bigInt().toString();
    s.issuerAuthClaimNonRevMtpAuxHv = nodeAuxIssuerAuthNonRev?.value.bigInt().toString();
    s.issuerAuthClaimNonRevMtpNoAux = nodeAuxIssuerAuthNonRev?.noAux;
    s.claimPathNotExists = existenceToInt(valueProof.mtp.existence);
    const nodAuxJSONLD = getNodeAuxValue(valueProof.mtp);
    s.claimPathMtpNoAux = nodAuxJSONLD.noAux;
    s.claimPathMtpAuxHi = nodAuxJSONLD.key.bigInt().toString();
    s.claimPathMtpAuxHv = nodAuxJSONLD.value.bigInt().toString();
    s.claimPathKey = valueProof.path.toString();
    if (this.skipClaimRevocationCheck) {
      s.isRevocationChecked = 0;
    } else {
      s.isRevocationChecked = 1;
    }
    const values2 = prepareCircuitArrayValues(this.query.values, this.getValueArrSize());
    s.value = bigIntArrayToStringArray(values2);
    return byteEncoder.encode(JSON.stringify(s));
  }
};
var AtomicQuerySigV2PubSignals = class extends BaseConfig {
  requestID;
  userID;
  issuerID;
  issuerAuthState;
  issuerClaimNonRevState;
  claimSchema;
  slotIndex;
  operator;
  value = [];
  timestamp;
  merklized;
  claimPathKey;
  // 0 for inclusion, 1 for non-inclusion
  claimPathNotExists;
  // 0 revocation not check, // 1 for check revocation
  isRevocationChecked;
  //
  /**
   *
   * PubSignalsUnmarshal unmarshal credentialAtomicQuerySig.circom public signals array to AtomicQuerySugPubSignals
   * @param {Uint8Array} data
   * @returns AtomicQuerySigV2PubSignals
   */
  pubSignalsUnmarshal(data) {
    const fieldLength = 13;
    const sVals = JSON.parse(byteDecoder.decode(data));
    if (sVals.length !== fieldLength + this.getValueArrSize()) {
      throw new Error(
        `invalid number of Output values expected ${fieldLength + this.getValueArrSize()} got ${sVals.length}`
      );
    }
    let fieldIdx = 0;
    this.merklized = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    this.userID = import_js_iden3_core13.Id.fromBigInt(BigInt(sVals[fieldIdx]));
    fieldIdx++;
    this.issuerAuthState = import_js_merkletree8.Hash.fromString(sVals[fieldIdx]);
    fieldIdx++;
    this.requestID = BigInt(sVals[fieldIdx]);
    fieldIdx++;
    this.issuerID = import_js_iden3_core13.Id.fromBigInt(BigInt(sVals[fieldIdx]));
    fieldIdx++;
    this.isRevocationChecked = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    this.issuerClaimNonRevState = import_js_merkletree8.Hash.fromString(sVals[fieldIdx]);
    fieldIdx++;
    this.timestamp = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    this.claimSchema = import_js_iden3_core13.SchemaHash.newSchemaHashFromInt(BigInt(sVals[fieldIdx]));
    fieldIdx++;
    this.claimPathNotExists = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    this.claimPathKey = BigInt(sVals[fieldIdx]);
    fieldIdx++;
    this.slotIndex = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    this.operator = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    for (let index = 0; index < this.getValueArrSize(); index++) {
      this.value.push(BigInt(sVals[fieldIdx]));
      fieldIdx++;
    }
    return this;
  }
};

// src/circuits/atomic-query-v3.ts
var import_js_iden3_core14 = require("@iden3/js-iden3-core");
var import_js_merkletree9 = require("@iden3/js-merkletree");
var zero = "0";
var AtomicQueryV3Inputs = class extends BaseConfig {
  constructor(opts) {
    super();
    if (!opts) {
      return;
    }
    const { mtLevel, mtLevelClaim } = opts;
    mtLevel && this.setMTLevel(mtLevel);
    mtLevelClaim && this.setMTLevelClaim(mtLevelClaim);
  }
  requestID;
  id;
  profileNonce;
  claimSubjectProfileNonce;
  claim;
  skipClaimRevocationCheck;
  query;
  currentTimeStamp;
  proofType;
  linkNonce;
  verifierID;
  nullifierSessionID;
  validate() {
    if (!this.requestID) {
      throw new Error("empty request ID" /* EmptyRequestID */);
    }
    if (!this.claim.nonRevProof.proof) {
      throw new Error("empty claim non-revocation mtp proof" /* EmptyClaimNonRevProof */);
    }
    if (!this.query.values) {
      throw new Error("empty query value" /* EmptyQueryValue */);
    }
    this.query.validateValueArraySize(this.getValueArrSize());
    if (!this.proofType) {
      throw new Error("invalid proof type" /* InvalidProofType */);
    }
    if (this.proofType === "BJJSignature2021" /* BJJSignature */) {
      if (!this.claim.signatureProof?.issuerAuthIncProof.proof) {
        throw new Error("empty issuer auth claim mtp proof" /* EmptyIssuerAuthClaimProof */);
      }
      if (!this.claim.signatureProof.issuerAuthNonRevProof.proof) {
        throw new Error("empty issuer auth claim non-revocation mtp proof" /* EmptyIssuerAuthClaimNonRevProof */);
      }
      if (!this.claim.signatureProof.signature) {
        throw new Error("empty claim signature" /* EmptyClaimSignature */);
      }
    }
    if (this.proofType === "Iden3SparseMerkleTreeProof" /* Iden3SparseMerkleTreeProof */) {
      if (!this.claim?.incProof?.proof) {
        throw new Error("empty claim mtp proof" /* EmptyClaimProof */);
      }
    }
  }
  fillMTPProofsWithZero(s) {
    s.issuerClaimMtp = prepareSiblingsStr(new import_js_merkletree9.Proof(), this.getMTLevel());
    s.issuerClaimClaimsTreeRoot = import_js_merkletree9.ZERO_HASH.bigInt().toString();
    s.issuerClaimRevTreeRoot = import_js_merkletree9.ZERO_HASH.bigInt().toString();
    s.issuerClaimRootsTreeRoot = import_js_merkletree9.ZERO_HASH.bigInt().toString();
    s.issuerClaimIdenState = import_js_merkletree9.ZERO_HASH.bigInt().toString();
  }
  fillSigProofWithZero(s) {
    s.issuerClaimSignatureR8x = zero;
    s.issuerClaimSignatureR8y = zero;
    s.issuerClaimSignatureS = zero;
    s.issuerAuthClaim = new import_js_iden3_core14.Claim().marshalJson();
    s.issuerAuthClaimMtp = prepareSiblingsStr(new import_js_merkletree9.Proof(), this.getMTLevel());
    s.issuerAuthClaimsTreeRoot = zero;
    s.issuerAuthRevTreeRoot = zero;
    s.issuerAuthRootsTreeRoot = zero;
    s.issuerAuthClaimNonRevMtp = prepareSiblingsStr(new import_js_merkletree9.Proof(), this.getMTLevel());
    s.issuerAuthClaimNonRevMtpAuxHi = import_js_merkletree9.ZERO_HASH.bigInt().toString();
    s.issuerAuthClaimNonRevMtpAuxHv = import_js_merkletree9.ZERO_HASH.bigInt().toString();
    s.issuerAuthClaimNonRevMtpNoAux = zero;
    s.issuerAuthState = zero;
  }
  // InputsMarshal returns Circom private inputs for credentialAtomicQueryV3.circom
  inputsMarshal() {
    this.validate();
    if (this.query.valueProof) {
      this.query.validate();
      this.query.valueProof.validate();
    }
    let valueProof = this.query.valueProof;
    if (!valueProof) {
      valueProof = new ValueProof();
      valueProof.path = 0n;
      valueProof.value = 0n;
      valueProof.mtp = new import_js_merkletree9.Proof();
    }
    let treeState = this.claim.nonRevProof.treeState;
    if (this.proofType === "BJJSignature2021" /* BJJSignature */ && this.skipClaimRevocationCheck) {
      treeState = this.claim.signatureProof?.issuerAuthNonRevProof.treeState;
    }
    if (!treeState) {
      throw new Error("empty tree state" /* EmptyTreeState */);
    }
    const s = {
      requestID: this.requestID.toString(),
      userGenesisID: this.id.bigInt().toString(),
      profileNonce: this.profileNonce.toString(),
      claimSubjectProfileNonce: this.claimSubjectProfileNonce.toString(),
      issuerID: this.claim.issuerID.bigInt().toString(),
      issuerClaim: this.claim.claim.marshalJson(),
      issuerClaimNonRevClaimsTreeRoot: treeState.claimsRoot.bigInt().toString(),
      issuerClaimNonRevRevTreeRoot: treeState.revocationRoot.bigInt().toString(),
      issuerClaimNonRevRootsTreeRoot: treeState.rootOfRoots.bigInt().toString(),
      issuerClaimNonRevState: treeState.state.bigInt().toString(),
      issuerClaimNonRevMtp: prepareSiblingsStr(
        this.claim.nonRevProof.proof,
        this.getMTLevel()
      ),
      claimSchema: this.claim.claim.getSchemaHash().bigInt().toString(),
      claimPathMtp: prepareSiblingsStr(valueProof.mtp, this.getMTLevelsClaim()),
      claimPathValue: valueProof.value.toString(),
      operator: this.query.operator,
      timestamp: this.currentTimeStamp,
      // value in this path in merklized json-ld document
      slotIndex: this.query.slotIndex,
      isRevocationChecked: 1
    };
    if (this.skipClaimRevocationCheck) {
      s.isRevocationChecked = 0;
    }
    if (this.proofType === "BJJSignature2021" /* BJJSignature */) {
      const sigProof = this.claim.signatureProof;
      s.proofType = "1";
      s.issuerClaimSignatureR8x = sigProof.signature.R8[0].toString();
      s.issuerClaimSignatureR8y = sigProof.signature.R8[1].toString();
      s.issuerClaimSignatureS = sigProof.signature.S.toString();
      s.issuerAuthClaim = sigProof.issuerAuthClaim?.marshalJson();
      s.issuerAuthClaimMtp = prepareSiblingsStr(
        sigProof.issuerAuthIncProof.proof,
        this.getMTLevel()
      );
      s.issuerAuthClaimsTreeRoot = sigProof.issuerAuthIncProof.treeState?.claimsRoot.bigInt().toString();
      s.issuerAuthRevTreeRoot = sigProof.issuerAuthIncProof.treeState?.revocationRoot.bigInt().toString();
      s.issuerAuthRootsTreeRoot = sigProof.issuerAuthIncProof.treeState?.rootOfRoots.bigInt().toString();
      s.issuerAuthClaimNonRevMtp = prepareSiblingsStr(
        sigProof.issuerAuthNonRevProof.proof,
        this.getMTLevel()
      );
      const nodeAuxIssuerAuthNonRev = getNodeAuxValue(sigProof.issuerAuthNonRevProof.proof);
      s.issuerAuthClaimNonRevMtpAuxHi = nodeAuxIssuerAuthNonRev.key.bigInt().toString();
      s.issuerAuthClaimNonRevMtpAuxHv = nodeAuxIssuerAuthNonRev.value.bigInt().toString();
      s.issuerAuthClaimNonRevMtpNoAux = nodeAuxIssuerAuthNonRev.noAux;
      s.issuerAuthState = sigProof.issuerAuthIncProof.treeState?.state.bigInt().toString();
      this.fillMTPProofsWithZero(s);
    } else if (this.proofType === "Iden3SparseMerkleTreeProof" /* Iden3SparseMerkleTreeProof */) {
      s.proofType = "2";
      const incProofTreeState = this.claim.incProof?.treeState;
      if (!incProofTreeState) {
        throw new Error("empty tree state" /* EmptyTreeState */);
      }
      s.issuerClaimMtp = prepareSiblingsStr(this.claim.incProof?.proof, this.getMTLevel());
      s.issuerClaimClaimsTreeRoot = incProofTreeState.claimsRoot.bigInt().toString();
      s.issuerClaimRevTreeRoot = incProofTreeState.revocationRoot.bigInt().toString();
      s.issuerClaimRootsTreeRoot = incProofTreeState.rootOfRoots.bigInt().toString();
      s.issuerClaimIdenState = incProofTreeState.state.bigInt().toString();
      this.fillSigProofWithZero(s);
    }
    const nodeAuxNonRev = getNodeAuxValue(this.claim.nonRevProof.proof);
    s.issuerClaimNonRevMtpAuxHi = nodeAuxNonRev.key.bigInt().toString();
    s.issuerClaimNonRevMtpAuxHv = nodeAuxNonRev.value.bigInt().toString();
    s.issuerClaimNonRevMtpNoAux = nodeAuxNonRev.noAux;
    const nodAuxJSONLD = getNodeAuxValue(valueProof.mtp);
    s.claimPathMtpNoAux = nodAuxJSONLD.noAux;
    s.claimPathMtpAuxHi = nodAuxJSONLD.key.bigInt().toString();
    s.claimPathMtpAuxHv = nodAuxJSONLD.value.bigInt().toString();
    s.claimPathKey = valueProof.path.toString();
    s.valueArraySize = this.query.values.length;
    const values2 = prepareCircuitArrayValues(this.query.values, this.getValueArrSize());
    s.value = bigIntArrayToStringArray(values2);
    s.linkNonce = this.linkNonce.toString();
    s.verifierID = this.verifierID?.bigInt().toString() ?? "0";
    s.nullifierSessionID = this.nullifierSessionID.toString();
    return byteEncoder.encode(JSON.stringify(s));
  }
};
var AtomicQueryV3PubSignals = class extends BaseConfig {
  constructor(opts) {
    super();
    if (!opts) {
      return;
    }
    const { mtLevel, mtLevelClaim } = opts;
    mtLevel && this.setMTLevel(mtLevel);
    mtLevelClaim && this.setMTLevelClaim(mtLevelClaim);
  }
  requestID;
  userID;
  issuerID;
  issuerState;
  issuerClaimNonRevState;
  claimSchema;
  slotIndex;
  operator;
  value = [];
  valueArraySize;
  timestamp;
  merklized;
  claimPathKey;
  isRevocationChecked;
  proofType;
  linkID;
  nullifier;
  operatorOutput;
  verifierID;
  nullifierSessionID;
  // PubSignalsUnmarshal unmarshal credentialAtomicQueryV3.circom public signals
  pubSignalsUnmarshal(data) {
    const fieldLength = 19;
    const pubSignals = JSON.parse(byteDecoder.decode(data));
    if (pubSignals.length !== fieldLength + this.getValueArrSize()) {
      throw new Error(
        `invalid number of Output values expected ${fieldLength + this.getValueArrSize()} got ${pubSignals.length}`
      );
    }
    let fieldIdx = 0;
    this.merklized = parseInt(pubSignals[fieldIdx]);
    fieldIdx++;
    this.userID = import_js_iden3_core14.Id.fromBigInt(BigInt(pubSignals[fieldIdx]));
    fieldIdx++;
    this.issuerState = import_js_merkletree9.Hash.fromString(pubSignals[fieldIdx]);
    fieldIdx++;
    this.linkID = BigInt(pubSignals[fieldIdx]);
    fieldIdx++;
    this.nullifier = BigInt(pubSignals[fieldIdx]);
    fieldIdx++;
    this.operatorOutput = BigInt(pubSignals[fieldIdx]);
    fieldIdx++;
    this.proofType = parseInt(pubSignals[fieldIdx]);
    fieldIdx++;
    this.requestID = BigInt(pubSignals[fieldIdx]);
    fieldIdx++;
    this.issuerID = import_js_iden3_core14.Id.fromBigInt(BigInt(pubSignals[fieldIdx]));
    fieldIdx++;
    this.isRevocationChecked = parseInt(pubSignals[fieldIdx]);
    fieldIdx++;
    this.issuerClaimNonRevState = import_js_merkletree9.Hash.fromString(pubSignals[fieldIdx]);
    fieldIdx++;
    this.timestamp = parseInt(pubSignals[fieldIdx]);
    fieldIdx++;
    this.claimSchema = import_js_iden3_core14.SchemaHash.newSchemaHashFromInt(BigInt(pubSignals[fieldIdx]));
    fieldIdx++;
    this.claimPathKey = BigInt(pubSignals[fieldIdx]);
    fieldIdx++;
    this.slotIndex = parseInt(pubSignals[fieldIdx]);
    fieldIdx++;
    this.operator = parseInt(pubSignals[fieldIdx]);
    fieldIdx++;
    for (let index = 0; index < this.getValueArrSize(); index++) {
      this.value.push(BigInt(pubSignals[fieldIdx]));
      fieldIdx++;
    }
    this.valueArraySize = parseInt(pubSignals[fieldIdx]);
    fieldIdx++;
    if (pubSignals[fieldIdx] !== "0") {
      this.verifierID = import_js_iden3_core14.Id.fromBigInt(BigInt(pubSignals[fieldIdx]));
    }
    fieldIdx++;
    this.nullifierSessionID = BigInt(pubSignals[fieldIdx]);
    fieldIdx++;
    return this;
  }
};

// src/circuits/atomic-query-v3-on-chain.ts
var import_js_iden3_core15 = require("@iden3/js-iden3-core");
var import_js_merkletree10 = require("@iden3/js-merkletree");
var zero2 = "0";
var AtomicQueryV3OnChainInputs = class extends BaseConfig {
  constructor(opts) {
    super();
    if (!opts) {
      return;
    }
    const { mtLevel, mtLevelClaim, mtLevelOnChain } = opts;
    mtLevel && this.setMTLevel(mtLevel);
    mtLevelClaim && this.setMTLevelClaim(mtLevelClaim);
    mtLevelOnChain && this.setMTLevelOnChain(mtLevelOnChain);
  }
  requestID;
  id;
  profileNonce;
  claimSubjectProfileNonce;
  claim;
  skipClaimRevocationCheck;
  // Auth inputs
  authClaim;
  authClaimIncMtp;
  authClaimNonRevMtp;
  treeState;
  gistProof;
  signature;
  challenge;
  query;
  currentTimeStamp;
  proofType;
  linkNonce;
  verifierID;
  nullifierSessionID;
  isBJJAuthEnabled;
  validate() {
    if (!this.requestID) {
      throw new Error("empty request ID" /* EmptyRequestID */);
    }
    if (!this.claim.nonRevProof.proof) {
      throw new Error("empty claim non-revocation mtp proof" /* EmptyClaimNonRevProof */);
    }
    if (!this.query.values) {
      throw new Error("empty query value" /* EmptyQueryValue */);
    }
    this.query.validateValueArraySize(this.getValueArrSize());
    if (!this.proofType) {
      throw new Error("invalid proof type" /* InvalidProofType */);
    }
    if (!this.challenge) {
      throw new Error("empty challenge" /* EmptyChallenge */);
    }
    if (this.isBJJAuthEnabled === 1) {
      if (!this.authClaimIncMtp) {
        throw new Error("empty auth claim mtp proof" /* EmptyAuthClaimProof */);
      }
      if (!this.authClaimNonRevMtp) {
        throw new Error("empty auth claim non-revocation mtp proof" /* EmptyAuthClaimNonRevProof */);
      }
      if (!this.signature) {
        throw new Error("empty challenge signature" /* EmptyChallengeSignature */);
      }
      if (!this.gistProof.proof) {
        throw new Error("empty GIST merkle tree proof" /* EmptyGISTProof */);
      }
    }
    if (this.proofType === "BJJSignature2021" /* BJJSignature */) {
      if (!this.claim.signatureProof?.issuerAuthIncProof.proof) {
        throw new Error("empty issuer auth claim mtp proof" /* EmptyIssuerAuthClaimProof */);
      }
      if (!this.claim.signatureProof.issuerAuthNonRevProof.proof) {
        throw new Error("empty issuer auth claim non-revocation mtp proof" /* EmptyIssuerAuthClaimNonRevProof */);
      }
      if (!this.claim.signatureProof.signature) {
        throw new Error("empty claim signature" /* EmptyClaimSignature */);
      }
    }
    if (this.proofType === "Iden3SparseMerkleTreeProof" /* Iden3SparseMerkleTreeProof */) {
      if (!this.claim?.incProof?.proof) {
        throw new Error("empty claim mtp proof" /* EmptyClaimProof */);
      }
    }
  }
  fillMTPProofsWithZero(s) {
    s.issuerClaimMtp = prepareSiblingsStr(new import_js_merkletree10.Proof(), this.getMTLevel());
    s.issuerClaimClaimsTreeRoot = import_js_merkletree10.ZERO_HASH.bigInt().toString();
    s.issuerClaimRevTreeRoot = import_js_merkletree10.ZERO_HASH.bigInt().toString();
    s.issuerClaimRootsTreeRoot = import_js_merkletree10.ZERO_HASH.bigInt().toString();
    s.issuerClaimIdenState = import_js_merkletree10.ZERO_HASH.bigInt().toString();
  }
  fillSigProofWithZero(s) {
    s.issuerClaimSignatureR8x = zero2;
    s.issuerClaimSignatureR8y = zero2;
    s.issuerClaimSignatureS = zero2;
    s.issuerAuthClaim = new import_js_iden3_core15.Claim().marshalJson();
    s.issuerAuthClaimMtp = prepareSiblingsStr(new import_js_merkletree10.Proof(), this.getMTLevel());
    s.issuerAuthClaimsTreeRoot = zero2;
    s.issuerAuthRevTreeRoot = zero2;
    s.issuerAuthRootsTreeRoot = zero2;
    s.issuerAuthClaimNonRevMtp = prepareSiblingsStr(new import_js_merkletree10.Proof(), this.getMTLevel());
    s.issuerAuthClaimNonRevMtpAuxHi = import_js_merkletree10.ZERO_HASH.bigInt().toString();
    s.issuerAuthClaimNonRevMtpAuxHv = import_js_merkletree10.ZERO_HASH.bigInt().toString();
    s.issuerAuthClaimNonRevMtpNoAux = zero2;
    s.issuerAuthState = zero2;
  }
  fillAuthWithZero(s) {
    s.authClaim = new import_js_iden3_core15.Claim().marshalJson();
    s.userClaimsTreeRoot = import_js_merkletree10.ZERO_HASH.bigInt().toString();
    s.userRevTreeRoot = import_js_merkletree10.ZERO_HASH.bigInt().toString();
    s.userRootsTreeRoot = import_js_merkletree10.ZERO_HASH.bigInt().toString();
    s.userState = import_js_merkletree10.ZERO_HASH.bigInt().toString();
    s.authClaimIncMtp = prepareSiblingsStr(new import_js_merkletree10.Proof(), this.getMTLevel());
    s.authClaimNonRevMtp = prepareSiblingsStr(new import_js_merkletree10.Proof(), this.getMTLevel());
    s.challengeSignatureR8x = zero2;
    s.challengeSignatureR8y = zero2;
    s.challengeSignatureS = zero2;
    s.gistRoot = import_js_merkletree10.ZERO_HASH.bigInt().toString();
    s.gistMtp = prepareSiblingsStr(new import_js_merkletree10.Proof(), this.getMTLevelOnChain());
    s.authClaimNonRevMtpAuxHi = import_js_merkletree10.ZERO_HASH.bigInt().toString();
    s.authClaimNonRevMtpAuxHv = import_js_merkletree10.ZERO_HASH.bigInt().toString();
    s.authClaimNonRevMtpNoAux = zero2;
    s.gistMtpAuxHi = import_js_merkletree10.ZERO_HASH.bigInt().toString();
    s.gistMtpAuxHv = import_js_merkletree10.ZERO_HASH.bigInt().toString();
    s.gistMtpNoAux = zero2;
  }
  // InputsMarshal returns Circom private inputs for credentialAtomicQueryV3OnChain.circom
  inputsMarshal() {
    this.validate();
    if (this.query.valueProof) {
      this.query.validate();
      this.query.valueProof.validate();
    }
    let valueProof = this.query.valueProof;
    if (!valueProof) {
      valueProof = new ValueProof();
      valueProof.path = 0n;
      valueProof.value = 0n;
      valueProof.mtp = new import_js_merkletree10.Proof();
    }
    let treeState = this.claim.nonRevProof.treeState;
    if (this.proofType === "BJJSignature2021" /* BJJSignature */ && this.skipClaimRevocationCheck) {
      treeState = this.claim.signatureProof?.issuerAuthNonRevProof.treeState;
    }
    if (!treeState) {
      throw new Error("empty tree state" /* EmptyTreeState */);
    }
    const s = {
      requestID: this.requestID.toString(),
      userGenesisID: this.id.bigInt().toString(),
      profileNonce: this.profileNonce.toString(),
      claimSubjectProfileNonce: this.claimSubjectProfileNonce.toString(),
      issuerID: this.claim.issuerID.bigInt().toString(),
      issuerClaim: this.claim.claim.marshalJson(),
      issuerClaimNonRevClaimsTreeRoot: treeState.claimsRoot.bigInt().toString(),
      issuerClaimNonRevRevTreeRoot: treeState.revocationRoot.bigInt().toString(),
      issuerClaimNonRevRootsTreeRoot: treeState.rootOfRoots.bigInt().toString(),
      issuerClaimNonRevState: treeState.state.bigInt().toString(),
      issuerClaimNonRevMtp: prepareSiblingsStr(
        this.claim.nonRevProof.proof,
        this.getMTLevel()
      ),
      claimSchema: this.claim.claim.getSchemaHash().bigInt().toString(),
      claimPathMtp: prepareSiblingsStr(valueProof.mtp, this.getMTLevelsClaim()),
      claimPathValue: valueProof.value.toString(),
      operator: this.query.operator,
      timestamp: this.currentTimeStamp,
      // value in this path in merklized json-ld document
      slotIndex: this.query.slotIndex,
      isRevocationChecked: 1
    };
    s.challenge = this.challenge?.toString();
    if (this.isBJJAuthEnabled === 1) {
      s.authClaim = this.authClaim?.marshalJson();
      s.userClaimsTreeRoot = this.treeState.claimsRoot?.bigInt().toString();
      s.userRevTreeRoot = this.treeState.revocationRoot?.bigInt().toString();
      s.userRootsTreeRoot = this.treeState.rootOfRoots?.bigInt().toString();
      s.userState = this.treeState.state?.bigInt().toString();
      s.authClaimIncMtp = prepareSiblingsStr(this.authClaimIncMtp, this.getMTLevel());
      s.authClaimNonRevMtp = prepareSiblingsStr(this.authClaimNonRevMtp, this.getMTLevel());
      s.challengeSignatureR8x = this.signature.R8[0].toString();
      s.challengeSignatureR8y = this.signature.R8[1].toString();
      s.challengeSignatureS = this.signature.S.toString();
      s.gistMtp = this.gistProof && prepareSiblingsStr(this.gistProof.proof, this.getMTLevelOnChain());
      const nodeAuxAuth = getNodeAuxValue(this.authClaimNonRevMtp);
      s.authClaimNonRevMtpAuxHi = nodeAuxAuth.key.bigInt().toString();
      s.authClaimNonRevMtpAuxHv = nodeAuxAuth.value.bigInt().toString();
      s.authClaimNonRevMtpNoAux = nodeAuxAuth.noAux;
      const globalNodeAux = getNodeAuxValue(this.gistProof.proof);
      s.gistMtpAuxHi = globalNodeAux.key.bigInt().toString();
      s.gistMtpAuxHv = globalNodeAux.value.bigInt().toString();
      s.gistMtpNoAux = globalNodeAux.noAux;
      s.gistRoot = this.gistProof.root.bigInt().toString();
    } else {
      this.fillAuthWithZero(s);
    }
    if (this.skipClaimRevocationCheck) {
      s.isRevocationChecked = 0;
    }
    if (this.proofType === "BJJSignature2021" /* BJJSignature */) {
      const sigProof = this.claim.signatureProof;
      s.proofType = "1";
      s.issuerClaimSignatureR8x = sigProof.signature.R8[0].toString();
      s.issuerClaimSignatureR8y = sigProof.signature.R8[1].toString();
      s.issuerClaimSignatureS = sigProof.signature.S.toString();
      s.issuerAuthClaim = sigProof.issuerAuthClaim?.marshalJson();
      s.issuerAuthClaimMtp = prepareSiblingsStr(
        sigProof.issuerAuthIncProof.proof,
        this.getMTLevel()
      );
      const issuerAuthTreeState = this.claim.nonRevProof.treeState;
      if (!issuerAuthTreeState) {
        throw new Error("empty tree state" /* EmptyTreeState */);
      }
      s.issuerAuthClaimsTreeRoot = sigProof.issuerAuthIncProof.treeState?.claimsRoot.bigInt().toString();
      s.issuerAuthRevTreeRoot = sigProof.issuerAuthIncProof.treeState?.revocationRoot.bigInt().toString();
      s.issuerAuthRootsTreeRoot = sigProof.issuerAuthIncProof.treeState?.rootOfRoots.bigInt().toString();
      s.issuerAuthClaimNonRevMtp = prepareSiblingsStr(
        sigProof.issuerAuthNonRevProof.proof,
        this.getMTLevel()
      );
      const nodeAuxIssuerAuthNonRev = getNodeAuxValue(sigProof.issuerAuthNonRevProof.proof);
      s.issuerAuthClaimNonRevMtpAuxHi = nodeAuxIssuerAuthNonRev.key.bigInt().toString();
      s.issuerAuthClaimNonRevMtpAuxHv = nodeAuxIssuerAuthNonRev.value.bigInt().toString();
      s.issuerAuthClaimNonRevMtpNoAux = nodeAuxIssuerAuthNonRev.noAux;
      s.issuerAuthState = sigProof.issuerAuthIncProof.treeState?.state.bigInt().toString();
      this.fillMTPProofsWithZero(s);
    } else if (this.proofType === "Iden3SparseMerkleTreeProof" /* Iden3SparseMerkleTreeProof */) {
      s.proofType = "2";
      const incProofTreeState = this.claim.incProof?.treeState;
      if (!incProofTreeState) {
        throw new Error("empty tree state" /* EmptyTreeState */);
      }
      s.issuerClaimMtp = prepareSiblingsStr(this.claim.incProof?.proof, this.getMTLevel());
      s.issuerClaimClaimsTreeRoot = incProofTreeState.claimsRoot.bigInt().toString();
      s.issuerClaimRevTreeRoot = incProofTreeState.revocationRoot.bigInt().toString();
      s.issuerClaimRootsTreeRoot = incProofTreeState.rootOfRoots.bigInt().toString();
      s.issuerClaimIdenState = incProofTreeState.state.bigInt().toString();
      this.fillSigProofWithZero(s);
    }
    const nodeAuxNonRev = getNodeAuxValue(this.claim.nonRevProof.proof);
    s.issuerClaimNonRevMtpAuxHi = nodeAuxNonRev.key.bigInt().toString();
    s.issuerClaimNonRevMtpAuxHv = nodeAuxNonRev.value.bigInt().toString();
    s.issuerClaimNonRevMtpNoAux = nodeAuxNonRev.noAux;
    const nodAuxJSONLD = getNodeAuxValue(valueProof.mtp);
    s.claimPathMtpNoAux = nodAuxJSONLD.noAux;
    s.claimPathMtpAuxHi = nodAuxJSONLD.key.bigInt().toString();
    s.claimPathMtpAuxHv = nodAuxJSONLD.value.bigInt().toString();
    s.claimPathKey = valueProof.path.toString();
    s.valueArraySize = this.query.values.length;
    const values2 = prepareCircuitArrayValues(this.query.values, this.getValueArrSize());
    s.value = bigIntArrayToStringArray(values2);
    s.linkNonce = this.linkNonce.toString();
    s.verifierID = this.verifierID?.bigInt().toString() ?? "0";
    s.nullifierSessionID = this.nullifierSessionID.toString();
    s.isBJJAuthEnabled = this.isBJJAuthEnabled.toString();
    return byteEncoder.encode(JSON.stringify(s));
  }
};
var AtomicQueryV3OnChainPubSignals = class extends BaseConfig {
  requestID;
  userID;
  issuerID;
  issuerState;
  issuerClaimNonRevState;
  timestamp;
  circuitQueryHash;
  challenge;
  gistRoot;
  proofType;
  linkID;
  nullifier;
  operatorOutput;
  isBJJAuthEnabled;
  // PubSignalsUnmarshal unmarshal credentialAtomicQueryV3.circom public signals
  pubSignalsUnmarshal(data) {
    const sVals = JSON.parse(byteDecoder.decode(data));
    let fieldIdx = 0;
    this.userID = import_js_iden3_core15.Id.fromBigInt(BigInt(sVals[fieldIdx]));
    fieldIdx++;
    this.circuitQueryHash = BigInt(sVals[fieldIdx]);
    fieldIdx++;
    this.issuerState = import_js_merkletree10.Hash.fromString(sVals[fieldIdx]);
    fieldIdx++;
    this.linkID = BigInt(sVals[fieldIdx]);
    fieldIdx++;
    this.nullifier = BigInt(sVals[fieldIdx]);
    fieldIdx++;
    this.operatorOutput = BigInt(sVals[fieldIdx]);
    fieldIdx++;
    this.proofType = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    this.requestID = BigInt(sVals[fieldIdx]);
    fieldIdx++;
    this.challenge = BigInt(sVals[fieldIdx]);
    fieldIdx++;
    this.gistRoot = import_js_merkletree10.Hash.fromString(sVals[fieldIdx]);
    fieldIdx++;
    this.issuerID = import_js_iden3_core15.Id.fromBigInt(BigInt(sVals[fieldIdx]));
    fieldIdx++;
    this.issuerClaimNonRevState = import_js_merkletree10.Hash.fromString(sVals[fieldIdx]);
    fieldIdx++;
    this.timestamp = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    this.isBJJAuthEnabled = parseInt(sVals[fieldIdx]);
    return this;
  }
  /** {@inheritDoc IStateInfoPubSignals.getStatesInfo} */
  getStatesInfo() {
    return {
      states: [
        { id: this.issuerID, state: this.issuerState },
        { id: this.issuerID, state: this.issuerClaimNonRevState }
      ],
      gists: [{ id: this.userID, root: this.gistRoot }]
    };
  }
};

// src/circuits/atomic-query-sig-v2-on-chain.ts
var import_js_iden3_core16 = require("@iden3/js-iden3-core");
var import_js_merkletree11 = require("@iden3/js-merkletree");
var AtomicQuerySigV2OnChainInputs = class extends BaseConfig {
  requestID;
  // auth
  id;
  profileNonce;
  claimSubjectProfileNonce;
  // claim issued for user
  claim;
  skipClaimRevocationCheck;
  authClaim;
  authClaimIncMtp;
  authClaimNonRevMtp;
  treeState;
  gistProof;
  signature;
  challenge;
  // query
  query;
  currentTimeStamp;
  /**
   *  Validate inputs
   *
   *
   */
  validate() {
    if (!this.requestID) {
      throw new Error("empty request ID" /* EmptyRequestID */);
    }
    if (!this.claim.nonRevProof?.proof) {
      throw new Error("empty claim non-revocation mtp proof" /* EmptyClaimNonRevProof */);
    }
    if (!this.claim.signatureProof?.issuerAuthIncProof.proof) {
      throw new Error("empty issuer auth claim mtp proof" /* EmptyIssuerAuthClaimProof */);
    }
    if (!this.claim.signatureProof.issuerAuthNonRevProof.proof) {
      throw new Error("empty issuer auth claim non-revocation mtp proof" /* EmptyIssuerAuthClaimNonRevProof */);
    }
    if (!this.claim.signatureProof.signature) {
      throw new Error("empty claim signature" /* EmptyClaimSignature */);
    }
    if (!this.query?.values) {
      throw new Error("empty query value" /* EmptyQueryValue */);
    }
    if (!this.authClaimIncMtp) {
      throw new Error("empty auth claim mtp proof" /* EmptyAuthClaimProof */);
    }
    if (!this.authClaimNonRevMtp) {
      throw new Error("empty auth claim non-revocation mtp proof" /* EmptyAuthClaimNonRevProof */);
    }
    if (!this.gistProof.proof) {
      throw new Error("empty GIST merkle tree proof" /* EmptyGISTProof */);
    }
    if (!this.signature) {
      throw new Error("empty challenge signature" /* EmptyChallengeSignature */);
    }
    if (this.challenge === null || this.challenge === void 0) {
      throw new Error("empty challenge" /* EmptyChallenge */);
    }
  }
  /**
   * marshal inputs
   *
   * @returns Uint8Array
   */
  inputsMarshal() {
    this.validate();
    if (this.query?.valueProof) {
      this.query.validate();
      this.query.valueProof.validate();
    }
    const valueProof = this.query?.valueProof ?? new ValueProof();
    const treeState = this.skipClaimRevocationCheck ? this.claim.signatureProof?.issuerAuthNonRevProof.treeState : this.claim.nonRevProof?.treeState;
    const s = {
      requestID: this.requestID.toString(),
      userGenesisID: this.id.bigInt().toString(),
      profileNonce: this.profileNonce.toString(),
      claimSubjectProfileNonce: this.claimSubjectProfileNonce?.toString(),
      issuerID: this.claim.issuerID?.bigInt().toString(),
      issuerClaim: this.claim.claim?.marshalJson(),
      issuerClaimNonRevClaimsTreeRoot: treeState?.claimsRoot?.bigInt().toString(),
      issuerClaimNonRevRevTreeRoot: treeState?.revocationRoot?.bigInt().toString(),
      issuerClaimNonRevRootsTreeRoot: treeState?.rootOfRoots?.bigInt().toString(),
      issuerClaimNonRevState: treeState?.state?.bigInt().toString(),
      issuerClaimNonRevMtp: this.claim.nonRevProof?.proof && prepareSiblingsStr(this.claim.nonRevProof.proof, this.getMTLevel()),
      issuerClaimSignatureR8x: this.claim.signatureProof && this.claim.signatureProof.signature.R8[0].toString(),
      issuerClaimSignatureR8y: this.claim.signatureProof?.signature.R8[1].toString(),
      issuerClaimSignatureS: this.claim.signatureProof?.signature.S.toString(),
      issuerAuthClaim: this.claim.signatureProof?.issuerAuthClaim?.marshalJson(),
      issuerAuthClaimMtp: this.claim.signatureProof?.issuerAuthIncProof?.proof && prepareSiblingsStr(this.claim.signatureProof.issuerAuthIncProof.proof, this.getMTLevel()),
      issuerAuthClaimsTreeRoot: this.claim.signatureProof?.issuerAuthIncProof?.treeState?.claimsRoot?.bigInt().toString(),
      issuerAuthRevTreeRoot: this.claim.signatureProof?.issuerAuthIncProof?.treeState?.revocationRoot?.bigInt().toString(),
      issuerAuthRootsTreeRoot: this.claim.signatureProof?.issuerAuthIncProof?.treeState?.rootOfRoots?.bigInt().toString(),
      issuerAuthClaimNonRevMtp: this.claim.signatureProof?.issuerAuthNonRevProof?.proof && prepareSiblingsStr(
        this.claim.signatureProof.issuerAuthNonRevProof.proof,
        this.getMTLevel()
      ),
      claimSchema: this.claim.claim?.getSchemaHash().bigInt().toString(),
      claimPathMtp: prepareSiblingsStr(valueProof.mtp, this.getMTLevelsClaim()),
      claimPathValue: valueProof.value.toString(),
      operator: this.query.operator,
      timestamp: this.currentTimeStamp,
      // value in this path in merklized json-ld document
      slotIndex: this.query?.slotIndex,
      isRevocationChecked: 1,
      authClaim: this.authClaim.marshalJson(),
      authClaimIncMtp: this.authClaimIncMtp && prepareSiblingsStr(this.authClaimIncMtp, this.getMTLevel()),
      authClaimNonRevMtp: this.authClaimNonRevMtp && prepareSiblingsStr(this.authClaimNonRevMtp, this.getMTLevel()),
      challenge: this.challenge?.toString(),
      challengeSignatureR8x: this.signature.R8[0].toString(),
      challengeSignatureR8y: this.signature.R8[1].toString(),
      challengeSignatureS: this.signature.S.toString(),
      userClaimsTreeRoot: this.treeState.claimsRoot?.string(),
      userRevTreeRoot: this.treeState.revocationRoot?.string(),
      userRootsTreeRoot: this.treeState.rootOfRoots?.string(),
      userState: this.treeState.state?.string(),
      gistRoot: this.gistProof.root.string(),
      gistMtp: this.gistProof && prepareSiblingsStr(this.gistProof.proof, this.getMTLevelOnChain())
    };
    if (this.skipClaimRevocationCheck) {
      s.isRevocationChecked = 0;
    }
    const nodeAuxNonRev = getNodeAuxValue(this.claim.nonRevProof?.proof);
    s.issuerClaimNonRevMtpAuxHi = nodeAuxNonRev?.key.bigInt().toString();
    s.issuerClaimNonRevMtpAuxHv = nodeAuxNonRev?.value.bigInt().toString();
    s.issuerClaimNonRevMtpNoAux = nodeAuxNonRev?.noAux;
    const nodeAuxIssuerAuthNonRev = getNodeAuxValue(
      this.claim.signatureProof?.issuerAuthNonRevProof.proof
    );
    s.issuerAuthClaimNonRevMtpAuxHi = nodeAuxIssuerAuthNonRev?.key.bigInt().toString();
    s.issuerAuthClaimNonRevMtpAuxHv = nodeAuxIssuerAuthNonRev?.value.bigInt().toString();
    s.issuerAuthClaimNonRevMtpNoAux = nodeAuxIssuerAuthNonRev?.noAux;
    s.claimPathNotExists = existenceToInt(valueProof.mtp.existence);
    const nodAuxJSONLD = getNodeAuxValue(valueProof.mtp);
    s.claimPathMtpNoAux = nodAuxJSONLD.noAux;
    s.claimPathMtpAuxHi = nodAuxJSONLD.key.bigInt().toString();
    s.claimPathMtpAuxHv = nodAuxJSONLD.value.bigInt().toString();
    s.claimPathKey = valueProof.path.toString();
    const values2 = prepareCircuitArrayValues(this.query.values, this.getValueArrSize());
    s.value = bigIntArrayToStringArray(values2);
    const nodeAuxAuth = getNodeAuxValue(this.authClaimNonRevMtp);
    s.authClaimNonRevMtpAuxHi = nodeAuxAuth.key.string();
    s.authClaimNonRevMtpAuxHv = nodeAuxAuth.value.string();
    s.authClaimNonRevMtpNoAux = nodeAuxAuth.noAux;
    const globalNodeAux = getNodeAuxValue(this.gistProof.proof);
    s.gistMtpAuxHi = globalNodeAux.key.string();
    s.gistMtpAuxHv = globalNodeAux.value.string();
    s.gistMtpNoAux = globalNodeAux.noAux;
    return byteEncoder.encode(JSON.stringify(s));
  }
};
var AtomicQuerySigV2OnChainCircuitInputs = class {
  requestID;
  // user data
  userGenesisID;
  profileNonce;
  claimSubjectProfileNonce;
  issuerID;
  // Claim
  issuerClaim;
  issuerClaimNonRevClaimsTreeRoot;
  issuerClaimNonRevRevTreeRoot;
  issuerClaimNonRevRootsTreeRoot;
  issuerClaimNonRevState;
  issuerClaimNonRevMtp;
  issuerClaimNonRevMtpAuxHi;
  issuerClaimNonRevMtpAuxHv;
  issuerClaimNonRevMtpNoAux;
  claimSchema;
  issuerClaimSignatureR8x;
  issuerClaimSignatureR8y;
  issuerClaimSignatureS;
  issuerAuthClaim;
  issuerAuthClaimMtp;
  issuerAuthClaimNonRevMtp;
  issuerAuthClaimNonRevMtpAuxHi;
  issuerAuthClaimNonRevMtpAuxHv;
  issuerAuthClaimNonRevMtpNoAux;
  issuerAuthClaimsTreeRoot;
  issuerAuthRevTreeRoot;
  issuerAuthRootsTreeRoot;
  isRevocationChecked;
  // Query
  // JSON path
  claimPathNotExists;
  // 0 for inclusion, 1 for non-inclusion
  claimPathMtp;
  claimPathMtpNoAux;
  // 1 if aux node is empty, 0 if non-empty or for inclusion proofs
  claimPathMtpAuxHi;
  // 0 for inclusion proof
  claimPathMtpAuxHv;
  // 0 for inclusion proof
  claimPathKey;
  // hash of path in merklized json-ld document
  claimPathValue;
  // value in this path in merklized json-ld document
  operator;
  slotIndex;
  timestamp;
  value;
  // AuthClaim proof of inclusion
  authClaim;
  authClaimIncMtp;
  // AuthClaim non revocation proof
  authClaimNonRevMtp;
  authClaimNonRevMtpAuxHi;
  authClaimNonRevMtpAuxHv;
  authClaimNonRevMtpNoAux;
  challenge;
  challengeSignatureR8x;
  challengeSignatureR8y;
  challengeSignatureS;
  // User State
  userClaimsTreeRoot;
  userRevTreeRoot;
  userRootsTreeRoot;
  userState;
  // Global on-cain state
  gistRoot;
  gistMtp;
  gistMtpAuxHi;
  gistMtpAuxHv;
  gistMtpNoAux;
};
var AtomicQuerySigV2OnChainPubSignals = class extends BaseConfig {
  requestID;
  userID;
  issuerID;
  issuerAuthState;
  issuerClaimNonRevState;
  timestamp;
  merklized;
  isRevocationChecked;
  // 0 revocation not check, // 1 for check revocation
  circuitQueryHash;
  challenge;
  gistRoot;
  //
  /**
   *
   * // PubSignalsUnmarshal unmarshal credentialAtomicQuerySig.circom public signals
   * @param {Uint8Array} data
   * @returns AtomicQuerySigV2PubSignals
   */
  pubSignalsUnmarshal(data) {
    const sVals = JSON.parse(byteDecoder.decode(data));
    let fieldIdx = 0;
    this.merklized = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    this.userID = import_js_iden3_core16.Id.fromBigInt(BigInt(sVals[fieldIdx]));
    fieldIdx++;
    this.circuitQueryHash = BigInt(sVals[fieldIdx]);
    fieldIdx++;
    this.issuerAuthState = import_js_merkletree11.Hash.fromString(sVals[fieldIdx]);
    fieldIdx++;
    this.requestID = BigInt(sVals[fieldIdx]);
    fieldIdx++;
    this.challenge = BigInt(sVals[fieldIdx]);
    fieldIdx++;
    this.gistRoot = import_js_merkletree11.Hash.fromString(sVals[fieldIdx]);
    fieldIdx++;
    this.issuerID = import_js_iden3_core16.Id.fromBigInt(BigInt(sVals[fieldIdx]));
    fieldIdx++;
    this.isRevocationChecked = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    this.issuerClaimNonRevState = import_js_merkletree11.Hash.fromString(sVals[fieldIdx]);
    fieldIdx++;
    this.timestamp = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    return this;
  }
  /** {@inheritDoc IStateInfoPubSignals.getStatesInfo} */
  getStatesInfo() {
    return {
      states: [
        { id: this.issuerID, state: this.issuerAuthState },
        { id: this.issuerID, state: this.issuerClaimNonRevState }
      ],
      gists: [{ id: this.userID, root: this.gistRoot }]
    };
  }
};

// src/circuits/auth-v2.ts
var import_js_merkletree12 = require("@iden3/js-merkletree");
var import_js_iden3_core17 = require("@iden3/js-iden3-core");
var AuthV2Inputs = class extends BaseConfig {
  genesisID;
  profileNonce;
  authClaim;
  authClaimIncMtp;
  authClaimNonRevMtp;
  treeState;
  gistProof;
  signature;
  challenge;
  validate() {
    if (!this.genesisID) {
      throw new Error("empty Id" /* EmptyId */);
    }
    if (!this.authClaimIncMtp) {
      throw new Error("empty auth claim mtp proof" /* EmptyAuthClaimProof */);
    }
    if (!this.authClaimNonRevMtp) {
      throw new Error("empty auth claim non-revocation mtp proof" /* EmptyAuthClaimNonRevProof */);
    }
    if (!this.gistProof.proof) {
      throw new Error("empty GIST merkle tree proof" /* EmptyGISTProof */);
    }
    if (!this.signature) {
      throw new Error("empty challenge signature" /* EmptyChallengeSignature */);
    }
    if (!this.challenge) {
      throw new Error("empty challenge" /* EmptyChallenge */);
    }
  }
  // InputsMarshal returns Circom private inputs for auth.circom
  inputsMarshal() {
    this.validate();
    const s = {
      genesisID: this.genesisID?.bigInt().toString(),
      profileNonce: this.profileNonce?.toString(),
      authClaim: this.authClaim?.marshalJson(),
      authClaimIncMtp: prepareSiblingsStr(this.authClaimIncMtp, this.getMTLevel()),
      authClaimNonRevMtp: prepareSiblingsStr(this.authClaimNonRevMtp, this.getMTLevel()),
      challenge: this.challenge?.toString(),
      challengeSignatureR8x: this.signature.R8[0].toString(),
      challengeSignatureR8y: this.signature.R8[1].toString(),
      challengeSignatureS: this.signature.S.toString(),
      claimsTreeRoot: this.treeState.claimsRoot?.bigInt().toString(),
      revTreeRoot: this.treeState.revocationRoot?.bigInt().toString(),
      rootsTreeRoot: this.treeState.rootOfRoots?.bigInt().toString(),
      state: this.treeState.state?.bigInt().toString(),
      gistRoot: this.gistProof.root.bigInt().toString(),
      gistMtp: this.gistProof && prepareSiblingsStr(this.gistProof.proof, this.getMTLevelOnChain())
    };
    const nodeAuxAuth = getNodeAuxValue(this.authClaimNonRevMtp);
    s.authClaimNonRevMtpAuxHi = nodeAuxAuth.key.bigInt().toString();
    s.authClaimNonRevMtpAuxHv = nodeAuxAuth.value.bigInt().toString();
    s.authClaimNonRevMtpNoAux = nodeAuxAuth.noAux;
    const globalNodeAux = getNodeAuxValue(this.gistProof.proof);
    s.gistMtpAuxHi = globalNodeAux.key.bigInt().toString();
    s.gistMtpAuxHv = globalNodeAux.value.bigInt().toString();
    s.gistMtpNoAux = globalNodeAux.noAux;
    return byteEncoder.encode(JSON.stringify(s));
  }
};
var AuthV2PubSignals = class {
  userID;
  challenge;
  GISTRoot;
  /**
   * PubSignalsUnmarshal unmarshal auth.circom public inputs to AuthPubSignals
   *
   * @param {Uint8Array} data
   * @returns AuthV2PubSignals
   */
  pubSignalsUnmarshal(data) {
    const len = 3;
    const sVals = JSON.parse(byteDecoder.decode(data));
    if (sVals.length !== len) {
      throw new Error(`invalid number of Output values expected ${len} got ${sVals.length}`);
    }
    this.userID = import_js_iden3_core17.Id.fromBigInt(BigInt(sVals[0]));
    this.challenge = BigInt(sVals[1]);
    this.GISTRoot = import_js_merkletree12.Hash.fromString(sVals[2]);
    return this;
  }
  getStatesInfo() {
    return {
      states: [],
      gists: [{ id: this.userID, root: this.GISTRoot }]
    };
  }
};

// src/circuits/state-transition.ts
var import_js_iden3_core18 = require("@iden3/js-iden3-core");
var import_js_merkletree13 = require("@iden3/js-merkletree");
var StateTransitionInputs = class extends BaseConfig {
  id;
  oldTreeState;
  newTreeState;
  isOldStateGenesis;
  authClaim;
  authClaimNewStateIncProof;
  signature;
  /**
   * CircuitInputMarshal returns Circom private inputs for stateTransition.circom
   *
   * @returns Uint8Array
   */
  inputsMarshal() {
    if (!this.authClaim?.incProof?.proof) {
      throw new Error("empty auth claim mtp proof" /* EmptyAuthClaimProof */);
    }
    if (!this.authClaimNewStateIncProof) {
      throw new Error("empty auth claim mtp proof in the new state" /* EmptyAuthClaimProofInTheNewState */);
    }
    if (!this.authClaim.nonRevProof?.proof) {
      throw new Error("empty auth claim non-revocation mtp proof" /* EmptyAuthClaimNonRevProof */);
    }
    const s = {
      authClaim: this.authClaim?.claim?.marshalJson(),
      authClaimMtp: prepareSiblingsStr(this.authClaim.incProof.proof, this.getMTLevel()),
      authClaimNonRevMtp: prepareSiblingsStr(this.authClaim.nonRevProof.proof, this.getMTLevel()),
      newAuthClaimMtp: prepareSiblingsStr(this.authClaimNewStateIncProof, this.getMTLevel()),
      userID: this.id?.bigInt().toString(),
      newUserState: this.newTreeState?.state?.bigInt().toString(),
      claimsTreeRoot: this.oldTreeState?.claimsRoot?.bigInt().toString(),
      oldUserState: this.oldTreeState?.state?.bigInt().toString(),
      revTreeRoot: this.oldTreeState?.revocationRoot?.bigInt().toString(),
      rootsTreeRoot: this.oldTreeState?.rootOfRoots?.bigInt().toString(),
      signatureR8x: this.signature.R8[0].toString(),
      signatureR8y: this.signature.R8[1].toString(),
      signatureS: this.signature.S.toString(),
      newClaimsTreeRoot: this.newTreeState?.claimsRoot?.bigInt().toString(),
      newRootsTreeRoot: this.newTreeState?.rootOfRoots?.bigInt().toString(),
      newRevTreeRoot: this.newTreeState?.revocationRoot?.bigInt().toString()
    };
    if (this.isOldStateGenesis) {
      s.isOldStateGenesis = "1";
    } else {
      s.isOldStateGenesis = "0";
    }
    const nodeAuxAuth = getNodeAuxValue(this.authClaim.nonRevProof.proof);
    s.authClaimNonRevMtpAuxHi = nodeAuxAuth.key.bigInt().toString();
    s.authClaimNonRevMtpAuxHv = nodeAuxAuth.value.bigInt().toString();
    s.authClaimNonRevMtpNoAux = nodeAuxAuth.noAux;
    return byteEncoder.encode(JSON.stringify(s));
  }
};
var StateTransitionPubSignals = class {
  userId;
  oldUserState;
  newUserState;
  isOldStateGenesis;
  /**
   *
   *
   * PubSignalsUnmarshal unmarshal stateTransition.circom public signal
   * @param {Uint8Array} data
   * @returns StateTransitionPubSignals
   */
  pubSignalsUnmarshal(data) {
    const sVals = JSON.parse(byteDecoder.decode(data));
    const fieldLength = 4;
    if (sVals.length !== fieldLength) {
      throw new Error(
        `invalid number of Output values expected ${fieldLength} got ${sVals.length}`
      );
    }
    this.userId = import_js_iden3_core18.Id.fromBigInt(BigInt(sVals[0]));
    this.oldUserState = import_js_merkletree13.Hash.fromString(sVals[1]);
    this.newUserState = import_js_merkletree13.Hash.fromString(sVals[2]);
    this.isOldStateGenesis = BigInt(sVals[3]) === BigInt(1);
    return this;
  }
};

// src/circuits/linked-multi-query.ts
var import_js_merkletree14 = require("@iden3/js-merkletree");
var LinkedMultiQueryInputs = class extends BaseConfig {
  constructor(_queryCount) {
    super();
    this._queryCount = _queryCount;
  }
  get queryCount() {
    return this._queryCount;
  }
  linkNonce;
  claim;
  query;
  // InputsMarshal returns Circom private inputs for linkedMultiQueryInputs.circom
  inputsMarshal() {
    const claimPathMtp = [];
    const claimPathMtpNoAux = [];
    const claimPathMtpAuxHi = [];
    const claimPathMtpAuxHv = [];
    const claimPathKey = [];
    const claimPathValue = [];
    const slotIndex = [];
    const operator = [];
    const value = [];
    const valueArraySize = [];
    for (let i = 0; i < this.queryCount; i++) {
      if (!this.query[i]) {
        claimPathMtp.push(new Array(this.getMTLevelsClaim()).fill("0"));
        claimPathMtpNoAux.push("0");
        claimPathMtpAuxHi.push("0");
        claimPathMtpAuxHv.push("0");
        claimPathKey.push("0");
        claimPathValue.push("0");
        slotIndex.push(0);
        operator.push(0);
        const valuesArr2 = prepareCircuitArrayValues([], this.getValueArrSize());
        value.push(bigIntArrayToStringArray(valuesArr2));
        valueArraySize.push(0);
        continue;
      }
      let valueProof = this.query[i].valueProof;
      if (!valueProof) {
        valueProof = new ValueProof();
        valueProof.path = 0n;
        valueProof.value = 0n;
        valueProof.mtp = new import_js_merkletree14.Proof();
      }
      claimPathMtp.push(prepareSiblingsStr(valueProof.mtp, this.getMTLevelsClaim()));
      const nodAuxJSONLD = getNodeAuxValue(valueProof.mtp);
      claimPathMtpNoAux.push(nodAuxJSONLD.noAux);
      claimPathMtpAuxHi.push(nodAuxJSONLD.key.bigInt().toString());
      claimPathMtpAuxHv.push(nodAuxJSONLD.value.bigInt().toString());
      claimPathKey.push(valueProof.path.toString());
      claimPathValue.push(valueProof.value.toString());
      slotIndex.push(this.query[i].slotIndex);
      operator.push(this.query[i].operator);
      valueArraySize.push(this.query[i].values.length);
      const valuesArr = prepareCircuitArrayValues(this.query[i].values, this.getValueArrSize());
      value.push(bigIntArrayToStringArray(valuesArr));
    }
    const s = {
      linkNonce: this.linkNonce.toString(),
      issuerClaim: this.claim.marshalJson(),
      claimSchema: this.claim.getSchemaHash().bigInt().toString(),
      claimPathMtp,
      claimPathMtpNoAux,
      claimPathMtpAuxHi,
      claimPathMtpAuxHv,
      claimPathKey,
      claimPathValue,
      slotIndex,
      operator,
      value,
      valueArraySize
    };
    return byteEncoder.encode(JSON.stringify(s));
  }
};
var LinkedMultiQueryPubSignals = class {
  constructor(queryCount = 10) {
    this.queryCount = queryCount;
    if (this.queryCount < 1) {
      throw new Error("queryCount must be greater than 0");
    }
  }
  linkID;
  merklized;
  operatorOutput;
  circuitQueryHash;
  /**
   * PubSignalsUnmarshal unmarshal linkedMultiQuery.circom public inputs to LinkedMultiQueryPubSignals
   *
   * @param {Uint8Array} data
   * @returns LinkedMultiQueryPubSignals
   */
  pubSignalsUnmarshal(data) {
    const len = 2 + this.queryCount * 2;
    const sVals = JSON.parse(byteDecoder.decode(data));
    if (sVals.length !== len) {
      throw new Error(`invalid number of Output values expected ${len} got ${sVals.length}`);
    }
    let fieldIdx = 0;
    this.linkID = BigInt(sVals[fieldIdx]);
    fieldIdx++;
    this.merklized = parseInt(sVals[fieldIdx]);
    fieldIdx++;
    this.operatorOutput = [];
    for (let i = 0; i < this.queryCount; i++) {
      this.operatorOutput.push(BigInt(sVals[fieldIdx]));
      fieldIdx++;
    }
    this.circuitQueryHash = [];
    for (let i = 0; i < this.queryCount; i++) {
      this.circuitQueryHash.push(BigInt(sVals[fieldIdx]));
      fieldIdx++;
    }
    return this;
  }
};

// src/circuits/auth-v3.ts
var AuthV3Inputs = class extends AuthV2Inputs {
  constructor(opts) {
    super();
    if (!opts) {
      return;
    }
    const { mtLevel, mtLevelOnChain } = opts;
    mtLevel && this.setMTLevel(mtLevel);
    mtLevelOnChain && this.setMTLevelOnChain(mtLevelOnChain);
  }
};
var AuthV3PubSignals = class extends AuthV2PubSignals {
};

// src/circuits/validator.ts
var allOperations2 = Object.values(QueryOperators);
var v2Operations = [
  0 /* NOOP */,
  1 /* EQ */,
  2 /* LT */,
  3 /* GT */,
  4 /* IN */,
  5 /* NIN */,
  6 /* NE */,
  16 /* SD */
];
var v2OnChainOperations = [
  1 /* EQ */,
  2 /* LT */,
  3 /* GT */,
  4 /* IN */,
  5 /* NIN */,
  6 /* NE */
];
var noQueriesValidation = { validation: { maxQueriesCount: 0, supportedOperations: [] } };
var credentialAtomicQueryV2Validation = {
  validation: { maxQueriesCount: 1, supportedOperations: v2Operations }
};
var credentialAtomicQueryV2OnChainValidation = {
  validation: { maxQueriesCount: 1, supportedOperations: v2OnChainOperations }
};
var credentialAtomicQueryV3Validation = {
  validation: { maxQueriesCount: 1, supportedOperations: allOperations2 }
};
var circuitValidator = {
  ["credentialAtomicQueryMTPV2" /* AtomicQueryMTPV2 */]: credentialAtomicQueryV2Validation,
  ["credentialAtomicQueryMTPV2OnChain" /* AtomicQueryMTPV2OnChain */]: {
    ...credentialAtomicQueryV2OnChainValidation,
    unmarshaller: AtomicQueryMTPV2OnChainPubSignals
  },
  ["credentialAtomicQuerySigV2" /* AtomicQuerySigV2 */]: credentialAtomicQueryV2Validation,
  ["credentialAtomicQuerySigV2OnChain" /* AtomicQuerySigV2OnChain */]: {
    ...credentialAtomicQueryV2OnChainValidation,
    unmarshaller: AtomicQuerySigV2OnChainPubSignals
  },
  ["credentialAtomicQueryV3-beta.1" /* AtomicQueryV3 */]: credentialAtomicQueryV3Validation,
  ["credentialAtomicQueryV3OnChain-beta.1" /* AtomicQueryV3OnChain */]: {
    ...credentialAtomicQueryV3Validation,
    unmarshaller: AtomicQueryV3OnChainPubSignals
  },
  ["authV2" /* AuthV2 */]: { ...noQueriesValidation, unmarshaller: AuthV2PubSignals },
  ["authV3" /* AuthV3 */]: { ...noQueriesValidation, unmarshaller: AuthV3PubSignals },
  ["authV3-8-32" /* AuthV3_8_32 */]: {
    ...noQueriesValidation,
    unmarshaller: AuthV3PubSignals,
    mtLevel: 8,
    mtLevelClaim: 32
  },
  ["stateTransition" /* StateTransition */]: noQueriesValidation,
  ["linkedMultiQuery10-beta.1" /* LinkedMultiQuery10 */]: {
    validation: { maxQueriesCount: 10, supportedOperations: allOperations2 }
  },
  ["credentialAtomicQueryV3" /* AtomicQueryV3Stable */]: {
    ...credentialAtomicQueryV3Validation,
    subVersions: [
      {
        mtLevel: 16,
        mtLevelClaim: 16,
        targetCircuitId: "credentialAtomicQueryV3" /* AtomicQueryV3Stable */ + "-16-16-64"
      }
    ]
  },
  ["credentialAtomicQueryV3OnChain" /* AtomicQueryV3OnChainStable */]: {
    ...credentialAtomicQueryV3Validation,
    subVersions: [
      {
        mtLevel: 16,
        mtLevelClaim: 16,
        mtLevelOnChain: 32,
        targetCircuitId: "credentialAtomicQueryV3OnChain" /* AtomicQueryV3OnChainStable */ + "-16-16-64-16-32"
      }
    ],
    unmarshaller: AtomicQueryV3OnChainPubSignals
  },
  ["linkedMultiQuery" /* LinkedMultiQueryStable */]: {
    validation: { maxQueriesCount: 10, supportedOperations: allOperations2 },
    subVersions: [
      {
        queryCount: 3,
        targetCircuitId: "linkedMultiQuery" /* LinkedMultiQueryStable */ + "3"
      },
      {
        queryCount: 5,
        targetCircuitId: "linkedMultiQuery" /* LinkedMultiQueryStable */ + "5"
      }
    ]
  }
};
var getCircuitIdsWithSubVersions = (filterCircuitIds) => {
  return [
    ...Object.keys(circuitValidator).reduce((acc, key) => {
      const circuitId = key;
      const applyFilter = filterCircuitIds && filterCircuitIds.length > 0;
      if (applyFilter && !filterCircuitIds.includes(circuitId)) {
        return acc;
      }
      acc.add(circuitId);
      const targetCircuitIds = circuitValidator[circuitId]?.subVersions?.map((subversion) => subversion.targetCircuitId) ?? [];
      targetCircuitIds.forEach((id) => acc.add(id));
      return acc;
    }, /* @__PURE__ */ new Set())
  ];
};
var getGroupedCircuitIdsWithSubVersions = (filterCircuitId) => {
  for (const key of Object.keys(circuitValidator)) {
    const circuitId = key;
    const subVersions = circuitValidator[circuitId]?.subVersions ?? [];
    const group = [...subVersions.map((subversion) => subversion.targetCircuitId), circuitId];
    if (group.includes(filterCircuitId)) {
      return group;
    }
  }
  const validatorItem = circuitValidator[filterCircuitId];
  if (validatorItem) {
    const subVersions = validatorItem.subVersions ?? [];
    return [...subVersions.map((subversion) => subversion.targetCircuitId), filterCircuitId];
  }
  return [filterCircuitId];
};
var getUnmarshallerForCircuitId = (circuitIdToFind) => {
  for (const key of Object.keys(circuitValidator)) {
    const circuitId = key;
    if (circuitId === circuitIdToFind && circuitValidator[circuitId].unmarshaller) {
      return {
        unmarshaller: circuitValidator[circuitId].unmarshaller,
        opts: circuitValidator[circuitId].mtLevel || circuitValidator[circuitId].mtLevelClaim || circuitValidator[circuitId].mtLevelOnChain ? {
          mtLevel: circuitValidator[circuitId].mtLevel,
          mtLevelClaim: circuitValidator[circuitId].mtLevelClaim,
          mtLevelOnChain: circuitValidator[circuitId].mtLevelOnChain
        } : void 0
      };
    }
    const subVersions = circuitValidator[circuitId]?.subVersions ?? [];
    if (subVersions.length > 0) {
      const subVersion = subVersions.find(
        (subversion) => subversion.targetCircuitId === circuitIdToFind
      );
      if (subVersion && circuitValidator[circuitId].unmarshaller) {
        return {
          unmarshaller: circuitValidator[circuitId].unmarshaller,
          opts: subVersion.mtLevel || subVersion.mtLevelClaim || subVersion.mtLevelOnChain ? {
            mtLevel: subVersion.mtLevel,
            mtLevelClaim: subVersion.mtLevelClaim,
            mtLevelOnChain: subVersion.mtLevelOnChain
          } : void 0
        };
      }
    }
  }
};

// src/storage/blockchain/abi/State.json
var State_default = [{ inputs: [], stateMutability: "nonpayable", type: "constructor" }, { anonymous: false, inputs: [{ indexed: false, internalType: "uint8", name: "version", type: "uint8" }], name: "Initialized", type: "event" }, { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "previousOwner", type: "address" }, { indexed: true, internalType: "address", name: "newOwner", type: "address" }], name: "OwnershipTransferStarted", type: "event" }, { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "previousOwner", type: "address" }, { indexed: true, internalType: "address", name: "newOwner", type: "address" }], name: "OwnershipTransferred", type: "event" }, { inputs: [], name: "VERSION", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" }, { inputs: [], name: "acceptOwnership", outputs: [], stateMutability: "nonpayable", type: "function" }, { inputs: [], name: "getDefaultIdType", outputs: [{ internalType: "bytes2", name: "", type: "bytes2" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "uint256", name: "id", type: "uint256" }], name: "getGISTProof", outputs: [{ components: [{ internalType: "uint256", name: "root", type: "uint256" }, { internalType: "bool", name: "existence", type: "bool" }, { internalType: "uint256[64]", name: "siblings", type: "uint256[64]" }, { internalType: "uint256", name: "index", type: "uint256" }, { internalType: "uint256", name: "value", type: "uint256" }, { internalType: "bool", name: "auxExistence", type: "bool" }, { internalType: "uint256", name: "auxIndex", type: "uint256" }, { internalType: "uint256", name: "auxValue", type: "uint256" }], internalType: "structIState.GistProof", name: "", type: "tuple" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "uint256", name: "id", type: "uint256" }, { internalType: "uint256", name: "blockNumber", type: "uint256" }], name: "getGISTProofByBlock", outputs: [{ components: [{ internalType: "uint256", name: "root", type: "uint256" }, { internalType: "bool", name: "existence", type: "bool" }, { internalType: "uint256[64]", name: "siblings", type: "uint256[64]" }, { internalType: "uint256", name: "index", type: "uint256" }, { internalType: "uint256", name: "value", type: "uint256" }, { internalType: "bool", name: "auxExistence", type: "bool" }, { internalType: "uint256", name: "auxIndex", type: "uint256" }, { internalType: "uint256", name: "auxValue", type: "uint256" }], internalType: "structIState.GistProof", name: "", type: "tuple" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "uint256", name: "id", type: "uint256" }, { internalType: "uint256", name: "root", type: "uint256" }], name: "getGISTProofByRoot", outputs: [{ components: [{ internalType: "uint256", name: "root", type: "uint256" }, { internalType: "bool", name: "existence", type: "bool" }, { internalType: "uint256[64]", name: "siblings", type: "uint256[64]" }, { internalType: "uint256", name: "index", type: "uint256" }, { internalType: "uint256", name: "value", type: "uint256" }, { internalType: "bool", name: "auxExistence", type: "bool" }, { internalType: "uint256", name: "auxIndex", type: "uint256" }, { internalType: "uint256", name: "auxValue", type: "uint256" }], internalType: "structIState.GistProof", name: "", type: "tuple" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "uint256", name: "id", type: "uint256" }, { internalType: "uint256", name: "timestamp", type: "uint256" }], name: "getGISTProofByTime", outputs: [{ components: [{ internalType: "uint256", name: "root", type: "uint256" }, { internalType: "bool", name: "existence", type: "bool" }, { internalType: "uint256[64]", name: "siblings", type: "uint256[64]" }, { internalType: "uint256", name: "index", type: "uint256" }, { internalType: "uint256", name: "value", type: "uint256" }, { internalType: "bool", name: "auxExistence", type: "bool" }, { internalType: "uint256", name: "auxIndex", type: "uint256" }, { internalType: "uint256", name: "auxValue", type: "uint256" }], internalType: "structIState.GistProof", name: "", type: "tuple" }], stateMutability: "view", type: "function" }, { inputs: [], name: "getGISTRoot", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "uint256", name: "start", type: "uint256" }, { internalType: "uint256", name: "length", type: "uint256" }], name: "getGISTRootHistory", outputs: [{ components: [{ internalType: "uint256", name: "root", type: "uint256" }, { internalType: "uint256", name: "replacedByRoot", type: "uint256" }, { internalType: "uint256", name: "createdAtTimestamp", type: "uint256" }, { internalType: "uint256", name: "replacedAtTimestamp", type: "uint256" }, { internalType: "uint256", name: "createdAtBlock", type: "uint256" }, { internalType: "uint256", name: "replacedAtBlock", type: "uint256" }], internalType: "structIState.GistRootInfo[]", name: "", type: "tuple[]" }], stateMutability: "view", type: "function" }, { inputs: [], name: "getGISTRootHistoryLength", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "uint256", name: "root", type: "uint256" }], name: "getGISTRootInfo", outputs: [{ components: [{ internalType: "uint256", name: "root", type: "uint256" }, { internalType: "uint256", name: "replacedByRoot", type: "uint256" }, { internalType: "uint256", name: "createdAtTimestamp", type: "uint256" }, { internalType: "uint256", name: "replacedAtTimestamp", type: "uint256" }, { internalType: "uint256", name: "createdAtBlock", type: "uint256" }, { internalType: "uint256", name: "replacedAtBlock", type: "uint256" }], internalType: "structIState.GistRootInfo", name: "", type: "tuple" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "uint256", name: "blockNumber", type: "uint256" }], name: "getGISTRootInfoByBlock", outputs: [{ components: [{ internalType: "uint256", name: "root", type: "uint256" }, { internalType: "uint256", name: "replacedByRoot", type: "uint256" }, { internalType: "uint256", name: "createdAtTimestamp", type: "uint256" }, { internalType: "uint256", name: "replacedAtTimestamp", type: "uint256" }, { internalType: "uint256", name: "createdAtBlock", type: "uint256" }, { internalType: "uint256", name: "replacedAtBlock", type: "uint256" }], internalType: "structIState.GistRootInfo", name: "", type: "tuple" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "uint256", name: "timestamp", type: "uint256" }], name: "getGISTRootInfoByTime", outputs: [{ components: [{ internalType: "uint256", name: "root", type: "uint256" }, { internalType: "uint256", name: "replacedByRoot", type: "uint256" }, { internalType: "uint256", name: "createdAtTimestamp", type: "uint256" }, { internalType: "uint256", name: "replacedAtTimestamp", type: "uint256" }, { internalType: "uint256", name: "createdAtBlock", type: "uint256" }, { internalType: "uint256", name: "replacedAtBlock", type: "uint256" }], internalType: "structIState.GistRootInfo", name: "", type: "tuple" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "uint256", name: "id", type: "uint256" }], name: "getStateInfoById", outputs: [{ components: [{ internalType: "uint256", name: "id", type: "uint256" }, { internalType: "uint256", name: "state", type: "uint256" }, { internalType: "uint256", name: "replacedByState", type: "uint256" }, { internalType: "uint256", name: "createdAtTimestamp", type: "uint256" }, { internalType: "uint256", name: "replacedAtTimestamp", type: "uint256" }, { internalType: "uint256", name: "createdAtBlock", type: "uint256" }, { internalType: "uint256", name: "replacedAtBlock", type: "uint256" }], internalType: "structIState.StateInfo", name: "", type: "tuple" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "uint256", name: "id", type: "uint256" }, { internalType: "uint256", name: "state", type: "uint256" }], name: "getStateInfoByIdAndState", outputs: [{ components: [{ internalType: "uint256", name: "id", type: "uint256" }, { internalType: "uint256", name: "state", type: "uint256" }, { internalType: "uint256", name: "replacedByState", type: "uint256" }, { internalType: "uint256", name: "createdAtTimestamp", type: "uint256" }, { internalType: "uint256", name: "replacedAtTimestamp", type: "uint256" }, { internalType: "uint256", name: "createdAtBlock", type: "uint256" }, { internalType: "uint256", name: "replacedAtBlock", type: "uint256" }], internalType: "structIState.StateInfo", name: "", type: "tuple" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "uint256", name: "id", type: "uint256" }, { internalType: "uint256", name: "startIndex", type: "uint256" }, { internalType: "uint256", name: "length", type: "uint256" }], name: "getStateInfoHistoryById", outputs: [{ components: [{ internalType: "uint256", name: "id", type: "uint256" }, { internalType: "uint256", name: "state", type: "uint256" }, { internalType: "uint256", name: "replacedByState", type: "uint256" }, { internalType: "uint256", name: "createdAtTimestamp", type: "uint256" }, { internalType: "uint256", name: "replacedAtTimestamp", type: "uint256" }, { internalType: "uint256", name: "createdAtBlock", type: "uint256" }, { internalType: "uint256", name: "replacedAtBlock", type: "uint256" }], internalType: "structIState.StateInfo[]", name: "", type: "tuple[]" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "uint256", name: "id", type: "uint256" }], name: "getStateInfoHistoryLengthById", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }, { inputs: [], name: "getVerifier", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "uint256", name: "id", type: "uint256" }], name: "idExists", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "contractIStateTransitionVerifier", name: "verifierContractAddr", type: "address" }, { internalType: "bytes2", name: "defaultIdType", type: "bytes2" }], name: "initialize", outputs: [], stateMutability: "nonpayable", type: "function" }, { inputs: [], name: "owner", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" }, { inputs: [], name: "pendingOwner", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" }, { inputs: [], name: "renounceOwnership", outputs: [], stateMutability: "nonpayable", type: "function" }, { inputs: [{ internalType: "bytes2", name: "defaultIdType", type: "bytes2" }], name: "setDefaultIdType", outputs: [], stateMutability: "nonpayable", type: "function" }, { inputs: [{ internalType: "address", name: "newVerifierAddr", type: "address" }], name: "setVerifier", outputs: [], stateMutability: "nonpayable", type: "function" }, { inputs: [{ internalType: "uint256", name: "id", type: "uint256" }, { internalType: "uint256", name: "state", type: "uint256" }], name: "stateExists", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "address", name: "newOwner", type: "address" }], name: "transferOwnership", outputs: [], stateMutability: "nonpayable", type: "function" }, { inputs: [{ internalType: "uint256", name: "id", type: "uint256" }, { internalType: "uint256", name: "oldState", type: "uint256" }, { internalType: "uint256", name: "newState", type: "uint256" }, { internalType: "bool", name: "isOldStateGenesis", type: "bool" }, { internalType: "uint256[2]", name: "a", type: "uint256[2]" }, { internalType: "uint256[2][2]", name: "b", type: "uint256[2][2]" }, { internalType: "uint256[2]", name: "c", type: "uint256[2]" }], name: "transitState", outputs: [], stateMutability: "nonpayable", type: "function" }, { inputs: [{ internalType: "uint256", name: "id", type: "uint256" }, { internalType: "uint256", name: "oldState", type: "uint256" }, { internalType: "uint256", name: "newState", type: "uint256" }, { internalType: "bool", name: "isOldStateGenesis", type: "bool" }, { internalType: "uint256", name: "methodId", type: "uint256" }, { internalType: "bytes", name: "methodParams", type: "bytes" }], name: "transitStateGeneric", outputs: [], stateMutability: "nonpayable", type: "function" }];

// src/storage/blockchain/state.ts
var import_js_iden3_core33 = require("@iden3/js-iden3-core");

// src/blockchain/transaction-service.ts
var TransactionService = class {
  /**
   * Creates an instance of TransactionService.
   * @param {JsonRpcProvider} - RPC provider
   */
  constructor(_provider) {
    this._provider = _provider;
  }
  /** {@inheritDoc ITransactionService.getTransactionReceiptAndBlock} */
  async getTransactionReceiptAndBlock(txnHash) {
    const receipt = await this._provider.getTransactionReceipt(txnHash);
    const block = await receipt?.getBlock();
    return { receipt: receipt || void 0, block };
  }
  /** {@inheritDoc ITransactionService.sendTransactionRequest} */
  async sendTransactionRequest(signer, request) {
    const tx = await signer.sendTransaction(request);
    const txnReceipt = await tx.wait();
    if (!txnReceipt) {
      throw new Error(`transaction: ${tx.hash} failed to mined`);
    }
    const status = txnReceipt.status;
    const txnHash = txnReceipt.hash;
    if (!status) {
      throw new Error(`transaction: ${txnHash} failed to mined`);
    }
    return { txnHash, txnReceipt };
  }
  /** {@inheritDoc ITransactionService.resendTransaction} */
  async resendTransaction(signer, request, opts) {
    const feeData = await this._provider.getFeeData();
    let { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = feeData;
    if (opts?.increasedFeesPercentage) {
      const multiplyVal = BigInt((opts.increasedFeesPercentage + 100) / 100);
      maxFeePerGas = maxFeePerGas ? maxFeePerGas * multiplyVal : null;
      maxPriorityFeePerGas = maxPriorityFeePerGas ? maxPriorityFeePerGas * multiplyVal : null;
      gasPrice = gasPrice ? gasPrice * multiplyVal : null;
    }
    request.maxFeePerGas = maxFeePerGas;
    request.maxPriorityFeePerGas = maxPriorityFeePerGas;
    request.gasPrice = gasPrice;
    return this.sendTransactionRequest(signer, request);
  }
};

// src/storage/blockchain/common.ts
var import_ethers5 = require("ethers");
var packZkpProof = (inputs, a, b, c) => {
  return new import_ethers5.ethers.AbiCoder().encode(
    ["uint256[] inputs", "uint256[2]", "uint256[2][2]", "uint256[2]"],
    [inputs, a, b, c]
  );
};
var prepareZkpProof = (proof) => {
  return {
    a: proof.pi_a.slice(0, 2),
    b: [
      [proof.pi_b[0][1], proof.pi_b[0][0]],
      [proof.pi_b[1][1], proof.pi_b[1][0]]
    ],
    c: proof.pi_c.slice(0, 2)
  };
};

// src/storage/memory/merkletree.ts
var import_js_merkletree15 = require("@iden3/js-merkletree");
var uuid = __toESM(require("uuid"), 1);

// src/storage/entities/mt.ts
var MerkleTreeType = /* @__PURE__ */ ((MerkleTreeType2) => {
  MerkleTreeType2[MerkleTreeType2["Claims"] = 0] = "Claims";
  MerkleTreeType2[MerkleTreeType2["Revocations"] = 1] = "Revocations";
  MerkleTreeType2[MerkleTreeType2["Roots"] = 2] = "Roots";
  return MerkleTreeType2;
})(MerkleTreeType || {});

// src/storage/utils.ts
var import_ethers6 = require("ethers");
var import_canonicalize = __toESM(require("canonicalize"), 1);
var MERKLE_TREE_TYPES = [
  0 /* Claims */,
  1 /* Revocations */,
  2 /* Roots */
];
var createMerkleTreeMetaInfo = (identifier) => {
  const treesMeta = [];
  for (let index = 0; index < MERKLE_TREE_TYPES.length; index++) {
    const mType = MERKLE_TREE_TYPES[index];
    const treeId = `${identifier}+${mType}`;
    treesMeta.push({ treeId, identifier, type: mType });
  }
  return treesMeta;
};
var CACHE_KEY_VERSION = /* @__PURE__ */ ((CACHE_KEY_VERSION2) => {
  CACHE_KEY_VERSION2["V1"] = "v1";
  return CACHE_KEY_VERSION2;
})(CACHE_KEY_VERSION || {});
var createZkpRequestCacheKey = (version, profileDID, r, credId) => {
  const payload = {
    ...r,
    query: {
      ...r.query,
      allowedIssuers: [...r.query?.allowedIssuers ?? []].sort()
    }
  };
  const canonical = (0, import_canonicalize.default)(payload);
  if (!canonical) {
    throw new Error("Failed to canonicalize ZKP request");
  }
  const requestCanonicalBytes = byteEncoder.encode(canonical);
  return `${version}:${profileDID.string()}:${credId}:${(0, import_ethers6.sha256)(requestCanonicalBytes)}`;
};

// src/storage/memory/merkletree.ts
var InMemoryMerkleTreeStorage = class {
  /**
   * key value storage for trees where key is identifier
   *
   * @type {{
   *     [v in string]: TreeWithMetaInfo[];
   *   }}
   */
  _data;
  /**
   * tree depth
   *
   * @type {number}
   */
  mtDepth;
  /**
   * Creates an instance of InMemoryMerkleTreeStorage.
   * @param {number} _mtDepth
   */
  constructor(_mtDepth) {
    this.mtDepth = _mtDepth;
    this._data = {};
  }
  /** create trees in the  memory*/
  async createIdentityMerkleTrees(identifier) {
    if (!identifier) {
      identifier = `${uuid.v4()}`;
    }
    if (this._data[identifier]) {
      throw new Error(
        `Present merkle tree meta information in the store for current identifier ${identifier}`
      );
    }
    this._data[identifier] = [];
    const treesMeta = [];
    MERKLE_TREE_TYPES.forEach((t) => {
      const treeId = identifier.concat("+" + t.toString());
      const tree = new import_js_merkletree15.Merkletree(new import_js_merkletree15.InMemoryDB((0, import_js_merkletree15.str2Bytes)(treeId)), true, this.mtDepth);
      const metaInfo = { treeId, identifier, type: t };
      this._data[identifier].push({ tree, metaInfo });
      treesMeta.push(metaInfo);
    });
    return treesMeta;
  }
  /** get trees meta info from the memory */
  async getIdentityMerkleTreesInfo(identifier) {
    return this._data[identifier].map((treeWithInfo) => treeWithInfo.metaInfo);
  }
  /** get merkle tree by identifier and type from memory */
  async getMerkleTreeByIdentifierAndType(identifier, mtType) {
    const treeWithMeta = this._data[identifier].find(
      (treeWithInfo) => treeWithInfo.metaInfo.type == mtType
    );
    if (!treeWithMeta) {
      throw new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
    }
    return treeWithMeta.tree;
  }
  /** adds entry to merkle tree in the memory */
  async addToMerkleTree(identifier, mtType, hindex, hvalue) {
    for (let index = 0; index < this._data[identifier].length; index++) {
      if (this._data[identifier][index].metaInfo.type === mtType) {
        await this._data[identifier][index].tree.add(hindex, hvalue);
      }
    }
  }
  /** bind merkle tree identifier in memory */
  async bindMerkleTreeToNewIdentifier(oldIdentifier, newIdentifier) {
    this._data[newIdentifier] = [...this._data[oldIdentifier]];
    delete this._data[oldIdentifier];
    this._data[newIdentifier].forEach((treeWithMeta) => {
      treeWithMeta.metaInfo.identifier = newIdentifier;
    });
  }
};

// src/storage/memory/data-source.ts
var InMemoryDataSource = class {
  _data = [];
  /** saves in the memory */
  async save(key, value, keyName = "id") {
    const itemIndex = this._data.findIndex((i) => i[keyName] === key);
    if (itemIndex === -1) {
      this._data.push(value);
    } else {
      this._data[itemIndex] = value;
    }
  }
  /** gets value from from the memory */
  async get(key, keyName = "id") {
    return this._data.find((t) => t[keyName] === key);
  }
  /** loads from value from the memory */
  async load() {
    return this._data;
  }
  /** deletes from value from the memory */
  async delete(key, keyName = "id") {
    const newData = this._data.filter((i) => i[keyName] !== key);
    if (newData.length === this._data.length) {
      throw new Error(`${"item not found" /* ItemNotFound */} to delete: ${key}`);
    }
    this._data = newData;
  }
};

// node_modules/quick-lru/index.js
var QuickLRU = class extends Map {
  #size = 0;
  #cache = /* @__PURE__ */ new Map();
  #oldCache = /* @__PURE__ */ new Map();
  #maxSize;
  #maxAge;
  #onEviction;
  constructor(options = {}) {
    super();
    if (!(options.maxSize && options.maxSize > 0)) {
      throw new TypeError("`maxSize` must be a number greater than 0");
    }
    if (typeof options.maxAge === "number" && options.maxAge === 0) {
      throw new TypeError("`maxAge` must be a number greater than 0");
    }
    this.#maxSize = options.maxSize;
    this.#maxAge = options.maxAge || Number.POSITIVE_INFINITY;
    this.#onEviction = options.onEviction;
  }
  // For tests.
  get __oldCache() {
    return this.#oldCache;
  }
  #emitEvictions(cache) {
    if (typeof this.#onEviction !== "function") {
      return;
    }
    for (const [key, item] of cache) {
      this.#onEviction(key, item.value);
    }
  }
  #deleteIfExpired(key, item) {
    if (typeof item.expiry === "number" && item.expiry <= Date.now()) {
      if (typeof this.#onEviction === "function") {
        this.#onEviction(key, item.value);
      }
      return this.delete(key);
    }
    return false;
  }
  #getOrDeleteIfExpired(key, item) {
    const deleted = this.#deleteIfExpired(key, item);
    if (deleted === false) {
      return item.value;
    }
  }
  #getItemValue(key, item) {
    return item.expiry ? this.#getOrDeleteIfExpired(key, item) : item.value;
  }
  #peek(key, cache) {
    const item = cache.get(key);
    return this.#getItemValue(key, item);
  }
  #set(key, value) {
    this.#cache.set(key, value);
    this.#size++;
    if (this.#size >= this.#maxSize) {
      this.#size = 0;
      this.#emitEvictions(this.#oldCache);
      this.#oldCache = this.#cache;
      this.#cache = /* @__PURE__ */ new Map();
    }
  }
  #moveToRecent(key, item) {
    this.#oldCache.delete(key);
    this.#set(key, item);
  }
  *#entriesAscending() {
    for (const item of this.#oldCache) {
      const [key, value] = item;
      if (!this.#cache.has(key)) {
        const deleted = this.#deleteIfExpired(key, value);
        if (deleted === false) {
          yield item;
        }
      }
    }
    for (const item of this.#cache) {
      const [key, value] = item;
      const deleted = this.#deleteIfExpired(key, value);
      if (deleted === false) {
        yield item;
      }
    }
  }
  get(key) {
    if (this.#cache.has(key)) {
      const item = this.#cache.get(key);
      return this.#getItemValue(key, item);
    }
    if (this.#oldCache.has(key)) {
      const item = this.#oldCache.get(key);
      if (this.#deleteIfExpired(key, item) === false) {
        this.#moveToRecent(key, item);
        return item.value;
      }
    }
  }
  set(key, value, { maxAge = this.#maxAge } = {}) {
    const expiry = typeof maxAge === "number" && maxAge !== Number.POSITIVE_INFINITY ? Date.now() + maxAge : void 0;
    if (this.#cache.has(key)) {
      this.#cache.set(key, {
        value,
        expiry
      });
    } else {
      this.#set(key, { value, expiry });
    }
    return this;
  }
  has(key) {
    if (this.#cache.has(key)) {
      return !this.#deleteIfExpired(key, this.#cache.get(key));
    }
    if (this.#oldCache.has(key)) {
      return !this.#deleteIfExpired(key, this.#oldCache.get(key));
    }
    return false;
  }
  peek(key) {
    if (this.#cache.has(key)) {
      return this.#peek(key, this.#cache);
    }
    if (this.#oldCache.has(key)) {
      return this.#peek(key, this.#oldCache);
    }
  }
  delete(key) {
    const deleted = this.#cache.delete(key);
    if (deleted) {
      this.#size--;
    }
    return this.#oldCache.delete(key) || deleted;
  }
  clear() {
    this.#cache.clear();
    this.#oldCache.clear();
    this.#size = 0;
  }
  resize(newSize) {
    if (!(newSize && newSize > 0)) {
      throw new TypeError("`maxSize` must be a number greater than 0");
    }
    const items = [...this.#entriesAscending()];
    const removeCount = items.length - newSize;
    if (removeCount < 0) {
      this.#cache = new Map(items);
      this.#oldCache = /* @__PURE__ */ new Map();
      this.#size = items.length;
    } else {
      if (removeCount > 0) {
        this.#emitEvictions(items.slice(0, removeCount));
      }
      this.#oldCache = new Map(items.slice(removeCount));
      this.#cache = /* @__PURE__ */ new Map();
      this.#size = 0;
    }
    this.#maxSize = newSize;
  }
  *keys() {
    for (const [key] of this) {
      yield key;
    }
  }
  *values() {
    for (const [, value] of this) {
      yield value;
    }
  }
  *[Symbol.iterator]() {
    for (const item of this.#cache) {
      const [key, value] = item;
      const deleted = this.#deleteIfExpired(key, value);
      if (deleted === false) {
        yield [key, value.value];
      }
    }
    for (const item of this.#oldCache) {
      const [key, value] = item;
      if (!this.#cache.has(key)) {
        const deleted = this.#deleteIfExpired(key, value);
        if (deleted === false) {
          yield [key, value.value];
        }
      }
    }
  }
  *entriesDescending() {
    let items = [...this.#cache];
    for (let i = items.length - 1; i >= 0; --i) {
      const item = items[i];
      const [key, value] = item;
      const deleted = this.#deleteIfExpired(key, value);
      if (deleted === false) {
        yield [key, value.value];
      }
    }
    items = [...this.#oldCache];
    for (let i = items.length - 1; i >= 0; --i) {
      const item = items[i];
      const [key, value] = item;
      if (!this.#cache.has(key)) {
        const deleted = this.#deleteIfExpired(key, value);
        if (deleted === false) {
          yield [key, value.value];
        }
      }
    }
  }
  *entriesAscending() {
    for (const [key, value] of this.#entriesAscending()) {
      yield [key, value.value];
    }
  }
  get size() {
    if (!this.#size) {
      return this.#oldCache.size;
    }
    let oldCacheSize = 0;
    for (const key of this.#oldCache.keys()) {
      if (!this.#cache.has(key)) {
        oldCacheSize++;
      }
    }
    return Math.min(this.#size + oldCacheSize, this.#maxSize);
  }
  get maxSize() {
    return this.#maxSize;
  }
  entries() {
    return this.entriesAscending();
  }
  forEach(callbackFunction, thisArgument = this) {
    for (const [key, value] of this.entriesAscending()) {
      callbackFunction.call(thisArgument, value, key, this);
    }
  }
  get [Symbol.toStringTag]() {
    return "QuickLRU";
  }
  toString() {
    return `QuickLRU(${this.size}/${this.maxSize})`;
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toString();
  }
};

// src/storage/memory/cache-lru.ts
function createInMemoryCache(params) {
  const cache = new QuickLRU({ maxSize: params.maxSize, maxAge: params.ttl });
  return {
    get: async (key) => {
      return cache.get(key);
    },
    set: async (key, value, ttl) => {
      cache.set(key, value, { maxAge: ttl ?? params.ttl });
    },
    clear: async () => {
      cache.clear();
    },
    delete: async (key) => {
      cache.delete(key);
    }
  };
}

// src/iden3comm/constants.ts
var constants_exports = {};
__export(constants_exports, {
  AcceptAuthCircuits: () => AcceptAuthCircuits,
  AcceptJweKEKAlgorithms: () => AcceptJweKEKAlgorithms,
  AcceptJwsAlgorithms: () => AcceptJwsAlgorithms,
  AcceptJwzAlgorithms: () => AcceptJwzAlgorithms,
  CEKEncryption: () => CEKEncryption,
  DEFAULT_AUTH_VERIFY_DELAY: () => DEFAULT_AUTH_VERIFY_DELAY,
  DEFAULT_PROOF_VERIFY_DELAY: () => DEFAULT_PROOF_VERIFY_DELAY,
  MEDIA_TYPE_TO_CONTENT_TYPE: () => MEDIA_TYPE_TO_CONTENT_TYPE,
  MediaType: () => MediaType,
  PROTOCOL_MESSAGE_TYPE: () => PROTOCOL_MESSAGE_TYPE,
  ProtocolVersion: () => ProtocolVersion,
  SUPPORTED_PUBLIC_KEY_TYPES: () => SUPPORTED_PUBLIC_KEY_TYPES,
  defaultAcceptProfile: () => defaultAcceptProfile
});
var IDEN3_PROTOCOL = "https://iden3-communication.io/";
var DIDCOMM_PROTOCOL = "https://didcomm.org/";
var PROTOCOL_MESSAGE_TYPE = Object.freeze({
  // AuthorizationV2RequestMessageType defines auth request type of the communication protocol
  AUTHORIZATION_REQUEST_MESSAGE_TYPE: `${IDEN3_PROTOCOL}authorization/1.0/request`,
  // AuthorizationResponseMessageType defines auth response type of the communication protocol
  AUTHORIZATION_RESPONSE_MESSAGE_TYPE: `${IDEN3_PROTOCOL}authorization/1.0/response`,
  // CredentialIssuanceRequestMessageType accepts request for credential creation
  CREDENTIAL_ISSUANCE_REQUEST_MESSAGE_TYPE: `${IDEN3_PROTOCOL}credentials/1.0/issuance-request`,
  // CredentialFetchRequestMessageType is type for request of credential generation
  CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE: `${IDEN3_PROTOCOL}credentials/1.0/fetch-request`,
  // CredentialOfferMessageType is type of message with credential offering
  CREDENTIAL_OFFER_MESSAGE_TYPE: `${IDEN3_PROTOCOL}credentials/1.0/offer`,
  // CredentialIssuanceResponseMessageType is type for message with a credential issuance
  CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE: `${IDEN3_PROTOCOL}credentials/1.0/issuance-response`,
  // CredentialRefreshMessageType is type for message with a credential issuance
  CREDENTIAL_REFRESH_MESSAGE_TYPE: `${IDEN3_PROTOCOL}credentials/1.0/refresh`,
  // DeviceRegistrationRequestMessageType defines device registration request type of the communication protocol
  DEVICE_REGISTRATION_REQUEST_MESSAGE_TYPE: `${IDEN3_PROTOCOL}devices/1.0/registration`,
  // MessageFetMessageFetchRequestMessageType defines message fetch request type of the communication protocol.
  MESSAGE_FETCH_REQUEST_MESSAGE_TYPE: `${IDEN3_PROTOCOL}messages/1.0/fetch`,
  // ProofGenerationRequestMessageType is type for request of proof generation
  PROOF_GENERATION_REQUEST_MESSAGE_TYPE: `${IDEN3_PROTOCOL}proofs/1.0/request`,
  // ProofGenerationResponseMessageType is type for response of proof generation
  PROOF_GENERATION_RESPONSE_MESSAGE_TYPE: `${IDEN3_PROTOCOL}proofs/1.0/response`,
  // RevocationStatusRequestMessageType is type for request of revocation status
  REVOCATION_STATUS_REQUEST_MESSAGE_TYPE: `${IDEN3_PROTOCOL}revocation/1.0/request-status`,
  // RevocationStatusResponseMessageType is type for response with a revocation status
  REVOCATION_STATUS_RESPONSE_MESSAGE_TYPE: `${IDEN3_PROTOCOL}revocation/1.0/status`,
  // ContractInvokeRequestMessageType is type for request of contract invoke request
  CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE: `${IDEN3_PROTOCOL}proofs/1.0/contract-invoke-request`,
  // ContractInvokeResponseMessageType is type for response of contract invoke request
  CONTRACT_INVOKE_RESPONSE_MESSAGE_TYPE: `${IDEN3_PROTOCOL}proofs/1.0/contract-invoke-response`,
  // CredentialOnchainOfferMessageType is type of message with credential onchain offering
  CREDENTIAL_ONCHAIN_OFFER_MESSAGE_TYPE: `${IDEN3_PROTOCOL}credentials/1.0/onchain-offer`,
  // ProposalRequestMessageType is type for proposal-request message
  PROPOSAL_REQUEST_MESSAGE_TYPE: `${IDEN3_PROTOCOL}credentials/0.1/proposal-request`,
  // ProposalMessageType is type for proposal message
  PROPOSAL_MESSAGE_TYPE: `${IDEN3_PROTOCOL}credentials/0.1/proposal`,
  // PaymentRequestMessageType is type for payment-request message
  PAYMENT_REQUEST_MESSAGE_TYPE: `${IDEN3_PROTOCOL}credentials/0.1/payment-request`,
  // PaymentMessageType is type for payment message
  PAYMENT_MESSAGE_TYPE: `${IDEN3_PROTOCOL}credentials/0.1/payment`,
  // DiscoveryProtocolQueriesMessageType is type for didcomm discovery protocol queries
  DISCOVERY_PROTOCOL_QUERIES_MESSAGE_TYPE: `${DIDCOMM_PROTOCOL}discover-features/2.0/queries`,
  // DiscoveryProtocolDiscloseMessageType is type for didcomm discovery protocol disclose
  DISCOVERY_PROTOCOL_DISCLOSE_MESSAGE_TYPE: `${DIDCOMM_PROTOCOL}discover-features/2.0/disclose`,
  // ProblemReportMessageType is type for didcomm problem report
  PROBLEM_REPORT_MESSAGE_TYPE: `${DIDCOMM_PROTOCOL}report-problem/2.0/problem-report`,
  /** 
    @beta
    EncryptedCredentialIssuanceResponseMessageType is type for encrypted credential issuance
  */
  ENCRYPTED_CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE: `${IDEN3_PROTOCOL}credentials/0.1/encrypted-issuance-response`
});
var MediaType = /* @__PURE__ */ ((MediaType2) => {
  MediaType2["ZKPMessage"] = "application/iden3-zkp-json";
  MediaType2["PlainMessage"] = "application/iden3comm-plain-json";
  MediaType2["SignedMessage"] = "application/iden3comm-signed-json";
  MediaType2["EncryptedMessage"] = "application/iden3comm-encrypted-json";
  return MediaType2;
})(MediaType || {});
var MEDIA_TYPE_TO_CONTENT_TYPE = {
  ["application/iden3-zkp-json" /* ZKPMessage */]: "text/plain",
  ["application/iden3comm-plain-json" /* PlainMessage */]: "application/json",
  ["application/iden3comm-signed-json" /* SignedMessage */]: "text/plain",
  ["application/iden3comm-encrypted-json" /* EncryptedMessage */]: "application/json"
};
var SUPPORTED_PUBLIC_KEY_TYPES = {
  ES256K: [
    "EcdsaSecp256k1VerificationKey2019",
    /**
     * Equivalent to EcdsaSecp256k1VerificationKey2019 when key is an ethereumAddress
     */
    "EcdsaSecp256k1RecoveryMethod2020",
    "JsonWebKey2020"
  ],
  "ES256K-R": [
    "EcdsaSecp256k1VerificationKey2019",
    /**
     * Equivalent to EcdsaSecp256k1VerificationKey2019 when key is an ethereumAddress
     */
    "EcdsaSecp256k1RecoveryMethod2020",
    "JsonWebKey2020"
  ]
};
var ProtocolVersion = /* @__PURE__ */ ((ProtocolVersion2) => {
  ProtocolVersion2["V1"] = "iden3comm/v1";
  return ProtocolVersion2;
})(ProtocolVersion || {});
var AcceptAuthCircuits = /* @__PURE__ */ ((AcceptAuthCircuits2) => {
  AcceptAuthCircuits2["AuthV2"] = "authV2";
  AcceptAuthCircuits2["AuthV3"] = "authV3";
  AcceptAuthCircuits2["AuthV3_8_32"] = "authV3-8-32";
  return AcceptAuthCircuits2;
})(AcceptAuthCircuits || {});
var AcceptJwzAlgorithms = /* @__PURE__ */ ((AcceptJwzAlgorithms2) => {
  AcceptJwzAlgorithms2["Groth16"] = "groth16";
  return AcceptJwzAlgorithms2;
})(AcceptJwzAlgorithms || {});
var AcceptJwsAlgorithms = /* @__PURE__ */ ((AcceptJwsAlgorithms2) => {
  AcceptJwsAlgorithms2["ES256K"] = "ES256K";
  AcceptJwsAlgorithms2["ES256KR"] = "ES256K-R";
  return AcceptJwsAlgorithms2;
})(AcceptJwsAlgorithms || {});
var AcceptJweKEKAlgorithms = /* @__PURE__ */ ((AcceptJweKEKAlgorithms2) => {
  AcceptJweKEKAlgorithms2["ECDH_ES_A256KW"] = "ECDH-ES+A256KW";
  AcceptJweKEKAlgorithms2["RSA_OAEP_256"] = "RSA-OAEP-256";
  return AcceptJweKEKAlgorithms2;
})(AcceptJweKEKAlgorithms || {});
var CEKEncryption = /* @__PURE__ */ ((CEKEncryption2) => {
  CEKEncryption2["A256GCM"] = "A256GCM";
  CEKEncryption2["A256CBC_HS512"] = "A256CBC-HS512";
  return CEKEncryption2;
})(CEKEncryption || {});
var defaultAcceptProfile = {
  protocolVersion: "iden3comm/v1" /* V1 */,
  env: "application/iden3-zkp-json" /* ZKPMessage */,
  circuits: ["authV2" /* AuthV2 */],
  alg: ["groth16" /* Groth16 */]
};
var DEFAULT_PROOF_VERIFY_DELAY = 1 * 60 * 60 * 1e3;
var DEFAULT_AUTH_VERIFY_DELAY = 5 * 60 * 1e3;

// src/storage/memory/proof-storage.ts
var InMemoryProofStorage = class {
  _cache;
  constructor(options) {
    const ttl = options?.ttl ?? DEFAULT_PROOF_VERIFY_DELAY;
    const maxSize = options?.maxSize ?? 1e3;
    this._cache = createInMemoryCache({ maxSize, ttl });
  }
  getProof(profileDID, credentialId, request) {
    return this._cache.get(
      createZkpRequestCacheKey("v1" /* V1 */, profileDID, request, credentialId)
    );
  }
  storeProof(profileDID, credentialId, request, response) {
    return this._cache.set(
      createZkpRequestCacheKey("v1" /* V1 */, profileDID, request, credentialId),
      response
    );
  }
  removeProof(profileDID, credentialId, request) {
    return this._cache.delete(
      createZkpRequestCacheKey("v1" /* V1 */, profileDID, request, credentialId)
    );
  }
};

// src/iden3comm/packageManager.ts
var PackageManager = class {
  packers;
  /**
   * Creates an instance of PackageManager.
   */
  constructor() {
    this.packers = /* @__PURE__ */ new Map();
  }
  /** {@inheritDoc IPackageManager.getSupportedProfiles} */
  getSupportedProfiles() {
    const acceptProfiles = [];
    const mediaTypes = this.getSupportedMediaTypes();
    for (const mediaType of mediaTypes) {
      const p = this.packers.get(mediaType);
      if (p) {
        acceptProfiles.push(...p.getSupportedProfiles());
      }
    }
    return [...new Set(acceptProfiles)];
  }
  /** {@inheritDoc IPackageManager.isProfileSupported} */
  isProfileSupported(mediaType, profile) {
    const p = this.packers.get(mediaType);
    if (!p) {
      return false;
    }
    return p.isProfileSupported(profile);
  }
  /** {@inheritDoc IPackageManager.getSupportedMediaTypes} */
  getSupportedMediaTypes() {
    return [...this.packers.keys()];
  }
  /** {@inheritDoc IPackageManager.registerPackers} */
  registerPackers(packers) {
    packers.forEach((p) => {
      this.packers.set(p.mediaType(), p);
    });
  }
  /** {@inheritDoc IPackageManager.pack} */
  async pack(mediaType, payload, params) {
    const p = this.packers.get(mediaType);
    if (!p) {
      throw new Error(`packer for media type ${mediaType} not found`);
    }
    return await p.pack(payload, params);
  }
  /**
   * Packs a protocol message using the specified media type and packer parameters.
   *
   * @param mediaType - The media type to use for packing the message.
   * @param protocolMessage - The protocol message to pack.
   * @param params - The packer parameters.
   * @returns A promise that resolves to the packed message as a Uint8Array.
   * @throws An error if the packer for the specified media type is not found.
   */
  packMessage(mediaType, protocolMessage, params) {
    const p = this.packers.get(mediaType);
    if (!p) {
      throw new Error(`packer for media type ${mediaType} not found`);
    }
    return p.packMessage(protocolMessage, params);
  }
  /** {@inheritDoc IPackageManager.unpack} */
  async unpack(envelope) {
    const decodedStr = byteDecoder.decode(envelope);
    const safeEnvelope = decodedStr.trim();
    const mediaType = this.getMediaType(safeEnvelope);
    return {
      unpackedMessage: await this.unpackWithSafeEnvelope(
        mediaType,
        byteEncoder.encode(safeEnvelope)
      ),
      unpackedMediaType: mediaType
    };
  }
  /** {@inheritDoc IPackageManager.unpackWithType} */
  async unpackWithType(mediaType, envelope) {
    const decoder = new TextDecoder("utf-8");
    const decodedStr = decoder.decode(envelope);
    const safeEnvelope = decodedStr.trim();
    return await this.unpackWithSafeEnvelope(mediaType, byteEncoder.encode(safeEnvelope));
  }
  async unpackWithSafeEnvelope(mediaType, envelope) {
    const p = this.packers.get(mediaType);
    if (!p) {
      throw new Error(`packer for media type ${mediaType} not found`);
    }
    const msg = await p.unpack(envelope);
    return msg;
  }
  /** {@inheritDoc IPackageManager.getMediaType} */
  getMediaType(envelope) {
    const error = new Error(`missing header 'typ' in the envelope`);
    const supportedMediaTypes = Object.values(MediaType);
    if (envelope[0] === "{") {
      const envelopeStub = JSON.parse(envelope);
      const typ2 = envelopeStub.typ;
      if (typ2 && supportedMediaTypes.includes(typ2)) {
        return typ2;
      }
      if (envelopeStub.protected) {
        const typ3 = typeof envelopeStub.protected === "string" ? JSON.parse(byteDecoder.decode(base64ToBytes(envelopeStub.protected, { loose: true })))?.typ : envelopeStub.protected.typ;
        if (typ3 && supportedMediaTypes.includes(typ3)) {
          return typ3;
        }
      }
      throw error;
    }
    const headerBase64 = envelope.split(".")[0];
    const header = JSON.parse(byteDecoder.decode(base64ToBytes(headerBase64, { loose: true })));
    const typ = header.typ;
    if (!typ || !supportedMediaTypes.includes(typ)) {
      throw error;
    }
    return typ;
  }
};

// src/iden3comm/utils/did.ts
var import_nist2 = require("@noble/curves/nist.js");
var import_js_iden3_core19 = require("@iden3/js-iden3-core");
var DIDAuthenticationSection = "authentication";
var resolveVerificationMethods = (didDocument) => {
  const vms = didDocument.verificationMethod || [];
  const sortedVerificationMethods = (didDocument[DIDAuthenticationSection] || []).map((verificationMethod) => {
    if (typeof verificationMethod === "string") {
      return vms.find((i) => i.id === verificationMethod);
    }
    return verificationMethod;
  }).filter((key) => key);
  for (let index = 0; index < vms.length; index++) {
    const id = vms[index].id;
    if (sortedVerificationMethods.findIndex((vm) => vm.id === id) === -1) {
      sortedVerificationMethods.push(vms[index]);
    }
  }
  return sortedVerificationMethods;
};
var extractPublicKeyBytes = (vm) => {
  const isSupportedVmType = Object.keys(SUPPORTED_PUBLIC_KEY_TYPES).some(
    (key) => SUPPORTED_PUBLIC_KEY_TYPES[key].includes(vm.type)
  );
  if (vm.publicKeyBase58 && isSupportedVmType) {
    return { publicKeyBytes: base58ToBytes(vm.publicKeyBase58), kmsKeyType: "Secp256k1" /* Secp256k1 */ };
  }
  if (vm.publicKeyBase64 && isSupportedVmType) {
    return {
      publicKeyBytes: base64UrlToBytes(vm.publicKeyBase64),
      kmsKeyType: "Secp256k1" /* Secp256k1 */
    };
  }
  if (vm.publicKeyHex && isSupportedVmType) {
    return { publicKeyBytes: hexToBytes(vm.publicKeyHex), kmsKeyType: "Secp256k1" /* Secp256k1 */ };
  }
  if (vm.publicKeyJwk && vm.publicKeyJwk.crv === "secp256k1" && vm.publicKeyJwk.x && vm.publicKeyJwk.y) {
    const xBytes = base64UrlToBytes(vm.publicKeyJwk.x);
    const yBytes = base64UrlToBytes(vm.publicKeyJwk.y);
    const x32 = new Uint8Array(32);
    const y32 = new Uint8Array(32);
    x32.set(xBytes, 32 - xBytes.length);
    y32.set(yBytes, 32 - yBytes.length);
    return {
      publicKeyBytes: new Uint8Array([4, ...x32, ...y32]),
      kmsKeyType: "Secp256k1" /* Secp256k1 */
    };
  }
  return { publicKeyBytes: null };
};
var toPublicKeyJwk = (keyStr, keyType) => {
  switch (keyType) {
    case "RSA-OAEP-256" /* RsaOaep256 */: {
      const pubJwk = JSON.parse(keyStr);
      return {
        kty: pubJwk.kty,
        n: pubJwk.n,
        e: pubJwk.e,
        alg: constants_exports.AcceptJweKEKAlgorithms.RSA_OAEP_256,
        ext: true
      };
    }
    case "P-384" /* P384 */: {
      const pubJwk = import_nist2.p384.Point.fromHex(keyStr);
      const coordinateByteLength = 48;
      const xBytes = import_js_iden3_core19.BytesHelper.intToNBytes(pubJwk.x, coordinateByteLength).reverse();
      const yBytes = import_js_iden3_core19.BytesHelper.intToNBytes(pubJwk.y, coordinateByteLength).reverse();
      const x = bytesToBase64url(xBytes);
      const y = bytesToBase64url(yBytes);
      return {
        kty: "EC",
        crv: "P-384",
        alg: constants_exports.AcceptJweKEKAlgorithms.ECDH_ES_A256KW,
        x,
        y,
        ext: true
      };
    }
    default:
      throw new Error(
        `Unsupported key type: ${keyType}. Supported key types ${"RSA-OAEP-256" /* RsaOaep256 */}, ${"P-384" /* P384 */}`
      );
  }
};

// src/iden3comm/utils/accept-profile.ts
function isProtocolVersion(value) {
  return Object.values(ProtocolVersion).includes(value);
}
function isMediaType(value) {
  return Object.values(MediaType).includes(value);
}
function isAcceptAuthCircuits(value) {
  return Object.values(AcceptAuthCircuits).includes(value);
}
function isAcceptJwsAlgorithms(value) {
  return Object.values(AcceptJwsAlgorithms).includes(value);
}
function isAcceptJwzAlgorithms(value) {
  return Object.values(AcceptJwzAlgorithms).includes(value);
}
var buildAcceptFromProvingMethodAlg = (provingMethodAlg) => {
  const [alg, circuitId] = provingMethodAlg.toString().split(":");
  return `${"iden3comm/v1" /* V1 */};env=${"application/iden3-zkp-json" /* ZKPMessage */};circuitId=${circuitId};alg=${alg}`;
};
var acceptHasProvingMethodAlg = (accept, provingMethodAlg) => {
  const [provingAlg, provingCircuitId] = provingMethodAlg.toString().split(":");
  for (const profile of accept) {
    const { env, circuits, alg } = parseAcceptProfile(profile);
    if (env === "application/iden3-zkp-json" /* ZKPMessage */ && circuits?.includes(provingCircuitId) && (!alg || alg?.includes(provingAlg))) {
      return true;
    }
  }
  return false;
};
function isAcceptJweAlgorithms(value) {
  return Object.values(AcceptJweKEKAlgorithms).includes(value);
}
var buildAccept = (profiles) => {
  const result = [];
  for (const profile of profiles) {
    let accept = `${profile.protocolVersion};env=${profile.env}`;
    if (profile.circuits?.length) {
      accept += `;circuitId=${profile.circuits.join(",")}`;
    }
    if (profile.alg?.length) {
      accept += `;alg=${profile.alg.join(",")}`;
    }
    result.push(accept);
  }
  return result;
};
var parseAcceptProfile = (profile) => {
  const params = profile.split(";");
  if (params.length < 2) {
    throw new Error("Invalid accept profile");
  }
  const protocolVersion = params[0].trim();
  if (!isProtocolVersion(protocolVersion)) {
    throw new Error(`Protocol version '${protocolVersion}' not supported`);
  }
  const envParam = params[1].split("=");
  if (envParam.length !== 2) {
    throw new Error(`Invalid accept profile 'env' parameter`);
  }
  const env = params[1].split("=")[1].trim();
  if (!isMediaType(env)) {
    throw new Error(`Envelop '${env}' not supported`);
  }
  const circuitsIndex = params.findIndex((i) => i.includes("circuitId="));
  if (env !== "application/iden3-zkp-json" /* ZKPMessage */ && circuitsIndex > 0) {
    throw new Error(`Circuits not supported for env '${env}'`);
  }
  let circuits = void 0;
  if (circuitsIndex > 0) {
    circuits = params[circuitsIndex].split("=")[1].split(",").map((i) => i.trim()).map((i) => {
      if (!isAcceptAuthCircuits(i)) {
        throw new Error(`Circuit '${i}' not supported`);
      }
      return i;
    });
  }
  const algIndex = params.findIndex((i) => i.includes("alg="));
  if (algIndex === -1) {
    return {
      protocolVersion,
      env,
      circuits,
      alg: void 0
    };
  }
  const algValues = params[algIndex].split("=")[1].split(",").map((i) => i.trim());
  let alg = [];
  switch (env) {
    case "application/iden3-zkp-json" /* ZKPMessage */:
      alg = algValues.map((i) => {
        if (!isAcceptJwzAlgorithms(i)) {
          throw new Error(`Algorithm '${i}' not supported for '${env}'`);
        }
        return i;
      });
      break;
    case "application/iden3comm-signed-json" /* SignedMessage */:
      alg = algValues.map((i) => {
        if (!isAcceptJwsAlgorithms(i)) {
          throw new Error(`Algorithm '${i}' not supported for '${env}'`);
        }
        return i;
      });
      break;
    case "application/iden3comm-encrypted-json" /* EncryptedMessage */:
      alg = algValues.map((i) => {
        if (!isAcceptJweAlgorithms(i)) {
          throw new Error(`Algorithm '${i}' not supported for '${env}'`);
        }
        return i;
      });
      break;
    default:
      throw new Error(`Algorithms not supported for '${env}'`);
  }
  return {
    protocolVersion,
    env,
    circuits,
    alg
  };
};

// src/iden3comm/utils/did-doc-builder.ts
var DEFAULT_DID_CONTEXT = "https://www.w3.org/ns/did/v1";
var JWK2020_CONTEXT_V1 = "https://w3id.org/security/suites/jws-2020/v1";
var DIDDocumentBuilder = class {
  constructor(_did, context = DEFAULT_DID_CONTEXT) {
    this._did = _did;
    const contextArr = [context].flat();
    this._context = contextArr.includes(DEFAULT_DID_CONTEXT) ? contextArr : [DEFAULT_DID_CONTEXT, ...contextArr];
  }
  _verificationMethods = [];
  _keyAgreements = [];
  _context;
  async addVerificationMethod(vm, context) {
    const method = await vm.build(this._did);
    this._verificationMethods.push(method);
    this._keyAgreements.push(method.id);
    if (context) {
      this._context = [
        .../* @__PURE__ */ new Set([...this._context, ...Array.isArray(context) ? context : [context]])
      ];
    }
    return this;
  }
  build() {
    return {
      "@context": this._context,
      id: this._did,
      keyAgreement: this._keyAgreements,
      verificationMethod: this._verificationMethods
    };
  }
};
var Jwk2020VerificationMethodBuilder = class {
  constructor(_keyProvider, opts) {
    this._keyProvider = _keyProvider;
    this._alias = opts?.alias;
  }
  _alias;
  async build(did) {
    const keyId = this._alias ? { type: this._keyProvider.keyType, id: this._alias } : await this._keyProvider.newPrivateKey();
    const pubKey = await this._keyProvider.publicKey(keyId);
    const alias = this._alias ?? keyId.id;
    const kid = `${did}#${alias}`;
    return {
      id: kid,
      type: "JsonWebKey2020",
      controller: did,
      publicKeyJwk: toPublicKeyJwk(pubKey, keyId.type)
    };
  }
};

// src/iden3comm/utils/jwk.ts
var getRecipientsJWKs = (recipients, documentResolver) => {
  return Promise.all(
    recipients.map(async (recipient) => {
      if (!recipient.did) {
        throw new Error("Missing recipient DID");
      }
      const recipientDidDoc = recipient.didDocument ?? (await documentResolver.resolve(recipient.did.string()))?.didDocument;
      if (!recipientDidDoc) {
        throw new Error("Recipient DID document not found");
      }
      const vms = resolveVerificationMethods(recipientDidDoc);
      if (!vms.length) {
        throw new Error(
          `No verification methods defined in the DID document of ${recipientDidDoc.id}`
        );
      }
      const keyType = recipient.keyType ?? "JsonWebKey2020";
      const alg = recipient.alg ?? "RSA-OAEP-256" /* RSA_OAEP_256 */;
      const vm = vms.find(
        (vm2) => vm2.controller === recipient.did.string() && vm2.type === keyType && vm2.publicKeyJwk?.alg === alg
      );
      if (!vm) {
        throw new Error(
          `No key found with id ${recipient.did.string()} and type ${keyType} in DID document of ${recipientDidDoc.id}`
        );
      }
      const recipientJWK = extractPublicKeyBytes2(vm);
      if (!recipientJWK) {
        throw new Error("No public key found");
      }
      if (recipientJWK instanceof Uint8Array) {
        throw new Error("Public key is not a JWK");
      }
      return {
        did: recipient.did.string(),
        keyType,
        kid: vm.id,
        alg,
        recipientJWK
      };
    })
  );
};
var extractPublicKeyBytes2 = (vm) => {
  if (vm.publicKeyBase58) {
    return base58ToBytes(vm.publicKeyBase58);
  }
  if (vm.publicKeyBase64) {
    return base64UrlToBytes(vm.publicKeyBase64);
  }
  if (vm.publicKeyHex) {
    return hexToBytes(vm.publicKeyHex);
  }
  if (vm.publicKeyJwk) {
    return vm.publicKeyJwk;
  }
  return null;
};

// src/iden3comm/packers/anon-crypt.ts
var AnonCryptPacker = class {
  constructor(_joseService, _documentResolver) {
    this._joseService = _joseService;
    this._documentResolver = _documentResolver;
  }
  _supportedProtocolVersions = ["iden3comm/v1" /* V1 */];
  _supportedAlgorithms = [
    "RSA-OAEP-256" /* RSA_OAEP_256 */,
    "ECDH-ES+A256KW" /* ECDH_ES_A256KW */
  ];
  packMessage(msg, param) {
    return this.packInternal(msg, param);
  }
  getSupportedAlgorithms() {
    return this._supportedAlgorithms;
  }
  registerSupportedAlgorithm(algorithm) {
    this._supportedAlgorithms = [.../* @__PURE__ */ new Set([...this._supportedAlgorithms, algorithm])];
  }
  /**
   * creates JSON Web Signature token
   *
   * @param {Uint8Array} payload - serialized message
   * @param {PackerParams} params - sender id and proving alg are required
   * @returns `Promise<Uint8Array>`
   */
  async pack(payload, params) {
    const message = JSON.parse(byteDecoder.decode(payload));
    return this.packInternal(message, params);
  }
  async unpack(envelope) {
    const { plaintext } = await this._joseService.decrypt(
      JSON.parse(byteDecoder.decode(envelope))
    );
    return JSON.parse(byteDecoder.decode(plaintext));
  }
  mediaType() {
    return "application/iden3comm-encrypted-json" /* EncryptedMessage */;
  }
  /** {@inheritDoc IPacker.getSupportedProfiles} */
  getSupportedProfiles() {
    return this._supportedProtocolVersions.map(
      (v) => `${v};env=${this.mediaType()};alg=${this._supportedAlgorithms.join(",")}`
    );
  }
  /** {@inheritDoc IPacker.isProfileSupported} */
  isProfileSupported(profile) {
    const { protocolVersion, env, circuits, alg } = parseAcceptProfile(profile);
    if (!this._supportedProtocolVersions.includes(protocolVersion)) {
      return false;
    }
    if (env !== this.mediaType()) {
      return false;
    }
    if (circuits) {
      throw new Error(`Circuits are not supported for ${env} media type`);
    }
    return Boolean(
      alg?.some((a) => this._supportedAlgorithms.includes(a))
    );
  }
  async packInternal(message, params) {
    const { enc, recipients } = params;
    if (!enc) {
      throw new Error("Missing encryption algorithm");
    }
    if (!recipients.length) {
      throw new Error("Missing recipients");
    }
    if (!message.to) {
      throw new Error("Missing recipient DID");
    }
    const recipientsJwks = await getRecipientsJWKs(recipients, this._documentResolver);
    const msg = byteEncoder.encode(JSON.stringify(message));
    const jwe = await this._joseService.encrypt(msg, {
      enc,
      typ: "application/iden3comm-encrypted-json" /* EncryptedMessage */,
      recipients: recipientsJwks
    });
    return byteEncoder.encode(JSON.stringify(jwe));
  }
};

// src/iden3comm/packers/jws.ts
var import_did_jwt2 = require("did-jwt");
var import_did_resolver = require("did-resolver");
var JWSPacker = class {
  /**
   * Creates an instance of JWSPacker.
   *
   * @param {KMS} _kms
   * @param {Resolvable} _documentResolver
   * @memberof JWSPacker
   */
  constructor(_kms, _documentResolver) {
    this._kms = _kms;
    this._documentResolver = _documentResolver;
  }
  supportedAlgorithms = ["ES256K" /* ES256K */, "ES256K-R" /* ES256KR */];
  supportedProtocolVersions = ["iden3comm/v1" /* V1 */];
  /**
   * Packs the given payload and returns a promise that resolves to the packed data.
   *
   * @param {Uint8Array} payload - The payload to be packed.
   * @param {PackerParams} param - The packing parameters.
   * @returns `Promise<Uint8Array>`
   */
  packMessage(msg, param) {
    return this.packInternal(msg, param);
  }
  /**
   * creates JSON Web Signature token
   *
   * @param {Uint8Array} payload - serialized message
   * @param {PackerParams} params - sender id and proving alg are required
   * @returns `Promise<Uint8Array>`
   */
  async pack(payload, params) {
    const message = JSON.parse(byteDecoder.decode(payload));
    return this.packInternal(message, params);
  }
  /**
   * validate envelope which is jwz token
   *
   * @param {Uint8Array} envelope
   * @returns `Promise<BasicMessage>`
   */
  async unpack(envelope) {
    const jws = byteDecoder.decode(envelope);
    const [headerStr, msgStr] = jws.split(".");
    const header = JSON.parse(decodeBase64url(headerStr));
    const message = JSON.parse(decodeBase64url(msgStr));
    const explicitSender = (0, import_did_resolver.parse)(header.kid)?.did;
    if (explicitSender && explicitSender !== message.from) {
      throw new Error(`Sender does not match DID in message with kid ${header?.kid}`);
    }
    const didDocument = await this.resolveDidDoc(message.from);
    let vms = resolveVerificationMethods(didDocument);
    if (!vms?.length) {
      throw new Error(`No verification methods defined in the DID document of ${didDocument.id}`);
    }
    if (header.kid) {
      const vm = vms.find((v) => {
        return v.id === header.kid;
      });
      if (!vm) {
        throw new Error(
          `verification method with specified kid ${header.kid} is not found in the DID Document`
        );
      }
      vms = [vm];
    }
    const verificationResponse = (0, import_did_jwt2.verifyJWS)(jws, vms);
    if (!verificationResponse) {
      throw new Error("JWS verification failed");
    }
    return message;
  }
  mediaType() {
    return "application/iden3comm-signed-json" /* SignedMessage */;
  }
  /** {@inheritDoc IPacker.getSupportedProfiles} */
  getSupportedProfiles() {
    return this.supportedProtocolVersions.map(
      (v) => `${v};env=${this.mediaType()};alg=${this.supportedAlgorithms.join(",")}`
    );
  }
  /** {@inheritDoc IPacker.isProfileSupported} */
  isProfileSupported(profile) {
    const { protocolVersion, env, circuits, alg } = parseAcceptProfile(profile);
    if (!this.supportedProtocolVersions.includes(protocolVersion)) {
      return false;
    }
    if (env !== this.mediaType()) {
      return false;
    }
    if (circuits) {
      throw new Error(`Circuits are not supported for ${env} media type`);
    }
    const algSupported = !alg?.length || alg.some((a) => this.supportedAlgorithms.includes(a));
    return algSupported;
  }
  async resolveDidDoc(from) {
    let didDocument;
    try {
      const didResolutionResult = await this._documentResolver.resolve(from);
      if (!didResolutionResult?.didDocument?.id) {
        throw new Error(`did document for ${from} is not found in resolution result`);
      }
      didDocument = didResolutionResult.didDocument;
    } catch (err) {
      throw new Error(`did document for ${from} is not resolved: ${err.message}`);
    }
    return didDocument;
  }
  async packInternal(message, params) {
    if (!params.alg) {
      throw new Error("Missing algorithm");
    }
    const from = message.from ?? "";
    if (!from) {
      throw new Error("Missing sender DID");
    }
    const vmTypes = SUPPORTED_PUBLIC_KEY_TYPES[params.alg];
    if (!vmTypes?.length) {
      throw new Error(`No supported verification methods for algorithm ${params.alg}`);
    }
    const didDocument = params.didDocument ?? await this.resolveDidDoc(from);
    const vms = resolveVerificationMethods(didDocument);
    if (!vms.length) {
      throw new Error(`No verification methods defined in the DID document of ${didDocument.id}`);
    }
    const vm = params.kid ? vms.find((vm2) => vm2.id === params.kid) : vms[0];
    if (!vm) {
      throw new Error(`No key found with id ${params.kid} in DID document of ${didDocument.id}`);
    }
    const { publicKeyBytes, kmsKeyType } = extractPublicKeyBytes(vm);
    if (!publicKeyBytes && !kmsKeyType) {
      if ((vm.blockchainAccountId || vm.ethereumAddress) && !params.signer) {
        throw new Error(`No signer provided for ${vm.blockchainAccountId || vm.ethereumAddress}`);
      }
    }
    const kid = vm.id;
    const headerObj = { alg: params.alg, kid, typ: "application/iden3comm-signed-json" /* SignedMessage */ };
    const header = encodeBase64url(JSON.stringify(headerObj));
    const msg = encodeBase64url(JSON.stringify(message));
    const signingInput = `${header}.${msg}`;
    const signingInputBytes = byteEncoder.encode(signingInput);
    let signatureBase64;
    if (params.signer) {
      const signature = await params.signer(vm, signingInputBytes);
      signatureBase64 = bytesToBase64url(signature);
    } else {
      if (!publicKeyBytes) {
        throw new Error("No public key found");
      }
      if (!kmsKeyType) {
        throw new Error("No KMS key type found");
      }
      const signatureBytes = await this._kms.sign(
        { type: kmsKeyType, id: keyPath(kmsKeyType, bytesToHex(publicKeyBytes)) },
        signingInputBytes,
        { alg: params.alg }
      );
      signatureBase64 = bytesToBase64url(signatureBytes);
    }
    return byteEncoder.encode(`${signingInput}.${signatureBase64}`);
  }
};

// src/iden3comm/packers/plain.ts
var PlainPacker = class {
  supportedProtocolVersions = ["iden3comm/v1" /* V1 */];
  /**
   * Packs a basic message using the specified parameters.
   *
   * @param msg - The basic message to pack.
   * @param param - The packer parameters.
   * @returns A promise that resolves to a Uint8Array representing the packed message.
   * @throws An error if the method is not implemented.
   */
  packMessage(msg) {
    msg.typ = "application/iden3comm-plain-json" /* PlainMessage */;
    return Promise.resolve(byteEncoder.encode(JSON.stringify(msg)));
  }
  /**
   * Pack returns packed message to transport envelope
   *
   * @param {Uint8Array} payload - json message serialized
   * @param {PlainPackerParams} _params - not used here
   * @returns `Promise<Uint8Array>`
   */
  async pack(payload) {
    const msg = JSON.parse(byteDecoder.decode(payload));
    msg.typ = "application/iden3comm-plain-json" /* PlainMessage */;
    return Promise.resolve(byteEncoder.encode(JSON.stringify(msg)));
  }
  /**
   * Unpack returns unpacked message from transport envelope
   *
   * @param {Uint8Array} envelope - packed envelope (serialized json with media type)
   * @returns `Promise<BasicMessage>`
   */
  async unpack(envelope) {
    return JSON.parse(byteDecoder.decode(envelope));
  }
  /**
   * returns media type for plain message
   *
   * @returns MediaType
   */
  mediaType() {
    return "application/iden3comm-plain-json" /* PlainMessage */;
  }
  /** {@inheritDoc IPacker.getSupportedProfiles} */
  getSupportedProfiles() {
    return this.supportedProtocolVersions.map((v) => `${v};env=${this.mediaType()}`);
  }
  /** {@inheritDoc IPacker.isProfileSupported} */
  isProfileSupported(profile) {
    const { protocolVersion, env, circuits, alg } = parseAcceptProfile(profile);
    if (!this.supportedProtocolVersions.includes(protocolVersion)) {
      return false;
    }
    if (env !== this.mediaType()) {
      return false;
    }
    if (circuits) {
      throw new Error(`Circuits are not supported for ${env} media type`);
    }
    if (alg) {
      throw new Error(`Algorithms are not supported for ${env} media type`);
    }
    return true;
  }
};

// src/iden3comm/packers/zkp.ts
var import_js_jwz = require("@iden3/js-jwz");
var import_js_iden3_core20 = require("@iden3/js-iden3-core");

// src/iden3comm/errors.ts
var ErrUnknownCircuitID = "unknown circuit ID. can't verify msg sender";
var ErrSenderNotUsedTokenCreation = "sender of message is not used for jwz token creation";
var ErrPackedWithUnsupportedCircuit = "message was packed with unsupported circuit";
var ErrProofIsInvalid = "message proof is invalid";
var ErrStateVerificationFailed = "message state verification failed";
var ErrNoProvingMethodAlg = "unknown proving method algorithm";

// src/iden3comm/packers/zkp.ts
var { getProvingMethod } = import_js_jwz.proving;
var DataPrepareHandlerFunc = class {
  /**
   * Creates an instance of DataPrepareHandlerFunc.
   * @param {AuthDataPrepareFunc} dataPrepareFunc - function that produces marshaled inputs for auth circuits
   */
  constructor(dataPrepareFunc) {
    this.dataPrepareFunc = dataPrepareFunc;
  }
  /**
   *
   *
   * @param {Uint8Array} hash - challenge that will be signed
   * @param {DID} did - did of identity that will prepare inputs
   * @param {CircuitId} circuitId - circuit id
   * @returns `Promise<Uint8Array>`
   */
  prepare(hash, did, circuitId) {
    return this.dataPrepareFunc(hash, did, circuitId);
  }
};
var VerificationHandlerFunc = class {
  /**
   * Creates an instance of VerificationHandlerFunc.
   * @param {StateVerificationFunc} stateVerificationFunc - state verification function
   */
  constructor(stateVerificationFunc) {
    this.stateVerificationFunc = stateVerificationFunc;
  }
  /**
   *
   *
   * @param {string} id  - id of circuit
   * @param {Array<string>} pubSignals - signals that must contain user id and state
   * @returns `Promise<boolean>`
   */
  verify(id, pubSignals, opts) {
    return this.stateVerificationFunc(id, pubSignals, opts);
  }
};
var ZKPPacker = class {
  /**
   * Creates an instance of ZKPPacker.
   * @param {Map<string, ProvingParams>} provingParamsMap - string is derived by JSON.parse(ProvingMethodAlg)
   * @param {Map<string, VerificationParams>} verificationParamsMap - string is derived by JSON.parse(ProvingMethodAlg)
   */
  constructor(provingParamsMap, verificationParamsMap, _opts = {
    acceptedStateTransitionDelay: DEFAULT_AUTH_VERIFY_DELAY
  }) {
    this.provingParamsMap = provingParamsMap;
    this.verificationParamsMap = verificationParamsMap;
    this._opts = _opts;
    const supportedProvers = Array.from(this.provingParamsMap.keys()).map(
      (alg) => alg.split(":")[1]
    );
    const supportedVerifiers = Array.from(this.verificationParamsMap.keys()).map(
      (alg) => alg.split(":")[1]
    );
    this.supportedCircuitIds = [.../* @__PURE__ */ new Set([...supportedProvers, ...supportedVerifiers])];
  }
  supportedProtocolVersions = ["iden3comm/v1" /* V1 */];
  supportedAlgorithms = ["groth16" /* Groth16 */];
  supportedCircuitIds;
  /**
   * Packs a basic message using the specified parameters.
   * @param msg - The basic message to pack.
   * @param param - The parameters for the ZKPPacker.
   * @returns A promise that resolves to a Uint8Array representing the packed message.
   */
  packMessage(msg, param) {
    return this.pack(byteEncoder.encode(JSON.stringify(msg)), param);
  }
  /**
   * creates JSON Web Zeroknowledge token
   *
   * @param {Uint8Array} payload - serialized message
   * @param {ZKPPackerParams} params - sender id and proving alg are required
   * @returns `Promise<Uint8Array>`
   */
  async pack(payload, params) {
    const provingMethod = await getProvingMethod(params.provingMethodAlg);
    const provingParams = this.provingParamsMap.get(params.provingMethodAlg.toString());
    if (!provingParams) {
      throw new Error(ErrNoProvingMethodAlg);
    }
    const token = new import_js_jwz.Token(
      provingMethod,
      byteDecoder.decode(payload),
      (hash, circuitId) => {
        return provingParams?.dataPreparer?.prepare(hash, params.senderDID, circuitId);
      }
    );
    token.setHeader(import_js_jwz.Header.Type, "application/iden3-zkp-json" /* ZKPMessage */);
    const tokenStr = await token.prove(provingParams.provingKey, provingParams.wasm);
    return byteEncoder.encode(tokenStr);
  }
  async unpackMessage(token, provingMethodAlg) {
    const verificationParams = this.verificationParamsMap.get(provingMethodAlg.toString());
    if (!verificationParams?.key) {
      throw new Error(ErrPackedWithUnsupportedCircuit);
    }
    const isValid = await token.verify(verificationParams?.key);
    if (!isValid) {
      throw new Error(ErrProofIsInvalid);
    }
    const verificationResult = await verificationParams?.verificationFn?.verify(
      token.circuitId,
      token.zkProof.pub_signals,
      this._opts
    );
    if (!verificationResult) {
      throw new Error(ErrStateVerificationFailed);
    }
    const message = JSON.parse(token.getPayload());
    await verifySender(token, message);
    return message;
  }
  parseToken(msg) {
    return import_js_jwz.Token.parse(byteDecoder.decode(msg));
  }
  /**
   * validate envelope which is jwz token
   *
   * @param {Uint8Array} envelope
   * @returns `Promise<BasicMessage>`
   */
  async unpack(envelope) {
    const token = await this.parseToken(envelope);
    const provingMethodAlg = new import_js_jwz.ProvingMethodAlg(token.alg, token.circuitId);
    return this.unpackMessage(token, provingMethodAlg);
  }
  mediaType() {
    return "application/iden3-zkp-json" /* ZKPMessage */;
  }
  /** {@inheritDoc IPacker.getSupportedProfiles} */
  getSupportedProfiles() {
    return this.supportedProtocolVersions.map(
      (v) => `${v};env=${this.mediaType()};alg=${this.supportedAlgorithms.join(
        ","
      )};circuitIds=${this.supportedCircuitIds.join(",")}`
    );
  }
  /** {@inheritDoc IPacker.isProfileSupported} */
  isProfileSupported(profile) {
    const { protocolVersion, env, circuits, alg } = parseAcceptProfile(profile);
    if (!this.supportedProtocolVersions.includes(protocolVersion)) {
      return false;
    }
    if (env !== this.mediaType()) {
      return false;
    }
    const supportedCircuitIds = this.supportedCircuitIds;
    const circuitIdSupported = !circuits?.length || circuits.some((c) => supportedCircuitIds.includes(c));
    const supportedAlgArr = this.supportedAlgorithms;
    const algSupported = !alg?.length || alg.some((a) => supportedAlgArr.includes(a));
    return algSupported && circuitIdSupported;
  }
};
var verifySender = async (token, msg) => {
  switch (token.circuitId) {
    case "authV2" /* AuthV2 */:
    case "authV3-8-32" /* AuthV3_8_32 */:
    case "authV3" /* AuthV3 */:
      {
        if (!msg.from) {
          throw new Error(ErrSenderNotUsedTokenCreation);
        }
        const authSignals = (token.circuitId === "authV2" /* AuthV2 */ ? new AuthV2PubSignals() : new AuthV3PubSignals()).pubSignalsUnmarshal(byteEncoder.encode(JSON.stringify(token.zkProof.pub_signals)));
        const did = import_js_iden3_core20.DID.parseFromId(authSignals.userID);
        const msgHash = await token.getMessageHash();
        const challenge = import_js_iden3_core20.BytesHelper.bytesToInt(msgHash.reverse());
        if (challenge !== authSignals.challenge) {
          throw new Error(ErrSenderNotUsedTokenCreation);
        }
        if (msg.from !== did.string()) {
          throw new Error(ErrSenderNotUsedTokenCreation);
        }
      }
      break;
    default:
      throw new Error(ErrUnknownCircuitID);
  }
};

// src/iden3comm/packers/zkp-default.ts
var import_js_jwz2 = require("@iden3/js-jwz");
var DefaultZKPPacker = class extends ZKPPacker {
  /**
   * Constructs a new instance of the class.
   *
   * @param circuitStorage - An implementation of the ICircuitStorage interface used to manage circuit data.
   * @param proofService - An implementation of the IProofService interface responsible for generating and verifying proofs.
   * @param opts - Optional state verification options to customize the behavior of the packer.
   */
  constructor(circuitStorage, proofService, opts) {
    super(/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map(), { ...opts });
    this.circuitStorage = circuitStorage;
    this.proofService = proofService;
    this.supportedCircuitIds = ["authV2" /* AuthV2 */, "authV3" /* AuthV3 */, "authV3-8-32" /* AuthV3_8_32 */];
  }
  /**
   * Packs the given payload using zero-knowledge proof (ZKP) parameters.
   *
   * Loads the circuit data (proving key and wasm) for the specified circuit ID from the circuit storage.
   * If the circuit data is not found, throws an error.
   * Caches the proving parameters for the proving method algorithm if not already cached.
   * Delegates the actual packing to the superclass implementation.
   *
   * @param payload - The data to be packed, as a Uint8Array.
   * @param params - The parameters required for ZKP packing, including the proving method algorithm.
   * @returns A Promise that resolves to the packed payload as a Uint8Array.
   * @throws If the circuit data (proving key or wasm) is not found for the given circuit ID.
   */
  async pack(payload, params) {
    const provingMethodAlg = params.provingMethodAlg;
    const circuitId = provingMethodAlg.circuitId;
    const provingParamsKey = provingMethodAlg.toString();
    if (!this.provingParamsMap.has(provingParamsKey)) {
      const { provingKey, wasm } = await this.circuitStorage.loadCircuitData(
        circuitId,
        {
          mode: "proving" /* Proving */
        }
      );
      if (!provingKey || !wasm) {
        throw new Error(`circuit data not found for circuit id: ${circuitId}`);
      }
      this.provingParamsMap.set(provingParamsKey, {
        provingKey,
        wasm,
        dataPreparer: new DataPrepareHandlerFunc(
          this.proofService.generateAuthInputs.bind(this.proofService)
        )
      });
    }
    return super.pack(payload, params);
  }
  /**
   * Unpacks a ZKP envelope into a `BasicMessage` by parsing the token, loading the verification key if necessary,
   * and preparing the verification parameters for the proving method algorithm.
   *
   * This method ensures that the verification parameters for the given circuit and algorithm are loaded and cached.
   * If the verification key is not found for the specified circuit, an error is thrown.
   *
   * @param envelope - The serialized ZKP envelope as a `Uint8Array`.
   * @returns A promise that resolves to a `BasicMessage` extracted from the envelope.
   * @throws If the verification key for the specified circuit ID cannot be found.
   */
  async unpack(envelope) {
    const token = await this.parseToken(envelope);
    const circuitId = token.circuitId;
    const provingMethodAlg = new import_js_jwz2.ProvingMethodAlg(token.alg, circuitId);
    if (!this.verificationParamsMap.has(provingMethodAlg.toString())) {
      const { verificationKey } = await this.circuitStorage.loadCircuitData(circuitId, {
        mode: "verification" /* Verification */
      });
      if (!verificationKey) {
        throw new Error(`verification key not found for circuit id: ${circuitId}`);
      }
      this.verificationParamsMap.set(provingMethodAlg.toString(), {
        key: verificationKey,
        verificationFn: new VerificationHandlerFunc(
          this.proofService.verifyState.bind(this.proofService)
        )
      });
    }
    return super.unpackMessage(token, provingMethodAlg);
  }
};

// src/iden3comm/types/protocol/credentials.ts
var CredentialOfferStatus = /* @__PURE__ */ ((CredentialOfferStatus2) => {
  CredentialOfferStatus2["Pending"] = "pending";
  CredentialOfferStatus2["Completed"] = "completed";
  CredentialOfferStatus2["Rejected"] = "rejected";
  return CredentialOfferStatus2;
})(CredentialOfferStatus || {});

// src/iden3comm/types/protocol/contract-request.ts
var AuthMethod = /* @__PURE__ */ ((AuthMethod2) => {
  AuthMethod2["AUTHV2"] = "authV2";
  AuthMethod2["AUTHV3"] = "authV3";
  AuthMethod2["AUTHV3_8_32"] = "authV3-8-32";
  AuthMethod2["ETH_IDENTITY"] = "ethIdentity";
  AuthMethod2["EMBEDDED_AUTH"] = "embeddedAuth";
  return AuthMethod2;
})(AuthMethod || {});

// src/iden3comm/types/protocol/discovery-protocol.ts
var DiscoverFeatureQueryType = /* @__PURE__ */ ((DiscoverFeatureQueryType2) => {
  DiscoverFeatureQueryType2["FeatureType"] = "feature-type";
  return DiscoverFeatureQueryType2;
})(DiscoverFeatureQueryType || {});
var DiscoveryProtocolFeatureType = /* @__PURE__ */ ((DiscoveryProtocolFeatureType2) => {
  DiscoveryProtocolFeatureType2["Accept"] = "accept";
  DiscoveryProtocolFeatureType2["Protocol"] = "protocol";
  DiscoveryProtocolFeatureType2["GoalCode"] = "goal-code";
  DiscoveryProtocolFeatureType2["Header"] = "header";
  return DiscoveryProtocolFeatureType2;
})(DiscoveryProtocolFeatureType || {});

// src/iden3comm/handlers/auth.ts
var import_js_iden3_core22 = require("@iden3/js-iden3-core");
var import_js_jwz4 = require("@iden3/js-jwz");
var uuid2 = __toESM(require("uuid"), 1);

// src/iden3comm/handlers/common.ts
var import_js_crypto9 = require("@iden3/js-crypto");
var import_js_iden3_core21 = require("@iden3/js-iden3-core");
var import_ethers7 = require("ethers");

// src/iden3comm/handlers/message-handler.ts
var import_js_jwz3 = require("@iden3/js-jwz");
var defaultProvingMethodAlg = import_js_jwz3.proving.provingMethodGroth16AuthV2Instance.methodAlg;
var AbstractMessageHandler = class {
  nextMessageHandler;
  setNext(messageHandler) {
    this.nextMessageHandler = messageHandler;
    return messageHandler;
  }
  async handle(message, context) {
    if (!context.allowExpiredMessages) {
      verifyExpiresTime(message);
    }
    if (this.nextMessageHandler) return this.nextMessageHandler.handle(message, context);
    return Promise.reject("Message handler not provided or message not supported");
  }
};
var MessageHandler = class {
  /**
   * Creates an instance of MessageHandler.
   * @param {{
   *       messageHandlers: AbstractMessageHandler[];
   *       packageManager: IPackageManager;
   *     }} _params
   * @memberof MessageHandler
   */
  constructor(_params) {
    this._params = _params;
    this.registerHandlers(_params.messageHandlers);
  }
  messageHandler;
  /**
   * Registers a list of message handlers and sets up the chain of responsibility.
   *
   * This method takes an array of `AbstractMessageHandler` instances and sets up a chain of responsibility
   * where each handler is linked to the next one in the array. The first handler in the array becomes the
   * main message handler for the `MessageHandler` class.
   *
   * @param {AbstractMessageHandler[]} handlersList - An array of `AbstractMessageHandler` instances to be registered.
   * @returns {void}
   */
  registerHandlers(handlersList) {
    if (!handlersList.length) return;
    const [firstMessageHandler, ...restHandlersList] = handlersList;
    const tempHandler = firstMessageHandler;
    for (const currentHandler of restHandlersList) {
      let lastHandler = tempHandler;
      while (lastHandler.nextMessageHandler) {
        lastHandler = lastHandler.nextMessageHandler;
      }
      lastHandler.setNext(currentHandler);
    }
    if (!this.messageHandler) {
      this.messageHandler = firstMessageHandler;
    } else {
      this.messageHandler.setNext(firstMessageHandler);
    }
  }
  /**
   * Handles a message by unpacking it, passing it to the registered message handler, and packing the response.
   *
   * This method takes a Uint8Array of message bytes and a context object that contains information specific to the
   * type of message being handled (e.g. AuthMessageHandlerOptions, ContractMessageHandlerOptions, etc.).
   *
   * The method first unpacks the message using the provided package manager, then passes the unpacked message and
   * context to the registered message handler. If the message handler returns a response, the method packs the
   * response using the package manager and returns it. If the message handler does not return a response, the
   * method returns null.
   *
   * @param bytes - A Uint8Array of message bytes to be handled.
   * @param context - An object containing information specific to the type of message being handled.
   * @returns A Promise that resolves to a Uint8Array of the packed response, or null if no response was generated.
   */
  async handleMessage(bytes, context) {
    const { unpackedMediaType, unpackedMessage: message } = await this._params.packageManager.unpack(bytes);
    if (!this.messageHandler) {
      return Promise.reject(new Error("Message handler not provided"));
    }
    if (unpackedMediaType === "application/iden3-zkp-json" /* ZKPMessage */) {
      context.messageProvingMethodAlg = await getProvingMethodAlgFromJWZ(bytes);
    }
    const response = await this.messageHandler.handle(message, context);
    if (!response) {
      return null;
    }
    let packerParams = {};
    const senderDid = context?.senderDid;
    if (unpackedMediaType === "application/iden3-zkp-json" /* ZKPMessage */ && senderDid) {
      packerParams = {
        senderDID: senderDid,
        provingMethodAlg: await getProvingMethodAlgFromJWZ(bytes)
      };
      return this._params.packageManager.packMessage(unpackedMediaType, response, packerParams);
    }
    return this._params.packageManager.packMessage("application/iden3comm-plain-json" /* PlainMessage */, response, packerParams);
  }
};
async function getProvingMethodAlgFromJWZ(bytes) {
  try {
    const tokenString = byteDecoder.decode(bytes);
    const token = await import_js_jwz3.Token.parse(tokenString);
    return token.method.methodAlg;
  } catch (e) {
    return defaultProvingMethodAlg;
  }
}

// src/iden3comm/handlers/common.ts
var getGroupedQueries = (requestScope) => requestScope.reduce((acc, proofReq) => {
  const query = proofReq.query;
  if (!query) {
    return acc;
  }
  const groupId = query.groupId;
  if (!groupId) {
    return acc;
  }
  const existedData = acc.get(groupId);
  if (!existedData) {
    const seed = (0, import_js_crypto9.getRandomBytes)(12);
    const dataView = new DataView(seed.buffer);
    const linkNonce = dataView.getUint32(0);
    acc.set(groupId, { query, linkNonce });
    return acc;
  }
  const credentialSubject = mergeObjects(
    existedData.query.credentialSubject,
    query.credentialSubject
  );
  acc.set(groupId, {
    ...existedData,
    query: {
      skipClaimRevocationCheck: existedData.query.skipClaimRevocationCheck || query.skipClaimRevocationCheck,
      ...existedData.query,
      credentialSubject
    }
  });
  return acc;
}, /* @__PURE__ */ new Map());
var processZeroKnowledgeProofRequests = async (to, requests, from, proofService, opts) => {
  const requestScope = requests ?? [];
  const combinedQueries = getGroupedQueries(requestScope);
  const groupedCredentialsCache = /* @__PURE__ */ new Map();
  const zkpResponses = [];
  for (const proofReq of requestScope) {
    let zkpRes;
    try {
      const isCircuitSupported = opts.supportedCircuits.includes(proofReq.circuitId);
      if (!isCircuitSupported) {
        if (proofReq.optional) {
          console.log(
            `Circuit ${proofReq.circuitId} is not supported, skipping optional proof request`
          );
          continue;
        }
        throw new Error(`Circuit ${proofReq.circuitId} is not allowed`);
      }
      const query = proofReq.query;
      const groupId = query?.groupId;
      const combinedQueryData = combinedQueries.get(groupId);
      if (groupId) {
        if (!combinedQueryData) {
          throw new Error(`Invalid group id ${query?.groupId}`);
        }
        const combinedQuery = combinedQueryData.query;
        if (!groupedCredentialsCache.has(groupId)) {
          const credWithRevStatus2 = await proofService.findCredentialByProofQuery(
            to,
            combinedQueryData.query
          );
          if (!credWithRevStatus2.cred) {
            if (proofReq.optional) {
              console.log(`No credential found for optional proof request, skipping`);
              continue;
            }
            throw new Error(
              VerifiableConstants.ERRORS.PROOF_SERVICE_NO_CREDENTIAL_FOR_QUERY + `${JSON.stringify(combinedQuery)}`
            );
          }
          groupedCredentialsCache.set(groupId, credWithRevStatus2);
        }
      }
      const credWithRevStatus = groupedCredentialsCache.get(groupId);
      zkpRes = await proofService.generateProof(proofReq, to, {
        verifierDid: from,
        challenge: opts.challenge,
        skipRevocation: Boolean(query?.skipClaimRevocationCheck),
        credential: credWithRevStatus?.cred,
        credentialRevocationStatus: credWithRevStatus?.revStatus,
        linkNonce: combinedQueryData?.linkNonce ? BigInt(combinedQueryData.linkNonce) : void 0,
        bypassCache: opts.bypassProofsCache,
        allowExpiredCredentials: opts.allowExpiredCredentials
      });
    } catch (error) {
      const expectedErrors = [
        VerifiableConstants.ERRORS.PROOF_SERVICE_NO_CREDENTIAL_FOR_IDENTITY_OR_PROFILE,
        VerifiableConstants.ERRORS.ID_WALLET_NO_CREDENTIAL_SATISFIED_QUERY,
        VerifiableConstants.ERRORS.CREDENTIAL_WALLET_ALL_CREDENTIALS_ARE_REVOKED,
        VerifiableConstants.ERRORS.PROOF_SERVICE_CREDENTIAL_IS_EXPIRED
      ];
      if (error instanceof Error && (expectedErrors.includes(error.message) || error.message.includes(
        VerifiableConstants.ERRORS.PROOF_SERVICE_NO_CREDENTIAL_FOR_QUERY
      )) && proofReq.optional) {
        console.log(`Error in optional proof request: ${error.message}, skipping`);
        continue;
      }
      throw error;
    }
    zkpResponses.push(zkpRes);
  }
  return zkpResponses;
};
var processProofAuth = async (to, proofService, opts) => {
  if (!opts.acceptProfile) {
    opts.acceptProfile = defaultAcceptProfile;
  }
  switch (opts.acceptProfile.env) {
    case "application/iden3comm-plain-json" /* PlainMessage */:
      return {
        authProof: {
          authMethod: "embeddedAuth" /* EMBEDDED_AUTH */
        }
      };
    case "application/iden3-zkp-json" /* ZKPMessage */:
      if (!opts.acceptProfile.circuits) {
        throw new Error("Circuit not specified in accept profile");
      }
      for (const circuitId of opts.acceptProfile.circuits) {
        if (!opts.supportedCircuits.includes(circuitId)) {
          throw new Error(`Circuit ${circuitId} is not supported`);
        }
        if (!opts.senderAddress) {
          throw new Error("Sender address is not provided");
        }
        const challengeAuth = calcChallengeAuth(opts.senderAddress, opts.zkpResponses);
        const zkpRes = await proofService.generateAuthProof(
          circuitId,
          to,
          { challenge: challengeAuth }
        );
        return {
          authProof: {
            authMethod: circuitId,
            zkp: zkpRes
          }
        };
      }
      throw new Error(`Auth method is not supported`);
    case "application/iden3comm-signed-json" /* SignedMessage */:
      if (!opts.acceptProfile.alg || opts.acceptProfile.alg.length === 0) {
        throw new Error("Algorithm not specified");
      }
      if (opts.acceptProfile.alg[0] === "ES256K-R" /* ES256KR */) {
        return {
          authProof: {
            authMethod: "ethIdentity" /* ETH_IDENTITY */,
            userDid: to
          }
        };
      }
      throw new Error(`Algorithm ${opts.acceptProfile.alg[0]} not supported`);
    default:
      throw new Error("Accept env not supported");
  }
};
var processProofResponse = (zkProof) => {
  const requestId = zkProof.id;
  const inputs = zkProof.pub_signals;
  const emptyBytes = "0x";
  if (inputs.length === 0) {
    return { requestId, zkProofEncoded: emptyBytes, metadata: emptyBytes };
  }
  const preparedZkpProof = prepareZkpProof(zkProof.proof);
  const zkProofEncoded = packZkpProof(
    inputs,
    preparedZkpProof.a,
    preparedZkpProof.b,
    preparedZkpProof.c
  );
  const metadata = import_ethers7.ethers.AbiCoder.defaultAbiCoder().encode(["string"], [zkProof.circuitId]);
  return { requestId, zkProofEncoded, metadata };
};
var calcChallengeAuth = (senderAddress, zkpResponses) => {
  const responses = zkpResponses.map((zkpResponse) => {
    const response = processProofResponse(zkpResponse);
    return {
      requestId: response.requestId,
      proof: response.zkProofEncoded,
      metadata: response.metadata
    };
  });
  return BigInt(
    import_ethers7.ethers.keccak256(
      new import_ethers7.ethers.AbiCoder().encode(
        ["address", "(uint256 requestId,bytes proof,bytes metadata)[]"],
        [senderAddress, responses]
      )
    )
  ) & BigInt("0x0fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
};
var packMetadatas = (metas) => {
  return new import_ethers7.ethers.AbiCoder().encode(["tuple(string key,bytes value)[]"], [metas]);
};
var verifyExpiresTime = (message) => {
  if (message?.expires_time && message.expires_time < (0, import_js_iden3_core21.getUnixTimestamp)(/* @__PURE__ */ new Date())) {
    throw new Error("Message expired");
  }
};
var initDefaultPackerOptions = (mediaType, packerOptions, opts) => {
  if (mediaType === "application/iden3comm-signed-json" /* SignedMessage */ || mediaType === "application/iden3comm-encrypted-json" /* EncryptedMessage */) {
    if (!packerOptions) {
      throw new Error(`packer options are required for ${mediaType}`);
    }
    return packerOptions;
  }
  if (mediaType === "application/iden3comm-plain-json" /* PlainMessage */) {
    return {};
  }
  if (mediaType === "application/iden3-zkp-json" /* ZKPMessage */) {
    const zkpPackerParams = {
      provingMethodAlg: packerOptions?.provingMethodAlg || opts?.provingMethodAlg || defaultProvingMethodAlg,
      senderDID: packerOptions?.senderDID || opts?.senderDID
    };
    if (!zkpPackerParams.senderDID) {
      throw new Error("senderDID is required for ZKPMessage");
    }
    return zkpPackerParams;
  }
  throw new Error(`unsupported media type ${mediaType}`);
};
var getFirstSupportedProfile = (responseType, packerMgr, profile) => {
  if (profile?.length) {
    for (const acceptProfileString of profile) {
      const acceptProfile = parseAcceptProfile(acceptProfileString);
      const responseTypeVersion = Number(responseType.split("/").at(-2));
      if (acceptProfile.protocolVersion !== "iden3comm/v1" /* V1 */ || acceptProfile.protocolVersion === "iden3comm/v1" /* V1 */ && (responseTypeVersion < 1 || responseTypeVersion >= 2)) {
        continue;
      }
      if (packerMgr.isProfileSupported(acceptProfile.env, acceptProfileString)) {
        return acceptProfile;
      }
    }
  }
  return defaultAcceptProfile;
};

// src/iden3comm/handlers/auth.ts
function createAuthorizationRequest(reason, sender, callbackUrl, opts) {
  return createAuthorizationRequestWithMessage(reason, "", sender, callbackUrl, opts);
}
function createAuthorizationRequestWithMessage(reason, message, sender, callbackUrl, opts) {
  const uuidv4 = uuid2.v4();
  const request = {
    id: uuidv4,
    thid: uuidv4,
    from: sender,
    typ: "application/iden3comm-plain-json" /* PlainMessage */,
    type: PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE,
    body: {
      accept: opts?.accept,
      reason,
      message,
      callbackUrl,
      scope: opts?.scope ?? []
    },
    created_time: (0, import_js_iden3_core22.getUnixTimestamp)(/* @__PURE__ */ new Date()),
    expires_time: opts?.expires_time ? (0, import_js_iden3_core22.getUnixTimestamp)(opts.expires_time) : void 0,
    attachments: opts?.attachments
  };
  return request;
}
var AuthHandler = class extends AbstractMessageHandler {
  /**
   * Creates an instance of AuthHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   * @param {IProofService} _proofService -  proof service to verify zk proofs
   *
   */
  constructor(_packerMgr, _proofService) {
    super();
    this._packerMgr = _packerMgr;
    this._proofService = _proofService;
  }
  _supportedCircuits = Object.values(CircuitId);
  handle(message, ctx) {
    switch (message.type) {
      case PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE:
        return this.handleAuthRequest(
          message,
          ctx
        );
      case PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE:
        return this.handleAuthResponse(
          message,
          ctx
        );
      default:
        return super.handle(message, ctx);
    }
  }
  /**
   * @inheritdoc IAuthHandler#parseAuthorizationRequest
   */
  async parseAuthorizationRequest(request) {
    const { unpackedMessage: message } = await this._packerMgr.unpack(request);
    const authRequest = message;
    if (message.type !== PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE) {
      throw new Error("Invalid media type");
    }
    authRequest.body.scope = authRequest.body.scope || [];
    return authRequest;
  }
  async handleAuthRequest(authRequest, ctx) {
    if (authRequest.type !== PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE) {
      throw new Error("Invalid message type for authorization request");
    }
    const to = authRequest.to ? import_js_iden3_core22.DID.parse(authRequest.to) : ctx.senderDid;
    const guid = uuid2.v4();
    if (!authRequest.from) {
      throw new Error("auth request should contain from field");
    }
    const responseType = PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE;
    const mediaType = this.getSupportedMediaTypeByProfile(ctx, authRequest.body.accept);
    const from = import_js_iden3_core22.DID.parse(authRequest.from);
    const responseScope = await processZeroKnowledgeProofRequests(
      to,
      authRequest?.body.scope,
      from,
      this._proofService,
      {
        mediaType,
        supportedCircuits: this._supportedCircuits,
        bypassProofsCache: ctx.bypassProofsCache,
        allowExpiredCredentials: ctx.allowExpiredCredentials
      }
    );
    return {
      id: guid,
      typ: mediaType,
      type: responseType,
      thid: authRequest.thid ?? guid,
      body: {
        message: authRequest?.body?.message,
        scope: responseScope
      },
      created_time: (0, import_js_iden3_core22.getUnixTimestamp)(/* @__PURE__ */ new Date()),
      from: to.string(),
      to: authRequest.from
    };
  }
  /**
   * @inheritdoc IAuthHandler#handleAuthorizationRequest
   */
  async handleAuthorizationRequest(did, request, opts) {
    const authRequest = await this.parseAuthorizationRequest(request);
    if (!opts?.allowExpiredMessages) {
      verifyExpiresTime(authRequest);
    }
    if (!opts) {
      opts = {
        mediaType: "application/iden3-zkp-json" /* ZKPMessage */
      };
    }
    const authResponse = await this.handleAuthRequest(authRequest, {
      senderDid: did,
      mediaType: opts.mediaType,
      bypassProofsCache: opts.bypassProofsCache,
      allowExpiredCredentials: opts.allowExpiredCredentials
    });
    const msgBytes = byteEncoder.encode(JSON.stringify(authResponse));
    const packerOpts = initDefaultPackerOptions(opts.mediaType, opts.packerOptions, {
      provingMethodAlg: this.getDefaultProvingMethodAlg(
        opts.preferredAuthProvingMethod,
        authRequest.body.accept
      ),
      senderDID: did
    });
    const token = byteDecoder.decode(
      await this._packerMgr.pack(opts.mediaType, msgBytes, packerOpts)
    );
    return { authRequest, authResponse, token };
  }
  async handleAuthResponse(response, ctx) {
    const request = ctx.request;
    if (response.type !== PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE) {
      throw new Error("Invalid message type for authorization response");
    }
    if ((request.body.message ?? "") !== (response.body.message ?? "")) {
      throw new Error("message for signing from request is not presented in response");
    }
    if (request.from !== response.to) {
      throw new Error(
        `sender of the request is not a target of response - expected ${request.from}, given ${response.to}`
      );
    }
    this.verifyAuthRequest(request);
    const requestScope = request.body.scope || [];
    const responseScope = response.body.scope || [];
    if (!response.from) {
      throw new Error(`proof response doesn't contain from field`);
    }
    const groupIdToLinkIdMap = /* @__PURE__ */ new Map();
    for (const proofRequest of requestScope) {
      const groupId = proofRequest.query?.groupId;
      const proofResp = responseScope.find(
        (resp) => resp.id.toString() === proofRequest.id.toString()
      );
      if (!proofResp) {
        if (proofRequest.optional) {
          continue;
        }
        throw new Error(`proof is not given for requestId ${proofRequest.id}`);
      }
      const allCircuitsSubversions = getGroupedCircuitIdsWithSubVersions(
        proofRequest.circuitId
      );
      if (!allCircuitsSubversions.includes(proofResp.circuitId)) {
        throw new Error(
          `proof is not given for requested circuit expected: ${allCircuitsSubversions.join(
            ", "
          )}, given ${proofResp.circuitId} `
        );
      }
      const params = proofRequest.params ?? {};
      params.verifierDid = import_js_iden3_core22.DID.parse(request.from);
      const opts = [ctx.acceptedProofGenerationDelay, ctx.acceptedStateTransitionDelay].some(
        (delay) => delay !== void 0
      ) ? {
        acceptedProofGenerationDelay: ctx.acceptedProofGenerationDelay,
        acceptedStateTransitionDelay: ctx.acceptedStateTransitionDelay
      } : void 0;
      const { linkID } = await this._proofService.verifyZKPResponse(proofResp, {
        query: proofRequest.query,
        sender: response.from,
        params,
        opts
      });
      if (linkID && groupId) {
        groupIdToLinkIdMap.set(groupId, [
          ...groupIdToLinkIdMap.get(groupId) ?? [],
          { linkID: linkID.toString(), requestId: proofResp.id }
        ]);
      }
    }
    for (const [groupId, metas] of groupIdToLinkIdMap.entries()) {
      if (metas.some((meta) => meta.linkID !== metas[0].linkID)) {
        throw new Error(
          `Link id validation failed for group ${groupId}, request linkID to requestIds info: ${JSON.stringify(
            metas
          )}`
        );
      }
    }
    return response;
  }
  /**
   * @inheritdoc IAuthHandler#handleAuthorizationResponse
   */
  async handleAuthorizationResponse(response, request, opts) {
    if (!opts?.allowExpiredMessages) {
      verifyExpiresTime(response);
    }
    const authResp = await this.handleAuthResponse(response, {
      request,
      acceptedStateTransitionDelay: opts?.acceptedStateTransitionDelay,
      acceptedProofGenerationDelay: opts?.acceptedProofGenerationDelay
    });
    return { request, response: authResp };
  }
  verifyAuthRequest(request) {
    const groupIdValidationMap = {};
    const requestScope = request.body.scope || [];
    for (const proofRequest of requestScope) {
      const proofQuery = proofRequest.query;
      if (!proofQuery) {
        continue;
      }
      const groupId = proofQuery.groupId;
      if (groupId) {
        const existingRequests = groupIdValidationMap[groupId] ?? [];
        for (const existingRequest of existingRequests) {
          const existingProofQuery = existingRequest.query;
          if (!existingProofQuery) {
            continue;
          }
          if (existingProofQuery.type !== proofQuery?.type) {
            throw new Error(`all requests in the group should have the same type`);
          }
          if (existingProofQuery.context !== proofQuery?.context) {
            throw new Error(`all requests in the group should have the same context`);
          }
          const allowedIssuers = proofQuery?.allowedIssuers;
          const existingRequestAllowedIssuers = existingProofQuery.allowedIssuers;
          if (!(allowedIssuers.includes("*") || allowedIssuers.every((issuer) => existingRequestAllowedIssuers.includes(issuer)))) {
            throw new Error(`all requests in the group should have the same issuer`);
          }
        }
        groupIdValidationMap[groupId] = [...groupIdValidationMap[groupId] ?? [], proofRequest];
      }
    }
  }
  getSupportedMediaTypeByProfile(ctx, profile) {
    let mediaType;
    if (!profile?.length) {
      return ctx.mediaType || "application/iden3-zkp-json" /* ZKPMessage */;
    }
    const supportedMediaTypes = [];
    for (const acceptProfile of profile) {
      const { env } = parseAcceptProfile(acceptProfile);
      if (this._packerMgr.isProfileSupported(env, acceptProfile)) {
        supportedMediaTypes.push(env);
      }
    }
    if (!supportedMediaTypes.length) {
      throw new Error("no packer with profile which meets `accept` header requirements");
    }
    mediaType = supportedMediaTypes.includes("application/iden3-zkp-json" /* ZKPMessage */) ? "application/iden3-zkp-json" /* ZKPMessage */ : supportedMediaTypes[0];
    if (ctx.mediaType && supportedMediaTypes.includes(ctx.mediaType)) {
      mediaType = ctx.mediaType;
    }
    return mediaType;
  }
  getDefaultProvingMethodAlg(preferredAuthProvingMethod, accept) {
    if (!accept?.length) {
      return defaultProvingMethodAlg;
    }
    const preferredOrder = [
      import_js_jwz4.proving.provingMethodGroth16AuthV3_8_32Instance.methodAlg,
      import_js_jwz4.proving.provingMethodGroth16AuthV3Instance.methodAlg
    ];
    if (preferredAuthProvingMethod) {
      const idx = preferredOrder.indexOf(preferredAuthProvingMethod);
      if (idx !== -1) {
        preferredOrder.splice(idx, 1);
      }
      preferredOrder.unshift(preferredAuthProvingMethod);
    }
    for (const methodAlg of preferredOrder) {
      if (this._packerMgr.isProfileSupported(
        "application/iden3-zkp-json" /* ZKPMessage */,
        buildAcceptFromProvingMethodAlg(methodAlg)
      ) && acceptHasProvingMethodAlg(accept, methodAlg)) {
        return methodAlg;
      }
    }
    return defaultProvingMethodAlg;
  }
};

// src/storage/blockchain/onchain-revocation.ts
var import_ethers8 = require("ethers");
var import_js_merkletree16 = require("@iden3/js-merkletree");

// src/storage/blockchain/abi/CredentialStatusResolver.json
var CredentialStatusResolver_default = [{ inputs: [], name: "MAX_SMT_DEPTH", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "uint256", name: "key", type: "uint256" }], name: "getNode", outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "uint256", name: "id", type: "uint256" }, { internalType: "uint64", name: "nonce", type: "uint64" }], name: "getRevocationStatus", outputs: [{ components: [{ components: [{ internalType: "uint256", name: "state", type: "uint256" }, { internalType: "uint256", name: "claimsTreeRoot", type: "uint256" }, { internalType: "uint256", name: "revocationTreeRoot", type: "uint256" }, { internalType: "uint256", name: "rootOfRoots", type: "uint256" }], internalType: "struct IOnchainCredentialStatusResolver.IdentityStateRoots", name: "issuer", type: "tuple" }, { components: [{ internalType: "uint256", name: "root", type: "uint256" }, { internalType: "bool", name: "existence", type: "bool" }, { internalType: "uint256[]", name: "siblings", type: "uint256[]" }, { internalType: "uint256", name: "index", type: "uint256" }, { internalType: "uint256", name: "value", type: "uint256" }, { internalType: "bool", name: "auxExistence", type: "bool" }, { internalType: "uint256", name: "auxIndex", type: "uint256" }, { internalType: "uint256", name: "auxValue", type: "uint256" }], internalType: "struct IOnchainCredentialStatusResolver.Proof", name: "mtp", type: "tuple" }], internalType: "struct IOnchainCredentialStatusResolver.CredentialStatus", name: "", type: "tuple" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "uint256", name: "id", type: "uint256" }, { internalType: "uint256", name: "state", type: "uint256" }, { internalType: "uint64", name: "nonce", type: "uint64" }], name: "getRevocationStatusByIdAndState", outputs: [{ components: [{ components: [{ internalType: "uint256", name: "state", type: "uint256" }, { internalType: "uint256", name: "claimsTreeRoot", type: "uint256" }, { internalType: "uint256", name: "revocationTreeRoot", type: "uint256" }, { internalType: "uint256", name: "rootOfRoots", type: "uint256" }], internalType: "struct IOnchainCredentialStatusResolver.IdentityStateRoots", name: "issuer", type: "tuple" }, { components: [{ internalType: "uint256", name: "root", type: "uint256" }, { internalType: "bool", name: "existence", type: "bool" }, { internalType: "uint256[]", name: "siblings", type: "uint256[]" }, { internalType: "uint256", name: "index", type: "uint256" }, { internalType: "uint256", name: "value", type: "uint256" }, { internalType: "bool", name: "auxExistence", type: "bool" }, { internalType: "uint256", name: "auxIndex", type: "uint256" }, { internalType: "uint256", name: "auxValue", type: "uint256" }], internalType: "struct IOnchainCredentialStatusResolver.Proof", name: "mtp", type: "tuple" }], internalType: "struct IOnchainCredentialStatusResolver.CredentialStatus", name: "", type: "tuple" }], stateMutability: "view", type: "function" }, { inputs: [], name: "owner", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "uint256[][]", name: "nodes", type: "uint256[][]" }], name: "saveNodes", outputs: [], stateMutability: "nonpayable", type: "function" }];

// src/storage/blockchain/onchain-revocation.ts
var OnChainRevocationStorage = class _OnChainRevocationStorage {
  /**
   *
   * Creates an instance of OnChainIssuer.
   * @public
   * @param {string} - onchain contract address
   * @param {string} - rpc url to connect to the blockchain
   */
  constructor(_config, contractAddress, _signer) {
    this._config = _config;
    this._signer = _signer;
    this._provider = new import_ethers8.JsonRpcProvider(_config.url);
    let contract = new import_ethers8.Contract(contractAddress, CredentialStatusResolver_default, this._provider);
    if (this._signer) {
      this._signer = this._signer.connect(this._provider);
      contract = contract.connect(this._signer);
    }
    this._contract = contract;
    this._transactionService = new TransactionService(this._provider);
  }
  _contract;
  _provider;
  _transactionService;
  /**
   * Get revocation status by issuerId, issuerState and nonce from the onchain.
   * @public
   * @returns Promise<RevocationStatus>
   */
  async getRevocationStatusByIdAndState(issuerID, state, nonce) {
    const response = await this._contract.getRevocationStatusByIdAndState(issuerID, state, nonce);
    const issuer = _OnChainRevocationStorage.convertIssuerInfo(response.issuer);
    const mtp = _OnChainRevocationStorage.convertSmtProofToProof(response.mtp);
    return {
      issuer,
      mtp
    };
  }
  /**
   * Get revocation status by nonce from the onchain contract.
   * @public
   * @returns Promise<RevocationStatus>
   */
  async getRevocationStatus(issuerID, nonce) {
    const response = await this._contract.getRevocationStatus(issuerID, nonce);
    const issuer = _OnChainRevocationStorage.convertIssuerInfo(response.issuer);
    const mtp = _OnChainRevocationStorage.convertSmtProofToProof(response.mtp);
    return {
      issuer,
      mtp
    };
  }
  async saveNodes(payload) {
    if (!this._signer) {
      throw new Error("No signer provided");
    }
    const feeData = await this._provider.getFeeData();
    const maxFeePerGas = this._config.maxFeePerGas ? BigInt(this._config.maxFeePerGas) : feeData.maxFeePerGas;
    const maxPriorityFeePerGas = this._config.maxPriorityFeePerGas ? BigInt(this._config.maxPriorityFeePerGas) : feeData.maxPriorityFeePerGas;
    const gasLimit = await this._contract.saveNodes.estimateGas(payload);
    const txData = await this._contract.saveNodes.populateTransaction(payload);
    const request = {
      to: txData.to,
      data: txData.data,
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas
    };
    const { txnReceipt } = await this._transactionService.sendTransactionRequest(
      this._signer,
      request
    );
    return txnReceipt;
  }
  static convertIssuerInfo(issuer) {
    const [state, claimsTreeRoot, revocationTreeRoot, rootOfRoots] = issuer.map(
      (i) => import_js_merkletree16.Hash.fromBigInt(i).hex()
    );
    return {
      state,
      claimsTreeRoot,
      revocationTreeRoot,
      rootOfRoots
    };
  }
  static convertSmtProofToProof(mtp) {
    let nodeAux = void 0;
    const siblings = mtp.siblings?.map((s) => s.toString());
    if (mtp.auxExistence) {
      nodeAux = {
        key: mtp.auxIndex.toString(),
        value: mtp.auxValue.toString()
      };
    }
    return import_js_merkletree16.Proof.fromJSON({ existence: mtp.existence, node_aux: nodeAux, siblings });
  }
};

// src/credentials/status/on-chain-revocation.ts
var import_js_iden3_core23 = require("@iden3/js-iden3-core");
var import_js_merkletree17 = require("@iden3/js-merkletree");

// src/storage/blockchain/errors.ts
function isErrorWithArgs(error) {
  return typeof error === "object" && error !== null && "errorArgs" in error && Array.isArray(error.errorArgs);
}
function extractErrorMessage(error) {
  const errorArgs = isErrorWithArgs(error) ? error.errorArgs[0] : void 0;
  const errMsg = errorArgs || (error instanceof Error ? error.message : "");
  return errMsg;
}
function isError(error, errorMsg) {
  const errMsg = extractErrorMessage(error);
  return errMsg.includes(errorMsg);
}
function isIdentityDoesNotExistError(error) {
  return isError(error, VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST) || isError(error, VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST_CUSTOM_ERROR);
}
function isStateDoesNotExistError(error) {
  return isError(error, VerifiableConstants.ERRORS.STATE_DOES_NOT_EXIST) || isError(error, VerifiableConstants.ERRORS.STATE_DOES_NOT_EXIST_CUSTOM_ERROR);
}
function isRootDoesNotExistError(error) {
  return isError(error, VerifiableConstants.ERRORS.ROOT_DOES_NOT_EXIST) || isError(error, VerifiableConstants.ERRORS.ROOT_DOES_NOT_EXIST_CUSTOM_ERROR);
}

// src/credentials/status/on-chain-revocation.ts
var OnChainResolver = class {
  /**
   *
   * Creates an instance of OnChainIssuer.
   * @public
   * @param {Array<EthConnectionConfig>} _configs - list of ethereum network connections
   */
  constructor(_configs, _opts) {
    this._configs = _configs;
    this._stateStorage = new EthStateStorage(_configs, _opts?.stateStorageOptions);
  }
  _stateStorage;
  /**
   * resolve is a method to resolve a credential status from the blockchain.
   *
   * @public
   * @param {CredentialStatus} credentialStatus -  credential status to resolve
   * @param {CredentialStatusResolveOptions} credentialStatusResolveOptions -  options for resolver
   * @returns `{Promise<RevocationStatus>}`
   */
  async resolve(credentialStatus, credentialStatusResolveOptions) {
    if (!credentialStatusResolveOptions?.issuerDID) {
      throw new Error("IssuerDID is not set in options");
    }
    return this.getRevocationOnChain(credentialStatus, credentialStatusResolveOptions.issuerDID);
  }
  /**
   * Gets partial revocation status info from onchain issuer contract.
   *
   * @param {CredentialStatus} credentialStatus - credential status section of credential
   * @param {DID} issuerDid - issuer did
   * @returns `{Promise<RevocationStatus>}`
   */
  async getRevocationOnChain(credentialStatus, issuer) {
    const { contractAddress, chainId, revocationNonce, stateHex } = this.extractCredentialStatusInfo(credentialStatus);
    if (revocationNonce !== credentialStatus.revocationNonce) {
      throw new Error("revocationNonce does not match");
    }
    const issuerId = import_js_iden3_core23.DID.idFromDID(issuer);
    let latestIssuerState;
    try {
      const latestStateInfo = await this._stateStorage.getLatestStateById(issuerId.bigInt());
      if (!latestStateInfo.state) {
        throw new Error("state contract returned empty state");
      }
      latestIssuerState = latestStateInfo.state;
    } catch (e) {
      if (!isIdentityDoesNotExistError(e)) {
        throw e;
      }
      if (!stateHex) {
        throw new Error(
          "latest state not found and state parameter is not present in credentialStatus.id"
        );
      }
      const stateBigInt = import_js_merkletree17.Hash.fromHex(stateHex).bigInt();
      if (!isGenesisState(issuer, stateBigInt)) {
        throw new Error(
          `latest state not found and state parameter ${stateHex} is not genesis state`
        );
      }
      latestIssuerState = stateBigInt;
    }
    const id = import_js_iden3_core23.DID.idFromDID(issuer);
    const onChainCaller = this._getOnChainRevocationStorageForIssuer(chainId, contractAddress);
    const revocationStatus = await onChainCaller.getRevocationStatusByIdAndState(
      id.bigInt(),
      latestIssuerState,
      revocationNonce
    );
    return revocationStatus;
  }
  /**
   * Extract information about credential status
   *
   * @param {credentialStatus} CredentialStatus - credential status
   * @returns {{contractAddress: string, chainId: number, revocationNonce: number, issuer: string;}}
   */
  extractCredentialStatusInfo(credentialStatus) {
    if (!credentialStatus.id) {
      throw new Error("credentialStatus id is empty");
    }
    const idParts = credentialStatus.id.split("/");
    if (idParts.length !== 2) {
      throw new Error("invalid credentialStatus id");
    }
    const idURL = new URL(credentialStatus.id);
    const stateHex = idURL.searchParams.get("state") || "";
    const contractIdentifier = idURL.searchParams.get("contractAddress");
    if (!contractIdentifier) {
      throw new Error("contractAddress not found in credentialStatus.id field");
    }
    const parts = contractIdentifier.split(":");
    if (parts.length != 2) {
      throw new Error("invalid contract address encoding. should be chainId:contractAddress");
    }
    const chainId = parseInt(parts[0], 10);
    const contractAddress = parts[1];
    const rv = idURL.searchParams.get("revocationNonce") || credentialStatus.revocationNonce;
    if (rv === void 0 || rv === null) {
      throw new Error("revocationNonce not found in credentialStatus id field");
    }
    const revocationNonce = typeof rv === "number" ? rv : parseInt(rv, 10);
    return { contractAddress, chainId, revocationNonce, stateHex };
  }
  networkByChainId(chainId) {
    const network = this._configs.find((c) => c.chainId === chainId);
    if (!network) {
      throw new Error(`chainId "${chainId}" not supported`);
    }
    return network;
  }
  _getOnChainRevocationStorageForIssuer(chainId, contractAddress) {
    const networkConfig = this.networkByChainId(chainId);
    const onChainCaller = new OnChainRevocationStorage(networkConfig, contractAddress);
    return onChainCaller;
  }
};

// src/credentials/status/reverse-sparse-merkle-tree.ts
var import_js_iden3_core24 = require("@iden3/js-iden3-core");
var import_js_merkletree19 = require("@iden3/js-merkletree");

// src/credentials/status/sparse-merkle-tree.ts
var import_js_merkletree18 = require("@iden3/js-merkletree");
var IssuerResolver = class {
  /**
   * resolve is a method to resolve a credential status directly from the issuer.
   *
   * @public
   * @param {CredentialStatus} credentialStatus -  credential status to resolve
   * @param {CredentialStatusResolveOptions} credentialStatusResolveOptions -  options for resolver
   * @returns `{Promise<RevocationStatus>}`
   */
  async resolve(credentialStatus) {
    const revStatusResp = await fetch(credentialStatus.id);
    const revStatus = await revStatusResp.json();
    return toRevocationStatus(revStatus);
  }
};
var toRevocationStatus = ({ issuer, mtp }) => {
  return {
    mtp: import_js_merkletree18.Proof.fromJSON(mtp),
    issuer
  };
};

// src/credentials/status/reverse-sparse-merkle-tree.ts
var ProofNode = class _ProofNode {
  /**
   *
   * Creates an instance of ProofNode.
   * @param {Hash} [hash=ZERO_HASH] - current node hash
   * @param {Hash[]} [children=[]] -  children of the node
   */
  constructor(hash = import_js_merkletree19.ZERO_HASH, children = []) {
    this.hash = hash;
    this.children = children;
  }
  /**
   * Determination of Node type
   * Can be: Leaf, Middle or State node
   *
   * @returns NodeType
   */
  nodeType() {
    if (this.children.length === 2) {
      return 1 /* Middle */;
    }
    if (this.children.length === 3 && this.children[2].hex() === import_js_merkletree19.Hash.fromBigInt(BigInt(1)).hex()) {
      return 2 /* Leaf */;
    }
    if (this.children.length === 3) {
      return 3 /* State */;
    }
    return 0 /* Unknown */;
  }
  /**
   * JSON Representation of ProofNode with a hex values
   *
   * @returns {*} - ProofNode with hexes
   */
  toJSON() {
    return {
      hash: this.hash.hex(),
      children: this.children.map((h) => h.hex())
    };
  }
  /**
   * Creates ProofNode Hashes from hex values
   *
   * @static
   * @param {ProofNodeHex} hexNode
   * @returns ProofNode
   */
  static fromHex(hexNode) {
    return new _ProofNode(
      import_js_merkletree19.Hash.fromHex(hexNode.hash),
      hexNode.children.map((ch) => import_js_merkletree19.Hash.fromHex(ch))
    );
  }
};
var RHSResolver = class {
  constructor(_state) {
    this._state = _state;
  }
  /**
   * resolve is a method to resolve a credential status from the blockchain.
   *
   * @public
   * @param {CredentialStatus} credentialStatus -  credential status to resolve
   * @param {CredentialStatusResolveOptions} credentialStatusResolveOptions -  options for resolver
   * @returns `{Promise<RevocationStatus>}`
   */
  async resolve(credentialStatus, credentialStatusResolveOptions) {
    if (!credentialStatusResolveOptions?.issuerDID) {
      throw new Error("IssuerDID is not set in options");
    }
    try {
      return await this.getStatus(
        credentialStatus,
        credentialStatusResolveOptions.issuerDID,
        credentialStatusResolveOptions.issuerData,
        credentialStatusResolveOptions.issuerGenesisState
      );
    } catch (e) {
      if (credentialStatus?.statusIssuer?.type === "SparseMerkleTreeProof" /* SparseMerkleTreeProof */) {
        try {
          return await new IssuerResolver().resolve(credentialStatus.statusIssuer);
        } catch (e2) {
          throw new Error(
            `can't fetch revocation status from backup endpoint: ${e2?.message}`
          );
        }
      }
      throw new Error(`can't fetch revocation status: ${e?.message}`);
    }
  }
  /**
   * Gets revocation status from rhs service.
   * @param {CredentialStatus} credentialStatus
   * @param {DID} issuerDID
   * @param {IssuerData} issuerData
   * @returns Promise<RevocationStatus>
   */
  async getStatus(credentialStatus, issuerDID, issuerData, genesisState) {
    const issuerId = import_js_iden3_core24.DID.idFromDID(issuerDID);
    let latestState;
    try {
      const latestStateInfo = await this._state.getLatestStateById(issuerId.bigInt());
      if (!latestStateInfo.state) {
        throw new Error("state contract returned empty state");
      }
      latestState = latestStateInfo.state;
    } catch (e) {
      if (!isIdentityDoesNotExistError(e)) {
        throw e;
      }
      const stateHex = this.extractState(credentialStatus.id);
      if (!stateHex) {
        return this.getRevocationStatusFromIssuerData(issuerDID, issuerData, genesisState);
      }
      const currentStateBigInt = import_js_merkletree19.Hash.fromHex(stateHex).bigInt();
      const isEthIdentity = isEthereumIdentity(issuerDID);
      if (!isEthIdentity && !isGenesisState(issuerDID, currentStateBigInt)) {
        throw new Error(
          `latest state not found and state parameter ${stateHex} is not genesis state`
        );
      }
      if (isEthIdentity) {
        throw new Error(`State must be published for Ethereum based identity`);
      }
      latestState = currentStateBigInt;
    }
    const rhsHost = credentialStatus.id.split("/node")[0];
    const hashedRevNonce = import_js_merkletree19.Hash.fromBigInt(BigInt(credentialStatus.revocationNonce ?? 0));
    const hashedIssuerRoot = import_js_merkletree19.Hash.fromBigInt(latestState);
    return await this.getRevocationStatusFromRHS(hashedRevNonce, hashedIssuerRoot, rhsHost);
  }
  /**
   * Extract revocation status from issuer data.
   * @param {DID} issuerDID
   * @param {IssuerData} issuerData
   */
  getRevocationStatusFromIssuerData(issuerDID, issuerData, genesisState) {
    if (!!genesisState && isGenesisState(issuerDID, genesisState.value.bigInt())) {
      return {
        mtp: new import_js_merkletree19.Proof(),
        issuer: {
          state: genesisState.value.hex(),
          revocationTreeRoot: genesisState.revocationTreeRoot.hex(),
          rootOfRoots: genesisState.rootOfRoots.hex(),
          claimsTreeRoot: genesisState.claimsTreeRoot.hex()
        }
      };
    }
    if (!!issuerData && isGenesisState(issuerDID, issuerData.state.value)) {
      return {
        mtp: new import_js_merkletree19.Proof(),
        issuer: {
          state: issuerData.state.value,
          revocationTreeRoot: issuerData.state.revocationTreeRoot,
          rootOfRoots: issuerData.state.rootOfRoots,
          claimsTreeRoot: issuerData.state.claimsTreeRoot
        }
      };
    }
    throw new Error(`issuer data / genesis state param is empty`);
  }
  /**
   * Gets partial revocation status info from rhs service.
   *
   * @param {Hash} data - hash to fetch
   * @param {Hash} issuerRoot - issuer root which is a part of url
   * @param {string} rhsUrl - base URL for reverse hash service
   * @returns Promise<RevocationStatus>
   */
  async getRevocationStatusFromRHS(data, issuerRoot, rhsUrl) {
    if (!rhsUrl) throw new Error("HTTP reverse hash service URL is not specified");
    const resp = await fetch(`${rhsUrl}/node/${issuerRoot.hex()}`);
    const treeRoots = (await resp.json())?.node;
    if (treeRoots.children.length !== 3) {
      throw new Error("state should has tree children");
    }
    const s = issuerRoot.hex();
    const [cTR, rTR, roTR] = treeRoots.children;
    const rtrHashed = import_js_merkletree19.Hash.fromHex(rTR);
    const nonRevProof = await this.rhsGenerateProof(rtrHashed, data, `${rhsUrl}/node`);
    return {
      mtp: nonRevProof,
      issuer: {
        state: s,
        claimsTreeRoot: cTR,
        revocationTreeRoot: rTR,
        rootOfRoots: roTR
      }
    };
  }
  async rhsGenerateProof(treeRoot, key, rhsUrl) {
    let existence = false;
    const siblings = [];
    let nodeAux;
    const mkProof = () => new import_js_merkletree19.Proof({ siblings, existence, nodeAux });
    let nextKey = treeRoot;
    for (let depth = 0; depth < key.bytes.length * 8; depth++) {
      if (nextKey.bytes.every((i) => i === 0)) {
        return mkProof();
      }
      const data = await fetch(`${rhsUrl}/${nextKey.hex()}`);
      const resp = (await data.json())?.node;
      const n = ProofNode.fromHex(resp);
      switch (n.nodeType()) {
        case 2 /* Leaf */:
          if (key.bytes.every((b, index) => b === n.children[0].bytes[index])) {
            existence = true;
            return mkProof();
          }
          nodeAux = {
            key: n.children[0],
            value: n.children[1]
          };
          return mkProof();
        case 1 /* Middle */:
          if ((0, import_js_merkletree19.testBit)(key.bytes, depth)) {
            nextKey = n.children[1];
            siblings.push(n.children[0]);
          } else {
            nextKey = n.children[0];
            siblings.push(n.children[1]);
          }
          break;
        default:
          throw new Error(`found unexpected node type in tree ${n.hash.hex()}`);
      }
    }
    throw new Error("tree depth is too high");
  }
  /**
   * Get state param from rhs url
   * @param {string} id
   * @returns string | null
   */
  extractState(id) {
    const u = new URL(id);
    return u.searchParams.get("state");
  }
};
function isIssuerGenesis(issuer, state) {
  const did = import_js_iden3_core24.DID.parse(issuer);
  const id = import_js_iden3_core24.DID.idFromDID(did);
  const { method, blockchain, networkId } = import_js_iden3_core24.DID.decodePartsFromId(id);
  const arr = import_js_iden3_core24.BytesHelper.hexToBytes(state);
  const stateBigInt = import_js_iden3_core24.BytesHelper.bytesToInt(arr);
  const type = (0, import_js_iden3_core24.buildDIDType)(method, blockchain, networkId);
  return isGenesisStateId(import_js_iden3_core24.DID.idFromDID(did).bigInt(), stateBigInt, type);
}
function isGenesisStateId(id, state, type) {
  const idFromState = import_js_iden3_core24.Id.idGenesisFromIdenState(type, state);
  return id.toString() === idFromState.bigInt().toString();
}

// src/credentials/status/resolver.ts
var CredentialStatusResolverRegistry = class {
  resolvers = /* @__PURE__ */ new Map();
  /**
   * register is a method to add a credential status resolver for specific credential status type
   *
   * @public
   * @param {CredentialStatusType} type -  one of the credential status types
   * @param {CredentialStatusResolver} resolver -  resolver
   */
  register(type, resolver) {
    this.resolvers.set(type, resolver);
  }
  /**
   * resolve is a method to resolve a credential status from the the specific source.
   *
   * @public
   * @param {CredentialStatus} credentialStatus -  credential status to resolve
   * @param {CredentialStatusResolveOptions} credentialStatusResolveOptions -  options for resolver
   * @returns `{Promise<RevocationStatus>}`
   */
  get(type) {
    return this.resolvers.get(type);
  }
};

// src/credentials/status/agent-revocation.ts
var uuid3 = __toESM(require("uuid"), 1);
var AgentResolver = class {
  /**
   * resolve is a method to resolve a credential status from an agent.
   *
   * @public
   * @param {CredentialStatus} credentialStatus -  credential status to resolve
   * @param {CredentialStatusResolveOptions} credentialStatusResolveOptions -  options for resolver
   * @returns `{Promise<RevocationStatus>}`
   */
  async resolve(credentialStatus, credentialStatusResolveOptions) {
    if (!credentialStatusResolveOptions?.issuerDID) {
      throw new Error("IssuerDID is not set in options");
    }
    if (!credentialStatusResolveOptions?.userDID) {
      throw new Error("UserDID is not set in options");
    }
    if (typeof credentialStatus.revocationNonce !== "number") {
      throw new Error("Revocation nonce is not set in credential status");
    }
    const from = credentialStatusResolveOptions.userDID.string();
    const to = credentialStatusResolveOptions.issuerDID.string();
    const msg = buildRevocationMessageRequest(from, to, credentialStatus.revocationNonce);
    const response = await fetch(credentialStatus.id, {
      method: "POST",
      body: JSON.stringify(msg),
      headers: {
        "Content-Type": "application/json"
      }
    });
    const agentResponse = await response.json();
    return toRevocationStatus(agentResponse.body);
  }
};
function buildRevocationMessageRequest(from, to, revocationNonce) {
  return {
    id: uuid3.v4(),
    typ: "application/iden3comm-plain-json" /* PlainMessage */,
    type: PROTOCOL_MESSAGE_TYPE.REVOCATION_STATUS_REQUEST_MESSAGE_TYPE,
    body: {
      revocation_nonce: revocationNonce
    },
    thid: uuid3.v4(),
    from,
    to
  };
}

// src/credentials/status/credential-status-publisher.ts
var CredentialStatusPublisherRegistry = class {
  _publishers = /* @__PURE__ */ new Map();
  /**
   * Registers one or more credential status publishers for a given type.
   * @param type - The credential status type.
   * @param publisher - One or more credential status publishers.
   */
  register(type, ...publisher) {
    const publishers = this._publishers.get(type) ?? [];
    publishers.push(...publisher);
    this._publishers.set(type, publishers);
  }
  /**
   * Retrieves the credential status publishers for a given type.
   * @param type - The credential status type.
   * @returns An array of credential status publishers or undefined if none are registered for the given type.
   */
  get(type) {
    return this._publishers.get(type);
  }
};
var Iden3OnchainSmtCredentialStatusPublisher = class {
  constructor(_storage) {
    this._storage = _storage;
  }
  /**
   * Publishes the credential status to the blockchain.
   * @param params - The parameters for publishing the credential status.
   */
  async publish(params) {
    if (!["Iden3OnchainSparseMerkleTreeProof2023" /* Iden3OnchainSparseMerkleTreeProof2023 */].includes(
      params.credentialStatusType
    )) {
      throw new Error(
        `On-chain publishing is not supported for credential status type ${params.credentialStatusType}`
      );
    }
    const nodesBigInts = params.nodes.map((n) => n.children.map((c) => c.bigInt()));
    const txPromise = this._storage.saveNodes(nodesBigInts);
    let publishMode = params.onChain?.publishMode ?? "sync";
    if (params.onChain?.txCallback) {
      publishMode = "callback";
    }
    switch (publishMode) {
      case "sync":
        await txPromise;
        break;
      case "callback": {
        if (!params.onChain?.txCallback) {
          throw new Error('txCallback is required for publishMode "callback"');
        }
        const cb = params.onChain?.txCallback;
        txPromise.then((receipt) => cb(receipt));
        break;
      }
      case "async": {
        const mb = MessageBus.getInstance();
        txPromise.then((receipt) => mb.publish(SDK_EVENTS.TX_RECEIPT_ACCEPTED, receipt));
        break;
      }
      default:
        throw new Error(`Invalid publishMode: ${publishMode}`);
    }
  }
};
var Iden3SmtRhsCredentialStatusPublisher = class {
  /**
   * Publishes the credential status to a specified node URL.
   * @param params - The parameters for publishing the credential status.
   * @param params.nodes - The proof nodes to be published.
   * @param params.rhsUrl - The URL of the node to publish the credential status to.
   * @returns A promise that resolves when the credential status is successfully published.
   * @throws An error if the publishing fails.
   */
  async publish(params) {
    if (!["Iden3ReverseSparseMerkleTreeProof" /* Iden3ReverseSparseMerkleTreeProof */].includes(
      params.credentialStatusType
    )) {
      throw new Error(
        `On-chain publishing is not supported for credential status type ${params.credentialStatusType}`
      );
    }
    const nodesJSON = params.nodes.map((n) => n.toJSON());
    const resp = await fetch(params.rhsUrl + "/node", {
      method: "post",
      body: JSON.stringify(nodesJSON)
    });
    if (resp.status !== 200) {
      throw new Error(`Failed to publish credential status. Status: ${resp.status}`);
    }
  }
};

// src/credentials/status/did-resolver-revocation.ts
var DidDocumentCredentialStatusResolver = class {
  constructor(didResolverUrl) {
    this.didResolverUrl = didResolverUrl;
  }
  async resolve(credentialStatus, opts) {
    if (!opts?.issuerDID) {
      throw new Error("IssuerDID is not set in options");
    }
    const url = `${this.didResolverUrl}/1.0/credential-status/${encodeURIComponent(
      opts.issuerDID.string()
    )}`;
    const resp = await fetch(url, {
      method: "POST",
      body: JSON.stringify(credentialStatus)
    });
    const data = await resp.json();
    return data;
  }
};

// src/credentials/credential-wallet.ts
var import_js_iden3_core25 = require("@iden3/js-iden3-core");
var uuid4 = __toESM(require("uuid"), 1);
var CredentialWallet = class {
  /**
   * Creates an instance of CredentialWallet.
   * @param {IDataStorage} _storage - data storage to access credential / identity / Merkle tree data
   * @param {CredentialStatusResolverRegistry} _credentialStatusResolverRegistry - list of credential status resolvers
   * if _credentialStatusResolverRegistry is not provided, default resolvers will be used
   */
  constructor(_storage, _credentialStatusResolverRegistry) {
    this._storage = _storage;
    this._credentialStatusResolverRegistry = _credentialStatusResolverRegistry;
    if (!this._credentialStatusResolverRegistry) {
      this._credentialStatusResolverRegistry = new CredentialStatusResolverRegistry();
      this._credentialStatusResolverRegistry.register(
        "SparseMerkleTreeProof" /* SparseMerkleTreeProof */,
        new IssuerResolver()
      );
      this._credentialStatusResolverRegistry.register(
        "Iden3commRevocationStatusV1.0" /* Iden3commRevocationStatusV1 */,
        new AgentResolver()
      );
    }
  }
  /**
   * {@inheritDoc ICredentialWallet.getCredentialStatusResolverRegistry}
   */
  getCredentialStatusResolverRegistry() {
    return this._credentialStatusResolverRegistry;
  }
  /**
   * {@inheritDoc ICredentialWallet.getAuthBJJCredential}
   */
  async getAuthBJJCredential(did) {
    const authBJJCredsOfIssuer = await this._storage.credential.findCredentialsByQuery({
      context: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_SCHEMA_JSONLD_URL,
      type: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_TYPE,
      allowedIssuers: [did.string()]
    });
    if (!authBJJCredsOfIssuer.length) {
      throw new Error(VerifiableConstants.ERRORS.NO_AUTH_CRED_FOUND);
    }
    for (let index = 0; index < authBJJCredsOfIssuer.length; index++) {
      const authCred = authBJJCredsOfIssuer[index];
      const revocationStatus = await this.getRevocationStatusFromCredential(authCred);
      if (!revocationStatus.mtp.existence) {
        return authCred;
      }
    }
    throw new Error("all auth bjj credentials are revoked");
  }
  /**
   * {@inheritDoc ICredentialWallet.getAllAuthBJJCredentials}
   */
  async getAllAuthBJJCredentials(did) {
    return this._storage.credential.findCredentialsByQuery({
      context: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_SCHEMA_JSONLD_URL,
      type: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_TYPE,
      allowedIssuers: [did.string()]
    });
  }
  /**
   * {@inheritDoc ICredentialWallet.getRevocationStatusFromCredential}
   */
  async getRevocationStatusFromCredential(cred) {
    const mtpProof = cred.getIden3SparseMerkleTreeProof();
    const sigProof = cred.getBJJSignature2021Proof();
    const stateInfo = mtpProof ? mtpProof.issuerData.state : sigProof?.issuerData.state;
    const issuerDID = import_js_iden3_core25.DID.parse(cred.issuer);
    const userDID = getUserDIDFromCredential(issuerDID, cred);
    const opts = {
      issuerGenesisState: stateInfo,
      issuerDID,
      userDID
    };
    return this.getRevocationStatus(cred.credentialStatus, opts);
  }
  /**
   * {@inheritDoc ICredentialWallet.getRevocationStatus}
   */
  async getRevocationStatus(credStatus, credentialStatusResolveOptions) {
    const statusResolver = this._credentialStatusResolverRegistry?.get(credStatus.type);
    if (!statusResolver) {
      throw new Error(`credential status resolver does not exist for ${credStatus.type} type`);
    }
    return statusResolver.resolve(credStatus, credentialStatusResolveOptions);
  }
  /**
   * {@inheritDoc ICredentialWallet.createCredential}
   */
  createCredential = (issuer, request, schema) => {
    if (!schema.$metadata.uris["jsonLdContext"]) {
      throw new Error("jsonLdContext is missing is the schema");
    }
    const r = { ...request };
    r.context = r.context ?? [];
    if (r.displayMethod?.type === "Iden3BasicDisplayMethodV1" /* Iden3BasicDisplayMethodV1 */ && !r.context.includes(VerifiableConstants.JSONLD_SCHEMA.IDEN3_DISPLAY_METHOD)) {
      r.context.push(VerifiableConstants.JSONLD_SCHEMA.IDEN3_DISPLAY_METHOD);
    }
    r.context.push(schema.$metadata.uris["jsonLdContext"]);
    r.expiration = r.expiration ? r.expiration * 1e3 : void 0;
    r.id = r.id ? r.id : `urn:${uuid4.v4()}`;
    r.issuanceDate = r.issuanceDate ? r.issuanceDate * 1e3 : Date.now();
    return W3CCredential.fromCredentialRequest(issuer, r);
  };
  /**
   * {@inheritDoc ICredentialWallet.findById}
   */
  async findById(id) {
    return this._storage.credential.findCredentialById(id);
  }
  /**
   * {@inheritDoc ICredentialWallet.findByContextType}
   */
  async findByContextType(context, type) {
    return this._storage.credential.findCredentialsByQuery({ context, type });
  }
  /**
   * {@inheritDoc ICredentialWallet.save}
   */
  async save(credential) {
    return this._storage.credential.saveCredential(credential);
  }
  /**
   * {@inheritDoc ICredentialWallet.saveAll}
   */
  async saveAll(credentials) {
    return this._storage.credential.saveAllCredentials(credentials);
  }
  /**
   * {@inheritDoc ICredentialWallet.remove}
   */
  async remove(id) {
    return this._storage.credential.removeCredential(id);
  }
  /**
   * {@inheritDoc ICredentialWallet.list}
   */
  async list() {
    return this._storage.credential.listCredentials();
  }
  /**
   * {@inheritDoc ICredentialWallet.findByQuery}
   */
  async findByQuery(query) {
    return this._storage.credential.findCredentialsByQuery(query);
  }
  /**
   * {@inheritDoc ICredentialWallet.filterByCredentialSubject}
   */
  async filterByCredentialSubject(credentials, subject) {
    return credentials.filter((cred) => {
      return cred.credentialSubject["id"] === subject.string();
    });
  }
  async findNonRevokedCredential(creds) {
    for (const cred of creds) {
      const revStatus = await this.getRevocationStatusFromCredential(cred);
      if (revStatus.mtp.existence) {
        continue;
      }
      return { cred, revStatus };
    }
    throw new Error(VerifiableConstants.ERRORS.CREDENTIAL_WALLET_ALL_CREDENTIALS_ARE_REVOKED);
  }
};

// src/credentials/rhs.ts
var import_js_merkletree20 = require("@iden3/js-merkletree");
var import_js_merkletree21 = require("@iden3/js-merkletree");
var import_js_merkletree22 = require("@iden3/js-merkletree");
async function pushHashesToRHS(state, trees, rhsUrl, revokedNonces) {
  const nodes = await getNodesRepresentation(revokedNonces, trees, state);
  const publisher = new Iden3SmtRhsCredentialStatusPublisher();
  await publisher.publish({
    nodes,
    credentialStatusType: "Iden3ReverseSparseMerkleTreeProof" /* Iden3ReverseSparseMerkleTreeProof */,
    rhsUrl
  });
}
async function getNodesRepresentation(revokedNonces, trees, state) {
  const nb = new NodesBuilder();
  if (revokedNonces) {
    await addRevocationNode(nb, trees, revokedNonces);
  }
  await addRoRNode(nb, trees);
  if (!state.bytes.every((b) => b === 0)) {
    nb.addProofNode(
      new ProofNode(state, [
        await trees.claimsTree.root(),
        await trees.revocationTree.root(),
        await trees.rootsTree.root()
      ])
    );
  }
  return nb.nodes;
}
async function addRoRNode(nb, trees) {
  const currentRootsTree = trees.rootsTree;
  const claimsTree = trees.claimsTree;
  return nb.addKey(currentRootsTree, (await claimsTree.root()).bigInt());
}
async function addRevocationNode(nb, trees, revokedNonces) {
  const revocationTree = trees.revocationTree;
  for (const nonce of revokedNonces) {
    await nb.addKey(revocationTree, BigInt(nonce));
  }
}
var NodesBuilder = class {
  constructor(nodes = [], seen = /* @__PURE__ */ new Map()) {
    this.nodes = nodes;
    this.seen = seen;
  }
  async addKey(tree, nodeKey) {
    const { value: nodeValue, siblings } = await tree.get(nodeKey);
    const nodeKeyHash = import_js_merkletree20.Hash.fromBigInt(nodeKey);
    const nodeValueHash = import_js_merkletree20.Hash.fromBigInt(nodeValue);
    const node = new import_js_merkletree20.NodeLeaf(nodeKeyHash, nodeValueHash);
    const newNodes = await buildNodesUp(siblings, node);
    for (const n of newNodes) {
      if (!this.seen.get(n.hash.hex())) {
        this.nodes.push(n);
        this.seen.set(n.hash.hex(), true);
      }
    }
  }
  addProofNode(node) {
    const hex = node.hash.hex();
    const isSeen = this.seen.get(hex);
    if (!isSeen) {
      this.nodes.push(node);
      this.seen.set(hex, true);
    }
  }
};
async function buildNodesUp(siblings, node) {
  if (node.type !== import_js_merkletree21.NODE_TYPE_LEAF) {
    throw new Error("node is not a leaf");
  }
  let prevHash = await node.getKey();
  const sl = siblings.length;
  const nodes = new Array(sl + 1);
  for (let index = 0; index < nodes.length; index++) {
    nodes[index] = new ProofNode();
  }
  nodes[sl].hash = prevHash;
  const hashOfOne = import_js_merkletree20.Hash.fromBigInt(BigInt(1));
  nodes[sl].children = [node.entry[0], node.entry[1], hashOfOne];
  const pathKey = node.entry[0];
  for (let i = sl - 1; i >= 0; i--) {
    const isRight = (0, import_js_merkletree20.testBit)(pathKey.bytes, i);
    nodes[i].children = new Array(2);
    if (isRight) {
      nodes[i].children[0] = siblings[i];
      nodes[i].children[1] = prevHash;
    } else {
      nodes[i].children[0] = prevHash;
      nodes[i].children[1] = siblings[i];
    }
    nodes[i].hash = (0, import_js_merkletree22.hashElems)([nodes[i].children[0].bigInt(), nodes[i].children[1].bigInt()]);
    prevHash = nodes[i].hash;
  }
  return nodes;
}

// src/iden3comm/handlers/fetch.ts
var import_js_iden3_core26 = require("@iden3/js-iden3-core");
var uuid5 = __toESM(require("uuid"), 1);
var FetchHandler = class _FetchHandler extends AbstractMessageHandler {
  /**
   * Constructs a new instance of the FetchHandler class.
   *
   * @param _packerMgr The package manager used for packing and unpacking data.
   * @param opts Optional configuration options for the FetchHandler.
   * @param opts.credentialWallet The credential wallet used for managing credentials.
   */
  constructor(_packerMgr, opts) {
    super();
    this._packerMgr = _packerMgr;
    this.opts = opts;
  }
  async handle(message, ctx) {
    switch (message.type) {
      case PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE: {
        const result = await this.handleOfferMessage(message, ctx);
        if (Array.isArray(result)) {
          const credWallet = this.opts?.credentialWallet;
          if (!credWallet) throw new Error("Credential wallet is not provided");
          await credWallet.saveAll(result);
          return null;
        }
        return result;
      }
      case PROTOCOL_MESSAGE_TYPE.CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE:
        return this.handleFetchRequest(message);
      case PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE:
        return this.handleIssuanceResponseMsg(message);
      case PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ONCHAIN_OFFER_MESSAGE_TYPE: {
        const result = await this.handleOnchainOfferMessage(
          message
        );
        if (Array.isArray(result)) {
          const credWallet = this.opts?.credentialWallet;
          if (!credWallet) throw new Error("Credential wallet is not provided");
          await credWallet.saveAll(result);
          return null;
        }
        return result;
      }
      case PROTOCOL_MESSAGE_TYPE.ENCRYPTED_CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE: {
        await this.handleEncryptedIssuanceResponseMessage(
          message
        );
        return null;
      }
      default:
        return super.handle(message, ctx);
    }
  }
  async handleOnchainOfferMessage(offerMessage) {
    if (!this.opts?.onchainIssuer) {
      throw new Error("onchain issuer is not provided");
    }
    const credentials = [];
    for (const credentialInfo of offerMessage.body.credentials) {
      const issuerDID = import_js_iden3_core26.DID.parse(offerMessage.from);
      const userDID = import_js_iden3_core26.DID.parse(offerMessage.to);
      const credential = await this.opts.onchainIssuer.getCredential(
        issuerDID,
        userDID,
        BigInt(credentialInfo.id)
      );
      credentials.push(credential);
    }
    return credentials;
  }
  async handleOfferMessage(offerMessage, ctx) {
    if (!ctx.mediaType) {
      ctx.mediaType = "application/iden3-zkp-json" /* ZKPMessage */;
    }
    const credentials = [];
    for (const credentialInfo of offerMessage.body.credentials) {
      const guid = uuid5.v4();
      const fetchRequest = {
        id: guid,
        typ: ctx.mediaType,
        type: PROTOCOL_MESSAGE_TYPE.CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE,
        thid: offerMessage.thid ?? guid,
        body: {
          id: credentialInfo.id
        },
        from: offerMessage.to,
        to: offerMessage.from
      };
      const msgBytes = byteEncoder.encode(JSON.stringify(fetchRequest));
      const senderDID = import_js_iden3_core26.DID.parse(offerMessage.to);
      const packerOpts = initDefaultPackerOptions(ctx.mediaType, ctx.packerOptions, {
        senderDID
      });
      const token = byteDecoder.decode(
        await this._packerMgr.pack(ctx.mediaType, msgBytes, packerOpts)
      );
      try {
        if (!offerMessage?.body?.url) {
          throw new Error(`could not fetch W3C credential, body url is missing`);
        }
        const resp = await fetch(offerMessage.body.url, {
          method: "post",
          headers: {
            "Content-Type": MEDIA_TYPE_TO_CONTENT_TYPE[ctx.mediaType],
            ...ctx.headers
          },
          body: token
        });
        const arrayBuffer = await resp.arrayBuffer();
        if (!arrayBuffer.byteLength) {
          throw new Error(`could not fetch , ${credentialInfo?.id}, response is empty`);
        }
        const { unpackedMessage: message } = await this._packerMgr.unpack(
          new Uint8Array(arrayBuffer)
        );
        if (message.type === PROTOCOL_MESSAGE_TYPE.ENCRYPTED_CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE) {
          await this.handleEncryptedIssuanceResponseMessage(
            message
          );
          return [];
        }
        if (message.type !== PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE) {
          return message;
        }
        credentials.push(
          W3CCredential.fromJSON(message.body.credential)
        );
      } catch (e) {
        throw new Error(
          `could not fetch protocol message for credential offer id: , ${credentialInfo?.id}, error: ${e.message ?? e}`
        );
      }
    }
    return credentials;
  }
  /**
   * Handles only messages with credentials/1.0/offer type
   *
   * @param {
   *     offer: Uint8Array; offer - raw offer message
   *     opts
   *   }) options how to fetch credential
   * @returns `Promise<W3CCredential[]>`
   */
  async handleCredentialOffer(offer, opts) {
    const offerMessage = await _FetchHandler.unpackMessage(
      this._packerMgr,
      offer,
      PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE
    );
    if (!opts?.allowExpiredMessages) {
      verifyExpiresTime(offerMessage);
    }
    const mediaType = opts?.mediaType || "application/iden3-zkp-json" /* ZKPMessage */;
    const packerOptions = initDefaultPackerOptions(mediaType, opts?.packerOptions, {
      provingMethodAlg: opts?.messageProvingMethodAlg || await getProvingMethodAlgFromJWZ(offer),
      senderDID: import_js_iden3_core26.DID.parse(offerMessage.to)
    });
    const result = await this.handleOfferMessage(offerMessage, {
      mediaType,
      headers: opts?.headers,
      packerOptions
    });
    if (Array.isArray(result)) {
      return result;
    }
    throw new Error("invalid protocol message response");
  }
  /**
   * Handles only messages with credentials/1.0/onchain-offer type
   * @beta
   */
  async handleOnchainOffer(offer) {
    const offerMessage = await _FetchHandler.unpackMessage(
      this._packerMgr,
      offer,
      PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ONCHAIN_OFFER_MESSAGE_TYPE
    );
    return this.handleOnchainOfferMessage(offerMessage);
  }
  async handleFetchRequest(msgRequest) {
    if (!msgRequest.to) {
      throw new Error("failed request. empty 'to' field");
    }
    if (!msgRequest.from) {
      throw new Error("failed request. empty 'from' field");
    }
    const issuerDID = import_js_iden3_core26.DID.parse(msgRequest.to);
    const userDID = import_js_iden3_core26.DID.parse(msgRequest.from);
    const credId = msgRequest.body?.id;
    if (!credId) {
      throw new Error("invalid credential id in fetch request body");
    }
    if (!this.opts?.credentialWallet) {
      throw new Error("please, provide credential wallet in options");
    }
    const cred = await this.opts.credentialWallet.findById(credId);
    if (!cred) {
      throw new Error("credential not found");
    }
    const userToVerifyDID = getUserDIDFromCredential(issuerDID, cred);
    if (userToVerifyDID.string() !== userDID.string()) {
      throw new Error("credential subject is not a sender DID");
    }
    return {
      id: uuid5.v4(),
      type: PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE,
      typ: msgRequest.typ ?? "application/iden3comm-plain-json" /* PlainMessage */,
      thid: msgRequest.thid ?? uuid5.v4(),
      body: { credential: cred },
      from: msgRequest.to,
      to: msgRequest.from
    };
  }
  /**
   * @inheritdoc IFetchHandler#handleCredentialFetchRequest
   */
  async handleCredentialFetchRequest(envelope, opts) {
    const msgRequest = await _FetchHandler.unpackMessage(
      this._packerMgr,
      envelope,
      PROTOCOL_MESSAGE_TYPE.CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE
    );
    if (!opts?.allowExpiredMessages) {
      verifyExpiresTime(msgRequest);
    }
    const request = await this.handleFetchRequest(msgRequest);
    return this._packerMgr.pack(
      "application/iden3comm-plain-json" /* PlainMessage */,
      byteEncoder.encode(JSON.stringify(request)),
      {}
    );
  }
  async handleEncryptedIssuanceResponseMessage(message) {
    if (!this.opts?.joseService) {
      throw new Error(
        "JoseService is not initialized. Encrypted issuance response cannot be handled"
      );
    }
    const { plaintext } = await this.opts.joseService.decrypt(
      message.body.data
    );
    const credential = W3CCredential.fromJSON({
      ...JSON.parse(byteDecoder.decode(plaintext)),
      proof: message.body.proof
    });
    if (!this.opts?.credentialWallet) {
      throw new Error(
        "please provide credential wallet in options for encrypted issuance response handling"
      );
    }
    if (!this.opts?.didResolverUrl) {
      throw new Error(
        "please provide resolver URL in options for encrypted issuance response handling"
      );
    }
    if (!this.opts?.merklizeOptions) {
      throw new Error("please provide merklize options for encrypted issuance response handling");
    }
    const credStatusResolverRegistry = this.opts.credentialWallet.getCredentialStatusResolverRegistry();
    if (!credStatusResolverRegistry) {
      throw new Error("credential status resolver registry is not available in credential wallet");
    }
    const isValid = await credential.verifyProofs(this.opts.didResolverUrl, {
      credStatusResolverRegistry,
      merklizeOptions: this.opts.merklizeOptions
    });
    if (!isValid) {
      throw new Error("credential proof verification failed");
    }
    await this.opts?.credentialWallet?.save(credential);
    return null;
  }
  async handleIssuanceResponseMsg(issuanceMsg) {
    if (!this.opts?.credentialWallet) {
      throw new Error("please provide credential wallet in options");
    }
    if (!issuanceMsg.body?.credential) {
      throw new Error("credential is missing in issuance response message");
    }
    if (!(issuanceMsg.body.credential instanceof W3CCredential)) {
      throw new Error("credential object is not properly unmarshaled");
    }
    await this.opts.credentialWallet.save(issuanceMsg.body.credential);
    return null;
  }
  /**
   * @inheritdoc IFetchHandler#handleIssuanceResponseMessage
   */
  async handleIssuanceResponseMessage(envelop, opts) {
    const issuanceMsg = await _FetchHandler.unpackMessage(
      this._packerMgr,
      envelop,
      PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE
    );
    if (!opts?.allowExpiredMessages) {
      verifyExpiresTime(issuanceMsg);
    }
    issuanceMsg.body.credential = W3CCredential.fromJSON(issuanceMsg.body.credential);
    await this.handleIssuanceResponseMsg(issuanceMsg);
    return Uint8Array.from([]);
  }
  /**
   * @inheritdoc IFetchHandler#unpackMessage
   */
  static async unpackMessage(packerMgr, envelope, messageType) {
    const { unpackedMessage: message } = await packerMgr.unpack(envelope);
    const msgRequest = message;
    if (message.type !== messageType) {
      throw new Error("Invalid message type");
    }
    return msgRequest;
  }
};

// src/iden3comm/handlers/contract-request.ts
var import_js_iden3_core27 = require("@iden3/js-iden3-core");
var ContractRequestHandler = class extends AbstractMessageHandler {
  /**
   * Creates an instance of ContractRequestHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   * @param {IProofService} _proofService -  proof service to verify zk proofs
   * @param {IOnChainZKPVerifier} _zkpVerifier - zkp verifier to submit response
   * @param {IOnChainVerifierMultiQuery} _verifierMultiQuery - verifier multi-query to submit response
   *
   */
  constructor(_packerMgr, _proofService, _zkpVerifier) {
    super();
    this._packerMgr = _packerMgr;
    this._proofService = _proofService;
    this._zkpVerifier = _zkpVerifier;
  }
  _supportedCircuits = [
    "authV2" /* AuthV2 */,
    "credentialAtomicQueryMTPV2OnChain" /* AtomicQueryMTPV2OnChain */,
    "credentialAtomicQuerySigV2OnChain" /* AtomicQuerySigV2OnChain */,
    "credentialAtomicQueryV3OnChain-beta.1" /* AtomicQueryV3OnChain */,
    "credentialAtomicQueryV3OnChain" /* AtomicQueryV3OnChainStable */,
    // Now we support off-chain circuits on-chain
    // TODO: We need to create validators for them
    "authV2" /* AuthV2 */,
    "authV3" /* AuthV3 */,
    "authV3-8-32" /* AuthV3_8_32 */,
    "linkedMultiQuery10-beta.1" /* LinkedMultiQuery10 */,
    "credentialAtomicQueryV3" /* AtomicQueryV3Stable */,
    "linkedMultiQuery" /* LinkedMultiQueryStable */
  ];
  async handle(message, ctx) {
    switch (message.type) {
      case PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE: {
        const ciMessage = message;
        const txHashResponsesMap = await this.handleContractInvoke(ciMessage, ctx);
        return this.createContractInvokeResponse(ciMessage, txHashResponsesMap);
      }
      default:
        return super.handle(message, ctx);
    }
  }
  async handleContractInvoke(message, ctx) {
    if (message.type !== PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE) {
      throw new Error("Invalid message type for contract invoke request");
    }
    const { senderDid: did, ethSigner, challenge } = ctx;
    if (!ctx.ethSigner) {
      throw new Error("Can't sign transaction. Provide Signer in options.");
    }
    const { chain_id } = message.body.transaction_data;
    const networkFlag = Object.keys(import_js_iden3_core27.ChainIds).find((key) => import_js_iden3_core27.ChainIds[key] === chain_id);
    if (!networkFlag) {
      throw new Error(`Invalid chain id ${chain_id}`);
    }
    const verifierDid = message.from ? import_js_iden3_core27.DID.parse(message.from) : void 0;
    const { scope = [] } = message.body;
    const zkpResponses = await processZeroKnowledgeProofRequests(
      did,
      scope,
      verifierDid,
      this._proofService,
      {
        ethSigner,
        challenge: challenge ?? import_js_iden3_core27.BytesHelper.bytesToInt(hexToBytes(await ethSigner.getAddress())),
        supportedCircuits: this._supportedCircuits
      }
    );
    const methodId = message.body.transaction_data.method_id.replace("0x", "");
    switch (methodId) {
      case "ade09fcd" /* SubmitZKPResponseV2 */: {
        const txHashZkpResponsesMap = await this._zkpVerifier.submitZKPResponseV2(
          ethSigner,
          message.body.transaction_data,
          zkpResponses
        );
        const response = /* @__PURE__ */ new Map();
        for (const [txHash, zkpResponses2] of txHashZkpResponsesMap) {
          response.set(txHash, { responses: zkpResponses2 });
        }
        message.body.transaction_data.txHash = txHashZkpResponsesMap.keys().next().value;
        return response;
      }
      case "b68967e2" /* SubmitZKPResponseV1 */: {
        const txHashZkpResponseMap = await this._zkpVerifier.submitZKPResponse(
          ethSigner,
          message.body.transaction_data,
          zkpResponses
        );
        const response = /* @__PURE__ */ new Map();
        for (const [txHash, zkpResponse] of txHashZkpResponseMap) {
          response.set(txHash, { responses: [zkpResponse] });
        }
        message.body.transaction_data.txHash = txHashZkpResponseMap.keys().next().value;
        return response;
      }
      case "06c86a91" /* SubmitResponse */: {
        if (!message.to) {
          throw new Error(`failed message. empty 'to' field`);
        }
        const acceptProfile = getFirstSupportedProfile(
          PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE,
          this._packerMgr,
          message.body.accept
        );
        const identifier = import_js_iden3_core27.DID.parse(message.to);
        const { authProof } = await processProofAuth(identifier, this._proofService, {
          supportedCircuits: this._supportedCircuits,
          acceptProfile,
          senderAddress: await ethSigner.getAddress(),
          zkpResponses
        });
        const txHashZkpResponsesMap = await this._zkpVerifier.submitResponse(
          ethSigner,
          message.body.transaction_data,
          zkpResponses,
          authProof
        );
        message.body.transaction_data.txHash = txHashZkpResponsesMap.keys().next().value;
        return txHashZkpResponsesMap;
      }
      default:
        throw new Error(
          `Not supported method id. Only '${"b68967e2" /* SubmitZKPResponseV1 */}, ${"ade09fcd" /* SubmitZKPResponseV2 */} and ${"06c86a91" /* SubmitResponse */} are supported.'`
        );
    }
  }
  /**
   * unpacks contract-invoke request
   * @beta
   * @param {Uint8Array} request - raw byte message
   * @returns `Promise<ContractInvokeRequest>`
   */
  async parseContractInvokeRequest(request) {
    const { unpackedMessage: message } = await this._packerMgr.unpack(request);
    const ciRequest = message;
    if (message.type !== PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE) {
      throw new Error("Invalid media type");
    }
    ciRequest.body.scope = ciRequest.body.scope || [];
    return ciRequest;
  }
  /**
   * creates contract invoke response
   * @private
   * @beta
   * @param {ContractInvokeRequest} request - ContractInvokeRequest
   * @param { Map<string, ZeroKnowledgeInvokeResponse>} responses - map tx hash to array of ZeroKnowledgeInvokeResponse
   * @returns `Promise<ContractInvokeResponse>`
   */
  async createContractInvokeResponse(request, txHashToZkpResponseMap) {
    const contractInvokeResponse = {
      id: request.id,
      thid: request.thid,
      type: PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_RESPONSE_MESSAGE_TYPE,
      from: request.to,
      to: request.from,
      body: {
        transaction_data: request.body.transaction_data,
        scope: []
      },
      created_time: (0, import_js_iden3_core27.getUnixTimestamp)(/* @__PURE__ */ new Date())
    };
    for (const [txHash, zkpResponses] of txHashToZkpResponseMap) {
      for (const zkpResponse of zkpResponses.responses) {
        contractInvokeResponse.body.scope.push({
          txHash,
          ...zkpResponse
        });
      }
      contractInvokeResponse.body = {
        ...contractInvokeResponse.body,
        crossChainProof: zkpResponses.crossChainProof,
        authProof: zkpResponses.authProof
      };
    }
    return contractInvokeResponse;
  }
  /**
   * handle contract invoke request
   * supports only 0xb68967e2 method id
   * @beta
   * @deprecated
   * @param {did} did  - sender DID
   * @param {ContractInvokeRequest} request  - contract invoke request
   * @param {ContractInvokeHandlerOptions} opts - handler options
   * @returns {Map<string, ZeroKnowledgeProofResponse>}` - map of transaction hash - ZeroKnowledgeProofResponse
   */
  async handleContractInvokeRequest(did, request, opts) {
    const ciRequest = await this.parseContractInvokeRequest(request);
    if (!opts.allowExpiredMessages) {
      verifyExpiresTime(ciRequest);
    }
    if (ciRequest.body.transaction_data.method_id !== "b68967e2" /* SubmitZKPResponseV1 */) {
      throw new Error(`please use handle method to work with other method ids`);
    }
    if (ciRequest.type !== PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE) {
      throw new Error("Invalid message type for contract invoke request");
    }
    const { ethSigner, challenge } = opts;
    if (!ethSigner) {
      throw new Error("Can't sign transaction. Provide Signer in options.");
    }
    const { chain_id } = ciRequest.body.transaction_data;
    const networkFlag = Object.keys(import_js_iden3_core27.ChainIds).find((key) => import_js_iden3_core27.ChainIds[key] === chain_id);
    if (!networkFlag) {
      throw new Error(`Invalid chain id ${chain_id}`);
    }
    const verifierDid = ciRequest.from ? import_js_iden3_core27.DID.parse(ciRequest.from) : void 0;
    const zkpResponses = await processZeroKnowledgeProofRequests(
      did,
      ciRequest?.body?.scope,
      verifierDid,
      this._proofService,
      { ethSigner, challenge, supportedCircuits: this._supportedCircuits }
    );
    return this._zkpVerifier.submitZKPResponse(
      ethSigner,
      ciRequest.body.transaction_data,
      zkpResponses
    );
  }
};

// src/iden3comm/handlers/refresh.ts
var import_js_iden3_core28 = require("@iden3/js-iden3-core");
var uuid6 = __toESM(require("uuid"), 1);
var RefreshHandler = class {
  /**
   * Creates an instance of RefreshHandler.
   * @param {RefreshHandlerOptions} _options - refresh handler options
   */
  constructor(_options) {
    this._options = _options;
  }
  async refreshCredential(credential, opts) {
    if (!credential.refreshService) {
      throw new Error("refreshService not specified for W3CCredential");
    }
    if (credential.refreshService.type !== "Iden3RefreshService2023" /* Iden3RefreshService2023 */) {
      throw new Error(`refresh service type ${credential.refreshService.type} is not supported`);
    }
    const otherIdentifier = credential.credentialSubject.id;
    if (!otherIdentifier) {
      throw new Error("self credentials do not support refresh");
    }
    const senderDID = import_js_iden3_core28.DID.parse(otherIdentifier);
    const mediaType = opts?.mediaType || "application/iden3-zkp-json" /* ZKPMessage */;
    const packerOptions = opts?.packerOptions ?? {
      senderDID,
      provingMethodAlg: defaultProvingMethodAlg
    };
    const refreshMsg = {
      id: uuid6.v4(),
      typ: "application/iden3-zkp-json" /* ZKPMessage */,
      type: PROTOCOL_MESSAGE_TYPE.CREDENTIAL_REFRESH_MESSAGE_TYPE,
      thid: uuid6.v4(),
      body: {
        id: credential.id,
        reason: opts?.reason ?? "credential is expired"
      },
      from: otherIdentifier,
      to: credential.issuer
    };
    const msgBytes = byteEncoder.encode(JSON.stringify(refreshMsg));
    const token = await this._options.packageManager.pack(mediaType, msgBytes, packerOptions);
    const resp = await fetch(credential.refreshService.id, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: token.buffer
    });
    if (resp.status !== 200) {
      throw new Error(`could not refresh W3C credential, return status ${resp.status}`);
    }
    const respBody = await resp.json();
    if (!respBody.body?.credential) {
      throw new Error("no credential in CredentialIssuanceMessage response");
    }
    return W3CCredential.fromJSON(respBody.body.credential);
  }
};

// src/iden3comm/handlers/revocation-status.ts
var import_js_iden3_core29 = require("@iden3/js-iden3-core");
var uuid7 = __toESM(require("uuid"), 1);
var RevocationStatusHandler = class extends AbstractMessageHandler {
  /**
   * Creates an instance of RevocationStatusHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   * @param {IIdentityWallet} _identityWallet - identity wallet
   *
   */
  constructor(_packerMgr, _identityWallet) {
    super();
    this._packerMgr = _packerMgr;
    this._identityWallet = _identityWallet;
  }
  handle(message, context) {
    if (!context.senderDid) {
      throw new Error("DID is required");
    }
    if (!context.mediaType) {
      throw new Error("mediaType is required");
    }
    switch (message.type) {
      case PROTOCOL_MESSAGE_TYPE.REVOCATION_STATUS_REQUEST_MESSAGE_TYPE:
        return this.handleRevocationStatusRequestMessage(
          message,
          context
        );
      default:
        return super.handle(message, context);
    }
  }
  async handleRevocationStatusRequestMessage(rsRequest, context) {
    if (!rsRequest.to) {
      throw new Error(`failed request. empty 'to' field`);
    }
    if (!rsRequest.from) {
      throw new Error(`failed request. empty 'from' field`);
    }
    if (!rsRequest.body?.revocation_nonce) {
      throw new Error(`failed request. empty 'revocation_nonce' field`);
    }
    const issuerDID = import_js_iden3_core29.DID.parse(rsRequest.to);
    const mtpWithTreeState = await this._identityWallet.generateNonRevocationMtpWithNonce(
      issuerDID,
      BigInt(rsRequest.body.revocation_nonce),
      context.treeState
    );
    const treeState = mtpWithTreeState.treeState;
    const revStatus = {
      issuer: {
        state: treeState?.state.string(),
        claimsTreeRoot: treeState.claimsRoot.string(),
        revocationTreeRoot: treeState.revocationRoot.string(),
        rootOfRoots: treeState.rootOfRoots.string()
      },
      mtp: mtpWithTreeState.proof
    };
    const guid = uuid7.v4();
    const response = {
      id: guid,
      typ: "application/iden3comm-plain-json" /* PlainMessage */,
      type: PROTOCOL_MESSAGE_TYPE.REVOCATION_STATUS_RESPONSE_MESSAGE_TYPE,
      thid: rsRequest.thid ?? guid,
      body: revStatus,
      from: context.senderDid.string(),
      to: rsRequest.from
    };
    return response;
  }
  /**
   * @inheritdoc IRevocationStatusHandler#parseRevocationStatusRequest
   */
  async parseRevocationStatusRequest(request) {
    const { unpackedMessage: message } = await this._packerMgr.unpack(request);
    const ciRequest = message;
    if (message.type !== PROTOCOL_MESSAGE_TYPE.REVOCATION_STATUS_REQUEST_MESSAGE_TYPE) {
      throw new Error("Invalid media type");
    }
    return ciRequest;
  }
  /**
   * @inheritdoc IRevocationStatusHandler#handleRevocationStatusRequest
   */
  async handleRevocationStatusRequest(did, request, opts) {
    if (!opts) {
      opts = {
        mediaType: "application/iden3comm-plain-json" /* PlainMessage */
      };
    }
    const rsRequest = await this.parseRevocationStatusRequest(request);
    if (!opts.allowExpiredMessages) {
      verifyExpiresTime(rsRequest);
    }
    const response = await this.handleRevocationStatusRequestMessage(rsRequest, {
      senderDid: did,
      mediaType: opts.mediaType,
      packerOptions: opts.packerOptions,
      treeState: opts.treeState
    });
    if (!rsRequest.to) {
      throw new Error(`failed request. empty 'to' field`);
    }
    const senderDID = import_js_iden3_core29.DID.parse(rsRequest.to);
    const packerOpts = initDefaultPackerOptions(opts.mediaType, opts.packerOptions, {
      senderDID,
      provingMethodAlg: opts.packerOptions?.provingMethodAlg || await getProvingMethodAlgFromJWZ(request)
    });
    return this._packerMgr.pack(
      opts.mediaType,
      byteEncoder.encode(JSON.stringify(response)),
      packerOpts
    );
  }
};

// src/iden3comm/handlers/credential-proposal.ts
var import_js_iden3_core30 = require("@iden3/js-iden3-core");
var uuid8 = __toESM(require("uuid"), 1);
function createProposalRequest(sender, receiver, opts) {
  const uuidv4 = uuid8.v4();
  const request = {
    id: uuidv4,
    thid: uuidv4,
    from: sender.string(),
    to: receiver.string(),
    typ: "application/iden3comm-plain-json" /* PlainMessage */,
    type: PROTOCOL_MESSAGE_TYPE.PROPOSAL_REQUEST_MESSAGE_TYPE,
    body: {
      credentials: opts.credentials,
      did_doc: opts.did_doc
    },
    created_time: (0, import_js_iden3_core30.getUnixTimestamp)(/* @__PURE__ */ new Date()),
    expires_time: opts?.expires_time ? (0, import_js_iden3_core30.getUnixTimestamp)(opts.expires_time) : void 0,
    attachments: opts.attachments
  };
  return request;
}
function createProposal(sender, receiver, proposals, opts) {
  const uuidv4 = uuid8.v4();
  const request = {
    id: uuidv4,
    thid: uuidv4,
    from: sender.string(),
    to: receiver.string(),
    typ: "application/iden3comm-plain-json" /* PlainMessage */,
    type: PROTOCOL_MESSAGE_TYPE.PROPOSAL_MESSAGE_TYPE,
    body: {
      proposals: proposals || []
    },
    created_time: (0, import_js_iden3_core30.getUnixTimestamp)(/* @__PURE__ */ new Date()),
    expires_time: opts?.expires_time ? (0, import_js_iden3_core30.getUnixTimestamp)(opts.expires_time) : void 0
  };
  return request;
}
var CredentialProposalHandler = class extends AbstractMessageHandler {
  /**
   * @beta Creates an instance of CredentialProposalHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   * @param {IIdentityWallet} _identityWallet - identity wallet
   * @param {CredentialProposalHandlerParams} _params - credential proposal handler params
   *
   */
  constructor(_packerMgr, _identityWallet, _params) {
    super();
    this._packerMgr = _packerMgr;
    this._identityWallet = _identityWallet;
    this._params = _params;
  }
  async handle(message, context) {
    switch (message.type) {
      case PROTOCOL_MESSAGE_TYPE.PROPOSAL_REQUEST_MESSAGE_TYPE:
        return await this.handleProposalRequestMessage(
          message,
          context
        );
      default:
        return super.handle(message, context);
    }
  }
  /**
   * @inheritdoc ICredentialProposalHandler#parseProposalRequest
   */
  async parseProposalRequest(request) {
    const { unpackedMessage: message } = await this._packerMgr.unpack(request);
    const proposalRequest = message;
    if (message.type !== PROTOCOL_MESSAGE_TYPE.PROPOSAL_REQUEST_MESSAGE_TYPE) {
      throw new Error("Invalid media type");
    }
    return proposalRequest;
  }
  async handleProposalRequestMessage(proposalRequest, ctx) {
    if (!proposalRequest.to) {
      throw new Error(`failed request. empty 'to' field`);
    }
    if (!proposalRequest.from) {
      throw new Error(`failed request. empty 'from' field`);
    }
    if (!proposalRequest.body?.credentials?.length) {
      throw new Error(`failed request. no 'credentials' in body`);
    }
    let credOfferMessage = void 0;
    let proposalMessage = void 0;
    for (let i = 0; i < proposalRequest.body.credentials.length; i++) {
      const cred = proposalRequest.body.credentials[i];
      let credsFromWallet = [];
      if (!ctx?.forceCredentialReissue) {
        try {
          credsFromWallet = await this._identityWallet.credentialWallet.findByQuery({
            credentialSubject: {
              id: {
                $eq: proposalRequest.from
              }
            },
            type: cred.type,
            context: cred.context,
            allowedIssuers: [proposalRequest.to]
          });
        } catch (e) {
          if (e.message !== "no credential satisfied query") {
            throw e;
          }
        }
        credsFromWallet = credsFromWallet.filter(
          (c) => !c.expirationDate || new Date(c.expirationDate) > /* @__PURE__ */ new Date()
        );
        if (credsFromWallet.length) {
          const guid = uuid8.v4();
          if (!credOfferMessage) {
            credOfferMessage = {
              id: guid,
              typ: this._params.packerParams.mediaType,
              type: PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE,
              thid: proposalRequest.thid ?? guid,
              body: {
                url: this._params.agentUrl,
                credentials: []
              },
              from: proposalRequest.to,
              to: proposalRequest.from
            };
          }
          credOfferMessage.body.credentials.push(
            ...credsFromWallet.map((c) => ({
              id: c.id,
              description: ""
            }))
          );
          continue;
        }
      }
      const proposal = await this._params.proposalResolverFn(cred.context, cred.type, {
        msg: proposalRequest
      });
      if (!proposal) {
        throw new Error(`can't resolve Proposal for type: ${cred.type}, context: ${cred.context}`);
      }
      if (!proposalMessage) {
        const guid = uuid8.v4();
        proposalMessage = {
          id: guid,
          typ: this._params.packerParams.mediaType,
          type: PROTOCOL_MESSAGE_TYPE.PROPOSAL_MESSAGE_TYPE,
          thid: proposalRequest.thid ?? guid,
          body: {
            proposals: []
          },
          from: proposalRequest.to,
          to: proposalRequest.from
        };
      }
      proposalMessage.body?.proposals.push(proposal);
    }
    return proposalMessage ?? credOfferMessage;
  }
  /**
   * @inheritdoc ICredentialProposalHandler#handleProposalRequest
   */
  async handleProposalRequest(request, opts) {
    const proposalRequest = await this.parseProposalRequest(request);
    if (!proposalRequest.from) {
      throw new Error(`failed request. empty 'from' field`);
    }
    if (!opts?.allowExpiredMessages) {
      verifyExpiresTime(proposalRequest);
    }
    const senderDID = import_js_iden3_core30.DID.parse(proposalRequest.from);
    const message = await this.handleProposalRequestMessage(proposalRequest);
    const response = byteEncoder.encode(JSON.stringify(message));
    const packerOpts = initDefaultPackerOptions(
      this._params.packerParams.mediaType,
      this._params.packerParams.packerOptions,
      {
        provingMethodAlg: await getProvingMethodAlgFromJWZ(request),
        senderDID
      }
    );
    return this._packerMgr.pack(this._params.packerParams.mediaType, response, packerOpts);
  }
  /**
   * @inheritdoc ICredentialProposalHandler#handleProposal
   */
  async handleProposal(proposal, opts) {
    if (!opts?.allowExpiredMessages) {
      verifyExpiresTime(proposal);
    }
    if (opts?.proposalRequest && opts.proposalRequest.from !== proposal.to) {
      throw new Error(
        `sender of the request is not a target of response - expected ${opts.proposalRequest.from}, given ${proposal.to}`
      );
    }
    return { proposal };
  }
};

// src/iden3comm/handlers/payment.ts
var import_js_iden3_core31 = require("@iden3/js-iden3-core");
var uuid9 = __toESM(require("uuid"), 1);
function createPaymentRequest(sender, receiver, agent, payments, opts) {
  const uuidv4 = uuid9.v4();
  const request = {
    id: uuidv4,
    thid: uuidv4,
    from: sender.string(),
    to: receiver.string(),
    typ: "application/iden3comm-plain-json" /* PlainMessage */,
    type: PROTOCOL_MESSAGE_TYPE.PAYMENT_REQUEST_MESSAGE_TYPE,
    body: {
      agent,
      payments
    },
    created_time: (0, import_js_iden3_core31.getUnixTimestamp)(/* @__PURE__ */ new Date()),
    expires_time: opts?.expires_time ? (0, import_js_iden3_core31.getUnixTimestamp)(opts.expires_time) : void 0
  };
  return request;
}
function createPayment(sender, receiver, payments, opts) {
  const uuidv4 = uuid9.v4();
  const request = {
    id: uuidv4,
    thid: uuidv4,
    from: sender.string(),
    to: receiver.string(),
    typ: "application/iden3comm-plain-json" /* PlainMessage */,
    type: PROTOCOL_MESSAGE_TYPE.PAYMENT_MESSAGE_TYPE,
    body: {
      payments
    },
    created_time: (0, import_js_iden3_core31.getUnixTimestamp)(/* @__PURE__ */ new Date()),
    expires_time: opts?.expires_time ? (0, import_js_iden3_core31.getUnixTimestamp)(opts.expires_time) : void 0
  };
  return request;
}
var PaymentHandler = class extends AbstractMessageHandler {
  /**
   * @beta Creates an instance of PaymentHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   * @param {PaymentHandlerParams} _params - payment handler params
   *
   */
  constructor(_packerMgr, _params) {
    super();
    this._packerMgr = _packerMgr;
    this._params = _params;
  }
  async handle(message, context) {
    switch (message.type) {
      case PROTOCOL_MESSAGE_TYPE.PAYMENT_REQUEST_MESSAGE_TYPE:
        return await this.handlePaymentRequestMessage(
          message,
          context
        );
      case PROTOCOL_MESSAGE_TYPE.PAYMENT_MESSAGE_TYPE:
        await this.handlePayment(message, context);
        return null;
      default:
        return super.handle(message, context);
    }
  }
  /**
   * @inheritdoc IPaymentHandler#parsePaymentRequest
   */
  async parsePaymentRequest(request) {
    const { unpackedMessage: message } = await this._packerMgr.unpack(request);
    const paymentRequest = message;
    if (message.type !== PROTOCOL_MESSAGE_TYPE.PAYMENT_REQUEST_MESSAGE_TYPE) {
      throw new Error("Invalid media type");
    }
    return paymentRequest;
  }
  async handlePaymentRequestMessage(paymentRequest, ctx) {
    if (!paymentRequest.to) {
      throw new Error(`failed request. empty 'to' field`);
    }
    if (!paymentRequest.from) {
      throw new Error(`failed request. empty 'from' field`);
    }
    if (!paymentRequest.body.payments?.length) {
      throw new Error(`failed request. no 'payments' in body`);
    }
    if (!ctx.paymentHandler) {
      throw new Error(`please provide payment handler in context`);
    }
    const senderDID = import_js_iden3_core31.DID.parse(paymentRequest.to);
    const receiverDID = import_js_iden3_core31.DID.parse(paymentRequest.from);
    const payments = [];
    for (let i = 0; i < paymentRequest.body.payments.length; i++) {
      const { data } = paymentRequest.body.payments[i];
      const selectedPayment = Array.isArray(data) ? data.find((p) => {
        return p.type === "Iden3PaymentRequestCryptoV1" /* Iden3PaymentRequestCryptoV1 */ ? p.id === ctx.nonce : p.nonce === ctx.nonce;
      }) : data;
      if (!selectedPayment) {
        throw new Error(`failed request. no payment in request for nonce ${ctx.nonce}`);
      }
      switch (selectedPayment.type) {
        case "Iden3PaymentRequestCryptoV1" /* Iden3PaymentRequestCryptoV1 */:
          payments.push(
            await this.handleIden3PaymentRequestCryptoV1(selectedPayment, ctx.paymentHandler)
          );
          break;
        case "Iden3PaymentRailsRequestV1" /* Iden3PaymentRailsRequestV1 */:
          payments.push(
            await this.handleIden3PaymentRailsRequestV1(selectedPayment, ctx.paymentHandler)
          );
          break;
        case "Iden3PaymentRailsERC20RequestV1" /* Iden3PaymentRailsERC20RequestV1 */:
          payments.push(
            await this.handleIden3PaymentRailsERC20RequestV1(
              selectedPayment,
              ctx.paymentHandler,
              ctx.erc20TokenApproveHandler
            )
          );
          break;
        case "Iden3PaymentRailsSolanaRequestV1" /* Iden3PaymentRailsSolanaRequestV1 */:
          payments.push(
            await this.handleIden3PaymentRailsSolanaRequestV1(selectedPayment, ctx.paymentHandler)
          );
          break;
        case "Iden3PaymentRailsSolanaSPLRequestV1" /* Iden3PaymentRailsSolanaSPLRequestV1 */:
          payments.push(
            await this.handleIden3PaymentRailsSolanaSPLRequestV1(
              {
                ...selectedPayment,
                type: "Iden3PaymentRailsSolanaSPLRequestV1" /* Iden3PaymentRailsSolanaSPLRequestV1 */
              },
              ctx.paymentHandler
            )
          );
          break;
      }
    }
    const paymentMessage = createPayment(senderDID, receiverDID, payments);
    const mediaType = ctx?.mediaType || this._params.packerParams.mediaType || "application/iden3-zkp-json" /* ZKPMessage */;
    const packerParams = initDefaultPackerOptions(
      mediaType,
      ctx?.packerOptions || this._params.packerParams,
      {
        senderDID,
        provingMethodAlg: ctx.messageProvingMethodAlg
      }
    );
    const response = await this.packMessage(paymentMessage, senderDID, mediaType, packerParams);
    const agentResult = await fetch(paymentRequest.body.agent, {
      method: "POST",
      body: response.buffer,
      headers: {
        ...ctx.headers,
        "Content-Type": this._params.packerParams.mediaType === "application/iden3comm-plain-json" /* PlainMessage */ ? "application/json" : "application/octet-stream"
      }
    });
    const arrayBuffer = await agentResult.arrayBuffer();
    if (!arrayBuffer.byteLength) {
      return null;
    }
    const { unpackedMessage } = await this._packerMgr.unpack(new Uint8Array(arrayBuffer));
    return unpackedMessage;
  }
  /**
   * @inheritdoc IPaymentHandler#handlePaymentRequest
   */
  async handlePaymentRequest(request, opts) {
    const paymentRequest = await this.parsePaymentRequest(request);
    if (!paymentRequest.from) {
      throw new Error(`failed request. empty 'from' field`);
    }
    if (!paymentRequest.to) {
      throw new Error(`failed request. empty 'to' field`);
    }
    if (!opts?.allowExpiredMessages) {
      verifyExpiresTime(paymentRequest);
    }
    const mediaType = opts.mediaType || this._params.packerParams.mediaType || "application/iden3-zkp-json" /* ZKPMessage */;
    if (!opts.packerOptions) {
      opts.packerOptions = this._params.packerParams.packerOptions;
    }
    opts.mediaType = mediaType;
    const senderDID = import_js_iden3_core31.DID.parse(paymentRequest.to);
    opts.packerOptions = initDefaultPackerOptions(mediaType, opts.packerOptions, {
      provingMethodAlg: await getProvingMethodAlgFromJWZ(request),
      senderDID
    });
    const agentMessage = await this.handlePaymentRequestMessage(paymentRequest, opts);
    if (!agentMessage) {
      return null;
    }
    return this.packMessage(
      agentMessage,
      senderDID,
      opts.mediaType || "application/iden3-zkp-json" /* ZKPMessage */,
      opts.packerOptions
    );
  }
  /**
   * @inheritdoc IPaymentHandler#handlePayment
   */
  async handlePayment(payment, params) {
    if (!params?.allowExpiredMessages) {
      verifyExpiresTime(payment);
    }
    if (params.paymentRequest.from !== payment.to) {
      throw new Error(
        `sender of the request is not a target of response - expected ${params.paymentRequest.from}, given ${payment.to}`
      );
    }
    if (!payment.body.payments.length) {
      throw new Error(`failed request. empty 'payments' field in body`);
    }
    if (!params.paymentValidationHandler) {
      throw new Error(`please provide payment validation handler in options`);
    }
    for (let i = 0; i < payment.body.payments.length; i++) {
      const p = payment.body.payments[i];
      const nonce = p.type === "Iden3PaymentCryptoV1" /* Iden3PaymentCryptoV1 */ ? p.id : p.nonce;
      const requestDataArr = params.paymentRequest.body.payments.map((r) => Array.isArray(r.data) ? r.data : [r.data]).flat();
      const requestData = requestDataArr.find(
        (r) => r.type === "Iden3PaymentRequestCryptoV1" /* Iden3PaymentRequestCryptoV1 */ ? r.id === nonce : r.nonce === nonce
      );
      if (!requestData) {
        throw new Error(
          `can't find payment request for payment ${p.type === "Iden3PaymentCryptoV1" /* Iden3PaymentCryptoV1 */ ? "id" : "nonce"} ${nonce}`
        );
      }
      await params.paymentValidationHandler(p.paymentData.txId, requestData);
    }
  }
  /**
   * @inheritdoc IPaymentHandler#createPaymentRailsV1
   */
  async createPaymentRailsV1(sender, receiver, agent, signer, payments, createOptions) {
    const paymentRequestInfo = [];
    for (let i = 0; i < payments.length; i++) {
      const { credentials, description } = payments[i];
      const dataArr = [];
      for (let j = 0; j < payments[i].options.length; j++) {
        const { nonce, amount, chainId, optionId, expirationDate } = payments[i].options[j];
        const multiChainConfig = this._params.multiChainPaymentConfig?.find(
          (c) => c.chainId === chainId
        );
        if (!multiChainConfig) {
          throw new Error(`failed request. no config for chain ${chainId}`);
        }
        const { recipient, paymentRails, options } = multiChainConfig;
        const option = options.find((t) => t.id === optionId);
        if (!option) {
          throw new Error(`failed request. no option for id ${optionId}`);
        }
        if ((option.type === "Iden3PaymentRailsERC20RequestV1" /* Iden3PaymentRailsERC20RequestV1 */ || option.type === "Iden3PaymentRailsSolanaSPLRequestV1" /* Iden3PaymentRailsSolanaSPLRequestV1 */) && !option.contractAddress) {
          throw new Error(`failed request. no token address for option id ${optionId}`);
        }
        const expirationDateRequired = expirationDate ?? new Date((/* @__PURE__ */ new Date()).setHours((/* @__PURE__ */ new Date()).getHours() + 1));
        if (option.type === "Iden3PaymentRailsSolanaRequestV1" /* Iden3PaymentRailsSolanaRequestV1 */ || option.type === "Iden3PaymentRailsSolanaSPLRequestV1" /* Iden3PaymentRailsSolanaSPLRequestV1 */) {
          if (!createOptions?.solSigner) {
            throw new Error(
              `please provide solana signer in context for ${option.type} payment type`
            );
          }
          const payment = await buildSolanaPayment(
            createOptions.solSigner,
            option,
            chainId,
            paymentRails,
            recipient,
            BigInt(amount),
            expirationDateRequired,
            nonce
          );
          dataArr.push(payment);
        } else {
          const payment = await buildEvmPayment(
            signer,
            option,
            chainId,
            paymentRails,
            recipient,
            BigInt(amount),
            expirationDateRequired,
            nonce
          );
          dataArr.push(payment);
        }
      }
      paymentRequestInfo.push({
        data: dataArr,
        credentials,
        description
      });
    }
    return createPaymentRequest(sender, receiver, agent, paymentRequestInfo);
  }
  async packMessage(message, senderDID, mediaType, packerParams) {
    const responseEncoded = byteEncoder.encode(JSON.stringify(message));
    const packerOpts = mediaType === "application/iden3comm-signed-json" /* SignedMessage */ ? packerParams : {
      provingMethodAlg: packerParams?.provingMethodAlg || defaultProvingMethodAlg
    };
    return await this._packerMgr.pack(mediaType, responseEncoded, {
      senderDID,
      ...packerOpts
    });
  }
  async handleIden3PaymentRequestCryptoV1(data, paymentHandler) {
    if (data.expiration && new Date(data.expiration) < /* @__PURE__ */ new Date()) {
      throw new Error(`failed request. expired request`);
    }
    const txId = await paymentHandler(data);
    return {
      id: data.id,
      "@context": "https://schema.iden3.io/core/jsonld/payment.jsonld#Iden3PaymentCryptoV1",
      type: "Iden3PaymentCryptoV1" /* Iden3PaymentCryptoV1 */,
      paymentData: {
        txId
      }
    };
  }
  async handleIden3PaymentRailsRequestV1(data, paymentHandler) {
    if (data.expirationDate && new Date(data.expirationDate) < /* @__PURE__ */ new Date()) {
      throw new Error(`failed request. expired request`);
    }
    const signer = await verifyEIP712TypedData(data, this._params.documentResolver);
    if (this._params.allowedSigners && !this._params.allowedSigners.includes(signer)) {
      throw new Error(`failed request. signer is not in the allowed signers list`);
    }
    const txId = await paymentHandler(data);
    const proof = Array.isArray(data.proof) ? data.proof[0] : data.proof;
    return {
      nonce: data.nonce,
      type: "Iden3PaymentRailsV1" /* Iden3PaymentRailsV1 */,
      "@context": "https://schema.iden3.io/core/jsonld/payment.jsonld#Iden3PaymentRailsV1",
      paymentData: {
        txId,
        chainId: proof.eip712.domain.chainId
      }
    };
  }
  async handleIden3PaymentRailsSolanaRequestV1(data, paymentHandler) {
    if (data.expirationDate && new Date(data.expirationDate) < /* @__PURE__ */ new Date()) {
      throw new Error(`failed request. expired request`);
    }
    const isValid = await verifyIden3SolanaPaymentRequest(data, this._params.documentResolver);
    if (!isValid) {
      throw new Error(`failed request. invalid Solana payment request signature`);
    }
    const proof = Array.isArray(data.proof) ? data.proof[0] : data.proof;
    const signer = proof.verificationMethod.split(":").slice(-1)[0];
    if (this._params.allowedSigners && !this._params.allowedSigners.includes(signer)) {
      throw new Error(`failed request. signer is not in the allowed signers list`);
    }
    const txId = await paymentHandler(data);
    return {
      nonce: data.nonce,
      type: "Iden3PaymentRailsSolanaV1" /* Iden3PaymentRailsSolanaV1 */,
      "@context": "https://schema.iden3.io/core/jsonld/payment.jsonld#Iden3PaymentRailsSolanaV1",
      paymentData: {
        txId,
        chainId: proof.domain.chainId
      }
    };
  }
  async handleIden3PaymentRailsSolanaSPLRequestV1(data, paymentHandler) {
    if (data.expirationDate && new Date(data.expirationDate) < /* @__PURE__ */ new Date()) {
      throw new Error(`failed request. expired request`);
    }
    const isValid = await verifyIden3SolanaPaymentRequest(data, this._params.documentResolver);
    if (!isValid) {
      throw new Error(`failed request. invalid Solana payment request signature`);
    }
    const proof = Array.isArray(data.proof) ? data.proof[0] : data.proof;
    const signer = proof.verificationMethod.split(":").slice(-1)[0];
    if (this._params.allowedSigners && !this._params.allowedSigners.includes(signer)) {
      throw new Error(`failed request. signer is not in the allowed signers list`);
    }
    const txId = await paymentHandler(data);
    return {
      nonce: data.nonce,
      type: "Iden3PaymentRailsSolanaSPLV1" /* Iden3PaymentRailsSolanaSPLV1 */,
      "@context": "https://schema.iden3.io/core/jsonld/payment.jsonld#Iden3PaymentRailsSolanaSPLV1",
      paymentData: {
        txId,
        chainId: proof.domain.chainId,
        tokenAddress: data.tokenAddress
      }
    };
  }
  async handleIden3PaymentRailsERC20RequestV1(data, paymentHandler, approveHandler) {
    if (data.expirationDate && new Date(data.expirationDate) < /* @__PURE__ */ new Date()) {
      throw new Error(`failed request. expired request`);
    }
    const signer = await verifyEIP712TypedData(data, this._params.documentResolver);
    if (this._params.allowedSigners && !this._params.allowedSigners.includes(signer)) {
      throw new Error(`failed request. signer is not in the allowed signers list`);
    }
    if (!data.features?.includes("EIP-2612" /* EIP_2612 */) && !approveHandler) {
      throw new Error(`please provide erc20TokenApproveHandler in context for ERC-20 payment type`);
    }
    if (approveHandler) {
      await approveHandler(data);
    }
    const txId = await paymentHandler(data);
    const proof = Array.isArray(data.proof) ? data.proof[0] : data.proof;
    return {
      nonce: data.nonce,
      type: "Iden3PaymentRailsERC20V1" /* Iden3PaymentRailsERC20V1 */,
      "@context": "https://schema.iden3.io/core/jsonld/payment.jsonld#Iden3PaymentRailsERC20V1",
      paymentData: {
        txId,
        chainId: proof.eip712.domain.chainId,
        tokenAddress: data.tokenAddress
      }
    };
  }
};

// src/iden3comm/handlers/discovery-protocol.ts
var uuid10 = __toESM(require("uuid"), 1);
var import_js_iden3_core32 = require("@iden3/js-iden3-core");
function createDiscoveryFeatureQueryMessage(queries, opts) {
  const uuidv4 = uuid10.v4();
  return {
    id: uuidv4,
    thid: uuidv4,
    typ: "application/iden3comm-plain-json" /* PlainMessage */,
    type: PROTOCOL_MESSAGE_TYPE.DISCOVERY_PROTOCOL_QUERIES_MESSAGE_TYPE,
    body: {
      queries
    },
    from: opts?.from,
    to: opts?.to,
    created_time: (0, import_js_iden3_core32.getUnixTimestamp)(/* @__PURE__ */ new Date()),
    expires_time: opts?.expires_time
  };
}
function createDiscoveryFeatureDiscloseMessage(disclosures, opts) {
  const uuidv4 = uuid10.v4();
  return {
    id: uuidv4,
    typ: "application/iden3comm-plain-json" /* PlainMessage */,
    thid: uuidv4,
    type: PROTOCOL_MESSAGE_TYPE.DISCOVERY_PROTOCOL_DISCLOSE_MESSAGE_TYPE,
    body: {
      disclosures
    },
    from: opts?.from,
    to: opts?.to,
    created_time: (0, import_js_iden3_core32.getUnixTimestamp)(/* @__PURE__ */ new Date()),
    expires_time: opts?.expires_time
  };
}
var DiscoveryProtocolHandler = class extends AbstractMessageHandler {
  /**
   * Creates an instance of DiscoveryProtocolHandler.
   * @param {DiscoveryProtocolOptions} _options - discovery protocol options
   */
  constructor(_options) {
    super();
    this._options = _options;
    const headers = [
      "id",
      "typ",
      "type",
      "thid",
      "body",
      "from",
      "to",
      "created_time",
      "expires_time"
    ];
    if (!_options.headers) {
      _options.headers = headers;
    }
  }
  /**
   * @inheritdoc IProtocolMessageHandler#handle
   */
  async handle(message, context) {
    switch (message.type) {
      case PROTOCOL_MESSAGE_TYPE.DISCOVERY_PROTOCOL_QUERIES_MESSAGE_TYPE:
        return await this.handleDiscoveryQuery(message, context);
      default:
        return super.handle(message, context);
    }
  }
  /**
   * @inheritdoc IDiscoveryProtocolHandler#handleDiscoveryQuery
   */
  async handleDiscoveryQuery(message, opts) {
    if (!opts?.allowExpiredMessages) {
      verifyExpiresTime(message);
    }
    const disclosures = [];
    for (const query of message.body.queries) {
      disclosures.push(...this.handleQuery(query));
    }
    return Promise.resolve(
      createDiscoveryFeatureDiscloseMessage(disclosures, {
        to: message.from,
        from: message.to,
        expires_time: opts?.disclosureExpiresDate ? (0, import_js_iden3_core32.getUnixTimestamp)(opts.disclosureExpiresDate) : void 0
      })
    );
  }
  handleQuery(query) {
    let result = [];
    switch (query["feature-type" /* FeatureType */]) {
      case "accept" /* Accept */:
        result = this.handleAcceptQuery();
        break;
      case "protocol" /* Protocol */:
        result = this.handleProtocolQuery();
        break;
      case "goal-code" /* GoalCode */:
        result = this.handleGoalCodeQuery();
        break;
      case "header" /* Header */:
        result = this.handleHeaderQuery();
        break;
    }
    return this.handleMatch(result, query.match);
  }
  handleAcceptQuery() {
    const acceptProfiles = this._options.packageManager.getSupportedProfiles();
    return acceptProfiles.map((profile) => ({
      ["feature-type" /* FeatureType */]: "accept" /* Accept */,
      id: profile
    }));
  }
  handleProtocolQuery() {
    return this._options.protocols?.map((protocol) => ({
      ["feature-type" /* FeatureType */]: "protocol" /* Protocol */,
      id: protocol
    })) ?? [];
  }
  handleGoalCodeQuery() {
    return this._options.goalCodes?.map((goalCode) => ({
      ["feature-type" /* FeatureType */]: "goal-code" /* GoalCode */,
      id: goalCode
    })) ?? [];
  }
  handleHeaderQuery() {
    return this._options.headers?.map((header) => ({
      ["feature-type" /* FeatureType */]: "header" /* Header */,
      id: header
    })) ?? [];
  }
  handleMatch(disclosures, match) {
    if (!match || match === "*") {
      return disclosures;
    }
    const regExp = this.wildcardToRegExp(match);
    return disclosures.filter((disclosure) => regExp.test(disclosure.id));
  }
  wildcardToRegExp(match) {
    const regexPattern = match.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    return new RegExp(`^${regexPattern}$`);
  }
};

// src/iden3comm/handlers/problem-report.ts
var uuid11 = __toESM(require("uuid"), 1);
function createProblemReport(code, opts) {
  const uuidv4 = uuid11.v4();
  return {
    id: uuidv4,
    pthid: opts?.pthid,
    typ: "application/iden3comm-plain-json" /* PlainMessage */,
    type: PROTOCOL_MESSAGE_TYPE.PROBLEM_REPORT_MESSAGE_TYPE,
    ack: opts?.ack,
    body: {
      code,
      comment: opts?.comment,
      args: opts?.args,
      escalate_to: opts?.escalate_to
    },
    from: opts?.from,
    to: opts?.to
  };
}
function createProblemReportMessage(pthid, code, opts) {
  return createProblemReport(code, {
    pthid,
    ...opts
  });
}

// src/iden3comm/services/jose.ts
var import_jose = require("jose");
var JoseService = class {
  constructor(resolvePrivateKeyByKid) {
    this.resolvePrivateKeyByKid = resolvePrivateKeyByKid;
  }
  async encrypt(msg, options) {
    const { enc, typ, recipients } = options;
    const generalJwe = new import_jose.GeneralEncrypt(msg).setProtectedHeader({ enc, typ });
    recipients.forEach(({ recipientJWK, alg, kid }) => {
      generalJwe.addRecipient(recipientJWK).setUnprotectedHeader({
        alg,
        kid
      });
    });
    const jwe = await generalJwe.encrypt();
    return jwe;
  }
  async decrypt(data) {
    const getKey = (protectedHeaders, jwe) => {
      const kid = jwe.header?.kid || protectedHeaders && protectedHeaders.kid;
      if (!kid) {
        throw new Error("kid is required");
      }
      return this.resolvePrivateKeyByKid(kid);
    };
    if (Object.prototype.hasOwnProperty.call(data, "encrypted_key")) {
      const flattenedJWE = data;
      flattenedJWE.header = this.removeDuplicates(
        (0, import_jose.decodeProtectedHeader)(flattenedJWE),
        flattenedJWE.header || {}
      );
      return (0, import_jose.flattenedDecrypt)(data, getKey);
    }
    return (0, import_jose.generalDecrypt)(data, getKey);
  }
  removeDuplicates = (protectedHeader, recipientHeader) => {
    const cleaned = { ...recipientHeader };
    for (const [key, value] of Object.entries(protectedHeader)) {
      if (cleaned[key] === value) delete cleaned[key];
    }
    return cleaned;
  };
};

// src/iden3comm/services/key-resolver.ts
var DefaultKMSKeyResolver = class {
  constructor(kms) {
    this.kms = kms;
  }
  resolvePrivateKeyByKid = async (kid) => {
    const [, alias] = kid.split("#");
    if (!alias) {
      throw new Error("Missing key identifier");
    }
    const [keyType] = alias.split(":");
    if (!keyType) {
      throw new Error("Missing key type in alias for default key resolver");
    }
    const pkStore = await this.kms.getKeyProvider(keyType)?.getPkStore();
    if (!pkStore) {
      throw new Error(`Key provider not found for ${keyType}`);
    }
    try {
      return JSON.parse(await pkStore.get({ alias }));
    } catch (error) {
      throw new Error(`Key not found for ${alias}`);
    }
  };
};

// src/iden3comm/notifications/index.ts
var notifications_exports = {};
__export(notifications_exports, {
  DeviceNotificationStatus: () => DeviceNotificationStatus,
  NotificationServiceType: () => NotificationServiceType,
  NotificationStatus: () => NotificationStatus,
  PushNotifier: () => PushNotifier
});

// src/iden3comm/notifications/types.ts
var NotificationServiceType = /* @__PURE__ */ ((NotificationServiceType2) => {
  NotificationServiceType2["Push"] = "push-notification";
  return NotificationServiceType2;
})(NotificationServiceType || {});
var NotificationStatus = /* @__PURE__ */ ((NotificationStatus2) => {
  NotificationStatus2["Success"] = "success";
  NotificationStatus2["Failed"] = "failed";
  return NotificationStatus2;
})(NotificationStatus || {});

// src/iden3comm/notifications/push.ts
var DeviceNotificationStatus = /* @__PURE__ */ ((DeviceNotificationStatus2) => {
  DeviceNotificationStatus2["Success"] = "success";
  DeviceNotificationStatus2["Rejected"] = "rejected";
  DeviceNotificationStatus2["Failed"] = "failed";
  return DeviceNotificationStatus2;
})(DeviceNotificationStatus || {});
var defaultPushNotificationPublisher = {
  type: "push-notification" /* Push */,
  send: async ({
    url,
    pushService,
    message
  }) => {
    try {
      const req = new Request(url, {
        method: "POST",
        body: JSON.stringify({
          metadata: pushService.metadata,
          message
        })
      });
      const resp = await fetch(req);
      if (resp.status !== 200) {
        throw new Error(`could not send push notification, return status ${resp.status}`);
      }
      const devices = await resp.json();
      return {
        status: "success" /* Success */,
        devices
      };
    } catch (error) {
      return {
        status: "failed" /* Failed */,
        error: error.toString()
      };
    }
  }
};
var PushNotifier = class {
  constructor(_publisher = defaultPushNotificationPublisher) {
    this._publisher = _publisher;
    if (_publisher.type !== "push-notification" /* Push */) {
      throw new Error(`PushNotifier: publisher type ${_publisher.type} is not supported`);
    }
  }
  async notify(msg, request) {
    const pushService = (request.didDocument.service ?? []).find(
      (s) => s.type === "push-notification" /* Push */
    );
    if (!pushService) {
      throw new Error("no push service in did document");
    }
    if (!pushService.metadata?.devices?.length) {
      throw new Error("no devices in push service");
    }
    const serviceEndpointsUrls = [pushService.serviceEndpoint ?? []].flat().reduce((acc, s) => {
      if (typeof s === "string") {
        return [...acc, s];
      }
      if (typeof s.uri === "string") {
        return [...acc, s.uri];
      }
      return acc;
    }, []);
    const promises = serviceEndpointsUrls.map(
      async (url) => this._publisher.send({ url, pushService, message: msg })
    );
    return await Promise.all(promises);
  }
};

// src/storage/blockchain/state.ts
var defaultEthConnectionConfig = {
  url: "http://localhost:8545",
  defaultGasLimit: 6e5,
  minGasPrice: "0",
  maxGasPrice: "100000000000",
  confirmationBlockCount: 5,
  confirmationTimeout: 6e5,
  contractAddress: "",
  receiptTimeout: 6e5,
  rpcResponseTimeout: 5e3,
  waitReceiptCycleTime: 3e4,
  waitBlockCycleTime: 3e3
};
var defaultStateInfo = {
  state: 0n,
  replacedByState: 0n,
  createdAtTimestamp: 0n,
  replacedAtTimestamp: 0n,
  createdAtBlock: 0n,
  replacedAtBlock: 0n
};
var EthStateStorage = class {
  /**
   * Creates an instance of EthStateStorage.
   * @param {EthConnectionConfig} [ethConfig=defaultEthConnectionConfig]
   */
  constructor(ethConfig, options) {
    this.ethConfig = ethConfig;
    const config = Array.isArray(ethConfig) ? ethConfig[0] : ethConfig;
    this.provider = new import_ethers9.JsonRpcProvider(config.url);
    this.stateContract = new import_ethers9.Contract(config.contractAddress, State_default, this.provider);
    this._transactionService = new TransactionService(this.getRpcProvider());
    this._latestStateCacheOptions = {
      ttl: options?.latestStateCacheOptions?.ttl ?? constants_exports.DEFAULT_PROOF_VERIFY_DELAY / 2,
      maxSize: options?.latestStateCacheOptions?.maxSize ?? DEFAULT_CACHE_MAX_SIZE
    };
    this._stateCacheOptions = {
      notReplacedTtl: options?.stateCacheOptions?.notReplacedTtl ?? constants_exports.DEFAULT_PROOF_VERIFY_DELAY / 2,
      replacedTtl: options?.stateCacheOptions?.replacedTtl ?? constants_exports.DEFAULT_PROOF_VERIFY_DELAY,
      maxSize: options?.stateCacheOptions?.maxSize ?? DEFAULT_CACHE_MAX_SIZE
    };
    this._rootCacheOptions = {
      replacedTtl: options?.rootCacheOptions?.replacedTtl ?? constants_exports.DEFAULT_AUTH_VERIFY_DELAY,
      notReplacedTtl: options?.rootCacheOptions?.notReplacedTtl ?? constants_exports.DEFAULT_AUTH_VERIFY_DELAY / 2,
      maxSize: options?.rootCacheOptions?.maxSize ?? DEFAULT_CACHE_MAX_SIZE
    };
    this._gistProofCacheOptions = {
      ttl: constants_exports.DEFAULT_AUTH_VERIFY_DELAY / 2,
      maxSize: options?.gistProofCacheOptions?.maxSize ?? DEFAULT_CACHE_MAX_SIZE
    };
    this._latestStateResolveCache = options?.latestStateCacheOptions?.cache ?? createInMemoryCache({
      maxSize: this._latestStateCacheOptions.maxSize,
      ttl: this._latestStateCacheOptions.ttl
    });
    this._stateResolveCache = options?.stateCacheOptions?.cache ?? createInMemoryCache({
      maxSize: this._stateCacheOptions.maxSize,
      ttl: this._stateCacheOptions.replacedTtl
    });
    this._rootResolveCache = options?.rootCacheOptions?.cache ?? createInMemoryCache({
      maxSize: this._rootCacheOptions.maxSize,
      ttl: this._rootCacheOptions.replacedTtl
    });
    this._gistProofResolveCache = options?.gistProofCacheOptions?.cache ?? createInMemoryCache({
      maxSize: this._gistProofCacheOptions.maxSize,
      ttl: this._gistProofCacheOptions.ttl
    });
    this._disableCache = options?.disableCache ?? false;
  }
  stateContract;
  provider;
  _transactionService;
  _latestStateResolveCache;
  _stateResolveCache;
  _rootResolveCache;
  _gistProofResolveCache;
  _latestStateCacheOptions;
  _stateCacheOptions;
  _rootCacheOptions;
  _gistProofCacheOptions;
  _disableCache = false;
  /** {@inheritdoc IStateStorage.getLatestStateById} */
  async getLatestStateById(id) {
    const cacheKey = this.getLatestStateCacheKey(id);
    if (!this._disableCache) {
      const cachedResult = await this._latestStateResolveCache?.get(cacheKey);
      if (cachedResult) {
        if (cachedResult.state === 0n && cachedResult.createdAtTimestamp === 0n) {
          throw new Error(VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST_CUSTOM_ERROR);
        }
        return cachedResult;
      }
    }
    const { stateContract } = this.getStateContractAndProviderForId(id);
    let rawData = [];
    try {
      rawData = await stateContract.getStateInfoById(id);
    } catch (e) {
      if (isIdentityDoesNotExistError(e) && !this._disableCache) {
        await this._latestStateResolveCache?.set(
          cacheKey,
          {
            id,
            ...defaultStateInfo
          },
          this._latestStateCacheOptions.ttl
        );
      }
      throw e;
    }
    const stateInfo = {
      id: BigInt(rawData[0]),
      state: BigInt(rawData[1]),
      replacedByState: BigInt(rawData[2]),
      createdAtTimestamp: BigInt(rawData[3]),
      replacedAtTimestamp: BigInt(rawData[4]),
      createdAtBlock: BigInt(rawData[5]),
      replacedAtBlock: BigInt(rawData[6])
    };
    !this._disableCache && await this._latestStateResolveCache?.set(
      cacheKey,
      stateInfo,
      this._latestStateCacheOptions.ttl
    );
    return stateInfo;
  }
  /** {@inheritdoc IStateStorage.getStateInfoByIdAndState} */
  async getStateInfoByIdAndState(id, state) {
    const cacheKey = this.getStateCacheKey(id, state);
    if (!this._disableCache) {
      const cachedResult = await this._stateResolveCache?.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
    }
    const { stateContract } = this.getStateContractAndProviderForId(id);
    let stateInfo;
    try {
      const rawData = await stateContract.getStateInfoByIdAndState(id, state);
      stateInfo = {
        id: BigInt(rawData[0]),
        state: BigInt(rawData[1]),
        replacedByState: BigInt(rawData[2]),
        createdAtTimestamp: BigInt(rawData[3]),
        replacedAtTimestamp: BigInt(rawData[4]),
        createdAtBlock: BigInt(rawData[5]),
        replacedAtBlock: BigInt(rawData[6])
      };
    } catch (e) {
      if (!isStateDoesNotExistError(e)) {
        throw e;
      }
      const isGenesis = getIsGenesisStateById(import_js_iden3_core33.Id.fromBigInt(id), state);
      if (!isGenesis) {
        throw new Error(
          `State ${state} for identity ${id} is not genesis and not registered in the smart contract`
        );
      }
      stateInfo = {
        id,
        ...defaultStateInfo,
        state
      };
    }
    const ttl = stateInfo.replacedAtTimestamp === 0n ? this._stateCacheOptions.notReplacedTtl : this._stateCacheOptions.replacedTtl;
    !this._disableCache && await this._stateResolveCache?.set(cacheKey, stateInfo, ttl);
    return stateInfo;
  }
  /** {@inheritdoc IStateStorage.publishState} */
  async publishState(proof, signer) {
    const stateTransitionPubSig = new StateTransitionPubSignals();
    stateTransitionPubSig.pubSignalsUnmarshal(
      byteEncoder.encode(JSON.stringify(proof.pub_signals))
    );
    const { userId, oldUserState, newUserState, isOldStateGenesis } = stateTransitionPubSig;
    const { stateContract, provider } = this.getStateContractAndProviderForId(userId.bigInt());
    const contract = stateContract.connect(signer);
    const preparedZkpProof = prepareZkpProof(proof.proof);
    const payload = [
      userId.bigInt().toString(),
      oldUserState.bigInt().toString(),
      newUserState.bigInt().toString(),
      isOldStateGenesis,
      preparedZkpProof.a,
      preparedZkpProof.b,
      preparedZkpProof.c
    ];
    const feeData = await provider.getFeeData();
    const maxFeePerGas = defaultEthConnectionConfig.maxFeePerGas ? BigInt(defaultEthConnectionConfig.maxFeePerGas) : feeData.maxFeePerGas;
    const maxPriorityFeePerGas = defaultEthConnectionConfig.maxPriorityFeePerGas ? BigInt(defaultEthConnectionConfig.maxPriorityFeePerGas) : feeData.maxPriorityFeePerGas;
    const gasLimit = await contract.transitState.estimateGas(...payload);
    const txData = await contract.transitState.populateTransaction(...payload);
    const request = {
      to: txData.to,
      data: txData.data,
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas
    };
    const { txnHash } = await this._transactionService.sendTransactionRequest(signer, request);
    await this._latestStateResolveCache?.delete(this.getLatestStateCacheKey(userId.bigInt()));
    return txnHash;
  }
  /** {@inheritdoc IStateStorage.publishStateGeneric} */
  async publishStateGeneric(signer, userStateTransitionInfo) {
    const { userId, oldUserState, newUserState, isOldStateGenesis, methodId, methodParams } = userStateTransitionInfo;
    const { stateContract, provider } = this.getStateContractAndProviderForId(userId.bigInt());
    const contract = stateContract.connect(signer);
    const feeData = await provider.getFeeData();
    const maxFeePerGas = defaultEthConnectionConfig.maxFeePerGas ? BigInt(defaultEthConnectionConfig.maxFeePerGas) : feeData.maxFeePerGas;
    const maxPriorityFeePerGas = defaultEthConnectionConfig.maxPriorityFeePerGas ? BigInt(defaultEthConnectionConfig.maxPriorityFeePerGas) : feeData.maxPriorityFeePerGas;
    const payload = [
      userId.bigInt().toString(),
      oldUserState.bigInt().toString(),
      newUserState.bigInt().toString(),
      isOldStateGenesis,
      methodId,
      //BigInt(1),
      methodParams
      //'0x'
    ];
    const gasLimit = await contract.transitStateGeneric.estimateGas(...payload);
    const txData = await contract.transitStateGeneric.populateTransaction(...payload);
    const request = {
      to: txData.to,
      data: txData.data,
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas
    };
    const { txnHash } = await this._transactionService.sendTransactionRequest(signer, request);
    await this._latestStateResolveCache?.delete(this.getLatestStateCacheKey(userId.bigInt()));
    return txnHash;
  }
  /** {@inheritdoc IStateStorage.getGISTProof} */
  async getGISTProof(id) {
    const cacheKey = this.getGistProofCacheKey(id);
    if (!this._disableCache) {
      const cachedResult = await this._gistProofResolveCache?.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
    }
    const { stateContract } = this.getStateContractAndProviderForId(id);
    const data = await stateContract.getGISTProof(id);
    const stateProof = {
      root: BigInt(data.root.toString()),
      existence: data.existence,
      siblings: data.siblings?.map(
        (sibling) => BigInt(sibling.toString())
      ),
      index: BigInt(data.index.toString()),
      value: BigInt(data.value.toString()),
      auxExistence: data.auxExistence,
      auxIndex: BigInt(data.auxIndex.toString()),
      auxValue: BigInt(data.auxValue.toString())
    };
    !this._disableCache && await this._gistProofResolveCache?.set(
      cacheKey,
      stateProof,
      this._gistProofCacheOptions.ttl
    );
    return stateProof;
  }
  /** {@inheritdoc IStateStorage.getGISTRootInfo} */
  async getGISTRootInfo(root, id) {
    const idTyped = import_js_iden3_core33.Id.fromBigInt(id);
    const chainId = (0, import_js_iden3_core33.getChainId)(import_js_iden3_core33.DID.blockchainFromId(idTyped), import_js_iden3_core33.DID.networkIdFromId(idTyped));
    const cacheKey = this.getRootCacheKey(chainId, root);
    if (!this._disableCache) {
      const cachedResult = await this._rootResolveCache?.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
    }
    const { stateContract } = this.getStateContractAndProviderForId(id);
    const data = await stateContract.getGISTRootInfo(root);
    const rootInfo = {
      root: BigInt(data.root.toString()),
      replacedByRoot: BigInt(data.replacedByRoot.toString()),
      createdAtTimestamp: BigInt(data.createdAtTimestamp.toString()),
      replacedAtTimestamp: BigInt(data.replacedAtTimestamp.toString()),
      createdAtBlock: BigInt(data.createdAtBlock.toString()),
      replacedAtBlock: BigInt(data.replacedAtBlock.toString())
    };
    const ttl = rootInfo.replacedAtTimestamp == 0n ? this._rootCacheOptions.notReplacedTtl : this._rootCacheOptions.replacedTtl;
    !this._disableCache && await this._rootResolveCache?.set(cacheKey, rootInfo, ttl);
    return rootInfo;
  }
  /** {@inheritdoc IStateStorage.getRpcProvider} */
  getRpcProvider() {
    return this.provider;
  }
  /** enable caching */
  enableCache() {
    this._disableCache = false;
  }
  /** disable caching */
  disableCache() {
    this._disableCache = true;
  }
  getStateContractAndProviderForId(id) {
    const idTyped = import_js_iden3_core33.Id.fromBigInt(id);
    const chainId = (0, import_js_iden3_core33.getChainId)(import_js_iden3_core33.DID.blockchainFromId(idTyped), import_js_iden3_core33.DID.networkIdFromId(idTyped));
    const config = this.networkByChainId(chainId);
    const provider = new import_ethers9.JsonRpcProvider(config.url);
    const stateContract = new import_ethers9.Contract(config.contractAddress, State_default, provider);
    return { stateContract, provider };
  }
  networkByChainId(chainId) {
    const config = Array.isArray(this.ethConfig) ? this.ethConfig : [this.ethConfig];
    const network = config.find((c) => c.chainId === chainId);
    if (!network) {
      throw new Error(`chainId "${chainId}" not supported`);
    }
    return network;
  }
  getGistProofCacheKey(id) {
    return `gist:${id.toString()}`;
  }
  getLatestStateCacheKey(id) {
    return `latest-state:${id.toString()}`;
  }
  getStateCacheKey(id, state) {
    return `state:${id.toString()}-${state.toString()}`;
  }
  getRootCacheKey(chainId, root) {
    return `root:${chainId.toString()}-${root.toString()}`;
  }
};

// src/storage/blockchain/onchain-zkp-verifier.ts
var import_ethers10 = require("ethers");

// src/storage/blockchain/abi/ZkpVerifier.json
var ZkpVerifier_default = [
  {
    inputs: [],
    name: "InvalidInitialization",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "message",
        type: "string"
      },
      {
        internalType: "uint64",
        name: "requestId",
        type: "uint64"
      },
      {
        internalType: "uint256",
        name: "linkID",
        type: "uint256"
      },
      {
        internalType: "uint64",
        name: "requestIdToCompare",
        type: "uint64"
      },
      {
        internalType: "uint256",
        name: "linkIdToCompare",
        type: "uint256"
      }
    ],
    name: "LinkedProofError",
    type: "error"
  },
  {
    inputs: [],
    name: "NotInitializing",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      }
    ],
    name: "OwnableInvalidOwner",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "version",
        type: "uint64"
      }
    ],
    name: "Initialized",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "OwnershipTransferStarted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "OwnershipTransferred",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint64",
        name: "requestId",
        type: "uint64"
      },
      {
        indexed: true,
        internalType: "address",
        name: "requestOwner",
        type: "address"
      },
      {
        indexed: false,
        internalType: "string",
        name: "metadata",
        type: "string"
      },
      {
        indexed: false,
        internalType: "address",
        name: "validator",
        type: "address"
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes"
      }
    ],
    name: "ZKPRequestSet",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint64",
        name: "requestId",
        type: "uint64"
      },
      {
        indexed: true,
        internalType: "address",
        name: "caller",
        type: "address"
      }
    ],
    name: "ZKPResponseSubmitted",
    type: "event"
  },
  {
    inputs: [],
    name: "REQUESTS_RETURN_LIMIT",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "VERSION",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract ICircuitValidator",
        name: "validator",
        type: "address"
      }
    ],
    name: "addValidatorToWhitelist",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "requestId",
        type: "uint64"
      }
    ],
    name: "disableZKPRequest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "requestId",
        type: "uint64"
      }
    ],
    name: "enableZKPRequest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address"
      },
      {
        internalType: "uint64",
        name: "requestId",
        type: "uint64"
      }
    ],
    name: "getProofStatus",
    outputs: [
      {
        components: [
          {
            internalType: "bool",
            name: "isVerified",
            type: "bool"
          },
          {
            internalType: "string",
            name: "validatorVersion",
            type: "string"
          },
          {
            internalType: "uint256",
            name: "blockNumber",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "blockTimestamp",
            type: "uint256"
          }
        ],
        internalType: "struct IZKPVerifier.ProofStatus",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address"
      },
      {
        internalType: "uint64",
        name: "requestId",
        type: "uint64"
      },
      {
        internalType: "string",
        name: "key",
        type: "string"
      }
    ],
    name: "getProofStorageField",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "requestId",
        type: "uint64"
      }
    ],
    name: "getRequestOwner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "requestId",
        type: "uint64"
      }
    ],
    name: "getZKPRequest",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "metadata",
            type: "string"
          },
          {
            internalType: "contract ICircuitValidator",
            name: "validator",
            type: "address"
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes"
          }
        ],
        internalType: "struct IZKPVerifier.ZKPRequest",
        name: "zkpRequest",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "startIndex",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "length",
        type: "uint256"
      }
    ],
    name: "getZKPRequests",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "metadata",
            type: "string"
          },
          {
            internalType: "contract ICircuitValidator",
            name: "validator",
            type: "address"
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes"
          }
        ],
        internalType: "struct IZKPVerifier.ZKPRequest[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getZKPRequestsCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IStateCrossChain",
        name: "stateCrossChain",
        type: "address"
      }
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address"
      },
      {
        internalType: "uint64",
        name: "requestId",
        type: "uint64"
      }
    ],
    name: "isProofVerified",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract ICircuitValidator",
        name: "validator",
        type: "address"
      }
    ],
    name: "isWhitelistedValidator",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "requestId",
        type: "uint64"
      }
    ],
    name: "isZKPRequestEnabled",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "pendingOwner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract ICircuitValidator",
        name: "validator",
        type: "address"
      }
    ],
    name: "removeValidatorFromWhitelist",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "requestId",
        type: "uint64"
      }
    ],
    name: "requestIdExists",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "requestId",
        type: "uint64"
      },
      {
        internalType: "address",
        name: "requestOwner",
        type: "address"
      }
    ],
    name: "setRequestOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "requestId",
        type: "uint64"
      },
      {
        components: [
          {
            internalType: "string",
            name: "metadata",
            type: "string"
          },
          {
            internalType: "contract ICircuitValidator",
            name: "validator",
            type: "address"
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes"
          }
        ],
        internalType: "struct IZKPVerifier.ZKPRequest",
        name: "request",
        type: "tuple"
      }
    ],
    name: "setZKPRequest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "requestId",
        type: "uint64"
      },
      {
        internalType: "uint256[]",
        name: "inputs",
        type: "uint256[]"
      },
      {
        internalType: "uint256[2]",
        name: "a",
        type: "uint256[2]"
      },
      {
        internalType: "uint256[2][2]",
        name: "b",
        type: "uint256[2][2]"
      },
      {
        internalType: "uint256[2]",
        name: "c",
        type: "uint256[2]"
      }
    ],
    name: "submitZKPResponse",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint64",
            name: "requestId",
            type: "uint64"
          },
          {
            internalType: "bytes",
            name: "zkProof",
            type: "bytes"
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes"
          }
        ],
        internalType: "struct ZKPResponse[]",
        name: "responses",
        type: "tuple[]"
      },
      {
        internalType: "bytes",
        name: "crossChainProof",
        type: "bytes"
      }
    ],
    name: "submitZKPResponseV2",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address"
      },
      {
        internalType: "uint64[]",
        name: "requestIds",
        type: "uint64[]"
      }
    ],
    name: "verifyLinkedProofs",
    outputs: [],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "requestId",
        type: "uint64"
      },
      {
        internalType: "uint256[]",
        name: "inputs",
        type: "uint256[]"
      },
      {
        internalType: "uint256[2]",
        name: "a",
        type: "uint256[2]"
      },
      {
        internalType: "uint256[2][2]",
        name: "b",
        type: "uint256[2][2]"
      },
      {
        internalType: "uint256[2]",
        name: "c",
        type: "uint256[2]"
      },
      {
        internalType: "address",
        name: "sender",
        type: "address"
      }
    ],
    name: "verifyZKPResponse",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "key",
            type: "string"
          },
          {
            internalType: "uint256",
            name: "inputValue",
            type: "uint256"
          }
        ],
        internalType: "struct ICircuitValidator.KeyToInputValue[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "version",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "pure",
    type: "function"
  }
];

// src/storage/blockchain/onchain-zkp-verifier.ts
var import_universal_verifier_v2_abi = require("@iden3/universal-verifier-v2-abi");
var import_js_iden3_core34 = require("@iden3/js-iden3-core");
var import_js_merkletree23 = require("@iden3/js-merkletree");
var maxGasLimit = 10000000n;
var FunctionSignatures = /* @__PURE__ */ ((FunctionSignatures2) => {
  FunctionSignatures2["SubmitZKPResponseV1"] = "b68967e2";
  FunctionSignatures2["SubmitZKPResponseV2"] = "ade09fcd";
  FunctionSignatures2["SubmitResponse"] = "06c86a91";
  return FunctionSignatures2;
})(FunctionSignatures || {});
var toTxDataArgs = function(res) {
  return [
    {
      authMethod: res.authProof.raw.authMethod,
      proof: res.authProof.encoded
    },
    res.proofs.map((p) => {
      return {
        requestId: p.requestId,
        proof: p.encoded,
        metadata: p.metadata
      };
    }),
    res.crossChainProof.encoded
  ];
};
var OnChainZKPVerifier = class _OnChainZKPVerifier {
  /**
   *
   * Creates an instance of OnChainZKPVerifier.
   * @beta
   * @param {EthConnectionConfig[]} - array of ETH configs
   */
  constructor(_configs, _opts) {
    this._configs = _configs;
    this._opts = _opts;
  }
  /**
   * supported circuits
   */
  static _supportedCircuits = [
    "authV2" /* AuthV2 */,
    "authV3" /* AuthV3 */,
    "authV3-8-32" /* AuthV3_8_32 */,
    "credentialAtomicQueryMTPV2OnChain" /* AtomicQueryMTPV2OnChain */,
    "credentialAtomicQuerySigV2OnChain" /* AtomicQuerySigV2OnChain */,
    "credentialAtomicQueryV3OnChain-beta.1" /* AtomicQueryV3OnChain */,
    "credentialAtomicQueryV3OnChain" /* AtomicQueryV3OnChainStable */
  ];
  static async prepareTxArgsSubmitV1(txData, zkProofResponse) {
    if (txData.method_id.replace("0x", "") !== "b68967e2" /* SubmitZKPResponseV1 */) {
      throw new Error(
        `prepareTxArgsSubmitV1 function doesn't implement requested method id. Only '0x${"b68967e2" /* SubmitZKPResponseV1 */}' is supported.`
      );
    }
    const requestID = zkProofResponse.id;
    const inputs = zkProofResponse.pub_signals;
    const preparedZkpProof = prepareZkpProof(zkProofResponse.proof);
    const payload = [requestID, inputs, preparedZkpProof.a, preparedZkpProof.b, preparedZkpProof.c];
    return payload;
  }
  /**
   * {@inheritDoc IOnChainZKPVerifier.prepareTxArgsSubmitV1}
   */
  async prepareTxArgsSubmitV1(txData, zkProofResponse) {
    return _OnChainZKPVerifier.prepareTxArgsSubmitV1(txData, zkProofResponse);
  }
  /**
   * {@inheritDoc IOnChainZKPVerifier.submitZKPResponse}
   */
  async submitZKPResponse(ethSigner, txData, zkProofResponses) {
    const chainConfig = this._configs.find((i) => i.chainId == txData.chain_id);
    if (!chainConfig) {
      throw new Error(`config for chain id ${txData.chain_id} was not found`);
    }
    if (txData.method_id.replace("0x", "") !== "b68967e2" /* SubmitZKPResponseV1 */) {
      throw new Error(
        `submitZKPResponse function doesn't implement requested method id. Only '0x${"b68967e2" /* SubmitZKPResponseV1 */}' is supported.`
      );
    }
    const provider = new import_ethers10.JsonRpcProvider(chainConfig.url, chainConfig.chainId);
    ethSigner = ethSigner.connect(provider);
    const response = /* @__PURE__ */ new Map();
    const feeData = await provider.getFeeData();
    const maxFeePerGas = chainConfig.maxFeePerGas ? BigInt(chainConfig.maxFeePerGas) : feeData.maxFeePerGas;
    const maxPriorityFeePerGas = chainConfig.maxPriorityFeePerGas ? BigInt(chainConfig.maxPriorityFeePerGas) : feeData.maxPriorityFeePerGas;
    const verifierContract = new import_ethers10.Contract(txData.contract_address, ZkpVerifier_default);
    for (const zkProofResponse of zkProofResponses) {
      const txArgs = await this.prepareTxArgsSubmitV1(txData, zkProofResponse);
      const payload = await verifierContract.submitZKPResponse.populateTransaction(...txArgs);
      const request = {
        to: txData.contract_address,
        data: payload.data,
        maxFeePerGas,
        maxPriorityFeePerGas
      };
      let gasLimit;
      try {
        gasLimit = await ethSigner.estimateGas(request);
      } catch (e) {
        gasLimit = maxGasLimit;
      }
      request.gasLimit = gasLimit;
      const transactionService = new TransactionService(provider);
      const { txnHash } = await transactionService.sendTransactionRequest(ethSigner, request);
      response.set(txnHash, zkProofResponse);
    }
    return response;
  }
  /**
   * {@inheritDoc IOnChainZKPVerifier.submitZKPResponseV2}
   */
  async submitZKPResponseV2(ethSigner, txData, zkProofResponses) {
    const chainConfig = this._configs.find((i) => i.chainId == txData.chain_id);
    if (!chainConfig) {
      throw new Error(`config for chain id ${txData.chain_id} was not found`);
    }
    if (txData.method_id.replace("0x", "") !== "ade09fcd" /* SubmitZKPResponseV2 */) {
      throw new Error(
        `submitZKPResponseV2 function doesn't implement requested method id. Only '0x${"ade09fcd" /* SubmitZKPResponseV2 */}' is supported.`
      );
    }
    if (!this._opts?.didResolverUrl) {
      throw new Error(`did resolver url required for crosschain verification`);
    }
    const provider = new import_ethers10.JsonRpcProvider(chainConfig.url, chainConfig.chainId);
    ethSigner = ethSigner.connect(provider);
    const txDataArgs = await this.prepareTxArgsSubmitV2(txData, zkProofResponses);
    const feeData = await provider.getFeeData();
    const maxFeePerGas = chainConfig.maxFeePerGas ? BigInt(chainConfig.maxFeePerGas) : feeData.maxFeePerGas;
    const maxPriorityFeePerGas = chainConfig.maxPriorityFeePerGas ? BigInt(chainConfig.maxPriorityFeePerGas) : feeData.maxPriorityFeePerGas;
    const verifierContract = new import_ethers10.Contract(txData.contract_address, ZkpVerifier_default);
    const txRequestData = await verifierContract.submitZKPResponseV2.populateTransaction(
      ...txDataArgs
    );
    const request = {
      to: txData.contract_address,
      data: txRequestData.data,
      maxFeePerGas,
      maxPriorityFeePerGas
    };
    let gasLimit;
    try {
      gasLimit = await ethSigner.estimateGas(request);
    } catch (e) {
      gasLimit = maxGasLimit;
    }
    request.gasLimit = gasLimit;
    const transactionService = new TransactionService(provider);
    const { txnHash } = await transactionService.sendTransactionRequest(ethSigner, request);
    return (/* @__PURE__ */ new Map()).set(txnHash, zkProofResponses);
  }
  /**
   * {@inheritDoc IOnChainVerifierMultiQuery.submitResponse}
   */
  async submitResponse(ethSigner, txData, responses, authProof) {
    const chainConfig = this._configs.find((i) => i.chainId == txData.chain_id);
    if (!chainConfig) {
      throw new Error(`config for chain id ${txData.chain_id} was not found`);
    }
    if (txData.method_id.replace("0x", "") !== "06c86a91" /* SubmitResponse */) {
      throw new Error(
        `submitResponse function doesn't implement requested method id. Only '0x${"06c86a91" /* SubmitResponse */}' is supported.`
      );
    }
    if (!this._opts?.didResolverUrl) {
      throw new Error(`did resolver url required for crosschain verification`);
    }
    const provider = new import_ethers10.JsonRpcProvider(chainConfig.url, chainConfig.chainId);
    ethSigner = ethSigner.connect(provider);
    const txPreparationResult = await this.prepareTxArgsSubmit(txData, responses, authProof);
    const feeData = await provider.getFeeData();
    const maxFeePerGas = chainConfig.maxFeePerGas ? BigInt(chainConfig.maxFeePerGas) : feeData.maxFeePerGas;
    const maxPriorityFeePerGas = chainConfig.maxPriorityFeePerGas ? BigInt(chainConfig.maxPriorityFeePerGas) : feeData.maxPriorityFeePerGas;
    const verifierContract = new import_ethers10.Contract(txData.contract_address, import_universal_verifier_v2_abi.IVerifierABI);
    const txRequestData = await verifierContract.submitResponse.populateTransaction(
      ...txPreparationResult.txDataArgs
    );
    const request = {
      to: txData.contract_address,
      data: txRequestData.data,
      maxFeePerGas,
      maxPriorityFeePerGas
    };
    let gasLimit;
    try {
      gasLimit = await ethSigner.estimateGas(request);
    } catch (e) {
      gasLimit = maxGasLimit;
    }
    request.gasLimit = gasLimit;
    const transactionService = new TransactionService(provider);
    const { txnHash } = await transactionService.sendTransactionRequest(ethSigner, request);
    return (/* @__PURE__ */ new Map()).set(txnHash, {
      authProof: txPreparationResult.result.authProof.raw,
      crossChainProof: txPreparationResult.result.crossChainProof.raw,
      responses: txPreparationResult.result.proofs.map((m) => m.proof)
    });
  }
  static async prepareTxArgsSubmit(resolverUrl, txData, responses, authProof) {
    if (txData.method_id.replace("0x", "") !== "06c86a91" /* SubmitResponse */) {
      throw new Error(
        `submit cross chain doesn't implement requested method id. Only '0x${"06c86a91" /* SubmitResponse */}' is supported.`
      );
    }
    const gistUpdatesArr = [];
    const stateUpdatesArr = [];
    const payloadResponses = [];
    const emptyBytes = "0x";
    let encodedAuthProof = "";
    switch (authProof.authMethod) {
      case "authV2" /* AUTHV2 */:
      case "authV3" /* AUTHV3 */:
      case "authV3-8-32" /* AUTHV3_8_32 */: {
        const preparedZkpProof = prepareZkpProof(authProof.zkp.proof);
        encodedAuthProof = packZkpProof(
          authProof.zkp.pub_signals,
          preparedZkpProof.a,
          preparedZkpProof.b,
          preparedZkpProof.c
        );
        break;
      }
      case "ethIdentity" /* ETH_IDENTITY */: {
        encodedAuthProof = packEthIdentityProof(authProof.userDid);
        break;
      }
      case "embeddedAuth" /* EMBEDDED_AUTH */: {
        encodedAuthProof = "0x";
        break;
      }
      default:
        throw new Error("auth proof must use method authV2, authV3, authV3-8-32 or ethIdentity");
    }
    for (const zkProof of responses) {
      this.checkSupportedCircuit(zkProof.circuitId);
      const { requestId, zkProofEncoded, metadata } = processProofResponse(zkProof);
      payloadResponses.push({
        proof: zkProof,
        requestId,
        encoded: zkProofEncoded,
        metadata
      });
    }
    const allZkProofs = responses.map((zkProof) => ({
      circuitId: zkProof.circuitId,
      pub_signals: zkProof.pub_signals
    }));
    if (["authV2" /* AUTHV2 */, "authV3" /* AUTHV3 */, "authV3-8-32" /* AUTHV3_8_32 */].includes(authProof.authMethod)) {
      allZkProofs.push({
        circuitId: authProof.zkp.circuitId,
        pub_signals: authProof.zkp.pub_signals
      });
    }
    for (const zkProof of allZkProofs) {
      const { gistUpdateResolutions, stateUpdateResolutions } = this.getUpdateResolutions(
        resolverUrl,
        txData.chain_id,
        zkProof.circuitId,
        zkProof.pub_signals
      );
      if (gistUpdateResolutions.length > 0) {
        gistUpdatesArr.push(...await Promise.all(gistUpdateResolutions));
      }
      if (stateUpdateResolutions.length > 0) {
        stateUpdatesArr.push(
          ...await Promise.all(stateUpdateResolutions)
        );
      }
    }
    const encodedCrossChainProof = gistUpdatesArr.length || stateUpdatesArr.length ? this.packCrossChainProofs(gistUpdatesArr, stateUpdatesArr) : emptyBytes;
    const preparationResult = {
      authProof: { raw: authProof, encoded: encodedAuthProof },
      proofs: payloadResponses,
      crossChainProof: {
        raw: {
          globalStateProofs: gistUpdatesArr || [],
          identityStateProofs: stateUpdatesArr || []
        },
        encoded: encodedCrossChainProof
      }
    };
    return { result: preparationResult, txDataArgs: toTxDataArgs(preparationResult) };
  }
  async prepareTxArgsSubmit(txData, responses, authProof) {
    if (!this._opts?.didResolverUrl) {
      throw new Error(`did resolver url required for crosschain verification`);
    }
    return _OnChainZKPVerifier.prepareTxArgsSubmit(
      this._opts.didResolverUrl,
      txData,
      responses,
      authProof
    );
  }
  static checkSupportedCircuit(circuitId) {
    const circuitsWithSubVersions = getCircuitIdsWithSubVersions(this._supportedCircuits);
    if (!circuitsWithSubVersions.includes(circuitId)) {
      throw new Error(`Circuit ${circuitId} not supported by OnChainZKPVerifier`);
    }
  }
  static getCrossChainResolvers(source, txDataChainId, type, didResolverUrl) {
    return [
      ...new Set(
        source.map(
          (info) => JSON.stringify({
            id: info.id.string(),
            [type]: type === "gist" ? info.root?.string() : info.state?.string()
          })
        )
      )
    ].reduce((acc, s) => {
      const info = JSON.parse(s);
      const id = import_js_iden3_core34.Id.fromString(info.id);
      const chainId = (0, import_js_iden3_core34.chainIDfromDID)(import_js_iden3_core34.DID.parseFromId(id));
      if (txDataChainId === chainId) {
        return acc;
      }
      const promise = this.resolveDidDocumentEip712MessageAndSignature(
        import_js_iden3_core34.DID.parseFromId(import_js_iden3_core34.Id.fromString(info.id)),
        didResolverUrl,
        {
          [type]: import_js_merkletree23.Hash.fromString(info[type])
        }
      );
      return [...acc, promise];
    }, []);
  }
  static async prepareTxArgsSubmitV2(resolverUrl, txData, zkProofResponses) {
    if (txData.method_id.replace("0x", "") !== "ade09fcd" /* SubmitZKPResponseV2 */) {
      throw new Error(
        `submit cross chain doesn't implement requested method id. Only '0x${"ade09fcd" /* SubmitZKPResponseV2 */}' is supported.`
      );
    }
    const gistUpdatesArr = [];
    const stateUpdatesArr = [];
    const payloadResponses = [];
    const emptyBytes = "0x";
    for (const zkProof of zkProofResponses) {
      this.checkSupportedCircuit(zkProof.circuitId);
      const { requestId, zkProofEncoded, metadata } = processProofResponse(zkProof);
      payloadResponses.push({
        requestId,
        zkProof: zkProofEncoded,
        data: metadata
      });
      const { gistUpdateResolutions, stateUpdateResolutions } = this.getUpdateResolutions(
        resolverUrl,
        txData.chain_id,
        zkProof.circuitId,
        zkProof.pub_signals
      );
      if (gistUpdateResolutions.length > 0) {
        gistUpdatesArr.push(...await Promise.all(gistUpdateResolutions));
      }
      if (stateUpdateResolutions.length > 0) {
        stateUpdatesArr.push(
          ...await Promise.all(stateUpdateResolutions)
        );
      }
    }
    const crossChainProofEncoded = gistUpdatesArr.length || stateUpdatesArr.length ? this.packCrossChainProofs(gistUpdatesArr, stateUpdatesArr) : emptyBytes;
    return [payloadResponses, crossChainProofEncoded];
  }
  async prepareTxArgsSubmitV2(txData, zkProofResponses) {
    if (!this._opts?.didResolverUrl) {
      throw new Error(`did resolver url required for crosschain verification`);
    }
    return _OnChainZKPVerifier.prepareTxArgsSubmitV2(
      this._opts.didResolverUrl,
      txData,
      zkProofResponses
    );
  }
  static getUpdateResolutions(resolverUrl, chainId, proofCircuitId, inputs) {
    const stateInfo = this.getOnChainGistRootStatePubSignals(proofCircuitId, inputs);
    const gistUpdateResolutions = this.getCrossChainResolvers(
      stateInfo.gists,
      chainId,
      "gist",
      resolverUrl
    );
    const stateUpdateResolutions = this.getCrossChainResolvers(
      stateInfo.states,
      chainId,
      "state",
      resolverUrl
    );
    return { gistUpdateResolutions, stateUpdateResolutions };
  }
  static packCrossChainProofs(gistUpdateArr, stateUpdateArr) {
    const proofs = [];
    for (const globalStateUpdate of gistUpdateArr) {
      proofs.push({
        proofType: "globalStateProof",
        proof: this.packGlobalStateMsg(globalStateUpdate)
      });
    }
    for (const stateUpdate of stateUpdateArr) {
      proofs.push({
        proofType: "stateProof",
        proof: this.packIdentityStateMsg(stateUpdate)
      });
    }
    return new import_ethers10.ethers.AbiCoder().encode(
      ["tuple(string proofType,bytes proof)[]"],
      [proofs]
    );
  }
  static packGlobalStateMsg(msg) {
    return new import_ethers10.ethers.AbiCoder().encode(
      [
        "tuple(tuple(uint256 timestamp,bytes2 idType,uint256 root,uint256 replacedAtTimestamp) globalStateMsg,bytes signature,)"
      ],
      [msg]
    );
  }
  static packIdentityStateMsg(msg) {
    return new import_ethers10.ethers.AbiCoder().encode(
      [
        "tuple(tuple(uint256 timestamp,uint256 id,uint256 state,uint256 replacedAtTimestamp) idStateMsg,bytes signature,)"
      ],
      [msg]
    );
  }
  static getOnChainGistRootStatePubSignals(onChainCircuitId, inputs) {
    const unmarshallerForCircuitId = getUnmarshallerForCircuitId(onChainCircuitId);
    if (!unmarshallerForCircuitId || !unmarshallerForCircuitId.unmarshaller) {
      throw new Error(`Circuit ${onChainCircuitId} not supported by OnChainZKPVerifier`);
    }
    const PubSignals = unmarshallerForCircuitId.unmarshaller;
    const queryPubSignals = new PubSignals(unmarshallerForCircuitId.opts);
    const encodedInputs = byteEncoder.encode(JSON.stringify(inputs));
    const pubSignalUnmarshalled = queryPubSignals.pubSignalsUnmarshal(encodedInputs);
    if (pubSignalUnmarshalled.getStatesInfo === void 0) {
      throw new Error(
        `Public signals unmarshaller for circuit ${onChainCircuitId} does not support getStatesInfo method`
      );
    }
    return pubSignalUnmarshalled.getStatesInfo();
  }
  static async resolveDidDocumentEip712MessageAndSignature(did, resolverUrl, opts) {
    const didDoc = await resolveDidDocument(did, resolverUrl, {
      ...opts,
      signature: "EthereumEip712Signature2021" /* EthereumEip712Signature2021 */
    });
    if (!didDoc.didResolutionMetadata.proof?.length) {
      throw new Error("No proof found in resolved DID document");
    }
    const message = didDoc.didResolutionMetadata.proof[0].eip712.message;
    const signature = didDoc.didResolutionMetadata.proof[0].proofValue;
    const isGistRequest = opts?.gist && !opts.state;
    if (isGistRequest) {
      return {
        globalStateMsg: {
          timestamp: message.timestamp,
          idType: message.idType,
          root: message.root,
          replacedAtTimestamp: message.replacedAtTimestamp
        },
        signature
      };
    }
    return {
      idStateMsg: {
        timestamp: message.timestamp,
        id: message.id,
        state: message.state,
        replacedAtTimestamp: message.replacedAtTimestamp
      },
      signature
    };
  }
};
var packEthIdentityProof = (did) => {
  return `0x${bytesToHex(import_js_iden3_core34.BytesHelper.intToBytes(import_js_iden3_core34.DID.idFromDID(did).bigInt()))}`;
};

// src/storage/blockchain/onchain-issuer.ts
var import_js_iden3_core37 = require("@iden3/js-iden3-core");
var import_ethers12 = require("ethers");
var import_onchain_non_merklized_issuer_base_abi2 = require("@iden3/onchain-non-merklized-issuer-base-abi");

// src/storage/blockchain/onchain-issuer-adapter/non-merklized/version/v0.0.1/onchain-non-merklized-issuer-adapter.ts
var import_js_iden3_core35 = require("@iden3/js-iden3-core");
var import_onchain_non_merklized_issuer_base_abi = require("@iden3/onchain-non-merklized-issuer-base-abi");
var import_js_jsonld_merklization5 = require("@iden3/js-jsonld-merklization");
var import_js_merkletree24 = require("@iden3/js-merkletree");
var import_ethers11 = require("ethers");
var import_js_iden3_core36 = require("@iden3/js-iden3-core");
var OnchainNonMerklizedIssuerAdapter = class {
  _contract;
  _contractAddress;
  _chainId;
  _issuerDid;
  _merklizationOptions;
  /**
   * Initializes an instance of `OnchainNonMerklizedIssuerAdapter`.
   *
   * @param ethConnectionConfig The configuration for the Ethereum connection.
   * @param issuerDid The decentralized identifier (DID) of the issuer.
   * @param merklizationOptions Optional settings for merklization.
   */
  constructor(ethConnectionConfig, issuerDid, options) {
    if (!ethConnectionConfig.chainId) {
      throw new Error("Chain ID is required");
    }
    this._chainId = ethConnectionConfig.chainId;
    this._contractAddress = import_ethers11.ethers.getAddress(
      import_ethers11.ethers.hexlify(import_js_iden3_core35.Id.ethAddressFromId(import_js_iden3_core35.DID.idFromDID(issuerDid)))
    );
    this._contract = import_onchain_non_merklized_issuer_base_abi.NonMerklizedIssuerBase__factory.connect(
      this._contractAddress,
      new import_ethers11.ethers.JsonRpcProvider(ethConnectionConfig.url)
    );
    this._issuerDid = issuerDid;
    this._merklizationOptions = options?.merklizationOptions;
  }
  /**
   * Checks if the contract supports required interfaces.
   * Throws an error if any required interface is unsupported.
   *
   * @throws Error - If required interfaces are not supported.
   */
  async isInterfaceSupported() {
    const supportedInterfaces = [
      {
        name: "Interface detection ERC-165",
        value: "0x01ffc9a7" /* InterfaceDetection */
      },
      {
        name: "Interface non-merklized issuer",
        value: "0x58874949" /* InterfaceNonMerklizedIssuer */
      },
      {
        name: "Interface get credential",
        value: "0x5d1ca631" /* InterfaceGetCredential */
      }
    ];
    const unsupportedInterfaces = await Promise.all(
      supportedInterfaces.map(async (interfaceObj) => {
        const isSupported = await this._contract.supportsInterface(interfaceObj.value);
        return isSupported ? null : interfaceObj.name;
      })
    );
    const unsupportedInterfacesFiltered = unsupportedInterfaces.filter(
      (interfaceName) => interfaceName !== null
    );
    if (unsupportedInterfacesFiltered.length > 0) {
      throw new Error(`Unsupported interfaces: ${unsupportedInterfacesFiltered.join(", ")}`);
    }
  }
  /**
   * Retrieves a credential from the on-chain non-merklized contract.
   * @param userId The user's core.Id.
   * @param credentialId The unique identifier of the credential.
   */
  async getCredential(userId, credentialId) {
    const [credentialData, coreClaimBigInts, credentialSubjectFields] = await this._contract.getCredential(userId.bigInt(), credentialId);
    return { credentialData, coreClaimBigInts, credentialSubjectFields };
  }
  /**
   * Retrieves the credential IDs of a user.
   * @param userId The user's core.Id.
   * @returns An array of credential IDs.
   */
  async getUserCredentialsIds(userId) {
    return this._contract.getUserCredentialIds(userId.bigInt());
  }
  /**
   * Converts on-chain credential to a verifiable credential.
   *
   * @param credentialData Data structure of the credential from the contract.
   * @param coreClaimBigInts Claim data in bigint format.
   * @param credentialSubjectFields Subject fields of the credential.
   */
  async convertOnChainInfoToW3CCredential(credentialData, coreClaimBigInts, credentialSubjectFields) {
    const c = new import_js_iden3_core35.Claim().unMarshalJson(JSON.stringify(coreClaimBigInts.map((b) => b.toString())));
    const credentialSubject = await this.convertCredentialSubject(
      c,
      credentialData.context,
      credentialData._type,
      credentialSubjectFields
    );
    const credentialRequest = {
      id: this.credentialId(credentialData.id),
      credentialSchema: credentialData.credentialSchema.id,
      type: credentialData._type,
      credentialSubject,
      expiration: c.getExpirationDate()?.getTime(),
      displayMethod: this.convertDisplayMethod(credentialData.displayMethod),
      context: credentialData.context,
      revocationOpts: {
        id: this._contractAddress,
        nonce: Number(c.getRevocationNonce()),
        type: "Iden3OnchainSparseMerkleTreeProof2023" /* Iden3OnchainSparseMerkleTreeProof2023 */
      },
      issuanceDate: (0, import_js_iden3_core36.getDateFromUnixTimestamp)(Number(credentialData.issuanceDate)).getTime()
    };
    const existenceProof = await this.existenceProof(c);
    const w3c = W3CCredential.fromCredentialRequest(this._issuerDid, credentialRequest);
    w3c.proof = [existenceProof];
    return w3c;
  }
  credentialId(id) {
    return `urn:iden3:onchain:${this._chainId}:${this._contractAddress}:${id}`;
  }
  async convertCredentialSubject(coreClaim, contractContexts, credentialType, credentialSubjectFields) {
    const contractContextsStr = JSON.stringify({
      "@context": contractContexts
    });
    const credentialSubject = {};
    for (const f of credentialSubjectFields) {
      const dataType = await import_js_jsonld_merklization5.Path.newTypeFromContext(
        contractContextsStr,
        `${credentialType}.${f.key}`,
        this._merklizationOptions
      );
      switch (dataType) {
        case "http://www.w3.org/2001/XMLSchema#boolean" /* Boolean */: {
          switch (f.rawValue.toString()) {
            case "18586133768512220936620570745912940619677854269274689475585506675881198879027" /* BooleanTrue */:
              credentialSubject[f.key] = true;
              break;
            case "19014214495641488759237505126948346942972912379615652741039992445865937985820" /* BooleanFalse */:
              credentialSubject[f.key] = false;
              break;
          }
          break;
        }
        case ("http://www.w3.org/2001/XMLSchema#nonNegativeInteger" /* NonNegativeInteger */, "http://www.w3.org/2001/XMLSchema#nonPositiveInteger" /* NonPositiveInteger */, "http://www.w3.org/2001/XMLSchema#negativeInteger" /* NegativeInteger */, "http://www.w3.org/2001/XMLSchema#positiveInteger" /* PositiveInteger */): {
          credentialSubject[f.key] = f.value.toString();
          break;
        }
        case "http://www.w3.org/2001/XMLSchema#integer" /* Integer */: {
          credentialSubject[f.key] = Number(f.value);
          break;
        }
        case "http://www.w3.org/2001/XMLSchema#string" /* String */: {
          this.validateSourceValue(dataType, f.value, f.rawValue);
          credentialSubject[f.key] = f.rawValue;
          break;
        }
        case "http://www.w3.org/2001/XMLSchema#dateTime" /* DateTime */: {
          const timestamp = BigInt(f.rawValue);
          const sourceTimestamp = (0, import_js_iden3_core36.getDateFromUnixTimestamp)(Number(timestamp)).toISOString();
          this.validateSourceValue(dataType, f.value, sourceTimestamp);
          credentialSubject[f.key] = sourceTimestamp;
          break;
        }
        case "http://www.w3.org/2001/XMLSchema#double" /* Double */: {
          const rawFloat = Number(f.rawValue);
          this.validateSourceValue(dataType, f.value, rawFloat);
          credentialSubject[f.key] = rawFloat;
          break;
        }
        default: {
          throw new Error(`Unsupported data type ${dataType}`);
        }
      }
    }
    credentialSubject["type"] = credentialType;
    const subjectId = coreClaim.getId();
    const subjectDid = import_js_iden3_core35.DID.parseFromId(subjectId);
    credentialSubject["id"] = subjectDid.string();
    return credentialSubject;
  }
  async existenceProof(coreClaim) {
    const [mtpProof, stateInfo] = await this._contract.getClaimProofWithStateInfo(
      coreClaim.hIndex()
    );
    if (!mtpProof.existence) {
      throw new Error("Claim does not exist");
    }
    const latestStateHash = import_js_merkletree24.Hash.fromBigInt(stateInfo.state);
    const latestClaimsOfRootHash = import_js_merkletree24.Hash.fromBigInt(stateInfo.claimsRoot);
    const latestRevocationOfRootHash = import_js_merkletree24.Hash.fromBigInt(stateInfo.revocationsRoot);
    const latestRootsOfRootHash = import_js_merkletree24.Hash.fromBigInt(stateInfo.rootsRoot);
    const p = new import_js_merkletree24.Proof({
      siblings: mtpProof.siblings.map((s) => import_js_merkletree24.Hash.fromBigInt(s)),
      existence: mtpProof.existence,
      nodeAux: mtpProof.auxExistence ? {
        key: import_js_merkletree24.Hash.fromBigInt(mtpProof.auxIndex),
        value: import_js_merkletree24.Hash.fromBigInt(mtpProof.auxValue)
      } : void 0
    });
    return new Iden3SparseMerkleTreeProof({
      issuerData: {
        id: this._issuerDid,
        state: {
          value: latestStateHash,
          claimsTreeRoot: latestClaimsOfRootHash,
          revocationTreeRoot: latestRevocationOfRootHash,
          rootOfRoots: latestRootsOfRootHash
        }
      },
      mtp: p,
      coreClaim
    });
  }
  async validateSourceValue(dataType, originHash, source) {
    const sourceHash = await import_js_jsonld_merklization5.Merklizer.hashValue(dataType, source);
    if (sourceHash !== originHash) {
      throw new Error(`Invalid source value for ${dataType} type`);
    }
  }
  convertDisplayMethod(onchainDisplayMethod) {
    if (!onchainDisplayMethod.id || !onchainDisplayMethod._type) {
      return void 0;
    }
    switch (onchainDisplayMethod._type) {
      case "Iden3BasicDisplayMethodV1" /* Iden3BasicDisplayMethodV1 */: {
        return {
          id: onchainDisplayMethod.id,
          type: "Iden3BasicDisplayMethodV1" /* Iden3BasicDisplayMethodV1 */
        };
      }
      default: {
        throw new Error(`Unsupported display method type ${onchainDisplayMethod._type}`);
      }
    }
  }
};

// src/storage/blockchain/onchain-issuer.ts
var OnchainIssuer = class {
  _ethConnectionConfig;
  _onchainIssuerOptions;
  /**
   * Initializes an instance of `Adapter`.
   * @param config The configuration for the Ethereum connection.
   * @param merklizationOptions Optional settings for merklization.
   */
  constructor(config, options) {
    this._ethConnectionConfig = config;
    this._onchainIssuerOptions = options;
  }
  /**
   * Retrieves a credential from the on-chain issuer.
   * @param issuerDID The issuer's core.DID.
   * @param userId The user's core.Id.
   * @param credentialId The unique identifier of the credential.
   */
  async getCredential(issuerDID, userDID, credentialId) {
    const { contract, connection } = this.getContractConnection(issuerDID);
    const response = await contract.getCredentialAdapterVersion();
    switch (response) {
      case "0.0.1": {
        const adapter = new OnchainNonMerklizedIssuerAdapter(connection, issuerDID, {
          merklizationOptions: this._onchainIssuerOptions?.merklizationOptions
        });
        await adapter.isInterfaceSupported();
        const { credentialData, coreClaimBigInts, credentialSubjectFields } = await adapter.getCredential(import_js_iden3_core37.DID.idFromDID(userDID), credentialId);
        return await adapter.convertOnChainInfoToW3CCredential(
          credentialData,
          coreClaimBigInts,
          credentialSubjectFields
        );
      }
      default:
        throw new Error(`Unsupported adapter version ${response}`);
    }
  }
  /**
   * Retrieves the credential identifiers for a user from the on-chain issuer.
   * @param issuerDID The issuer's core.DID.
   * @param userId The user's core.Id.
   */
  async getUserCredentialIds(issuerDID, userDID) {
    const { contract, connection } = this.getContractConnection(issuerDID);
    const response = await contract.getCredentialAdapterVersion();
    switch (response) {
      case "0.0.1": {
        const adapter = new OnchainNonMerklizedIssuerAdapter(connection, issuerDID, {
          merklizationOptions: this._onchainIssuerOptions?.merklizationOptions
        });
        await adapter.isInterfaceSupported();
        return await adapter.getUserCredentialsIds(import_js_iden3_core37.DID.idFromDID(userDID));
      }
      default:
        throw new Error(`Unsupported adapter version ${response}`);
    }
  }
  getContractConnection(did) {
    const issuerId = import_js_iden3_core37.DID.idFromDID(did);
    const chainId = (0, import_js_iden3_core37.chainIDfromDID)(did);
    const contractAddress = import_ethers12.ethers.getAddress(import_ethers12.ethers.hexlify(import_js_iden3_core37.Id.ethAddressFromId(issuerId)));
    const connection = this._ethConnectionConfig.find((c) => c.chainId === chainId);
    if (!connection) {
      throw new Error(`No connection found for chain ID ${chainId}`);
    }
    if (!connection.url) {
      throw new Error(`No URL found for chain ID ${chainId}`);
    }
    const contract = new import_ethers12.Contract(contractAddress, import_onchain_non_merklized_issuer_base_abi2.INonMerklizedIssuerABI, new import_ethers12.ethers.JsonRpcProvider(connection.url));
    return { contract, connection };
  }
};

// src/storage/blockchain/did-resolver-readonly-storage.ts
var import_js_merkletree25 = require("@iden3/js-merkletree");
var import_js_iden3_core38 = require("@iden3/js-iden3-core");
var import_ethers13 = require("ethers");
var DidResolverStateReadonlyStorage = class {
  constructor(resolverUrl) {
    this.resolverUrl = resolverUrl;
  }
  async getLatestStateById(id) {
    return this.getStateInfo(id);
  }
  async getStateInfoByIdAndState(id, state) {
    return this.getStateInfo(id, state);
  }
  async getGISTProof(id) {
    const { didDocument } = await resolveDidDocument(
      import_js_iden3_core38.DID.parseFromId(import_js_iden3_core38.Id.fromBigInt(id)),
      this.resolverUrl
    );
    const { global } = this.getIden3StateInfo2023(didDocument);
    if (!global) {
      throw new Error("GIST root not found");
    }
    const { proof } = global;
    if (!proof) {
      throw new Error("GIST proof not found");
    }
    return {
      root: global.root,
      existence: proof.existence,
      siblings: proof.siblings?.map((sibling) => BigInt(sibling)),
      index: BigInt(0),
      value: BigInt(0),
      auxExistence: !!proof.node_aux,
      auxIndex: proof.node_aux ? BigInt(proof.node_aux.key) : BigInt(0),
      auxValue: proof.node_aux ? BigInt(proof.node_aux.value) : BigInt(0)
    };
  }
  async getGISTRootInfo(root, userId) {
    const { didDocument } = await resolveDidDocument(
      import_js_iden3_core38.DID.parseFromId(import_js_iden3_core38.Id.fromBigInt(userId)),
      this.resolverUrl,
      {
        gist: import_js_merkletree25.Hash.fromBigInt(root)
      }
    );
    const { global } = this.getIden3StateInfo2023(didDocument);
    if (!global) {
      throw new Error("GIST root not found");
    }
    return global;
  }
  getRpcProvider() {
    return new import_ethers13.JsonRpcProvider();
  }
  publishState() {
    throw new Error("publishState method not implemented.");
  }
  publishStateGeneric() {
    throw new Error("publishStateGeneric method not implemented.");
  }
  async getStateInfo(id, state) {
    const opts = state ? { state: import_js_merkletree25.Hash.fromBigInt(state) } : void 0;
    const { didDocument } = await resolveDidDocument(
      import_js_iden3_core38.DID.parseFromId(import_js_iden3_core38.Id.fromBigInt(id)),
      this.resolverUrl,
      opts
    );
    const { info, published } = this.getIden3StateInfo2023(didDocument);
    if (!info && !published) {
      throw new Error(VerifiableConstants.ERRORS.STATE_DOES_NOT_EXIST);
    }
    if (!info) {
      throw new Error("State info not found");
    }
    info.id = id;
    info.state = opts?.state?.bigInt();
    return { ...info };
  }
  getIden3StateInfo2023(didDocument) {
    const vm = didDocument.verificationMethod?.find(
      (i) => i.type === "Iden3StateInfo2023"
    );
    if (!vm) {
      throw new Error("Iden3StateInfo2023 verification method not found");
    }
    return vm;
  }
};

// src/storage/blockchain/erc20-helper.ts
var import_ethers14 = require("ethers");

// src/storage/blockchain/abi/ERC20Permit.json
var ERC20Permit_default = [{ inputs: [], name: "ECDSAInvalidSignature", type: "error" }, { inputs: [{ internalType: "uint256", name: "length", type: "uint256" }], name: "ECDSAInvalidSignatureLength", type: "error" }, { inputs: [{ internalType: "bytes32", name: "s", type: "bytes32" }], name: "ECDSAInvalidSignatureS", type: "error" }, { inputs: [{ internalType: "address", name: "spender", type: "address" }, { internalType: "uint256", name: "allowance", type: "uint256" }, { internalType: "uint256", name: "needed", type: "uint256" }], name: "ERC20InsufficientAllowance", type: "error" }, { inputs: [{ internalType: "address", name: "sender", type: "address" }, { internalType: "uint256", name: "balance", type: "uint256" }, { internalType: "uint256", name: "needed", type: "uint256" }], name: "ERC20InsufficientBalance", type: "error" }, { inputs: [{ internalType: "address", name: "approver", type: "address" }], name: "ERC20InvalidApprover", type: "error" }, { inputs: [{ internalType: "address", name: "receiver", type: "address" }], name: "ERC20InvalidReceiver", type: "error" }, { inputs: [{ internalType: "address", name: "sender", type: "address" }], name: "ERC20InvalidSender", type: "error" }, { inputs: [{ internalType: "address", name: "spender", type: "address" }], name: "ERC20InvalidSpender", type: "error" }, { inputs: [{ internalType: "uint256", name: "deadline", type: "uint256" }], name: "ERC2612ExpiredSignature", type: "error" }, { inputs: [{ internalType: "address", name: "signer", type: "address" }, { internalType: "address", name: "owner", type: "address" }], name: "ERC2612InvalidSigner", type: "error" }, { inputs: [{ internalType: "address", name: "account", type: "address" }, { internalType: "uint256", name: "currentNonce", type: "uint256" }], name: "InvalidAccountNonce", type: "error" }, { inputs: [], name: "InvalidShortString", type: "error" }, { inputs: [{ internalType: "string", name: "str", type: "string" }], name: "StringTooLong", type: "error" }, { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "owner", type: "address" }, { indexed: true, internalType: "address", name: "spender", type: "address" }, { indexed: false, internalType: "uint256", name: "value", type: "uint256" }], name: "Approval", type: "event" }, { anonymous: false, inputs: [], name: "EIP712DomainChanged", type: "event" }, { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "from", type: "address" }, { indexed: true, internalType: "address", name: "to", type: "address" }, { indexed: false, internalType: "uint256", name: "value", type: "uint256" }], name: "Transfer", type: "event" }, { inputs: [], name: "DOMAIN_SEPARATOR", outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "address", name: "owner", type: "address" }, { internalType: "address", name: "spender", type: "address" }], name: "allowance", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "address", name: "spender", type: "address" }, { internalType: "uint256", name: "value", type: "uint256" }], name: "approve", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" }, { inputs: [{ internalType: "address", name: "account", type: "address" }], name: "balanceOf", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }, { inputs: [], name: "decimals", outputs: [{ internalType: "uint8", name: "", type: "uint8" }], stateMutability: "view", type: "function" }, { inputs: [], name: "eip712Domain", outputs: [{ internalType: "bytes1", name: "fields", type: "bytes1" }, { internalType: "string", name: "name", type: "string" }, { internalType: "string", name: "version", type: "string" }, { internalType: "uint256", name: "chainId", type: "uint256" }, { internalType: "address", name: "verifyingContract", type: "address" }, { internalType: "bytes32", name: "salt", type: "bytes32" }, { internalType: "uint256[]", name: "extensions", type: "uint256[]" }], stateMutability: "view", type: "function" }, { inputs: [], name: "name", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "address", name: "owner", type: "address" }], name: "nonces", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "address", name: "owner", type: "address" }, { internalType: "address", name: "spender", type: "address" }, { internalType: "uint256", name: "value", type: "uint256" }, { internalType: "uint256", name: "deadline", type: "uint256" }, { internalType: "uint8", name: "v", type: "uint8" }, { internalType: "bytes32", name: "r", type: "bytes32" }, { internalType: "bytes32", name: "s", type: "bytes32" }], name: "permit", outputs: [], stateMutability: "nonpayable", type: "function" }, { inputs: [], name: "symbol", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" }, { inputs: [], name: "totalSupply", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "address", name: "to", type: "address" }, { internalType: "uint256", name: "value", type: "uint256" }], name: "transfer", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" }, { inputs: [{ internalType: "address", name: "from", type: "address" }, { internalType: "address", name: "to", type: "address" }, { internalType: "uint256", name: "value", type: "uint256" }], name: "transferFrom", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" }];

// src/storage/blockchain/abi/ERC20.json
var ERC20_default = [{ inputs: [{ internalType: "uint256", name: "initialSupply", type: "uint256" }], stateMutability: "nonpayable", type: "constructor" }, { inputs: [{ internalType: "address", name: "spender", type: "address" }, { internalType: "uint256", name: "allowance", type: "uint256" }, { internalType: "uint256", name: "needed", type: "uint256" }], name: "ERC20InsufficientAllowance", type: "error" }, { inputs: [{ internalType: "address", name: "sender", type: "address" }, { internalType: "uint256", name: "balance", type: "uint256" }, { internalType: "uint256", name: "needed", type: "uint256" }], name: "ERC20InsufficientBalance", type: "error" }, { inputs: [{ internalType: "address", name: "approver", type: "address" }], name: "ERC20InvalidApprover", type: "error" }, { inputs: [{ internalType: "address", name: "receiver", type: "address" }], name: "ERC20InvalidReceiver", type: "error" }, { inputs: [{ internalType: "address", name: "sender", type: "address" }], name: "ERC20InvalidSender", type: "error" }, { inputs: [{ internalType: "address", name: "spender", type: "address" }], name: "ERC20InvalidSpender", type: "error" }, { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "owner", type: "address" }, { indexed: true, internalType: "address", name: "spender", type: "address" }, { indexed: false, internalType: "uint256", name: "value", type: "uint256" }], name: "Approval", type: "event" }, { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "from", type: "address" }, { indexed: true, internalType: "address", name: "to", type: "address" }, { indexed: false, internalType: "uint256", name: "value", type: "uint256" }], name: "Transfer", type: "event" }, { inputs: [{ internalType: "address", name: "owner", type: "address" }, { internalType: "address", name: "spender", type: "address" }], name: "allowance", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "address", name: "spender", type: "address" }, { internalType: "uint256", name: "value", type: "uint256" }], name: "approve", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" }, { inputs: [{ internalType: "address", name: "account", type: "address" }], name: "balanceOf", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }, { inputs: [], name: "decimals", outputs: [{ internalType: "uint8", name: "", type: "uint8" }], stateMutability: "view", type: "function" }, { inputs: [], name: "name", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" }, { inputs: [], name: "symbol", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" }, { inputs: [], name: "totalSupply", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "address", name: "to", type: "address" }, { internalType: "uint256", name: "value", type: "uint256" }], name: "transfer", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" }, { inputs: [{ internalType: "address", name: "from", type: "address" }, { internalType: "address", name: "to", type: "address" }, { internalType: "uint256", name: "value", type: "uint256" }], name: "transferFrom", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" }];

// src/storage/blockchain/erc20-helper.ts
async function getPermitSignature(signer, tokenAddress, spender, value, deadline, chainId) {
  const erc20PermitContract = new import_ethers14.Contract(tokenAddress, ERC20Permit_default, signer);
  const nonce = await erc20PermitContract.nonces(await signer.getAddress());
  const [name, version] = await Promise.all([
    erc20PermitContract.name(),
    erc20PermitContract.version?.().catch(() => "1") ?? Promise.resolve("1")
  ]);
  const domain = {
    name,
    version,
    chainId,
    verifyingContract: tokenAddress
  };
  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ]
  };
  const message = {
    owner: await signer.getAddress(),
    spender,
    value,
    nonce,
    deadline
  };
  return signer.signTypedData(domain, types, message);
}
async function getERC20Decimals(tokenAddress, runner) {
  const erc20Contract = new import_ethers14.Contract(tokenAddress, ERC20_default, runner);
  return erc20Contract.decimals();
}

// src/storage/filters/jsonQuery.ts
var SearchError = /* @__PURE__ */ ((SearchError2) => {
  SearchError2["NotDefinedQueryKey"] = "not defined query key";
  SearchError2["NotDefinedComparator"] = "not defined comparator";
  return SearchError2;
})(SearchError || {});
var SupportedDataFormat = /* @__PURE__ */ ((SupportedDataFormat2) => {
  SupportedDataFormat2[SupportedDataFormat2["BigInt"] = 0] = "BigInt";
  SupportedDataFormat2[SupportedDataFormat2["Boolean"] = 1] = "Boolean";
  SupportedDataFormat2[SupportedDataFormat2["Double"] = 2] = "Double";
  SupportedDataFormat2[SupportedDataFormat2["DateTime"] = 3] = "DateTime";
  SupportedDataFormat2[SupportedDataFormat2["String"] = 4] = "String";
  return SupportedDataFormat2;
})(SupportedDataFormat || {});
var truthyValues = [true, 1, "true"];
var falsyValues = [false, 0, "false"];
var equalsComparator = (a, b) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }
  if (!Array.isArray(a) && Array.isArray(b)) {
    return b.includes(a);
  }
  if (Array.isArray(a) && !Array.isArray(b)) {
    return a.includes(b);
  }
  a = a;
  b = b;
  if (truthyValues.includes(a) && truthyValues.includes(b)) {
    return true;
  }
  if (falsyValues.includes(a) && falsyValues.includes(b)) {
    return true;
  }
  return a === b;
};
var greaterThan = (a, b) => {
  const predicate = (a2, b2) => {
    const dataFormat = detectDataFormat(a2.toString());
    switch (dataFormat) {
      case 0 /* BigInt */:
      case 1 /* Boolean */:
        return BigInt(a2) > BigInt(b2);
      case 3 /* DateTime */:
        return Date.parse(a2.toString()) > Date.parse(b2.toString());
      /// nanoseconds won't be compared.
      case 2 /* Double */:
      case 4 /* String */:
      default:
        return a2 > b2;
    }
  };
  return operatorIndependentCheck(a, b, predicate);
};
var greaterThanOrEqual = (a, b) => {
  const predicate = (a2, b2) => {
    const dataFormat = detectDataFormat(a2.toString());
    switch (dataFormat) {
      case 0 /* BigInt */:
      case 1 /* Boolean */:
        return BigInt(a2) >= BigInt(b2);
      case 3 /* DateTime */:
        return Date.parse(a2.toString()) >= Date.parse(b2.toString());
      /// nanoseconds won't be compared.
      case 2 /* Double */:
      case 4 /* String */:
      default:
        return a2 >= b2;
    }
  };
  return operatorIndependentCheck(a, b, predicate);
};
var existsComparator = (a, b) => {
  if (truthyValues.includes(b) && typeof a !== "undefined") {
    return true;
  }
  if (falsyValues.includes(b) && (a === void 0 || Array.isArray(a) && !a.length)) {
    return true;
  }
  return false;
};
var inOperator = (a, b) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.every((val) => b.includes(val));
  }
  if (!Array.isArray(a) && Array.isArray(b)) {
    return b.includes(a);
  }
  if (Array.isArray(a) && !Array.isArray(b)) {
    return a.includes(b);
  }
  return false;
};
var betweenOperator = (a, b) => {
  if (!Array.isArray(b) || b.length !== 2) {
    throw new Error("$between/$nonbetween operator value should be 2 elements array");
  }
  const [min, max] = b.map(BigInt);
  const predicate = (val) => val >= min && val <= max;
  if (Array.isArray(a)) {
    return a.map(BigInt).every(predicate);
  }
  return predicate(BigInt(a));
};
var comparatorOptions = {
  $noop: () => true,
  $sd: () => true,
  $exists: (a, b) => existsComparator(a, b),
  $eq: (a, b) => equalsComparator(a, b),
  $in: (a, b) => inOperator(a, b),
  $nin: (a, b) => !inOperator(a, b),
  $gt: (a, b) => greaterThan(a, b),
  $lt: (a, b) => !greaterThanOrEqual(a, b),
  $ne: (a, b) => !equalsComparator(a, b),
  $gte: (a, b) => greaterThanOrEqual(a, b),
  $lte: (a, b) => !greaterThan(a, b),
  $between: (a, b) => betweenOperator(a, b),
  $nonbetween: (a, b) => !betweenOperator(a, b)
};
var resolvePath = (object, path, defaultValue = null) => {
  const pathParts = path.split(".");
  let o = object;
  for (const part of pathParts) {
    if (o === null || o === void 0) {
      return defaultValue;
    }
    o = o[part];
  }
  return o;
};
var FilterQuery = class {
  /**
   * Creates an instance of FilterQuery.
   * @param {string} path
   * @param {FilterOperatorFunction} operatorFunc
   * @param {*} value
   * @param {boolean} [isReverseParams=false]
   */
  constructor(path, operatorFunc, value, isReverseParams = false) {
    this.path = path;
    this.operatorFunc = operatorFunc;
    this.value = value;
    this.isReverseParams = isReverseParams;
  }
  /** {@inheritdoc IFilterQuery} */
  execute(credential) {
    if (!this.operatorFunc) {
      throw new Error("not defined comparator" /* NotDefinedComparator */);
    }
    const credentialPathValue = resolvePath(credential, this.path);
    if ((credentialPathValue === null || credentialPathValue === void 0) && this.operatorFunc !== comparatorOptions.$exists) {
      return false;
    }
    if (this.isReverseParams) {
      return this.operatorFunc(this.value, credentialPathValue);
    }
    return this.operatorFunc(credentialPathValue, this.value);
  }
};
var StandardJSONCredentialsQueryFilter = (query) => {
  return Object.keys(query).reduce((acc, queryKey) => {
    const queryValue = query[queryKey];
    switch (queryKey) {
      case "claimId":
        return acc.concat(new FilterQuery("id", comparatorOptions.$eq, queryValue));
      case "allowedIssuers": {
        const queryValueParam = queryValue || ["*"];
        if (queryValueParam.includes("*")) {
          return acc;
        }
        return acc.concat(new FilterQuery("issuer", comparatorOptions.$in, queryValue));
      }
      case "type":
        return acc.concat(new FilterQuery("type", comparatorOptions.$in, queryValue, true));
      case "context":
        return acc.concat(new FilterQuery("@context", comparatorOptions.$in, queryValue, true));
      case "credentialSubjectId":
        return acc.concat(
          new FilterQuery("credentialSubject.id", comparatorOptions.$eq, queryValue)
        );
      case "schema":
        return acc.concat(
          new FilterQuery("credentialSchema.id", comparatorOptions.$eq, queryValue)
        );
      case "credentialSubject": {
        const reqFilters = Object.keys(queryValue).reduce((acc2, fieldKey) => {
          const fieldParams = queryValue[fieldKey];
          if (typeof fieldParams === "object" && Object.keys(fieldParams).length === 0) {
            return acc2.concat([
              new FilterQuery(`credentialSubject.${fieldKey}`, comparatorOptions.$noop, null)
            ]);
          }
          const res = Object.keys(fieldParams).map((comparator) => {
            const value = fieldParams[comparator];
            const path = `credentialSubject.${fieldKey}`;
            return new FilterQuery(
              path,
              comparatorOptions[comparator],
              value
            );
          });
          return acc2.concat(res);
        }, []);
        return acc.concat(reqFilters);
      }
      case "proofType":
      case "groupId":
      case "skipClaimRevocationCheck": {
        return acc;
      }
      default:
        throw new Error(`${queryKey} : ${"not defined query key" /* NotDefinedQueryKey */}`);
    }
  }, []);
};
var operatorIndependentCheck = (a, b, predicate) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.every((val, index) => predicate(val, b[index]));
  }
  if (!Array.isArray(a) && Array.isArray(b)) {
    return b.every((val) => predicate(a, val));
  }
  if (Array.isArray(a) && !Array.isArray(b)) {
    return a.every((val) => predicate(val, b));
  }
  return predicate(a, b);
};
var regExBigInt = /^[+-]?\d+$/;
var regExDouble = /^(-?)(0|([1-9][0-9]*))(\\.[0-9]+)?$/;
var regExDateTimeRFC3339Nano = (
  /* eslint-disable-next-line */
  /^([0-9]+)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])[Tt]([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\.[0-9]+)?(([Zz])|([\+|\-]([01][0-9]|2[0-3]):[0-5][0-9]))$/
);
var regExBoolean = /^(true)|(false)$/;
var regExDateTimeYYYYMMDD = /^\d{4}-\d{2}-\d{2}$/;
var detectDataFormat = (s) => regExBigInt.test(s) ? 0 /* BigInt */ : regExDouble.test(s) ? 2 /* Double */ : regExDateTimeRFC3339Nano.test(s) || regExDateTimeYYYYMMDD.test(s) ? 3 /* DateTime */ : regExBoolean.test(s) ? 1 /* Boolean */ : 4 /* String */;

// src/storage/local-storage/data-source.ts
var BrowserDataSource = class {
  /**
   * Creates an instance of BrowserDataSource.
   * @param {string} _localStorageKey - key string to put storage name in the local storage
   */
  constructor(_localStorageKey) {
    this._localStorageKey = _localStorageKey;
    const data = localStorage.getItem(this._localStorageKey);
    if (!data) {
      localStorage.setItem(_localStorageKey, JSON.stringify([]));
    }
  }
  /**
   *
   * saves value to the local storage
   * @param {string} key - key value
   * @param {Type} value - value to store
   * @param {string} [keyName='id'] -  key name
   */
  async save(key, value, keyName = "id") {
    if (localStorage) {
      const data = localStorage.getItem(this._localStorageKey);
      let items = [];
      if (data) {
        items = JSON.parse(data);
      }
      const itemIndex = items.findIndex((i) => i[keyName] === key);
      if (itemIndex === -1) {
        items.push(value);
      } else {
        items[itemIndex] = value;
      }
      localStorage.setItem(this._localStorageKey, JSON.stringify(items));
    }
  }
  /**
   * gets value from the local storage by given key
   * @param {string} key - key value
   * @param {string}  [keyName='id'] -  key name
   */
  async get(key, keyName = "id") {
    const data = localStorage.getItem(this._localStorageKey);
    let parsedData = [];
    if (data) {
      parsedData = JSON.parse(data);
    }
    return parsedData.find((t) => t[keyName] === key);
  }
  /**
   * loads all from the local storage
   */
  async load() {
    const data = localStorage.getItem(this._localStorageKey);
    return data && JSON.parse(data);
  }
  /**
   * deletes item from the local storage
   * @param {string} key - key value
   * @param {string}  [keyName='id'] -  key name
   */
  async delete(key, keyName = "id") {
    const dataStr = localStorage.getItem(this._localStorageKey);
    let data = [];
    if (dataStr) {
      data = JSON.parse(dataStr);
    }
    const items = data.filter((i) => i[keyName] !== key);
    if (data.length === items.length) {
      throw new Error(`${"item not found" /* ItemNotFound */} to delete: ${key}`);
    }
    localStorage.setItem(this._localStorageKey, JSON.stringify(items));
  }
};

// src/storage/local-storage/merkletree.ts
var import_js_merkletree26 = require("@iden3/js-merkletree");
var uuid12 = __toESM(require("uuid"), 1);
var MerkleTreeLocalStorage = class _MerkleTreeLocalStorage {
  /**
   * Creates an instance of MerkleTreeLocalStorage.
   * @param {number} _mtDepth
   */
  constructor(_mtDepth) {
    this._mtDepth = _mtDepth;
  }
  /**
   * key for the storage key metadata
   *
   * @static
   */
  static storageKeyMeta = "merkle-tree-meta";
  /** creates a tree in the local storage */
  async createIdentityMerkleTrees(identifier) {
    if (!identifier) {
      identifier = `${uuid12.v4()}`;
    }
    const meta = localStorage.getItem(_MerkleTreeLocalStorage.storageKeyMeta);
    if (meta) {
      const metaInfo = JSON.parse(meta);
      const presentMetaForIdentifier = metaInfo.find((m) => m.treeId === `${identifier}+${m.type}`);
      if (presentMetaForIdentifier) {
        throw new Error(
          `Present merkle tree meta information in the store for current identifier ${identifier}`
        );
      }
      const identityMetaInfo = metaInfo.filter((m) => m.identifier === identifier);
      if (identityMetaInfo.length > 0) {
        return identityMetaInfo;
      }
      const treesMeta2 = createMerkleTreeMetaInfo(identifier);
      localStorage.setItem(
        _MerkleTreeLocalStorage.storageKeyMeta,
        JSON.stringify([...metaInfo, ...treesMeta2])
      );
      return [...metaInfo, ...treesMeta2];
    }
    const treesMeta = createMerkleTreeMetaInfo(identifier);
    localStorage.setItem(_MerkleTreeLocalStorage.storageKeyMeta, JSON.stringify(treesMeta));
    return treesMeta;
  }
  /**
   *
   * getIdentityMerkleTreesInfo from the local storage
   * @param {string} identifier
   * @returns `{Promise<IdentityMerkleTreeMetaInformation[]>}`
   */
  async getIdentityMerkleTreesInfo(identifier) {
    const meta = localStorage.getItem(_MerkleTreeLocalStorage.storageKeyMeta);
    if (meta) {
      const metaInfo = JSON.parse(meta);
      return metaInfo.filter((m) => m.identifier === identifier);
    }
    throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
  }
  /** get merkle tree from the local storage */
  async getMerkleTreeByIdentifierAndType(identifier, mtType) {
    const resultMeta = this.getMeta(identifier, mtType);
    return new import_js_merkletree26.Merkletree(new import_js_merkletree26.LocalStorageDB((0, import_js_merkletree26.str2Bytes)(resultMeta.treeId)), true, this._mtDepth);
  }
  getMeta(identifier, mtType) {
    const meta = localStorage.getItem(_MerkleTreeLocalStorage.storageKeyMeta);
    const err = new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
    if (!meta) {
      throw err;
    }
    const metaInfo = JSON.parse(meta);
    const resultMeta = metaInfo.filter((m) => m.identifier === identifier && m.type === mtType)[0];
    if (!resultMeta) {
      throw err;
    }
    return resultMeta;
  }
  /** adds to merkle tree in the local storage */
  async addToMerkleTree(identifier, mtType, hindex, hvalue) {
    const resultMeta = this.getMeta(identifier, mtType);
    const tree = new import_js_merkletree26.Merkletree(
      new import_js_merkletree26.LocalStorageDB((0, import_js_merkletree26.str2Bytes)(resultMeta.treeId)),
      true,
      this._mtDepth
    );
    await tree.add(hindex, hvalue);
  }
  /** binds merkle tree in the local storage to the new identifiers */
  async bindMerkleTreeToNewIdentifier(oldIdentifier, newIdentifier) {
    const meta = localStorage.getItem(_MerkleTreeLocalStorage.storageKeyMeta);
    if (!meta) {
      throw new Error(`Merkle tree meta not found for identifier ${oldIdentifier}`);
    }
    const metaInfo = JSON.parse(meta);
    const treesMeta = metaInfo.filter((m) => m.identifier === oldIdentifier).map((m) => ({ ...m, identifier: newIdentifier }));
    if (treesMeta.length === 0) {
      throw new Error(`Merkle tree meta not found for identifier ${oldIdentifier}`);
    }
    const newMetaInfo = [...metaInfo.filter((m) => m.identifier !== oldIdentifier), ...treesMeta];
    localStorage.setItem(_MerkleTreeLocalStorage.storageKeyMeta, JSON.stringify(newMetaInfo));
  }
};

// src/storage/indexed-db/data-source.ts
var import_idb_keyval2 = require("idb-keyval");
var IndexedDBDataSource = class {
  constructor(_storageKey) {
    this._storageKey = _storageKey;
    this._store = (0, import_idb_keyval2.createStore)(`${_storageKey}-db`, _storageKey);
  }
  /**
   * Creates an instance of IndexedDBDataSource.
   *
   * @param {string} _storageKey - key string to put storage name
   */
  _store;
  /**
   * Saves value to the indexed db storage
   *
   * @param {string} key - key value
   * @param {Type} value - value to store
   * @param {string} [keyName='id'] -  key name
   */
  async save(key, value, keyName = "id") {
    return (0, import_idb_keyval2.set)(key, value, this._store);
  }
  /**
   * Gets value from the indexed db storage by given key
   *
   * @param {string} key - key value
   * @param {string}  [keyName='id'] -  key name
   */
  async get(key, keyName = "id") {
    return (0, import_idb_keyval2.get)(key, this._store);
  }
  /**
   * loads all from the indexed db storage
   */
  async load() {
    return (0, import_idb_keyval2.values)(this._store);
  }
  /**
   * deletes item from the indexed db storage
   * @param {string} key - key value
   * @param {string}  [keyName='id'] -  key name
   */
  async delete(key, keyName = "id") {
    return (0, import_idb_keyval2.del)(key, this._store);
  }
};

// src/storage/indexed-db/merkletree.ts
var import_idb_keyval3 = require("idb-keyval");
var import_js_merkletree27 = require("@iden3/js-merkletree");
var uuid13 = __toESM(require("uuid"), 1);
var MerkleTreeIndexedDBStorage = class _MerkleTreeIndexedDBStorage {
  /**
   * Creates an instance of MerkleTreeIndexedDBStorage.
   * @param {number} _mtDepth
   */
  constructor(_mtDepth) {
    this._mtDepth = _mtDepth;
    this._merkleTreeMetaStore = (0, import_idb_keyval3.createStore)(
      `${_MerkleTreeIndexedDBStorage.storageKeyMeta}-db`,
      _MerkleTreeIndexedDBStorage.storageKeyMeta
    );
    this._bindingStore = (0, import_idb_keyval3.createStore)(
      `${_MerkleTreeIndexedDBStorage.storageBindingKeyMeta}-db`,
      _MerkleTreeIndexedDBStorage.storageBindingKeyMeta
    );
  }
  /**
   * key for the storage key metadata
   *
   * @static
   */
  static storageKeyMeta = "merkle-tree-meta";
  static storageBindingKeyMeta = "binding-did";
  _merkleTreeMetaStore;
  _bindingStore;
  /** creates a tree in the indexed db storage */
  async createIdentityMerkleTrees(identifier) {
    if (!identifier) {
      identifier = `${uuid13.v4()}`;
    }
    const existingBinging = await (0, import_idb_keyval3.get)(identifier, this._bindingStore);
    if (existingBinging) {
      throw new Error(
        `Present merkle tree meta information in the store for current identifier ${identifier}`
      );
    }
    const treesMeta = createMerkleTreeMetaInfo(identifier);
    await (0, import_idb_keyval3.set)(identifier, treesMeta, this._merkleTreeMetaStore);
    return treesMeta;
  }
  /**
   *
   * getIdentityMerkleTreesInfo from the indexed db storage
   * @param {string} identifier
   * @returns `{Promise<IdentityMerkleTreeMetaInformation[]>}`
   */
  async getIdentityMerkleTreesInfo(identifier) {
    const meta = await (0, import_idb_keyval3.get)(identifier, this._merkleTreeMetaStore);
    if (meta) {
      return meta;
    }
    throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
  }
  /** get merkle tree from the indexed db storage */
  async getMerkleTreeByIdentifierAndType(identifier, mtType) {
    const meta = await (0, import_idb_keyval3.get)(identifier, this._merkleTreeMetaStore);
    const err = new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
    if (!meta) {
      throw err;
    }
    const resultMeta = meta.find(
      (m) => m.identifier === identifier && m.type === mtType
    );
    if (!resultMeta) {
      throw err;
    }
    return new import_js_merkletree27.Merkletree(new import_js_merkletree27.IndexedDBStorage((0, import_js_merkletree27.str2Bytes)(resultMeta.treeId)), true, this._mtDepth);
  }
  /** adds to merkle tree in the indexed db storage */
  async addToMerkleTree(identifier, mtType, hindex, hvalue) {
    const meta = await (0, import_idb_keyval3.get)(identifier, this._merkleTreeMetaStore);
    if (!meta) {
      throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
    }
    const resultMeta = meta.find(
      (m) => m.identifier === identifier && m.type === mtType
    );
    if (!resultMeta) {
      throw new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
    }
    const tree = new import_js_merkletree27.Merkletree(
      new import_js_merkletree27.IndexedDBStorage((0, import_js_merkletree27.str2Bytes)(resultMeta.treeId)),
      true,
      this._mtDepth
    );
    await tree.add(hindex, hvalue);
  }
  /** binds merkle tree in the indexed db storage to the new identifiers */
  async bindMerkleTreeToNewIdentifier(oldIdentifier, newIdentifier) {
    const meta = await (0, import_idb_keyval3.get)(oldIdentifier, this._merkleTreeMetaStore);
    if (!meta || !meta?.length) {
      throw new Error(`Merkle tree meta not found for identifier ${oldIdentifier}`);
    }
    const treesMeta = meta.map((m) => ({
      ...m,
      identifier: newIdentifier
    }));
    await (0, import_idb_keyval3.del)(oldIdentifier, this._merkleTreeMetaStore);
    await (0, import_idb_keyval3.set)(newIdentifier, treesMeta, this._merkleTreeMetaStore);
    await (0, import_idb_keyval3.set)(oldIdentifier, newIdentifier, this._bindingStore);
  }
};

// src/storage/shared/circuit-storage.ts
var CircuitStorage = class {
  /**
   * Creates an instance of CircuitStorage.
   * @param {IDataSource<CircuitData>} _dataSource - data source to store circuit keys
   */
  constructor(_dataSource) {
    this._dataSource = _dataSource;
  }
  /**
   * storage key for circuits
   */
  static storageKey = "circuits";
  /**
   * loads circuit data by id
   * {@inheritdoc  ICircuitStorage.loadCircuitData}
   * @param {CircuitId} circuitId - id of the circuit
   * @returns `Promise<CircuitData>`
   */
  async loadCircuitData(circuitId) {
    const circuitData = await this._dataSource.get(circuitId.toString(), "circuitId");
    if (!circuitData) {
      throw new Error(`${"item not found" /* ItemNotFound */}: ${circuitId}`);
    }
    return circuitData;
  }
  /**
   * {@inheritdoc  ICircuitStorage.loadCircuitData}
   * saves circuit data for circuit id
   * @param {CircuitId} circuitId - id of the circuit
   * @param {CircuitData} circuitData - circuit keys
   * @returns `Promise<void>`
   */
  async saveCircuitData(circuitId, circuitData) {
    await this._dataSource.save(circuitId.toString(), circuitData, "circuitId");
  }
};

// src/storage/shared/credential-storage.ts
var CredentialStorage = class {
  /**
   * Creates an instance of CredentialStorage.
   * @param {IDataSource<W3CCredential>} _dataSource - W3CCredential credential KV data source
   */
  constructor(_dataSource) {
    this._dataSource = _dataSource;
  }
  /**
   * key for storage
   *
   * @static
   */
  static storageKey = "credentials";
  /** {@inheritdoc ICredentialStorage.listCredentials } */
  async listCredentials() {
    const creds = await this._dataSource.load();
    return creds.filter((i) => i !== void 0).map((cred) => cred && W3CCredential.fromJSON(cred));
  }
  /** @inheritdoc */
  async saveCredential(credential) {
    return this._dataSource.save(credential.id, credential.toJSON());
  }
  /** {@inheritdoc ICredentialStorage.listCredentials } */
  async saveAllCredentials(credentials) {
    for (const credential of credentials) {
      await this.saveCredential(credential);
    }
  }
  /** {@inheritdoc ICredentialStorage.listCredentials } */
  async removeCredential(id) {
    return this._dataSource.delete(id);
  }
  /** {@inheritdoc ICredentialStorage.listCredentials } */
  async findCredentialById(id) {
    const cred = await this._dataSource.get(id);
    return cred && W3CCredential.fromJSON(cred);
  }
  /** {@inheritdoc ICredentialStorage.listCredentials }
   * uses JSON query
   */
  async findCredentialsByQuery(query) {
    const filters = StandardJSONCredentialsQueryFilter(query);
    const creds = (await this._dataSource.load()).filter(
      (credential) => filters.every((filter) => filter.execute(credential))
    );
    const mappedCreds = creds.filter((i) => i !== void 0).map((cred) => W3CCredential.fromJSON(cred));
    return mappedCreds;
  }
};

// src/storage/shared/identity-storage.ts
var IdentityStorage = class {
  /**
   * Creates an instance of IdentityStorage.
   * @param {IDataSource<Identity>} _identityDataSource - data source for identities
   * @param {IDataSource<Profile>} _profileDataSource - data source for profiles
   */
  constructor(_identityDataSource, _profileDataSource) {
    this._identityDataSource = _identityDataSource;
    this._profileDataSource = _profileDataSource;
  }
  /**
   * storage key for identities
   *
   * @static
   */
  static identitiesStorageKey = "identities";
  /**
   * storage key for profiles
   *
   * @static
   */
  static profilesStorageKey = "profiles";
  async saveProfile(profile) {
    const profiles = await this._profileDataSource.load();
    const identityProfiles = profiles.filter(
      (p) => p.genesisIdentifier === profile.genesisIdentifier
    );
    const toSave = identityProfiles.length ? [...identityProfiles, profile] : [profile];
    for (let index = 0; index < toSave.length; index++) {
      const element = toSave[index];
      await this._profileDataSource.save(element.id, element);
    }
  }
  /**
   *  @deprecated The method should not be used. It returns only one profile per verifier, which can potentially restrict business use cases
   *   Use getProfilesByVerifier instead.
   */
  async getProfileByVerifier(verifier) {
    return this._profileDataSource.get(verifier, "verifier");
  }
  async getProfilesByVerifier(verifier, tags) {
    return (await this._profileDataSource.load()).filter(
      (p) => p.verifier === verifier && (!tags || tags.every((tag) => p.tags?.includes(tag)))
    );
  }
  async getProfileById(profileId) {
    return this._profileDataSource.get(profileId);
  }
  async getProfilesByGenesisIdentifier(genesisIdentifier) {
    return (await this._profileDataSource.load()).filter(
      (p) => p.genesisIdentifier === genesisIdentifier
    );
  }
  async getAllIdentities() {
    return this._identityDataSource.load();
  }
  async saveIdentity(identity) {
    return this._identityDataSource.save(identity.did, identity, "did");
  }
  async getIdentity(identifier) {
    return this._identityDataSource.get(identifier, "did");
  }
};

// src/storage/fs/circuits-storage.ts
var FSCircuitStorage = class {
  /**
   * Creates an instance of FSCircuitStorage.
   * @param {string} opts - options to read / save files
   */
  constructor(opts) {
    this.opts = opts;
    this._verificationKeyPath = this.opts.verificationFileName ?? this._verificationKeyPath;
    this._provingKeyPath = this.opts.provingFileName ?? this._provingKeyPath;
    this._wasmFilePath = this.opts.wasmFileName ?? this._wasmFilePath;
  }
  _verificationKeyPath = "verification_key.json";
  _provingKeyPath = "circuit_final.zkey";
  _wasmFilePath = "circuit.wasm";
  _fs = null;
  _browserNotSupportedError = new Error(
    "File system operations are not supported in browser environment"
  );
  async getFs() {
    if (this._fs) {
      return this._fs;
    }
    if (!process.env.BUILD_BROWSER) {
      this._fs = await import("fs");
    } else {
      this._fs = {
        existsSync: () => {
          throw this._browserNotSupportedError;
        },
        readFileSync: () => {
          throw this._browserNotSupportedError;
        },
        writeFileSync: () => {
          throw this._browserNotSupportedError;
        },
        mkdirSync: () => {
          throw this._browserNotSupportedError;
        }
      };
    }
    return this._fs;
  }
  /**
   * loads circuit data by id from file storage
   * {@inheritdoc  ICircuitStorage.loadCircuitData}
   * @param {CircuitId} circuitId - id of the circuit
   * @returns `Promise<CircuitData>`
   */
  async loadCircuitData(circuitId, opts) {
    const mode = opts?.mode ?? "full" /* Full */;
    const load = {
      wasm: mode === "proving" /* Proving */ || mode === "full" /* Full */ ? this.loadCircuitFile(circuitId, this._wasmFilePath) : Promise.resolve(null),
      provingKey: mode === "proving" /* Proving */ || mode === "full" /* Full */ ? this.loadCircuitFile(circuitId, this._provingKeyPath) : Promise.resolve(null),
      verificationKey: mode === "verification" /* Verification */ || mode === "full" /* Full */ ? this.loadCircuitFile(circuitId, this._verificationKeyPath) : Promise.resolve(null)
    };
    const [wasm, provingKey, verificationKey] = await Promise.all([
      load.wasm,
      load.provingKey,
      load.verificationKey
    ]);
    return {
      circuitId,
      wasm,
      provingKey,
      verificationKey
    };
  }
  async loadCircuitFile(circuitId, filename) {
    const keyPath2 = `${this.opts.dirname}/${circuitId}/${filename}`;
    const fs = await this.getFs();
    if (fs.existsSync(keyPath2)) {
      const keyData = fs.readFileSync(keyPath2);
      return new Uint8Array(keyData);
    }
    return null;
  }
  async writeCircuitFile(circuitId, filename, file, encoding) {
    const dirPath = `${this.opts.dirname}/${circuitId}`;
    const keyPath2 = `${dirPath}/${filename}`;
    const fs = await this.getFs();
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(keyPath2, file, encoding);
  }
  /**
   * {@inheritdoc  ICircuitStorage.loadCircuitData}
   * saves circuit data for circuit id to the file storage
   * @param {CircuitId} circuitId - id of the circuit
   * @param {CircuitData} circuitData - circuit keys
   * @returns `Promise<void>`
   */
  async saveCircuitData(circuitId, circuitData) {
    if (circuitData.verificationKey) {
      await this.writeCircuitFile(
        circuitId,
        this._verificationKeyPath,
        circuitData.verificationKey,
        "utf-8"
      );
    }
    if (circuitData.provingKey) {
      await this.writeCircuitFile(circuitId, this._provingKeyPath, circuitData.provingKey);
    }
    if (circuitData.wasm) {
      await this.writeCircuitFile(circuitId, this._wasmFilePath, circuitData.wasm);
    }
  }
};

// src/proof/proof-service.ts
var import_js_iden3_core42 = require("@iden3/js-iden3-core");

// src/proof/common.ts
var import_js_merkletree28 = require("@iden3/js-merkletree");
var import_js_jsonld_merklization6 = require("@iden3/js-jsonld-merklization");
var import_js_crypto10 = require("@iden3/js-crypto");
var toClaimNonRevStatus = (s) => {
  if (!s) {
    const hash = import_js_crypto10.poseidon.hash(new Array(3).fill(0n));
    return {
      proof: new import_js_merkletree28.Proof(),
      treeState: {
        state: import_js_merkletree28.Hash.fromBigInt(hash),
        claimsRoot: import_js_merkletree28.ZERO_HASH,
        revocationRoot: import_js_merkletree28.ZERO_HASH,
        rootOfRoots: import_js_merkletree28.ZERO_HASH
      }
    };
  }
  return {
    proof: s.mtp,
    treeState: buildTreeState(
      s.issuer.state,
      s.issuer.claimsTreeRoot,
      s.issuer.revocationTreeRoot,
      s.issuer.rootOfRoots
    )
  };
};
var toGISTProof = (smtProof) => {
  let existence = false;
  let nodeAux;
  if (smtProof.existence) {
    existence = true;
  } else {
    if (smtProof.auxExistence) {
      nodeAux = {
        key: import_js_merkletree28.Hash.fromBigInt(smtProof.auxIndex),
        value: import_js_merkletree28.Hash.fromBigInt(smtProof.auxValue)
      };
    }
  }
  const allSiblings = smtProof.siblings.map((s) => import_js_merkletree28.Hash.fromBigInt(s));
  const proof = new import_js_merkletree28.Proof({ siblings: allSiblings, nodeAux, existence });
  const root = import_js_merkletree28.Hash.fromBigInt(smtProof.root);
  return {
    root,
    proof
  };
};
var parseCredentialSubject = (credentialSubject) => {
  if (!credentialSubject) {
    return [{ operator: QueryOperators.$noop, fieldName: "" }];
  }
  const queries = [];
  const entries2 = Object.entries(credentialSubject);
  if (!entries2.length) {
    throw new Error(`query must have at least 1 predicate`);
  }
  for (const [fieldName, fieldReq] of entries2) {
    const fieldReqEntries = Object.entries(fieldReq);
    const isSelectiveDisclosure = fieldReqEntries.length === 0;
    if (isSelectiveDisclosure) {
      queries.push({ operator: QueryOperators.$sd, fieldName });
      continue;
    }
    for (const [operatorName, operatorValue] of fieldReqEntries) {
      if (!QueryOperators[operatorName]) {
        throw new Error(`operator is not supported by lib`);
      }
      const operator = QueryOperators[operatorName];
      queries.push({ operator, fieldName, operatorValue });
    }
  }
  return queries;
};
var parseQueryMetadata = async (propertyQuery, ldContextJSON, credentialType, options) => {
  const query = {
    ...propertyQuery,
    slotIndex: 0,
    merklizedSchema: false,
    datatype: "",
    claimPathKey: BigInt(0),
    values: [],
    path: new import_js_jsonld_merklization6.Path()
  };
  if (!propertyQuery.fieldName && propertyQuery.operator !== 0 /* NOOP */) {
    throw new Error("query must have a field name if operator is not $noop");
  }
  if (propertyQuery.fieldName) {
    query.datatype = await import_js_jsonld_merklization6.Path.newTypeFromContext(
      ldContextJSON,
      `${credentialType}.${propertyQuery.fieldName}`,
      options
    );
  }
  const serAttr = await getSerializationAttrFromContext(
    JSON.parse(ldContextJSON),
    options,
    credentialType
  );
  if (!serAttr) {
    query.merklizedSchema = true;
  }
  if (!query.merklizedSchema) {
    query.slotIndex = await getFieldSlotIndex(
      propertyQuery.fieldName,
      credentialType,
      byteEncoder.encode(ldContextJSON)
    );
  } else if (!options.legacyNoopOperator && query.operator === 0 /* NOOP */) {
    query.claimPathKey = BigInt(0);
    query.path = new import_js_jsonld_merklization6.Path();
  } else {
    try {
      const path = await buildFieldPath(
        ldContextJSON,
        credentialType,
        propertyQuery.fieldName,
        options
      );
      query.claimPathKey = await path.mtEntry();
      query.path = path;
    } catch (e) {
      throw new Error(`field does not exist in the schema ${e.message}`);
    }
  }
  if (propertyQuery.operatorValue !== void 0) {
    if (!isValidOperation(query.datatype, propertyQuery.operator)) {
      throw new Error(
        `operator ${propertyQuery.operator} is not supported for datatype ${query.datatype}`
      );
    }
    if ((propertyQuery.operator === 0 /* NOOP */ || propertyQuery.operator === 16 /* SD */) && propertyQuery.operatorValue) {
      throw new Error(`operator value should be undefined for ${propertyQuery.operator} operator`);
    }
    let values2;
    switch (propertyQuery.operator) {
      case 0 /* NOOP */:
      case 16 /* SD */:
        values2 = [];
        break;
      case 11 /* EXISTS */:
        values2 = transformExistsValue(propertyQuery.operatorValue);
        break;
      default:
        values2 = await transformQueryValueToBigInts(propertyQuery.operatorValue, query.datatype);
    }
    query.values = values2;
  }
  return query;
};
var parseQueriesMetadata = async (credentialType, ldContextJSON, credentialSubject, options) => {
  const queriesMetadata = parseCredentialSubject(credentialSubject);
  return Promise.all(
    queriesMetadata.map((m) => parseQueryMetadata(m, ldContextJSON, credentialType, options))
  );
};
var transformQueryValueToBigInts = async (value, ldType) => {
  const values2 = [];
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index++) {
      values2[index] = await import_js_jsonld_merklization6.Merklizer.hashValue(ldType, value[index]);
    }
  } else {
    values2[0] = await import_js_jsonld_merklization6.Merklizer.hashValue(ldType, value);
  }
  return values2;
};
var transformExistsValue = (value) => {
  if (typeof value == "boolean") {
    return [BigInt(value)];
  }
  throw new Error("exists operator value must be true or false");
};
var isAuthCircuit = (circuitId) => {
  return ["authV2" /* AuthV2 */, "authV3" /* AuthV3 */, "authV3-8-32" /* AuthV3_8_32 */].includes(circuitId);
};

// src/proof/provers/prover.ts
var import_js_jwz5 = require("@iden3/js-jwz");

// src/proof/provers/witness_calculator.ts
async function witnessBuilder(code, options) {
  options = options || {};
  let wasmModule;
  try {
    wasmModule = await WebAssembly.compile(code);
  } catch (err) {
    throw new Error(err);
  }
  let errStr = "";
  let msgStr = "";
  const instance = await WebAssembly.instantiate(wasmModule, {
    runtime: {
      exceptionHandler: function(code2) {
        let err;
        if (code2 == 1) {
          err = "Signal not found.\n";
        } else if (code2 == 2) {
          err = "Too many signals set.\n";
        } else if (code2 == 3) {
          err = "Signal already set.\n";
        } else if (code2 == 4) {
          err = "Assert Failed.\n";
        } else if (code2 == 5) {
          err = "Not enough memory.\n";
        } else if (code2 == 6) {
          err = "Input signal array access exceeds the size.\n";
        } else {
          err = "Unknown error.\n";
        }
        throw new Error(err + errStr);
      },
      printErrorMessage: function() {
        errStr += getMessage() + "\n";
      },
      writeBufferMessage: function() {
        const msg = getMessage();
        if (msg === "\n") {
          msgStr = "";
        } else {
          if (msgStr !== "") {
            msgStr += " ";
          }
          msgStr += msg;
        }
      },
      showSharedRWMemory: function() {
        printSharedRWMemory();
      }
    }
  });
  const sanityCheck = options;
  const wc = new WitnessCalculator(instance, sanityCheck);
  return wc;
  function getMessage() {
    let message = "";
    let c = instance.exports.getMessageChar();
    while (c != 0) {
      message += String.fromCharCode(c);
      c = instance.exports.getMessageChar();
    }
    return message;
  }
  function printSharedRWMemory() {
    const shared_rw_memory_size = instance.exports.getFieldNumLen32();
    const arr = new Uint32Array(shared_rw_memory_size);
    for (let j = 0; j < shared_rw_memory_size; j++) {
      arr[shared_rw_memory_size - 1 - j] = instance.exports.readSharedRWMemory(j);
    }
    if (msgStr !== "") {
      msgStr += " ";
    }
    msgStr += fromArray32(arr).toString();
  }
}
var WitnessCalculator = class {
  constructor(instance, sanityCheck) {
    this.instance = instance;
    this.instance = instance;
    this.version = this.instance.exports.getVersion();
    this.n32 = this.instance.exports.getFieldNumLen32();
    this.instance.exports.getRawPrime();
    const arr = new Uint32Array(this.n32);
    for (let i = 0; i < this.n32; i++) {
      arr[this.n32 - 1 - i] = this.instance.exports.readSharedRWMemory(i);
    }
    this.prime = fromArray32(arr);
    this.witnessSize = this.instance.exports.getWitnessSize();
    this.sanityCheck = sanityCheck;
  }
  version;
  n32;
  prime;
  witnessSize;
  sanityCheck;
  circom_version() {
    return this.instance.exports.getVersion();
  }
  async _doCalculateWitness(input, sanityCheck) {
    this.instance.exports.init(this.sanityCheck || sanityCheck ? 1 : 0);
    const keys = Object.keys(input);
    let input_counter = 0;
    keys.forEach((k) => {
      const h = fnvHash(k);
      const hMSB = parseInt(h.slice(0, 8), 16);
      const hLSB = parseInt(h.slice(8, 16), 16);
      const fArr = flatArray(input[k]);
      const signalSize = this.instance.exports.getInputSignalSize(hMSB, hLSB);
      if (signalSize < 0) {
        throw new Error(`Signal ${k} not found
`);
      }
      if (fArr.length < signalSize) {
        throw new Error(`Not enough values for input signal ${k}
`);
      }
      if (fArr.length > signalSize) {
        throw new Error(`Too many values for input signal ${k}
`);
      }
      for (let i = 0; i < fArr.length; i++) {
        const arrFr = toArray32(BigInt(fArr[i]) % this.prime, this.n32);
        for (let j = 0; j < this.n32; j++) {
          this.instance.exports.writeSharedRWMemory(j, arrFr[this.n32 - 1 - j]);
        }
        try {
          this.instance.exports.setInputSignal(hMSB, hLSB, i);
          input_counter++;
        } catch (err) {
          throw new Error(err);
        }
      }
    });
    if (input_counter < this.instance.exports.getInputSize()) {
      throw new Error(
        `Not all inputs have been set. Only ${input_counter} out of ${this.instance.exports.getInputSize()}`
      );
    }
  }
  async calculateWitness(input, sanityCheck) {
    const w = [];
    await this._doCalculateWitness(input, sanityCheck);
    for (let i = 0; i < this.witnessSize; i++) {
      this.instance.exports.getWitness(i);
      const arr = new Uint32Array(this.n32);
      for (let j = 0; j < this.n32; j++) {
        arr[this.n32 - 1 - j] = this.instance.exports.readSharedRWMemory(j);
      }
      w.push(fromArray32(arr));
    }
    return w;
  }
  async calculateBinWitness(input, sanityCheck) {
    const buff32 = new Uint32Array(this.witnessSize * this.n32);
    const buff = new Uint8Array(buff32.buffer);
    await this._doCalculateWitness(input, sanityCheck);
    for (let i = 0; i < this.witnessSize; i++) {
      this.instance.exports.getWitness(i);
      const pos = i * this.n32;
      for (let j = 0; j < this.n32; j++) {
        buff32[pos + j] = this.instance.exports.readSharedRWMemory(j);
      }
    }
    return buff;
  }
  async calculateWTNSBin(input, sanityCheck) {
    const buff32 = new Uint32Array(this.witnessSize * this.n32 + this.n32 + 11);
    const buff = new Uint8Array(buff32.buffer);
    await this._doCalculateWitness(input, sanityCheck);
    buff[0] = "w".charCodeAt(0);
    buff[1] = "t".charCodeAt(0);
    buff[2] = "n".charCodeAt(0);
    buff[3] = "s".charCodeAt(0);
    buff32[1] = 2;
    buff32[2] = 2;
    buff32[3] = 1;
    const n8 = this.n32 * 4;
    const idSection1length = 8 + n8;
    const idSection1lengthHex = idSection1length.toString(16);
    buff32[4] = parseInt(idSection1lengthHex.slice(0, 8), 16);
    buff32[5] = parseInt(idSection1lengthHex.slice(8, 16), 16);
    buff32[6] = n8;
    this.instance.exports.getRawPrime();
    let pos = 7;
    for (let j = 0; j < this.n32; j++) {
      buff32[pos + j] = this.instance.exports.readSharedRWMemory(j);
    }
    pos += this.n32;
    buff32[pos] = this.witnessSize;
    pos++;
    buff32[pos] = 2;
    pos++;
    const idSection2length = n8 * this.witnessSize;
    const idSection2lengthHex = idSection2length.toString(16);
    buff32[pos] = parseInt(idSection2lengthHex.slice(0, 8), 16);
    buff32[pos + 1] = parseInt(idSection2lengthHex.slice(8, 16), 16);
    pos += 2;
    for (let i = 0; i < this.witnessSize; i++) {
      this.instance.exports.getWitness(i);
      for (let j = 0; j < this.n32; j++) {
        buff32[pos + j] = this.instance.exports.readSharedRWMemory(j);
      }
      pos += this.n32;
    }
    return buff;
  }
};
function toArray32(rem, size) {
  const res = [];
  const radix = BigInt(4294967296);
  while (rem) {
    res.unshift(Number(rem % radix));
    rem = rem / radix;
  }
  if (size) {
    let i = size - res.length;
    while (i > 0) {
      res.unshift(0);
      i--;
    }
  }
  return res;
}
function fromArray32(arr) {
  let res = BigInt(0);
  const radix = BigInt(4294967296);
  for (let i = 0; i < arr.length; i++) {
    res = res * radix + BigInt(arr[i]);
  }
  return res;
}
function flatArray(a) {
  const res = [];
  fillArray(res, a);
  return res;
  function fillArray(res2, a2) {
    if (Array.isArray(a2)) {
      for (let i = 0; i < a2.length; i++) {
        fillArray(res2, a2[i]);
      }
    } else {
      res2.push(a2);
    }
  }
}
function fnvHash(str) {
  const uint64_max = BigInt(2) ** BigInt(64);
  let hash = BigInt("0xCBF29CE484222325");
  for (let i = 0; i < str.length; i++) {
    hash ^= BigInt(str[i].charCodeAt());
    hash *= BigInt(1099511628211);
    hash %= uint64_max;
  }
  let hashHex = hash.toString(16);
  const n = 16 - hashHex.length;
  hashHex = "0".repeat(n).concat(hashHex);
  return hashHex;
}

// src/proof/provers/prover.ts
var snarkjs = __toESM(require("snarkjs"), 1);
var ffjavascript = __toESM(require("ffjavascript"), 1);
var NativeProver = class _NativeProver {
  constructor(_circuitStorage) {
    this._circuitStorage = _circuitStorage;
  }
  static curveName = "bn128";
  /**
   * verifies zero knowledge proof
   *
   * @param {ZKProof} zkp - zero knowledge proof that will be verified
   * @param {string} circuitId - circuit id for proof verification
   * @returns `Promise<ZKProof>`
   */
  async verify(zkp, circuitId) {
    try {
      const circuitData = await this._circuitStorage.loadCircuitData(circuitId, {
        mode: "verification" /* Verification */
      });
      if (!circuitData.verificationKey) {
        throw new Error(`verification file doesn't exist for circuit ${circuitId}`);
      }
      return (0, import_js_jwz5.verifyGroth16Proof)(zkp, JSON.parse(byteDecoder.decode(circuitData.verificationKey)));
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  /**
   * generates zero knowledge proof
   *
   * @param {Uint8Array} inputs - inputs that will be used for proof generation
   * @param {string} circuitId - circuit id for proof generation
   * @returns `Promise<ZKProof>`
   */
  async generate(inputs, circuitId) {
    const circuitData = await this._circuitStorage.loadCircuitData(circuitId, {
      mode: "proving" /* Proving */
    });
    if (!circuitData.wasm) {
      throw new Error(`wasm file doesn't exist for circuit ${circuitId}`);
    }
    const witnessCalculator = await witnessBuilder(circuitData.wasm.buffer);
    const parsedData = JSON.parse(byteDecoder.decode(inputs));
    const wtnsBytes = await witnessCalculator.calculateWTNSBin(parsedData, 0);
    if (!circuitData.provingKey) {
      throw new Error(`proving file doesn't exist for circuit ${circuitId}`);
    }
    const { proof, publicSignals } = await snarkjs.groth16.prove(circuitData.provingKey, wtnsBytes);
    await this.terminateCurve();
    return {
      proof,
      pub_signals: publicSignals
    };
  }
  async terminateCurve() {
    const curve = await ffjavascript.getCurveFromName(_NativeProver.curveName);
    curve.terminate();
  }
};

// src/proof/proof-service.ts
var import_js_jsonld_merklization9 = require("@iden3/js-jsonld-merklization");

// src/proof/provers/inputs-generator.ts
var import_js_iden3_core39 = require("@iden3/js-iden3-core");
var InputGenerator = class {
  constructor(_identityWallet, _credentialWallet, _stateStorage) {
    this._identityWallet = _identityWallet;
    this._credentialWallet = _credentialWallet;
    this._stateStorage = _stateStorage;
  }
  async generateInputs(ctx) {
    const { circuitId } = ctx.proofReq;
    const fnName = `${circuitId.replace(/-beta\.1/g, "").replace(/-/g, "_").replace(/authV[\w-]+/g, "auth")}PrepareInputs`;
    const queriesLength = ctx.circuitQueries.length;
    if (queriesLength > circuitValidator[circuitId].validation.maxQueriesCount) {
      throw new Error(
        `circuit ${circuitId} supports only ${circuitValidator[circuitId].validation.maxQueriesCount} queries`
      );
    }
    const fn = this[fnName];
    if (!fn) {
      throw new Error(`inputs generator for ${circuitId} not found`);
    }
    return fn(ctx);
  }
  async newCircuitClaimData(preparedCredential) {
    const smtProof = preparedCredential.credential.getIden3SparseMerkleTreeProof();
    const circuitClaim = new CircuitClaim();
    circuitClaim.claim = preparedCredential.credentialCoreClaim;
    circuitClaim.issuerId = import_js_iden3_core39.DID.idFromDID(import_js_iden3_core39.DID.parse(preparedCredential.credential.issuer));
    if (smtProof) {
      circuitClaim.proof = smtProof.mtp;
      circuitClaim.treeState = {
        state: smtProof.issuerData.state.value,
        claimsRoot: smtProof.issuerData.state.claimsTreeRoot,
        revocationRoot: smtProof.issuerData.state.revocationTreeRoot,
        rootOfRoots: smtProof.issuerData.state.rootOfRoots
      };
    }
    const sigProof = preparedCredential.credential.getBJJSignature2021Proof();
    if (sigProof) {
      const issuerDID = sigProof.issuerData.id;
      const userDID = getUserDIDFromCredential(issuerDID, preparedCredential.credential);
      const { credentialStatus, mtp, authCoreClaim } = sigProof.issuerData;
      if (!credentialStatus) {
        throw new Error(
          "can't check the validity of issuer auth claim: no credential status in proof"
        );
      }
      if (!mtp) {
        throw new Error("issuer auth credential must have a mtp proof");
      }
      if (!authCoreClaim) {
        throw new Error("issuer auth credential must have a core claim proof");
      }
      const opts = {
        issuerGenesisState: sigProof.issuerData.state,
        issuerDID,
        userDID
      };
      const rs = await this._credentialWallet.getRevocationStatus(credentialStatus, opts);
      const issuerAuthNonRevProof = toClaimNonRevStatus(rs);
      circuitClaim.signatureProof = {
        signature: sigProof.signature,
        issuerAuthIncProof: {
          proof: sigProof.issuerData.mtp,
          treeState: {
            state: sigProof.issuerData.state.value,
            claimsRoot: sigProof.issuerData.state.claimsTreeRoot,
            revocationRoot: sigProof.issuerData.state.revocationTreeRoot,
            rootOfRoots: sigProof.issuerData.state.rootOfRoots
          }
        },
        issuerAuthClaim: sigProof.issuerData.authCoreClaim,
        issuerAuthNonRevProof
      };
    }
    return circuitClaim;
  }
  async prepareAuthBJJCredential(did, treeStateInfo) {
    const { authCredential, incProof, nonRevProof } = await this._identityWallet.getActualAuthCredential(did, treeStateInfo);
    const authCoreClaim = authCredential.getCoreClaimFromProof(
      "Iden3SparseMerkleTreeProof" /* Iden3SparseMerkleTreeProof */
    );
    if (!authCoreClaim) {
      throw new Error("auth core claim is not defined for auth bjj credential");
    }
    return {
      credential: authCredential,
      incProof,
      nonRevProof,
      coreClaim: authCoreClaim
    };
  }
  credentialAtomicQueryMTPV2PrepareInputs = async ({
    preparedCredential,
    identifier,
    proofReq,
    params,
    circuitQueries
  }) => {
    const circuitClaimData = await this.newCircuitClaimData(preparedCredential);
    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);
    const circuitInputs = new AtomicQueryMTPV2Inputs();
    circuitInputs.id = import_js_iden3_core39.DID.idFromDID(identifier);
    circuitInputs.requestID = BigInt(proofReq.id);
    const query = circuitQueries[0];
    query.operator = this.transformV2QueryOperator(query.operator);
    circuitInputs.query = query;
    circuitInputs.claim = {
      issuerID: circuitClaimData.issuerId,
      claim: circuitClaimData.claim,
      incProof: { proof: circuitClaimData.proof, treeState: circuitClaimData.treeState },
      nonRevProof: circuitClaimData.nonRevProof
    };
    circuitInputs.currentTimeStamp = (0, import_js_iden3_core39.getUnixTimestamp)(/* @__PURE__ */ new Date());
    circuitInputs.claimSubjectProfileNonce = BigInt(params.credentialSubjectProfileNonce);
    circuitInputs.profileNonce = BigInt(params.authProfileNonce);
    circuitInputs.skipClaimRevocationCheck = params.skipRevocation;
    this.checkOperatorSupport(proofReq.circuitId, query.operator);
    return {
      inputs: circuitInputs.inputsMarshal(),
      metadata: { targetCircuitId: proofReq.circuitId }
    };
  };
  authPrepareInputs = async ({
    identifier,
    proofReq,
    params
  }) => {
    const { nonce: authProfileNonce, genesisDID } = await this._identityWallet.getGenesisDIDMetadata(identifier);
    let challenge = params.challenge ?? proofReq.params?.challenge;
    if (!challenge) {
      throw new Error("challenge must be provided for auth circuit");
    }
    challenge = BigInt(challenge);
    const authPrepared = await this.prepareAuthBJJCredential(genesisDID);
    const signature = await this._identityWallet.signChallenge(challenge, authPrepared.credential);
    const id = import_js_iden3_core39.DID.idFromDID(genesisDID);
    const stateProof = await this._stateStorage.getGISTProof(id.bigInt());
    const gistProof = toGISTProof(stateProof);
    const authInputs = new AuthV3Inputs();
    if (proofReq.circuitId === "authV3-8-32" /* AuthV3_8_32 */) {
      authInputs.mtLevel = 8;
      authInputs.mtLevelOnChain = 32;
    }
    authInputs.genesisID = id;
    authInputs.profileNonce = BigInt(authProfileNonce);
    authInputs.authClaim = authPrepared.coreClaim;
    authInputs.authClaimIncMtp = authPrepared.incProof.proof;
    authInputs.authClaimNonRevMtp = authPrepared.nonRevProof.proof;
    authInputs.treeState = authPrepared.incProof.treeState;
    authInputs.signature = signature;
    authInputs.challenge = challenge;
    authInputs.gistProof = gistProof;
    return {
      inputs: authInputs.inputsMarshal()
    };
  };
  credentialAtomicQueryMTPV2OnChainPrepareInputs = async ({
    preparedCredential,
    identifier,
    proofReq,
    params,
    circuitQueries
  }) => {
    const circuitClaimData = await this.newCircuitClaimData(preparedCredential);
    const authInfo = await this.prepareAuthBJJCredential(identifier);
    const authClaimData = await this.newCircuitClaimData({
      credential: authInfo.credential,
      credentialCoreClaim: authInfo.coreClaim
    });
    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);
    const circuitInputs = new AtomicQueryMTPV2OnChainInputs();
    const id = import_js_iden3_core39.DID.idFromDID(identifier);
    circuitInputs.id = import_js_iden3_core39.DID.idFromDID(identifier);
    circuitInputs.requestID = BigInt(proofReq.id);
    const stateProof = await this._stateStorage.getGISTProof(id.bigInt());
    const gistProof = toGISTProof(stateProof);
    circuitInputs.gistProof = gistProof;
    if (authClaimData?.treeState) {
      circuitInputs.treeState = {
        state: authClaimData?.treeState?.state,
        claimsRoot: authClaimData?.treeState?.claimsRoot,
        revocationRoot: authClaimData?.treeState?.revocationRoot,
        rootOfRoots: authClaimData?.treeState?.rootOfRoots
      };
    }
    circuitInputs.authClaim = authClaimData.claim;
    circuitInputs.authClaimIncMtp = authClaimData.proof;
    circuitInputs.authClaimNonRevMtp = authInfo.nonRevProof.proof;
    if (!params.challenge) {
      throw new Error("challenge must be provided for onchain circuits");
    }
    const signature = await this._identityWallet.signChallenge(
      params.challenge,
      authInfo.credential
    );
    circuitInputs.signature = signature;
    circuitInputs.challenge = params.challenge;
    const query = circuitQueries[0];
    circuitInputs.query = query;
    circuitInputs.claim = {
      issuerID: circuitClaimData.issuerId,
      claim: circuitClaimData.claim,
      incProof: { proof: circuitClaimData.proof, treeState: circuitClaimData.treeState },
      nonRevProof: circuitClaimData.nonRevProof
    };
    circuitInputs.currentTimeStamp = (0, import_js_iden3_core39.getUnixTimestamp)(/* @__PURE__ */ new Date());
    circuitInputs.claimSubjectProfileNonce = BigInt(params.credentialSubjectProfileNonce);
    circuitInputs.profileNonce = BigInt(params.authProfileNonce);
    circuitInputs.skipClaimRevocationCheck = params.skipRevocation;
    this.checkOperatorSupport(proofReq.circuitId, query.operator);
    return { inputs: circuitInputs.inputsMarshal() };
  };
  credentialAtomicQuerySigV2PrepareInputs = async ({
    preparedCredential,
    identifier,
    proofReq,
    params,
    circuitQueries
  }) => {
    const circuitClaimData = await this.newCircuitClaimData(preparedCredential);
    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);
    const circuitInputs = new AtomicQuerySigV2Inputs();
    circuitInputs.id = import_js_iden3_core39.DID.idFromDID(identifier);
    circuitInputs.claim = {
      issuerID: circuitClaimData?.issuerId,
      signatureProof: circuitClaimData.signatureProof,
      claim: circuitClaimData.claim,
      nonRevProof: circuitClaimData.nonRevProof
    };
    circuitInputs.requestID = BigInt(proofReq.id);
    circuitInputs.claimSubjectProfileNonce = BigInt(params.credentialSubjectProfileNonce);
    circuitInputs.profileNonce = BigInt(params.authProfileNonce);
    circuitInputs.skipClaimRevocationCheck = params.skipRevocation;
    const query = circuitQueries[0];
    query.operator = this.transformV2QueryOperator(query.operator);
    circuitInputs.query = query;
    circuitInputs.currentTimeStamp = (0, import_js_iden3_core39.getUnixTimestamp)(/* @__PURE__ */ new Date());
    this.checkOperatorSupport(proofReq.circuitId, query.operator);
    return { inputs: circuitInputs.inputsMarshal() };
  };
  credentialAtomicQuerySigV2OnChainPrepareInputs = async ({
    preparedCredential,
    identifier,
    proofReq,
    params,
    circuitQueries
  }) => {
    const circuitClaimData = await this.newCircuitClaimData(preparedCredential);
    const authInfo = await this.prepareAuthBJJCredential(identifier);
    const authClaimData = await this.newCircuitClaimData({
      credential: authInfo.credential,
      credentialCoreClaim: authInfo.coreClaim
    });
    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);
    const circuitInputs = new AtomicQuerySigV2OnChainInputs();
    const id = import_js_iden3_core39.DID.idFromDID(identifier);
    circuitInputs.id = id;
    circuitInputs.claim = {
      issuerID: circuitClaimData.issuerId,
      signatureProof: circuitClaimData.signatureProof,
      claim: circuitClaimData.claim,
      nonRevProof: circuitClaimData.nonRevProof
    };
    circuitInputs.requestID = BigInt(proofReq.id);
    circuitInputs.claimSubjectProfileNonce = BigInt(params.credentialSubjectProfileNonce);
    circuitInputs.profileNonce = BigInt(params.authProfileNonce);
    circuitInputs.skipClaimRevocationCheck = params.skipRevocation;
    const query = circuitQueries[0];
    circuitInputs.query = query;
    circuitInputs.currentTimeStamp = (0, import_js_iden3_core39.getUnixTimestamp)(/* @__PURE__ */ new Date());
    if (authClaimData.treeState) {
      circuitInputs.treeState = {
        state: authClaimData.treeState?.state,
        claimsRoot: authClaimData.treeState?.claimsRoot,
        revocationRoot: authClaimData.treeState?.revocationRoot,
        rootOfRoots: authClaimData.treeState?.rootOfRoots
      };
    }
    const stateProof = await this._stateStorage.getGISTProof(id.bigInt());
    const gistProof = toGISTProof(stateProof);
    circuitInputs.gistProof = gistProof;
    circuitInputs.authClaim = authClaimData.claim;
    circuitInputs.authClaimIncMtp = authClaimData.proof;
    circuitInputs.authClaimNonRevMtp = authInfo.nonRevProof.proof;
    if (!params.challenge) {
      throw new Error("challenge must be provided for onchain circuits");
    }
    const signature = await this._identityWallet.signChallenge(
      params.challenge,
      authInfo.credential
    );
    circuitInputs.signature = signature;
    circuitInputs.challenge = params.challenge;
    this.checkOperatorSupport(proofReq.circuitId, query.operator);
    return { inputs: circuitInputs.inputsMarshal() };
  };
  credentialAtomicQueryV3PrepareInputs = async ({
    preparedCredential,
    identifier,
    proofReq,
    params,
    circuitQueries
  }) => {
    const circuitClaimData = await this.newCircuitClaimData(preparedCredential);
    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);
    const proofReqQuery = proofReq.query;
    if (!proofReqQuery) {
      throw new Error("proof request query is required for v3 circuits");
    }
    let proofType;
    switch (proofReqQuery.proofType) {
      case "BJJSignature2021" /* BJJSignature */:
        proofType = "BJJSignature2021" /* BJJSignature */;
        break;
      case "Iden3SparseMerkleTreeProof" /* Iden3SparseMerkleTreeProof */:
        proofType = "Iden3SparseMerkleTreeProof" /* Iden3SparseMerkleTreeProof */;
        break;
      default:
        if (circuitClaimData.proof) {
          proofType = "Iden3SparseMerkleTreeProof" /* Iden3SparseMerkleTreeProof */;
        } else if (circuitClaimData.signatureProof) {
          proofType = "BJJSignature2021" /* BJJSignature */;
        } else {
          throw Error("claim has no MTP or signature proof");
        }
        break;
    }
    const query = circuitQueries[0];
    const proofsToCheck = [
      { proof: circuitClaimData.nonRevProof.proof, levelKey: "mtLevel" },
      { proof: circuitClaimData.signatureProof?.issuerAuthIncProof.proof, levelKey: "mtLevel" },
      { proof: circuitClaimData.signatureProof?.issuerAuthNonRevProof.proof, levelKey: "mtLevel" },
      { proof: circuitClaimData.proof, levelKey: "mtLevel" },
      { proof: query.valueProof?.mtp, levelKey: "mtLevelClaim" }
    ];
    const targetCircuitInfo = selectV3TargetCircuit(proofReq.circuitId, proofsToCheck);
    const { mtLevel, mtLevelClaim, targetCircuitId } = targetCircuitInfo ?? {
      targetCircuitId: proofReq.circuitId
    };
    const circuitInputs = new AtomicQueryV3Inputs({ mtLevel, mtLevelClaim });
    circuitInputs.id = import_js_iden3_core39.DID.idFromDID(identifier);
    circuitInputs.claim = {
      issuerID: circuitClaimData?.issuerId,
      signatureProof: circuitClaimData.signatureProof,
      claim: circuitClaimData.claim,
      nonRevProof: circuitClaimData.nonRevProof,
      incProof: { proof: circuitClaimData.proof, treeState: circuitClaimData.treeState }
    };
    circuitInputs.requestID = BigInt(proofReq.id);
    circuitInputs.claimSubjectProfileNonce = BigInt(params.credentialSubjectProfileNonce);
    circuitInputs.profileNonce = BigInt(params.authProfileNonce);
    circuitInputs.skipClaimRevocationCheck = params.skipRevocation;
    query.values = [16 /* SD */, 0 /* NOOP */].includes(query.operator) ? [] : query.values;
    circuitInputs.query = query;
    circuitInputs.currentTimeStamp = (0, import_js_iden3_core39.getUnixTimestamp)(/* @__PURE__ */ new Date());
    circuitInputs.proofType = proofType;
    circuitInputs.linkNonce = params.linkNonce ?? 0n;
    circuitInputs.verifierID = params.verifierDid ? import_js_iden3_core39.DID.idFromDID(params.verifierDid) : void 0;
    circuitInputs.nullifierSessionID = proofReq.params?.nullifierSessionId ? BigInt(proofReq.params?.nullifierSessionId?.toString()) : 0n;
    this.checkOperatorSupport(proofReq.circuitId, query.operator);
    return {
      inputs: circuitInputs.inputsMarshal(),
      metadata: { targetCircuitId }
    };
  };
  credentialAtomicQueryV3OnChainPrepareInputs = async ({
    preparedCredential,
    identifier,
    proofReq,
    params,
    circuitQueries
  }) => {
    const id = import_js_iden3_core39.DID.idFromDID(identifier);
    const circuitClaimData = await this.newCircuitClaimData(preparedCredential);
    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);
    let proofType;
    const proofReqQuery = proofReq.query;
    if (!proofReqQuery) {
      throw new Error("proof request query is required for v3 onchain circuits");
    }
    switch (proofReqQuery.proofType) {
      case "BJJSignature2021" /* BJJSignature */:
        proofType = "BJJSignature2021" /* BJJSignature */;
        break;
      case "Iden3SparseMerkleTreeProof" /* Iden3SparseMerkleTreeProof */:
        proofType = "Iden3SparseMerkleTreeProof" /* Iden3SparseMerkleTreeProof */;
        break;
      default:
        if (circuitClaimData.proof) {
          proofType = "Iden3SparseMerkleTreeProof" /* Iden3SparseMerkleTreeProof */;
        } else if (circuitClaimData.signatureProof) {
          proofType = "BJJSignature2021" /* BJJSignature */;
        } else {
          throw Error("claim has no MTP or signature proof");
        }
        break;
    }
    const query = circuitQueries[0];
    const stateProof = await this._stateStorage.getGISTProof(id.bigInt());
    const gistProof = toGISTProof(stateProof);
    const mtLevelsProofs = [
      { proof: circuitClaimData.nonRevProof.proof, levelKey: "mtLevel" },
      { proof: circuitClaimData.signatureProof?.issuerAuthIncProof.proof, levelKey: "mtLevel" },
      {
        proof: circuitClaimData.signatureProof?.issuerAuthNonRevProof.proof,
        levelKey: "mtLevel"
      },
      { proof: circuitClaimData.proof, levelKey: "mtLevel" },
      { proof: query.valueProof?.mtp, levelKey: "mtLevelClaim" },
      { proof: gistProof.proof, levelKey: "mtLevelOnChain" }
    ];
    const { mtLevel, mtLevelClaim, mtLevelOnChain, targetCircuitId } = selectV3TargetCircuit(
      proofReq.circuitId,
      mtLevelsProofs,
      true
    ) ?? {
      targetCircuitId: proofReq.circuitId
    };
    const circuitInputs = new AtomicQueryV3OnChainInputs({ mtLevel, mtLevelClaim, mtLevelOnChain });
    circuitInputs.id = import_js_iden3_core39.DID.idFromDID(identifier);
    circuitInputs.claim = {
      issuerID: circuitClaimData?.issuerId,
      signatureProof: circuitClaimData.signatureProof,
      claim: circuitClaimData.claim,
      nonRevProof: circuitClaimData.nonRevProof,
      incProof: { proof: circuitClaimData.proof, treeState: circuitClaimData.treeState }
    };
    circuitInputs.requestID = BigInt(proofReq.id);
    circuitInputs.claimSubjectProfileNonce = BigInt(params.credentialSubjectProfileNonce);
    circuitInputs.profileNonce = BigInt(params.authProfileNonce);
    circuitInputs.skipClaimRevocationCheck = params.skipRevocation;
    query.values = [16 /* SD */, 0 /* NOOP */].includes(query.operator) ? [] : query.values;
    circuitInputs.query = query;
    circuitInputs.currentTimeStamp = (0, import_js_iden3_core39.getUnixTimestamp)(/* @__PURE__ */ new Date());
    circuitInputs.proofType = proofType;
    circuitInputs.linkNonce = params.linkNonce ?? 0n;
    circuitInputs.verifierID = params.verifierDid ? import_js_iden3_core39.DID.idFromDID(params.verifierDid) : void 0;
    circuitInputs.nullifierSessionID = proofReq.params?.nullifierSessionId ? BigInt(proofReq.params?.nullifierSessionId?.toString()) : 0n;
    const isEthIdentity = isEthereumIdentity(identifier);
    circuitInputs.isBJJAuthEnabled = isEthIdentity ? 0 : 1;
    const sender = proofReq.params?.sender;
    if (isEthIdentity && sender) {
      throw new Error(
        `the combination of "sender" and an Ethereum-based identity is not supported; when using an Ethereum identity as the prover, provide the challenge directly instead of a sender address''sender parameter is not supported for ethereum identities`
      );
    }
    const challenge = sender ? getChallengeFromEthAddress(sender) : BigInt(params.challenge ?? 0);
    circuitInputs.challenge = challenge;
    circuitInputs.gistProof = gistProof;
    if (circuitInputs.isBJJAuthEnabled === 1) {
      const authPrepared = await this.prepareAuthBJJCredential(identifier);
      const authClaimData = await this.newCircuitClaimData({
        credential: authPrepared.credential,
        credentialCoreClaim: authPrepared.coreClaim
      });
      const signature = await this._identityWallet.signChallenge(
        circuitInputs.challenge,
        authPrepared.credential
      );
      circuitInputs.authClaim = authClaimData.claim;
      circuitInputs.authClaimIncMtp = authClaimData.proof;
      circuitInputs.authClaimNonRevMtp = authPrepared.nonRevProof.proof;
      circuitInputs.treeState = authClaimData.treeState;
      circuitInputs.signature = signature;
    }
    this.checkOperatorSupport(proofReq.circuitId, query.operator);
    return { inputs: circuitInputs.inputsMarshal(), metadata: { targetCircuitId } };
  };
  linkedMultiQueryPrepareInputs = async ({
    preparedCredential,
    params,
    proofReq,
    circuitQueries
  }) => {
    const { circuitId } = proofReq;
    const resolveQueryCount = (circuitId2) => {
      if (circuitId2 === "linkedMultiQuery10-beta.1" /* LinkedMultiQuery10 */) {
        return { queryCount: 10, targetCircuitId: "linkedMultiQuery10-beta.1" /* LinkedMultiQuery10 */ };
      }
      if (circuitQueries.length <= 3) {
        return {
          queryCount: 3,
          targetCircuitId: "linkedMultiQuery" /* LinkedMultiQueryStable */ + "3"
        };
      }
      if (circuitQueries.length <= 5) {
        return {
          queryCount: 5,
          targetCircuitId: "linkedMultiQuery" /* LinkedMultiQueryStable */ + "5"
        };
      }
      return { queryCount: 10, targetCircuitId: "linkedMultiQuery" /* LinkedMultiQueryStable */ };
    };
    const { queryCount, targetCircuitId } = resolveQueryCount(circuitId);
    const circuitClaimData = await this.newCircuitClaimData(preparedCredential);
    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);
    const circuitInputs = new LinkedMultiQueryInputs(queryCount);
    circuitInputs.linkNonce = params.linkNonce ?? 0n;
    circuitInputs.claim = circuitClaimData.claim;
    circuitInputs.query = circuitQueries;
    circuitQueries.forEach((query) => {
      this.checkOperatorSupport(proofReq.circuitId, query.operator);
    });
    circuitQueries.forEach((query) => {
      query.values = [16 /* SD */, 0 /* NOOP */].includes(query.operator) ? [] : query.values;
    });
    return { inputs: circuitInputs.inputsMarshal(), metadata: { targetCircuitId } };
  };
  linkedMultiQuery10PrepareInputs = async (ctx) => this.linkedMultiQueryPrepareInputs(ctx);
  transformV2QueryOperator(operator) {
    return operator === 16 /* SD */ || operator === 0 /* NOOP */ ? 1 /* EQ */ : operator;
  }
  checkOperatorSupport(circuitId, operator) {
    const supportedOperators = circuitValidator[circuitId].validation.supportedOperations;
    if (!supportedOperators.includes(operator)) {
      throw new Error(
        `operator ${getOperatorNameByValue(operator)} is not supported by ${circuitId}`
      );
    }
  }
};
function selectV3TargetCircuit(circuitId, treesToCheck, isOnChain = false) {
  const subversions = circuitValidator[circuitId].subVersions;
  if (!subversions) {
    return void 0;
  }
  for (const subversion of subversions) {
    const { mtLevel, mtLevelClaim, mtLevelOnChain, targetCircuitId } = subversion;
    const filedLevelsDefined = isOnChain ? [mtLevel, mtLevelClaim, mtLevelOnChain] : [mtLevel, mtLevelClaim];
    if (filedLevelsDefined.some((lvl) => typeof lvl === "undefined")) {
      continue;
    }
    const mtLevelsValid = treesToCheck.reduce((acc, proofMap) => {
      if (!proofMap.proof) {
        return acc;
      }
      const allSiblings = proofMap.proof.allSiblings();
      const levelDepth = subversion[proofMap.levelKey];
      if (typeof levelDepth !== "number") {
        return acc;
      }
      return acc && allSiblings.length <= levelDepth - 1;
    }, true);
    if (mtLevelsValid) {
      return { mtLevel, mtLevelClaim, mtLevelOnChain, targetCircuitId };
    }
  }
  return void 0;
}

// src/proof/verifiers/pub-signals-verifier.ts
var import_js_iden3_core41 = require("@iden3/js-iden3-core");
var import_js_jsonld_merklization8 = require("@iden3/js-jsonld-merklization");

// src/proof/verifiers/query.ts
var import_js_iden3_core40 = require("@iden3/js-iden3-core");
var import_js_jsonld_merklization7 = require("@iden3/js-jsonld-merklization");
var import_ethers15 = require("ethers");
var defaultProofGenerationDelayOpts = 24 * 60 * 60 * 1e3;
async function checkQueryRequest(query, queriesMetadata, ldContext, outputs, circuitId, schemaLoader, opts) {
  const userDID = import_js_iden3_core40.DID.parseFromId(outputs.issuerId);
  const issuerAllowed = !query.allowedIssuers || query.allowedIssuers?.some((issuer) => issuer === "*" || issuer === userDID.string());
  if (!issuerAllowed) {
    throw new Error("issuer is not in allowed list");
  }
  if (!query.type) {
    throw new Error("query type is missing");
  }
  const schemaId = await import_js_jsonld_merklization7.Path.getTypeIDFromContext(JSON.stringify(ldContext), query.type, {
    documentLoader: schemaLoader
  });
  const schemaHash = calculateCoreSchemaHash(byteEncoder.encode(schemaId));
  if (schemaHash.bigInt() !== outputs.schemaHash.bigInt()) {
    throw new Error(`schema that was used is not equal to requested in query`);
  }
  if (!query.skipClaimRevocationCheck && outputs.isRevocationChecked === 0) {
    throw new Error(`check revocation is required`);
  }
  checkCircuitQueriesLength(circuitId, queriesMetadata);
  let acceptedProofGenerationDelay = defaultProofGenerationDelayOpts;
  if (opts?.acceptedProofGenerationDelay) {
    acceptedProofGenerationDelay = opts.acceptedProofGenerationDelay;
  }
  const timeDiff = Date.now() - (0, import_js_iden3_core40.getDateFromUnixTimestamp)(Number(outputs.timestamp)).getTime();
  if (timeDiff > acceptedProofGenerationDelay) {
    throw new Error("generated proof is outdated");
  }
  return;
}
var findCircuitValidation = (circuitId) => {
  for (const key in circuitValidator) {
    const validator = circuitValidator[key];
    if (key === circuitId) {
      return validator.validation;
    }
    for (const subversion of validator.subVersions ?? []) {
      if (subversion.targetCircuitId === circuitId) {
        return validator.validation;
      }
    }
  }
  throw new Error(`circuit validation for ${circuitId} is not found`);
};
function checkCircuitQueriesLength(circuitId, queriesMetadata) {
  const circuitValidationData = findCircuitValidation(circuitId);
  if (queriesMetadata.length > circuitValidationData.maxQueriesCount) {
    throw new Error(
      `circuit ${circuitId} supports only ${circuitValidationData.maxQueriesCount} queries`
    );
  }
}
function checkCircuitOperator(circuitId, operator) {
  const circuitValidationData = findCircuitValidation(circuitId);
  if (!circuitValidationData.supportedOperations.includes(operator)) {
    throw new Error(
      `circuit ${circuitId} not support ${getOperatorNameByValue(operator)} operator`
    );
  }
}
function verifyFieldValueInclusionV2(outputs, metadata) {
  if (outputs.operator == QueryOperators.$noop) {
    return;
  }
  if (outputs.merklized === 1) {
    if (outputs.claimPathNotExists === 1) {
      throw new Error(`proof doesn't contains target query key`);
    }
    if (outputs.claimPathKey !== metadata.claimPathKey) {
      throw new Error(`proof was generated for another path`);
    }
  } else {
    if (outputs.slotIndex !== metadata.slotIndex) {
      throw new Error(`wrong claim slot was used in claim`);
    }
  }
}
function verifyFieldValueInclusionNativeExistsSupport(outputs, metadata) {
  if (outputs.operator == 0 /* NOOP */) {
    return;
  }
  if (outputs.operator === 11 /* EXISTS */ && !outputs.merklized) {
    throw new Error("$exists operator is not supported for non-merklized credential");
  }
  if (outputs.merklized === 1) {
    if (outputs.claimPathKey !== metadata.claimPathKey) {
      throw new Error(`proof was generated for another path`);
    }
  } else {
    if (outputs.slotIndex !== metadata.slotIndex) {
      throw new Error(`wrong claim slot was used in claim`);
    }
  }
}
async function validateEmptyCredentialSubjectV2Circuit(cq, outputs) {
  if (outputs.operator !== 1 /* EQ */) {
    throw new Error("empty credentialSubject request available only for equal operation");
  }
  for (let index = 1; index < outputs.value.length; index++) {
    if (outputs.value[index] !== 0n) {
      throw new Error(`empty credentialSubject request not available for array of values`);
    }
  }
  const path = import_js_jsonld_merklization7.Path.newPath([VerifiableConstants.CREDENTIAL_SUBJECT_PATH]);
  const subjectEntry = await path.mtEntry();
  if (outputs.claimPathKey !== subjectEntry) {
    throw new Error(`proof doesn't contain credentialSubject in claimPathKey`);
  }
  return;
}
async function validateOperators(cq, outputs) {
  if (outputs.operator !== cq.operator) {
    throw new Error(`operator that was used is not equal to request`);
  }
  if (outputs.operator === 0 /* NOOP */) {
    return;
  }
  for (let index = 0; index < outputs.value.length; index++) {
    if (outputs.value[index] !== cq.values[index]) {
      if (outputs.value[index] === 0n && cq.values[index] === void 0) {
        continue;
      }
      throw new Error(`comparison value that was used is not equal to requested in query`);
    }
  }
}
async function validateDisclosureV2Circuit(cq, outputs, verifiablePresentation, ldLoader) {
  const bi = await fieldValueFromVerifiablePresentation(
    cq.fieldName,
    verifiablePresentation,
    ldLoader
  );
  if (bi !== outputs.value[0]) {
    throw new Error(`value that was used is not equal to requested in query`);
  }
  if (outputs.operator !== 1 /* EQ */) {
    throw new Error(`operator for selective disclosure must be $eq`);
  }
  for (let index = 1; index < outputs.value.length; index++) {
    if (outputs.value[index] !== 0n) {
      throw new Error(`selective disclosure not available for array of values`);
    }
  }
}
async function validateDisclosureNativeSDSupport(cq, outputs, verifiablePresentation, ldLoader) {
  const bi = await fieldValueFromVerifiablePresentation(
    cq.fieldName,
    verifiablePresentation,
    ldLoader
  );
  if (bi !== outputs.operatorOutput) {
    throw new Error(`operator output should be equal to disclosed value`);
  }
  if (outputs.operator !== 16 /* SD */) {
    throw new Error(`operator for selective disclosure must be $sd`);
  }
  for (let index = 0; index < outputs.value.length; index++) {
    if (outputs.value[index] !== 0n) {
      throw new Error(`public signal values must be zero`);
    }
  }
}
async function validateEmptyCredentialSubjectNoopNativeSupport(outputs) {
  if (outputs.operator !== 0 /* NOOP */) {
    throw new Error("empty credentialSubject request available only for $noop operation");
  }
  for (let index = 1; index < outputs.value.length; index++) {
    if (outputs.value[index] !== 0n) {
      throw new Error(`empty credentialSubject request not available for array of values`);
    }
  }
}
var fieldValueFromVerifiablePresentation = async (fieldName, verifiablePresentation, ldLoader) => {
  if (!verifiablePresentation) {
    throw new Error(`verifiablePresentation is required for selective disclosure request`);
  }
  let mz;
  const strVerifiablePresentation = JSON.stringify(verifiablePresentation);
  try {
    mz = await import_js_jsonld_merklization7.Merklizer.merklizeJSONLD(strVerifiablePresentation, {
      documentLoader: ldLoader
    });
  } catch (e) {
    throw new Error(`can't merklize verifiablePresentation`);
  }
  let merklizedPath;
  try {
    const p = `verifiableCredential.credentialSubject.${fieldName}`;
    merklizedPath = await import_js_jsonld_merklization7.Path.fromDocument(null, strVerifiablePresentation, p, {
      documentLoader: ldLoader
    });
  } catch (e) {
    throw new Error(`can't build path to '${fieldName}' key`);
  }
  let proof;
  let value;
  try {
    ({ proof, value } = await mz.proof(merklizedPath));
  } catch (e) {
    throw new Error(`can't get value by path '${fieldName}'`);
  }
  if (!value) {
    throw new Error(`can't get merkle value for field '${fieldName}'`);
  }
  if (!proof.existence) {
    throw new Error(
      `path [${merklizedPath.parts}] doesn't exist in verifiablePresentation document`
    );
  }
  return await value.mtEntry();
};
function calculateGroupId() {
  const groupID = BigInt(import_ethers15.ethers.keccak256(import_ethers15.ethers.randomBytes(32))) & // It should fit in a field number in the circuit (max 253 bits). With this we truncate to 252 bits for the group ID
  BigInt("0x0FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
  return groupID;
}
function calculateRequestId(requestParams, creatorAddress) {
  const requestId = (BigInt(
    import_ethers15.ethers.keccak256(import_ethers15.ethers.solidityPacked(["bytes", "address"], [requestParams, creatorAddress]))
  ) & BigInt("0x0000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")) + BigInt("0x0001000000000000000000000000000000000000000000000000000000000000");
  return requestId;
}
function calculateMultiRequestId(requestIds, groupIds, creatorAddress) {
  return BigInt(
    import_ethers15.ethers.keccak256(
      import_ethers15.ethers.solidityPacked(
        ["uint256[]", "uint256[]", "address"],
        [requestIds, groupIds, creatorAddress]
      )
    )
  );
}

// src/proof/verifiers/query-hash.ts
var import_js_crypto11 = require("@iden3/js-crypto");
function calculateQueryHashV2(values2, schema, slotIndex, operator, claimPathKey, claimPathNotExists) {
  const expValue = prepareCircuitArrayValues(values2, 64);
  const valueHash = import_js_crypto11.poseidon.spongeHashX(expValue, 6);
  return import_js_crypto11.poseidon.hash([
    schema.bigInt(),
    BigInt(slotIndex),
    BigInt(operator),
    BigInt(claimPathKey),
    BigInt(claimPathNotExists),
    valueHash
  ]);
}
function calculateQueryHashV3(values2, schema, slotIndex, operator, claimPathKey, valueArraySize, merklized, isRevocationChecked, verifierID, nullifierSessionID) {
  const expValue = prepareCircuitArrayValues(values2, defaultValueArraySize);
  const valueHash = import_js_crypto11.poseidon.spongeHashX(expValue, 6);
  const firstPartQueryHash = import_js_crypto11.poseidon.hash([
    schema.bigInt(),
    BigInt(slotIndex),
    BigInt(operator),
    BigInt(claimPathKey),
    BigInt(merklized),
    valueHash
  ]);
  const queryHash = import_js_crypto11.poseidon.hash([
    firstPartQueryHash,
    BigInt(valueArraySize),
    BigInt(isRevocationChecked),
    BigInt(verifierID),
    BigInt(nullifierSessionID),
    0n
  ]);
  return queryHash;
}

// src/proof/verifiers/pub-signals-verifier.ts
var userStateError = new Error(`user state is not valid`);
var zeroInt = 0n;
var PubSignalsVerifier = class {
  /**
   * Creates an instance of PubSignalsVerifier.
   * @param {DocumentLoader} _documentLoader document loader
   * @param {IStateStorage} _stateStorage state storage
   */
  constructor(_documentLoader, _stateStorage) {
    this._documentLoader = _documentLoader;
    this._stateStorage = _stateStorage;
  }
  /**
   * verify public signals
   *
   * @param {string} circuitId circuit id
   * @param {VerifyContext} ctx verification parameters
   * @returns `Promise<BaseConfig>`
   */
  async verify(circuitId, ctx) {
    const fnName = `${circuitId.replace("-beta.1", "").replace(/-/g, "_")}Verify`;
    const fn = this[fnName];
    if (!fn) {
      throw new Error(`public signals verifier for ${circuitId} not found`);
    }
    return fn({ ...ctx, circuitId });
  }
  credentialAtomicQueryMTPV2Verify = async ({
    query,
    verifiablePresentation,
    sender,
    challenge,
    pubSignals,
    opts
  }) => {
    let mtpv2PubSignals = new AtomicQueryMTPV2PubSignals();
    mtpv2PubSignals = mtpv2PubSignals.pubSignalsUnmarshal(
      byteEncoder.encode(JSON.stringify(pubSignals))
    );
    if (!mtpv2PubSignals.userID) {
      throw new Error("user id is not presented in proof public signals");
    }
    if (!mtpv2PubSignals.requestID) {
      throw new Error("requestId is not presented in proof public signals");
    }
    const outs = {
      issuerId: mtpv2PubSignals.issuerID,
      schemaHash: mtpv2PubSignals.claimSchema,
      slotIndex: mtpv2PubSignals.slotIndex,
      operator: mtpv2PubSignals.operator,
      value: mtpv2PubSignals.value,
      timestamp: mtpv2PubSignals.timestamp,
      merklized: mtpv2PubSignals.merklized,
      claimPathKey: mtpv2PubSignals.claimPathKey,
      claimPathNotExists: mtpv2PubSignals.claimPathNotExists,
      valueArraySize: mtpv2PubSignals.getValueArrSize(),
      isRevocationChecked: mtpv2PubSignals.isRevocationChecked
    };
    await this.checkQueryV2Circuits(
      "credentialAtomicQueryMTPV2" /* AtomicQueryMTPV2 */,
      query,
      outs,
      opts,
      verifiablePresentation
    );
    await this.checkStateExistenceForId(
      mtpv2PubSignals.issuerID,
      mtpv2PubSignals.issuerClaimIdenState
    );
    if (mtpv2PubSignals.isRevocationChecked !== 0) {
      await this.checkRevocationState(
        mtpv2PubSignals.issuerID,
        mtpv2PubSignals.issuerClaimNonRevState,
        opts
      );
    }
    this.verifyIdOwnership(sender, challenge, mtpv2PubSignals.userID, mtpv2PubSignals.requestID);
    return mtpv2PubSignals;
  };
  credentialAtomicQuerySigV2Verify = async ({
    query,
    verifiablePresentation,
    sender,
    challenge,
    pubSignals,
    opts
  }) => {
    let sigV2PubSignals = new AtomicQuerySigV2PubSignals();
    sigV2PubSignals = sigV2PubSignals.pubSignalsUnmarshal(
      byteEncoder.encode(JSON.stringify(pubSignals))
    );
    const outs = {
      issuerId: sigV2PubSignals.issuerID,
      schemaHash: sigV2PubSignals.claimSchema,
      slotIndex: sigV2PubSignals.slotIndex,
      operator: sigV2PubSignals.operator,
      value: sigV2PubSignals.value,
      timestamp: sigV2PubSignals.timestamp,
      merklized: sigV2PubSignals.merklized,
      claimPathKey: sigV2PubSignals.claimPathKey,
      claimPathNotExists: sigV2PubSignals.claimPathNotExists,
      valueArraySize: sigV2PubSignals.getValueArrSize(),
      isRevocationChecked: sigV2PubSignals.isRevocationChecked
    };
    await this.checkQueryV2Circuits(
      "credentialAtomicQuerySigV2" /* AtomicQuerySigV2 */,
      query,
      outs,
      opts,
      verifiablePresentation
    );
    await this.checkStateExistenceForId(sigV2PubSignals.issuerID, sigV2PubSignals.issuerAuthState);
    if (sigV2PubSignals.isRevocationChecked !== 0) {
      await this.checkRevocationState(
        sigV2PubSignals.issuerID,
        sigV2PubSignals.issuerClaimNonRevState,
        opts
      );
    }
    this.verifyIdOwnership(sender, challenge, sigV2PubSignals.userID, sigV2PubSignals.requestID);
    return sigV2PubSignals;
  };
  performQueryVerificationV3 = async (ctx, circuitOpts) => {
    const { query, verifiablePresentation, sender, challenge, opts, params, circuitId } = ctx;
    const { v3PubSignals } = circuitOpts;
    const outs = {
      issuerId: v3PubSignals.issuerID,
      schemaHash: v3PubSignals.claimSchema,
      slotIndex: v3PubSignals.slotIndex,
      operator: v3PubSignals.operator,
      value: v3PubSignals.value,
      timestamp: v3PubSignals.timestamp,
      merklized: v3PubSignals.merklized,
      claimPathKey: v3PubSignals.claimPathKey,
      valueArraySize: v3PubSignals.getValueArrSize(),
      operatorOutput: v3PubSignals.operatorOutput,
      isRevocationChecked: v3PubSignals.isRevocationChecked
    };
    if (!query.type) {
      throw new Error(`proof query type is undefined`);
    }
    const loader = this._documentLoader ?? (0, import_js_jsonld_merklization8.getDocumentLoader)();
    let context;
    try {
      context = (await loader(query.context ?? "")).document;
    } catch (e) {
      throw new Error(`can't load schema for request query`);
    }
    const queriesMetadata = await parseQueriesMetadata(
      query.type,
      JSON.stringify(context),
      query.credentialSubject,
      {
        documentLoader: loader
      }
    );
    if (!circuitId) {
      throw new Error("circuitId is not provided");
    }
    await checkQueryRequest(
      query,
      queriesMetadata,
      context,
      outs,
      circuitId,
      this._documentLoader,
      opts
    );
    const queryMetadata = queriesMetadata[0];
    checkCircuitOperator(circuitId, outs.operator);
    if (queryMetadata.operator === 16 /* SD */) {
      try {
        await validateDisclosureNativeSDSupport(
          queryMetadata,
          outs,
          verifiablePresentation,
          loader
        );
      } catch (e) {
        throw new Error(`failed to validate selective disclosure: ${e.message}`);
      }
    } else if (!queryMetadata.fieldName && queryMetadata.operator == 0 /* NOOP */) {
      try {
        await validateEmptyCredentialSubjectNoopNativeSupport(outs);
      } catch (e) {
        throw new Error(`failed to validate operators: ${e.message}`);
      }
    } else {
      try {
        await validateOperators(queryMetadata, outs);
      } catch (e) {
        throw new Error(`failed to validate operators: ${e.message}`);
      }
    }
    verifyFieldValueInclusionNativeExistsSupport(outs, queryMetadata);
    const { proofType, verifierID, nullifier, nullifierSessionID, linkID } = v3PubSignals;
    switch (query.proofType) {
      case "BJJSignature2021" /* BJJSignature */:
        if (proofType !== 1) {
          throw new Error("wrong proof type for BJJSignature");
        }
        break;
      case "Iden3SparseMerkleTreeProof" /* Iden3SparseMerkleTreeProof */:
        if (proofType !== 2) {
          throw new Error("wrong proof type for Iden3SparseMerkleTreeProof");
        }
        break;
      default:
    }
    const nSessionId = BigInt(params?.nullifierSessionId ?? 0);
    if (nSessionId !== 0n) {
      if (BigInt(nullifier ?? 0) === 0n) {
        throw new Error("nullifier should be provided for nullification and should not be 0");
      }
      const verifierDIDParam = params?.verifierDid;
      if (!verifierDIDParam) {
        throw new Error("verifierDid is required");
      }
      const id = import_js_iden3_core41.DID.idFromDID(verifierDIDParam);
      if (verifierID.bigInt() != id.bigInt()) {
        throw new Error("wrong verifier is used for nullification");
      }
      if (nullifierSessionID !== nSessionId) {
        throw new Error(
          `wrong verifier session id is used for nullification, expected ${nSessionId}, got ${nullifierSessionID}`
        );
      }
    } else if (nullifierSessionID !== 0n) {
      throw new Error(`Nullifier id is generated but wasn't requested`);
    }
    if (!query.groupId && linkID !== 0n) {
      throw new Error(`proof contains link id, but group id is not provided`);
    }
    if (query.groupId && linkID === 0n) {
      throw new Error("proof doesn't contain link id, but group id is provided");
    }
    await this.checkStateExistenceForId(v3PubSignals.issuerID, v3PubSignals.issuerState);
    if (v3PubSignals.isRevocationChecked !== 0) {
      await this.checkRevocationState(
        v3PubSignals.issuerID,
        v3PubSignals.issuerClaimNonRevState,
        opts
      );
    }
    this.verifyIdOwnership(sender, challenge, v3PubSignals.userID, v3PubSignals.requestID);
    return v3PubSignals;
  };
  credentialAtomicQueryV3BetaVerify = async (ctx, mtLevel, mtLevelClaim) => {
    const v3PubSignals = new AtomicQueryV3PubSignals({ mtLevel, mtLevelClaim }).pubSignalsUnmarshal(
      byteEncoder.encode(JSON.stringify(ctx.pubSignals))
    );
    return await this.performQueryVerificationV3(ctx, {
      v3PubSignals,
      mtLevel,
      mtLevelClaim
    });
  };
  credentialAtomicQueryV3Verify = async (ctx) => this.credentialAtomicQueryV3BetaVerify(ctx);
  credentialAtomicQueryV3_16_16_64Verify = async (ctx) => this.credentialAtomicQueryV3BetaVerify(ctx, 16, 16);
  authV2Verify = async ({
    sender,
    challenge,
    pubSignals,
    opts
  }) => {
    let authV2PubSignals = new AuthV2PubSignals();
    authV2PubSignals = authV2PubSignals.pubSignalsUnmarshal(
      byteEncoder.encode(JSON.stringify(pubSignals))
    );
    const gist = await this.checkGlobalState(authV2PubSignals.GISTRoot, authV2PubSignals.userID);
    let acceptedStateTransitionDelay = constants_exports.DEFAULT_AUTH_VERIFY_DELAY;
    if (opts?.acceptedStateTransitionDelay) {
      acceptedStateTransitionDelay = opts.acceptedStateTransitionDelay;
    }
    if (!gist.latest) {
      const timeDiff = Date.now() - (0, import_js_iden3_core41.getDateFromUnixTimestamp)(Number(gist.transitionTimestamp)).getTime();
      if (timeDiff > acceptedStateTransitionDelay) {
        throw new Error("global state is outdated");
      }
    }
    this.verifyIdOwnership(sender, challenge, authV2PubSignals.userID, authV2PubSignals.challenge);
    return new BaseConfig();
  };
  linkedMultiQueryNVerify = async ({ query, verifiablePresentation, pubSignals }, queryCount) => {
    let multiQueryPubSignals = new LinkedMultiQueryPubSignals(queryCount);
    multiQueryPubSignals = multiQueryPubSignals.pubSignalsUnmarshal(
      byteEncoder.encode(JSON.stringify(pubSignals))
    );
    let schema;
    const ldOpts = { documentLoader: this._documentLoader };
    try {
      schema = (await ldOpts.documentLoader(query.context || "")).document;
    } catch (e) {
      throw new Error(`can't load schema for request query`);
    }
    const ldContextJSON = JSON.stringify(schema);
    const credentialSubject = query.credentialSubject;
    const schemaId = await import_js_jsonld_merklization8.Path.getTypeIDFromContext(
      ldContextJSON,
      query.type || "",
      ldOpts
    );
    const schemaHash = calculateCoreSchemaHash(byteEncoder.encode(schemaId));
    const queriesMetadata = await parseQueriesMetadata(
      query.type || "",
      ldContextJSON,
      credentialSubject,
      ldOpts
    );
    const request = [];
    const merklized = queriesMetadata[0]?.merklizedSchema ? 1 : 0;
    for (let i = 0; i < multiQueryPubSignals.queryCount; i++) {
      const queryMeta = queriesMetadata[i];
      const values2 = queryMeta?.values ?? [];
      const valArrSize = values2.length;
      const queryHash = calculateQueryHashV3(
        values2,
        schemaHash,
        queryMeta?.slotIndex ?? 0,
        queryMeta?.operator ?? 0,
        queryMeta?.claimPathKey.toString() ?? 0,
        valArrSize,
        merklized,
        0,
        0,
        0
      );
      request.push({ queryHash, queryMeta });
    }
    const queryHashCompare = (a, b) => {
      if (a.queryHash < b.queryHash) return -1;
      if (a.queryHash > b.queryHash) return 1;
      return 0;
    };
    const pubSignalsMeta = multiQueryPubSignals.circuitQueryHash.map((queryHash, index) => ({
      queryHash,
      operatorOutput: multiQueryPubSignals.operatorOutput[index]
    }));
    pubSignalsMeta.sort(queryHashCompare);
    request.sort(queryHashCompare);
    for (let i = 0; i < multiQueryPubSignals.queryCount; i++) {
      if (request[i].queryHash != pubSignalsMeta[i].queryHash) {
        throw new Error("query hashes do not match");
      }
      if (request[i].queryMeta?.operator === 16 /* SD */) {
        const disclosedValue = await fieldValueFromVerifiablePresentation(
          request[i].queryMeta.fieldName,
          verifiablePresentation,
          this._documentLoader
        );
        if (disclosedValue != pubSignalsMeta[i].operatorOutput) {
          throw new Error("disclosed value is not in the proof outputs");
        }
      }
    }
    return multiQueryPubSignals;
  };
  linkedMultiQuery10Verify = async (ctx) => this.linkedMultiQueryNVerify(ctx, 10);
  linkedMultiQueryVerify = async (ctx) => this.linkedMultiQueryNVerify(ctx, 10);
  linkedMultiQuery5Verify = async (ctx) => this.linkedMultiQueryNVerify(ctx, 5);
  linkedMultiQuery3Verify = async (ctx) => this.linkedMultiQueryNVerify(ctx, 3);
  verifyIdOwnership = (sender, challenge, expectedUserId, expectedChallenge) => {
    const senderId = import_js_iden3_core41.DID.idFromDID(import_js_iden3_core41.DID.parse(sender));
    if (senderId.string() !== expectedUserId.string()) {
      throw new Error(
        `sender id is not used for proof creation, expected ${sender}, user from public signals: ${expectedUserId.string()}`
      );
    }
    if (challenge !== expectedChallenge) {
      throw new Error(
        `challenge is not used for proof creation, expected ${challenge}, challenge from public signals: ${expectedChallenge}  `
      );
    }
  };
  async checkQueryV2Circuits(circuitId, query, outs, opts, verifiablePresentation) {
    if (!query.type) {
      throw new Error(`proof query type is undefined`);
    }
    const loader = this._documentLoader ?? (0, import_js_jsonld_merklization8.getDocumentLoader)();
    let context;
    try {
      context = (await loader(query.context ?? "")).document;
    } catch (e) {
      throw new Error(`can't load schema for request query`);
    }
    const queriesMetadata = await parseQueriesMetadata(
      query.type,
      JSON.stringify(context),
      query.credentialSubject,
      {
        documentLoader: loader,
        legacyNoopOperator: true
      }
    );
    await checkQueryRequest(
      query,
      queriesMetadata,
      context,
      outs,
      circuitId,
      this._documentLoader,
      opts
    );
    const queryMetadata = queriesMetadata[0];
    checkCircuitOperator(circuitId, outs.operator);
    if (queryMetadata.operator === 16 /* SD */) {
      try {
        await validateDisclosureV2Circuit(queryMetadata, outs, verifiablePresentation, loader);
      } catch (e) {
        throw new Error(`failed to validate selective disclosure: ${e.message}`);
      }
    } else if (!queryMetadata.fieldName && queryMetadata.operator == 0 /* NOOP */) {
      try {
        await validateEmptyCredentialSubjectV2Circuit(queryMetadata, outs);
      } catch (e) {
        throw new Error(`failed to validate operators: ${e.message}`);
      }
    } else {
      try {
        await validateOperators(queryMetadata, outs);
      } catch (e) {
        throw new Error(`failed to validate operators: ${e.message}`);
      }
    }
    verifyFieldValueInclusionV2(outs, queryMetadata);
  }
  async resolve(id, state) {
    const idBigInt = id.bigInt();
    const contractState = await this._stateStorage.getStateInfoByIdAndState(idBigInt, state);
    if (!contractState.id || contractState.id.toString() !== idBigInt.toString()) {
      throw new Error(`state was recorded for another identity`);
    }
    if (!contractState.state || contractState.state.toString() !== state.toString()) {
      if (!contractState.replacedAtTimestamp || contractState.replacedAtTimestamp.toString() === zeroInt.toString()) {
        throw new Error(`no information about state transition`);
      }
      return {
        latest: false,
        transitionTimestamp: contractState.replacedAtTimestamp.toString()
      };
    }
    return {
      latest: !contractState.replacedAtTimestamp || contractState.replacedAtTimestamp.toString() === zeroInt.toString(),
      transitionTimestamp: contractState.replacedAtTimestamp?.toString() ?? 0
    };
  }
  async rootResolve(state, id) {
    let globalStateInfo;
    try {
      globalStateInfo = await this._stateStorage.getGISTRootInfo(state, id);
    } catch (e) {
      if (isRootDoesNotExistError(e)) {
        throw new Error("GIST root does not exist in the smart contract");
      }
      throw e;
    }
    if (globalStateInfo.root.toString() !== state.toString()) {
      throw new Error(`gist info contains invalid state`);
    }
    if (globalStateInfo.replacedByRoot.toString() !== zeroInt.toString()) {
      if (globalStateInfo.replacedAtTimestamp.toString() === zeroInt.toString()) {
        throw new Error(`state was replaced, but replaced time unknown`);
      }
      return {
        latest: false,
        transitionTimestamp: globalStateInfo.replacedAtTimestamp.toString()
      };
    }
    return {
      latest: true,
      transitionTimestamp: 0
    };
  }
  checkStateExistenceForId = async (userId, userState) => {
    await this.resolve(userId, userState.bigInt());
  };
  checkGlobalState = async (state, id) => {
    return this.rootResolve(state.bigInt(), id.bigInt());
  };
  checkRevocationStateForId = async (issuerId, issuerClaimNonRevState) => {
    const issuerNonRevStateResolved = await this.resolve(issuerId, issuerClaimNonRevState.bigInt());
    return issuerNonRevStateResolved;
  };
  checkRevocationState = async (issuerID, issuerClaimNonRevState, opts) => {
    const issuerNonRevStateResolved = await this.checkRevocationStateForId(
      issuerID,
      issuerClaimNonRevState
    );
    const acceptedStateTransitionDelay = opts?.acceptedStateTransitionDelay ?? constants_exports.DEFAULT_PROOF_VERIFY_DELAY;
    if (!issuerNonRevStateResolved.latest) {
      const timeDiff = Date.now() - (0, import_js_iden3_core41.getDateFromUnixTimestamp)(Number(issuerNonRevStateResolved.transitionTimestamp)).getTime();
      if (timeDiff > acceptedStateTransitionDelay) {
        throw new Error("issuer state is outdated");
      }
    }
  };
};

// src/proof/proof-service.ts
var ProofService = class {
  /**
   * Creates an instance of ProofService.
   * @param {IIdentityWallet} _identityWallet - identity wallet
   * @param {ICredentialWallet} _credentialWallet - credential wallet
   * @param {ICircuitStorage} _circuitStorage - circuit storage to load proving / verification files
   * @param {IStateStorage} _stateStorage - state storage to get GIST proof / publish state
   */
  constructor(_identityWallet, _credentialWallet, _circuitStorage, _stateStorage, opts) {
    this._identityWallet = _identityWallet;
    this._credentialWallet = _credentialWallet;
    this._stateStorage = _stateStorage;
    this._prover = opts?.prover ?? new NativeProver(_circuitStorage);
    this._ldOptions = { ...opts, documentLoader: opts?.documentLoader ?? cacheLoader(opts) };
    this._inputsGenerator = new InputGenerator(_identityWallet, _credentialWallet, _stateStorage);
    this._pubSignalsVerifier = new PubSignalsVerifier(
      opts?.documentLoader ?? cacheLoader(opts),
      _stateStorage
    );
    this._proofsCacheStorage = opts?.proofsCacheStorage;
  }
  _prover;
  _ldOptions;
  _inputsGenerator;
  _pubSignalsVerifier;
  _proofsCacheStorage;
  /** {@inheritdoc IProofService.verifyProof} */
  async verifyProof(zkp, circuitId) {
    return this._prover.verify(zkp, circuitId);
  }
  /** {@inheritdoc IProofService.verify} */
  async verifyZKPResponse(proofResp, opts) {
    const proofValid = await this._prover.verify(proofResp, proofResp.circuitId);
    if (!proofValid) {
      throw Error(
        `Proof with circuit id ${proofResp.circuitId} and request id ${proofResp.id} is not valid`
      );
    }
    const verifyContext = {
      pubSignals: proofResp.pub_signals,
      query: opts.query,
      verifiablePresentation: proofResp.vp,
      sender: opts.sender,
      challenge: BigInt(proofResp.id),
      opts: opts.opts,
      params: opts.params
    };
    const pubSignals = await this._pubSignalsVerifier.verify(proofResp.circuitId, verifyContext);
    return { linkID: pubSignals.linkID };
  }
  /** {@inheritdoc IProofService.generateProof} */
  async generateProof(proofReq, identifier, opts) {
    if (!opts) {
      opts = {
        skipRevocation: false,
        challenge: 0n
      };
    }
    const { nonce: authProfileNonce, genesisDID: genesisDid } = await this._identityWallet.getGenesisDIDMetadata(identifier);
    const query = proofReq.query;
    if (!query) {
      if (!isAuthCircuit(proofReq.circuitId)) {
        throw new Error(`for non-auth circuits query must be provided`);
      }
      const authRes = await this.generateAuthProof(proofReq.circuitId, identifier, {
        challenge: proofReq.params?.challenge ? BigInt(proofReq.params.challenge) : void 0
      });
      return {
        id: proofReq.id,
        circuitId: proofReq.circuitId,
        pub_signals: authRes.pub_signals,
        proof: authRes.proof
      };
    }
    let credentialWithRevStatus = { cred: opts.credential, revStatus: opts.credentialRevocationStatus };
    if (!opts.credential) {
      credentialWithRevStatus = await this.findCredentialByProofQuery(identifier, query);
    }
    if (opts.credential && !opts.credentialRevocationStatus && !opts.skipRevocation) {
      const revStatus = await this._credentialWallet.getRevocationStatusFromCredential(
        opts.credential
      );
      credentialWithRevStatus = { cred: opts.credential, revStatus };
    }
    if (!credentialWithRevStatus.cred) {
      throw new Error(
        VerifiableConstants.ERRORS.PROOF_SERVICE_NO_CREDENTIAL_FOR_QUERY + ` ${JSON.stringify(proofReq.query)}`
      );
    }
    if (!opts.allowExpiredCredentials && credentialWithRevStatus.cred.expirationDate && new Date(credentialWithRevStatus.cred.expirationDate) < /* @__PURE__ */ new Date()) {
      throw new Error(VerifiableConstants.ERRORS.PROOF_SERVICE_CREDENTIAL_IS_EXPIRED);
    }
    if (this._proofsCacheStorage && !opts?.bypassCache) {
      const cachedProof = await this._proofsCacheStorage.getProof(
        identifier,
        credentialWithRevStatus.cred.id,
        proofReq
      );
      if (cachedProof) {
        return cachedProof;
      }
    }
    const credentialCoreClaim = await this._identityWallet.getCoreClaimFromCredential(
      credentialWithRevStatus.cred
    );
    const preparedCredential = {
      credential: credentialWithRevStatus.cred,
      credentialCoreClaim,
      revStatus: credentialWithRevStatus.revStatus
    };
    const subjectDID = import_js_iden3_core42.DID.parse(preparedCredential.credential.credentialSubject["id"]);
    const { nonce: credentialSubjectProfileNonce, genesisDID: subjectGenesisDID } = await this._identityWallet.getGenesisDIDMetadata(subjectDID);
    if (subjectGenesisDID.string() !== genesisDid.string()) {
      throw new Error(VerifiableConstants.ERRORS.PROOF_SERVICE_PROFILE_GENESIS_DID_MISMATCH);
    }
    const propertiesMetadata = parseCredentialSubject(
      query.credentialSubject
    );
    if (!propertiesMetadata.length) {
      throw new Error(VerifiableConstants.ERRORS.PROOF_SERVICE_NO_QUERIES_IN_ZKP_REQUEST);
    }
    const mtPosition = preparedCredential.credentialCoreClaim.getMerklizedPosition();
    let mk;
    if (mtPosition !== import_js_iden3_core42.MerklizedRootPosition.None) {
      mk = await preparedCredential.credential.merklize(this._ldOptions);
    }
    const context = query["context"];
    const groupId = query["groupId"];
    const ldContext = await this.loadLdContext(context);
    const credentialType = query["type"];
    const queriesMetadata = [];
    const circuitQueries = [];
    for (const propertyMetadata of propertiesMetadata) {
      const queryMetadata = await parseQueryMetadata(
        propertyMetadata,
        byteDecoder.decode(ldContext),
        credentialType,
        {
          ...this._ldOptions,
          legacyNoopOperator: [
            "credentialAtomicQuerySigV2OnChain" /* AtomicQuerySigV2OnChain */,
            "credentialAtomicQueryMTPV2OnChain" /* AtomicQueryMTPV2OnChain */
          ].includes(proofReq.circuitId)
        }
      );
      queriesMetadata.push(queryMetadata);
      const circuitQuery = await this.toCircuitsQuery(
        preparedCredential.credential,
        queryMetadata,
        mk
      );
      circuitQueries.push(circuitQuery);
    }
    const sdQueries = queriesMetadata.filter((q) => q.operator === 16 /* SD */);
    let vp;
    if (sdQueries.length) {
      vp = createVerifiablePresentation(
        context,
        credentialType,
        preparedCredential.credential,
        sdQueries
      );
    }
    return this._generateProof({
      proofReq,
      vp,
      credId: preparedCredential.credential.id,
      identifier,
      preparedCredential,
      genesisDid,
      circuitQueries,
      inputParams: {
        ...opts,
        authProfileNonce,
        credentialSubjectProfileNonce,
        linkNonce: groupId ? opts.linkNonce : 0n
      },
      bypassCache: opts?.bypassCache
    });
  }
  async _generateProof({
    proofReq,
    vp,
    credId,
    identifier,
    preparedCredential,
    genesisDid,
    inputParams,
    circuitQueries,
    bypassCache
  }) {
    const { inputs, metadata } = await this.generateInputs(
      preparedCredential,
      genesisDid,
      proofReq,
      inputParams,
      circuitQueries
    );
    const circuitId = metadata?.targetCircuitId ?? proofReq.circuitId;
    try {
      const { proof, pub_signals } = await this._prover.generate(inputs, circuitId);
      const zkpRes = {
        id: proofReq.id,
        circuitId,
        vp,
        proof,
        pub_signals
      };
      if (this._proofsCacheStorage && credId) {
        if (!bypassCache) {
          await this._proofsCacheStorage.storeProof(identifier, credId, proofReq, zkpRes);
        } else if (this._proofsCacheStorage.removeProof) {
          await this._proofsCacheStorage.removeProof(identifier, credId, proofReq);
        }
      }
      return zkpRes;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      const cause = e instanceof Error ? e : new Error(errorMessage);
      throw new Error(`Proof generation failed for circuit ${circuitId}: ${errorMessage}`, {
        cause
      });
    }
  }
  /** {@inheritdoc IProofService.generateAuthProof} */
  async generateAuthProof(circuitId, identifier, opts) {
    if (!isAuthCircuit(circuitId)) {
      throw new Error("CircuitId is not supported");
    }
    if (!opts) {
      opts = {
        challenge: 0n
      };
    }
    const challenge = opts.challenge ? import_js_iden3_core42.BytesHelper.intToBytes(opts.challenge).reverse() : new Uint8Array(32);
    const authInputs = await this.generateAuthInputs(challenge, identifier, circuitId);
    const zkProof = await this._prover.generate(authInputs, circuitId);
    return {
      circuitId,
      proof: zkProof.proof,
      pub_signals: zkProof.pub_signals
    };
  }
  /** {@inheritdoc IProofService.transitState} */
  async transitState(did, oldTreeState, isOldStateGenesis, stateStorage, ethSigner) {
    return this._identityWallet.transitState(
      did,
      oldTreeState,
      isOldStateGenesis,
      ethSigner,
      this._prover
    );
  }
  async generateInputs(preparedCredential, identifier, proofReq, params, circuitQueries) {
    return this._inputsGenerator.generateInputs({
      preparedCredential,
      identifier,
      proofReq,
      params,
      circuitQueries
    });
  }
  async toCircuitsQuery(credential, queryMetadata, merklizedCredential) {
    if (queryMetadata.merklizedSchema && !merklizedCredential) {
      throw new Error("merklized root position is set to None for merklized schema");
    }
    if (!queryMetadata.merklizedSchema && merklizedCredential) {
      throw new Error("merklized root position is not set to None for non-merklized schema");
    }
    const query = new Query();
    query.slotIndex = queryMetadata.slotIndex;
    query.operator = queryMetadata.operator;
    query.values = queryMetadata.values;
    if (queryMetadata.merklizedSchema && merklizedCredential && queryMetadata.claimPathKey !== BigInt(0)) {
      const { proof, value: mtValue } = await merklizedCredential.proof(queryMetadata.path);
      query.valueProof = new ValueProof();
      query.valueProof.mtp = proof;
      query.valueProof.path = queryMetadata.claimPathKey;
      const mtEntry = await mtValue?.mtEntry() ?? 0n;
      query.valueProof.value = mtEntry;
      if (!queryMetadata.fieldName) {
        query.values = [mtEntry];
        return query;
      }
    }
    if (queryMetadata.operator === 16 /* SD */) {
      const [first, ...rest] = queryMetadata.fieldName.split(".");
      let v = credential.credentialSubject[first];
      for (const part of rest) {
        v = v[part];
      }
      if (typeof v === "undefined") {
        throw new Error(`credential doesn't contain value for field ${queryMetadata.fieldName}`);
      }
      query.values = await transformQueryValueToBigInts(v, queryMetadata.datatype);
    }
    return query;
  }
  async loadLdContext(context) {
    const loader = (0, import_js_jsonld_merklization9.getDocumentLoader)(this._ldOptions);
    let ldSchema;
    try {
      ldSchema = (await loader(context)).document;
    } catch (e) {
      throw new Error(`can't load ld context from url ${context}`);
    }
    return byteEncoder.encode(JSON.stringify(ldSchema));
  }
  /** {@inheritdoc IProofService.generateAuthV2Inputs} */
  async generateAuthV2Inputs(hash, did, circuitId) {
    if (circuitId !== "authV2" /* AuthV2 */) {
      throw new Error("CircuitId is not supported");
    }
    return this.generateAuthInputsCommon(hash, did, circuitId);
  }
  /** {@inheritdoc IProofService.generateAuthInputs} */
  async generateAuthInputs(hash, did, circuitId) {
    if (circuitId !== "authV2" /* AuthV2 */ && circuitId !== "authV3" /* AuthV3 */ && circuitId !== "authV3-8-32" /* AuthV3_8_32 */) {
      throw new Error("CircuitId is not supported");
    }
    return this.generateAuthInputsCommon(hash, did, circuitId);
  }
  async generateAuthInputsCommon(hash, did, circuitId) {
    const challenge = import_js_iden3_core42.BytesHelper.bytesToInt(hash.reverse());
    const inputsCxt = await this._inputsGenerator.generateInputs({
      proofReq: {
        circuitId
      },
      identifier: did,
      params: {
        challenge
      },
      circuitQueries: [],
      preparedCredential: {
        credential: new W3CCredential(),
        credentialCoreClaim: new import_js_iden3_core42.Claim()
      }
    });
    return inputsCxt.inputs;
  }
  /** {@inheritdoc IProofService.generateAuthV2Proof} */
  async generateAuthV2Proof(challenge, did) {
    const authInputs = await this.generateAuthInputs(challenge, did, "authV2" /* AuthV2 */);
    const zkProof = await this._prover.generate(authInputs, "authV2" /* AuthV2 */);
    return zkProof;
  }
  async verifyState(circuitId, pubSignals, opts = {
    acceptedStateTransitionDelay: constants_exports.DEFAULT_AUTH_VERIFY_DELAY
  }) {
    if (circuitId !== "authV2" /* AuthV2 */ && circuitId !== "authV3" /* AuthV3 */ && circuitId !== "authV3-8-32" /* AuthV3_8_32 */) {
      throw new Error(`CircuitId is not supported ${circuitId}`);
    }
    let gistRoot, userId;
    if (circuitId === "authV2" /* AuthV2 */) {
      const authV2PubSignals = new AuthV2PubSignals().pubSignalsUnmarshal(
        byteEncoder.encode(JSON.stringify(pubSignals))
      );
      gistRoot = authV2PubSignals.GISTRoot.bigInt();
      userId = authV2PubSignals.userID.bigInt();
    } else {
      const authV3PubSignals = new AuthV3PubSignals().pubSignalsUnmarshal(
        byteEncoder.encode(JSON.stringify(pubSignals))
      );
      gistRoot = authV3PubSignals.GISTRoot.bigInt();
      userId = authV3PubSignals.userID.bigInt();
    }
    const globalStateInfo = await this._stateStorage.getGISTRootInfo(gistRoot, userId);
    if (globalStateInfo.root !== gistRoot) {
      throw new Error(`gist info contains invalid state`);
    }
    if (globalStateInfo.replacedByRoot !== 0n) {
      if (globalStateInfo.replacedAtTimestamp === 0n) {
        throw new Error(`state was replaced, but replaced time unknown`);
      }
      const timeDiff = Date.now() - (0, import_js_iden3_core42.getDateFromUnixTimestamp)(Number(globalStateInfo.replacedAtTimestamp)).getTime();
      if (timeDiff > (opts?.acceptedStateTransitionDelay ?? constants_exports.DEFAULT_AUTH_VERIFY_DELAY)) {
        throw new Error("global state is outdated");
      }
    }
    return true;
  }
  async findCredentialByProofQuery(did, query) {
    const credentials = await this._identityWallet.findOwnedCredentialsByDID(did, query);
    if (!credentials.length) {
      throw new Error(
        VerifiableConstants.ERRORS.PROOF_SERVICE_NO_CREDENTIAL_FOR_IDENTITY_OR_PROFILE
      );
    }
    const credential = query.skipClaimRevocationCheck ? { cred: credentials[0], revStatus: void 0 } : await this._credentialWallet.findNonRevokedCredential(credentials);
    return credential;
  }
};

// src/identity/identity-wallet.ts
var IdentityWallet = class {
  /**
   * Constructs a new instance of the `IdentityWallet` class
   *
   * @param {KMS} _kms - Key Management System that allows signing data with BJJ key
   * @param {IDataStorage} _storage - data storage to access credential / identity / Merkle tree data
   * @param {ICredentialWallet} _credentialWallet - credential wallet instance to quickly access credential CRUD functionality
   * @public
   */
  constructor(_kms, _storage, _credentialWallet, _opts) {
    this._kms = _kms;
    this._storage = _storage;
    this._credentialWallet = _credentialWallet;
    this._opts = _opts;
    this._credentialStatusPublisherRegistry = this.getCredentialStatusPublisherRegistry(_opts);
    this._inputsGenerator = new InputGenerator(this, _credentialWallet, _storage.states);
    this._transactionService = new TransactionService(_storage.states.getRpcProvider());
  }
  _credentialStatusPublisherRegistry;
  _inputsGenerator;
  _transactionService;
  get credentialWallet() {
    return this._credentialWallet;
  }
  getCredentialStatusPublisherRegistry(_opts) {
    if (!_opts?.credentialStatusPublisherRegistry) {
      const registry = new CredentialStatusPublisherRegistry();
      const emptyPublisher = { publish: () => Promise.resolve() };
      registry.register(
        "Iden3ReverseSparseMerkleTreeProof" /* Iden3ReverseSparseMerkleTreeProof */,
        new Iden3SmtRhsCredentialStatusPublisher()
      );
      registry.register("SparseMerkleTreeProof" /* SparseMerkleTreeProof */, emptyPublisher);
      registry.register("Iden3commRevocationStatusV1.0" /* Iden3commRevocationStatusV1 */, emptyPublisher);
      return registry;
    } else {
      return this._opts?.credentialStatusPublisherRegistry;
    }
  }
  async createAuthCoreClaim(revNonce, seed) {
    const keyId = await this._kms.createKeyFromSeed("BJJ" /* BabyJubJub */, seed);
    const pubKeyHex = await this._kms.publicKey(keyId);
    const pubKey = import_js_crypto12.PublicKey.newFromHex(pubKeyHex);
    const schemaHash = import_js_iden3_core43.SchemaHash.authSchemaHash;
    const authClaim = import_js_iden3_core43.Claim.newClaim(
      schemaHash,
      import_js_iden3_core43.ClaimOptions.withIndexDataInts(pubKey.p[0], pubKey.p[1]),
      import_js_iden3_core43.ClaimOptions.withRevocationNonce(BigInt(0))
    );
    authClaim.setRevocationNonce(BigInt(revNonce));
    return { authClaim, pubKey };
  }
  async createAuthBJJCredential(did, pubKey, authClaim, currentState, revocationOpts) {
    const authData = authClaim.getExpirationDate();
    const expiration = authData ? (0, import_js_iden3_core43.getUnixTimestamp)(authData) : 0;
    const request = {
      credentialSchema: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_SCHEMA_JSON_URL,
      type: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_TYPE,
      credentialSubject: {
        x: pubKey.p[0].toString(),
        y: pubKey.p[1].toString()
      },
      subjectPosition: subjectPositionIndex(authClaim.getIdPosition()),
      version: 0,
      expiration,
      revocationOpts: {
        nonce: Number(authClaim.getRevocationNonce()),
        id: revocationOpts.id.replace(/\/$/, ""),
        type: revocationOpts.type,
        issuerState: currentState.hex()
      }
    };
    const authCredentials = await this._credentialWallet.getAllAuthBJJCredentials(did);
    let credential = new W3CCredential();
    if (authCredentials.length === 0) {
      const schema = JSON.parse(VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_SCHEMA_JSON);
      try {
        credential = this._credentialWallet.createCredential(did, request, schema);
      } catch (e) {
        throw new Error(`Error create w3c credential ${e.message}`);
      }
    } else {
      credential = await this.issueCredential(did, request);
    }
    return credential;
  }
  /**
   * {@inheritDoc IIdentityWallet.createIdentity}
   */
  async createIdentity(opts) {
    const tmpIdentifier = opts.seed ? uuid14.v5(import_js_crypto12.Hex.encode((0, import_js_crypto12.sha256)(opts.seed)), uuid14.NIL) : uuid14.v4();
    opts.seed = opts.seed ?? (0, import_js_crypto12.getRandomBytes)(32);
    await this._storage.mt.createIdentityMerkleTrees(tmpIdentifier);
    const revNonce = opts.revocationOpts.nonce ?? 0;
    const { authClaim, pubKey } = await this.createAuthCoreClaim(revNonce, opts.seed);
    const { hi, hv } = authClaim.hiHv();
    await this._storage.mt.addToMerkleTree(tmpIdentifier, 0 /* Claims */, hi, hv);
    const claimsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      tmpIdentifier,
      0 /* Claims */
    );
    const ctr = await claimsTree.root();
    const currentState = (0, import_js_merkletree29.hashElems)([ctr.bigInt(), import_js_merkletree29.ZERO_HASH.bigInt(), import_js_merkletree29.ZERO_HASH.bigInt()]);
    const didType = (0, import_js_iden3_core43.buildDIDType)(
      opts.method || import_js_iden3_core43.DidMethod.Iden3,
      opts.blockchain || import_js_iden3_core43.Blockchain.Polygon,
      opts.networkId || import_js_iden3_core43.NetworkId.Amoy
    );
    const identifier = import_js_iden3_core43.Id.idGenesisFromIdenState(didType, currentState.bigInt());
    const did = import_js_iden3_core43.DID.parseFromId(identifier);
    await this._storage.mt.bindMerkleTreeToNewIdentifier(tmpIdentifier, did.string());
    const oldTreeState = {
      revocationRoot: import_js_merkletree29.ZERO_HASH,
      claimsRoot: ctr,
      state: currentState,
      rootOfRoots: import_js_merkletree29.ZERO_HASH
    };
    const identity = await this._storage.identity.getIdentity(did.string());
    if (!identity) {
      await this._storage.identity.saveIdentity({
        did: did.string(),
        state: currentState,
        isStatePublished: false,
        isStateGenesis: true
      });
    }
    const credentials = await this._credentialWallet.findByQuery({
      credentialSubject: {
        x: {
          $eq: pubKey.p[0].toString()
        },
        y: {
          $eq: pubKey.p[1].toString()
        }
      },
      allowedIssuers: [did.string()]
    });
    if (credentials.length === 1 && credentials[0].credentialStatus.type === opts.revocationOpts.type) {
      return {
        did,
        credential: credentials[0]
      };
    }
    for (let i = 0; i < credentials.length; i++) {
      await this._credentialWallet.remove(credentials[i].id);
    }
    const credential = await this.createAuthBJJCredential(
      did,
      pubKey,
      authClaim,
      currentState,
      opts.revocationOpts
    );
    const index = authClaim.hIndex();
    const { proof } = await claimsTree.generateProof(index, ctr);
    const mtpProof = new Iden3SparseMerkleTreeProof({
      mtp: proof,
      issuerData: {
        id: did,
        state: {
          rootOfRoots: oldTreeState.rootOfRoots,
          revocationTreeRoot: oldTreeState.revocationRoot,
          claimsTreeRoot: ctr,
          value: currentState
        }
      },
      coreClaim: authClaim
    });
    credential.proof = [mtpProof];
    if (!opts.revocationOpts.genesisPublishingDisabled) {
      await this.publishRevocationInfoByCredentialStatusType(did, opts.revocationOpts.type, {
        rhsUrl: opts.revocationOpts.id,
        onChain: opts.revocationOpts.onChain
      });
    }
    await this._credentialWallet.save(credential);
    return {
      did,
      credential
    };
  }
  /**
   * {@inheritDoc IIdentityWallet.createEthereumBasedIdentity}
   */
  async createEthereumBasedIdentity(opts) {
    opts.seed = opts.seed ?? (0, import_js_crypto12.getRandomBytes)(32);
    opts.createBjjCredential = opts.createBjjCredential ?? true;
    let credential;
    const ethSigner = opts.ethSigner;
    if (opts.createBjjCredential && !ethSigner) {
      throw new Error(VerifiableConstants.ERRORS.ID_WALLET_SIGNER_IS_REQUIRED);
    }
    const currentState = import_js_merkletree29.ZERO_HASH;
    const didType = (0, import_js_iden3_core43.buildDIDType)(
      opts.method || import_js_iden3_core43.DidMethod.Iden3,
      opts.blockchain || import_js_iden3_core43.Blockchain.Polygon,
      opts.networkId || import_js_iden3_core43.NetworkId.Amoy
    );
    const keyIdEth = await this._kms.createKeyFromSeed("Secp256k1" /* Secp256k1 */, opts.seed);
    const pubKeyHexEth = (await this._kms.publicKey(keyIdEth)).slice(2);
    const did = buildDIDFromEthPubKey(didType, pubKeyHexEth);
    await this._storage.mt.createIdentityMerkleTrees(did.string());
    await this._storage.identity.saveIdentity({
      did: did.string(),
      state: currentState,
      isStatePublished: false,
      isStateGenesis: true
    });
    if (opts.createBjjCredential && ethSigner) {
      const oldTreeState = {
        revocationRoot: import_js_merkletree29.ZERO_HASH,
        claimsRoot: import_js_merkletree29.ZERO_HASH,
        state: currentState,
        rootOfRoots: import_js_merkletree29.ZERO_HASH
      };
      credential = await this.addBJJAuthCredential(did, oldTreeState, true, ethSigner, opts);
    }
    return {
      did,
      credential
    };
  }
  /** {@inheritDoc IIdentityWallet.getGenesisDIDMetadata} */
  async getGenesisDIDMetadata(did) {
    const identity = await this._storage.identity.getIdentity(did.string());
    if (identity) {
      return { nonce: 0, genesisDID: import_js_iden3_core43.DID.parse(identity.did) };
    }
    const profile = await this._storage.identity.getProfileById(did.string());
    if (!profile) {
      throw new Error(VerifiableConstants.ERRORS.ID_WALLET_PROFILE_OR_IDENTITY_NOT_FOUND);
    }
    return { nonce: profile.nonce, genesisDID: import_js_iden3_core43.DID.parse(profile.genesisIdentifier) };
  }
  /** {@inheritDoc IIdentityWallet.createProfile} */
  async createProfile(did, nonce, verifier, tagsOrOptions) {
    const profileDID = generateProfileDID(did, nonce);
    const isArray = Array.isArray(tagsOrOptions);
    const tags = isArray ? tagsOrOptions : tagsOrOptions?.tags;
    const metadata = !isArray ? tagsOrOptions?.metadata : void 0;
    const { didDocument, encryptionKeyOps } = isArray ? {} : tagsOrOptions ?? {};
    const identityProfiles = await this._storage.identity.getProfilesByGenesisIdentifier(
      did.string()
    );
    const profilesForTagAndVerifier = await this._storage.identity.getProfilesByVerifier(
      verifier,
      tags
    );
    if (profilesForTagAndVerifier.length) {
      throw new Error(VerifiableConstants.ERRORS.ID_WALLET_PROFILE_ALREADY_EXISTS_VERIFIER_TAGS);
    }
    const existingProfileWithNonce = identityProfiles.find((p) => p.nonce == nonce);
    if (existingProfileWithNonce) {
      throw new Error(VerifiableConstants.ERRORS.ID_WALLET_PROFILE_ALREADY_EXISTS);
    }
    let did_doc = didDocument;
    if (encryptionKeyOps?.provider) {
      const vmBuilder = new Jwk2020VerificationMethodBuilder(encryptionKeyOps.provider, {
        alias: encryptionKeyOps.alias
      });
      if (!did_doc) {
        did_doc = (await new DIDDocumentBuilder(profileDID.string()).addVerificationMethod(
          vmBuilder,
          JWK2020_CONTEXT_V1
        )).build();
      } else {
        const vm = await vmBuilder.build(profileDID.string());
        const contextArr = [did_doc["@context"]].flat().filter((c) => typeof c === "string");
        did_doc = {
          ...did_doc,
          verificationMethod: [...did_doc.verificationMethod ?? [], vm],
          "@context": [.../* @__PURE__ */ new Set([...contextArr, JWK2020_CONTEXT_V1])]
        };
      }
    }
    await this._storage.identity.saveProfile({
      id: profileDID.string(),
      nonce,
      genesisIdentifier: did.string(),
      verifier,
      tags,
      did_doc,
      metadata
    });
    return profileDID;
  }
  /**
   *
   * gets profile identity by genesis identifiers
   *
   * @param {string} genesisIdentifier - genesis identifier from which profile has been derived
   * @returns `{Promise<Profile[]>}`
   */
  async getProfilesByDID(did) {
    return this._storage.identity.getProfilesByGenesisIdentifier(did.string());
  }
  /** {@inheritDoc IIdentityWallet.generateKey} */
  async generateKey(keyType) {
    const key = await this._kms.createKeyFromSeed(keyType, (0, import_js_crypto12.getRandomBytes)(32));
    return key;
  }
  /**
   * @deprecated The method should not be used. It returns only one profile per verifier, which can potentially restrict business use cases
   * {@inheritDoc IIdentityWallet.getProfileByVerifier}
   */
  async getProfileByVerifier(verifier) {
    return this._storage.identity.getProfileByVerifier(verifier);
  }
  /** {@inheritDoc IIdentityWallet.getProfilesByVerifier} */
  async getProfilesByVerifier(verifier, tags) {
    return this._storage.identity.getProfilesByVerifier(verifier, tags);
  }
  /** {@inheritDoc IIdentityWallet.getDIDTreeModel} */
  async getDIDTreeModel(did) {
    const didStr = did.string();
    const claimsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      didStr,
      0 /* Claims */
    );
    const revocationTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      didStr,
      1 /* Revocations */
    );
    const rootsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      didStr,
      2 /* Roots */
    );
    const state = (0, import_js_merkletree29.hashElems)([
      (await claimsTree.root()).bigInt(),
      (await revocationTree.root()).bigInt(),
      (await rootsTree.root()).bigInt()
    ]);
    return {
      state,
      claimsTree,
      revocationTree,
      rootsTree
    };
  }
  /** {@inheritDoc IIdentityWallet.generateClaimMtp} */
  async generateCredentialMtp(did, credential, treeState) {
    const coreClaim = await this.getCoreClaimFromCredential(credential);
    return this.generateCoreClaimMtp(did, coreClaim, treeState);
  }
  /** {@inheritDoc IIdentityWallet.generateClaimMtp} */
  async generateCoreClaimMtp(did, coreClaim, treeState) {
    const treesModel = await this.getDIDTreeModel(did);
    const claimsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      did.string(),
      0 /* Claims */
    );
    const claimsRoot = await treesModel.claimsTree.root();
    const rootOfRoots = await treesModel.rootsTree.root();
    const revocationRoot = await treesModel.revocationTree.root();
    const { proof } = await claimsTree.generateProof(
      coreClaim.hIndex(),
      treeState ? treeState.claimsRoot : claimsRoot
    );
    return {
      proof,
      treeState: treeState ?? {
        state: treesModel.state,
        claimsRoot,
        rootOfRoots,
        revocationRoot
      }
    };
  }
  /** {@inheritDoc IIdentityWallet.generateNonRevocationMtp} */
  async generateNonRevocationMtp(did, credential, treeState) {
    const coreClaim = await this.getCoreClaimFromCredential(credential);
    const revNonce = coreClaim.getRevocationNonce();
    return this.generateNonRevocationMtpWithNonce(did, revNonce, treeState);
  }
  /** {@inheritDoc IIdentityWallet.generateNonRevocationMtpWithNonce} */
  async generateNonRevocationMtpWithNonce(did, revNonce, treeState) {
    const treesModel = await this.getDIDTreeModel(did);
    const revocationTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      did.string(),
      1 /* Revocations */
    );
    const claimsRoot = await treesModel.claimsTree.root();
    const rootOfRoots = await treesModel.rootsTree.root();
    const revocationRoot = await treesModel.revocationTree.root();
    const { proof } = await revocationTree.generateProof(
      revNonce,
      treeState ? treeState.revocationRoot : revocationRoot
    );
    return {
      proof,
      treeState: treeState ?? {
        state: treesModel.state,
        claimsRoot,
        rootOfRoots,
        revocationRoot
      }
    };
  }
  /** {@inheritDoc IIdentityWallet.sign} */
  async sign(message, credential) {
    const keyKMSId = getKMSIdByAuthCredential(credential);
    const payload = import_js_crypto12.poseidon.hashBytes(message);
    const signature = await this._kms.sign(keyKMSId, import_js_iden3_core43.BytesHelper.intToBytes(payload));
    return import_js_crypto12.Signature.newFromCompressed(signature);
  }
  /** {@inheritDoc IIdentityWallet.signChallenge} */
  async signChallenge(challenge, credential) {
    const keyKMSId = getKMSIdByAuthCredential(credential);
    const signature = await this._kms.sign(keyKMSId, import_js_iden3_core43.BytesHelper.intToBytes(challenge));
    return import_js_crypto12.Signature.newFromCompressed(signature);
  }
  /** {@inheritDoc IIdentityWallet.issueCredential} */
  async issueCredential(issuerDID, req, opts) {
    req.revocationOpts.id = req.revocationOpts.id.replace(/\/$/, "");
    let schema;
    const loader = opts?.documentLoader ?? cacheLoader(opts);
    try {
      schema = (await loader(req.credentialSchema)).document;
    } catch (e) {
      throw new Error(`can't load credential schema ${req.credentialSchema}`);
    }
    const jsonSchema = schema;
    let credential = new W3CCredential();
    const issuerRoots = await this.getDIDTreeModel(issuerDID);
    req.revocationOpts.issuerState = issuerRoots.state.hex();
    req.revocationOpts.nonce = typeof req.revocationOpts.nonce === "number" ? req.revocationOpts.nonce : new DataView((0, import_js_crypto12.getRandomBytes)(16).buffer).getUint32(0, false);
    req.subjectPosition = req.subjectPosition ?? "index" /* Index */;
    try {
      credential = this._credentialWallet.createCredential(issuerDID, req, jsonSchema);
      const encodedCred = byteEncoder.encode(JSON.stringify(credential));
      const encodedSchema = byteEncoder.encode(JSON.stringify(schema));
      await new JsonSchemaValidator().validate(encodedCred, encodedSchema);
    } catch (e) {
      throw new Error(`Error create w3c credential ${e.message}`);
    }
    const { authCredential: issuerAuthBJJCredential } = await this.getActualAuthCredential(
      issuerDID
    );
    const coreClaimOpts = {
      revNonce: req.revocationOpts.nonce,
      subjectPosition: req.subjectPosition,
      merklizedRootPosition: req.merklizedRootPosition ?? "" /* None */,
      updatable: false,
      version: 0,
      merklizeOpts: { ...opts, documentLoader: loader }
    };
    const coreClaim = await credential.toCoreClaim(coreClaimOpts);
    const { hi, hv } = coreClaim.hiHv();
    const coreClaimHash = import_js_crypto12.poseidon.hash([hi, hv]);
    const signature = await this.signChallenge(coreClaimHash, issuerAuthBJJCredential);
    if (!issuerAuthBJJCredential.proof) {
      throw new Error(
        VerifiableConstants.ERRORS.ID_WALLET_ISSUER_AUTH_BJJ_CRED_MUST_HAVE_ANY_PROOF
      );
    }
    const mtpAuthBJJProof = issuerAuthBJJCredential.getIden3SparseMerkleTreeProof();
    if (!mtpAuthBJJProof) {
      throw new Error(
        VerifiableConstants.ERRORS.ID_WALLET_ISSUER_AUTH_BJJ_CRED_MUST_HAVE_MTP_PROOF
      );
    }
    const sigProof = new BJJSignatureProof2021({
      issuerData: {
        id: issuerDID,
        state: mtpAuthBJJProof.issuerData.state,
        authCoreClaim: mtpAuthBJJProof.coreClaim,
        mtp: mtpAuthBJJProof.mtp,
        credentialStatus: issuerAuthBJJCredential.credentialStatus
      },
      coreClaim,
      signature
    });
    credential.proof = [sigProof];
    return credential;
  }
  /** {@inheritDoc IIdentityWallet.getActualAuthCredential} */
  async getActualAuthCredential(did, treeStateInfo) {
    const authCredentials = await this._credentialWallet.getAllAuthBJJCredentials(did);
    for (let i = 0; i < authCredentials.length; i++) {
      const incProof = await this.generateCredentialMtp(did, authCredentials[i], treeStateInfo);
      if (!incProof.proof.existence) {
        continue;
      }
      const nonRevProof = await this.generateNonRevocationMtp(
        did,
        authCredentials[i],
        treeStateInfo
      );
      if (!nonRevProof.proof.existence) {
        return {
          authCredential: authCredentials[i],
          incProof,
          nonRevProof
        };
      }
    }
    throw new Error(VerifiableConstants.ERRORS.NO_AUTH_CRED_FOUND);
  }
  /** {@inheritDoc IIdentityWallet.revokeCredential} */
  async revokeCredential(issuerDID, credential) {
    const issuerTree = await this.getDIDTreeModel(issuerDID);
    const coreClaim = await this.getCoreClaimFromCredential(credential);
    if (!coreClaim) {
      throw new Error(VerifiableConstants.ERRORS.ID_WALLET_CORE_CLAIM_REQUIRED_IN_ANY_PROOF);
    }
    const nonce = coreClaim.getRevocationNonce();
    await issuerTree.revocationTree.add(nonce, BigInt(0));
    return Number(BigInt.asUintN(64, nonce));
  }
  /** {@inheritDoc IIdentityWallet.addCredentialsToMerkleTree} */
  async addCredentialsToMerkleTree(credentials, issuerDID) {
    const oldIssuerTree = await this.getDIDTreeModel(issuerDID);
    let claimsRoot = await oldIssuerTree.claimsTree.root();
    let rootOfRoots = await oldIssuerTree.rootsTree.root();
    let revocationRoot = await oldIssuerTree.revocationTree.root();
    const oldTreeState = {
      state: oldIssuerTree.state,
      claimsRoot,
      revocationRoot,
      rootOfRoots
    };
    for (let index = 0; index < credentials.length; index++) {
      const credential = credentials[index];
      const coreClaim = credential.getCoreClaimFromProof("BJJSignature2021" /* BJJSignature */);
      if (!coreClaim) {
        throw new Error(VerifiableConstants.ERRORS.ID_WALLET_CORE_CLAIM_REQUIRED_IN_SIG_PROOF);
      }
      await this._storage.mt.addToMerkleTree(
        issuerDID.string(),
        0 /* Claims */,
        coreClaim.hIndex(),
        coreClaim.hValue()
      );
    }
    const newIssuerTreeState = await this.getDIDTreeModel(issuerDID);
    const claimTreeRoot = await newIssuerTreeState.claimsTree.root();
    await this._storage.mt.addToMerkleTree(
      issuerDID.string(),
      2 /* Roots */,
      claimTreeRoot.bigInt(),
      BigInt(0)
    );
    const newIssuerTreeStateWithROR = await this.getDIDTreeModel(issuerDID);
    claimsRoot = await newIssuerTreeStateWithROR.claimsTree.root();
    rootOfRoots = await newIssuerTreeStateWithROR.rootsTree.root();
    revocationRoot = await newIssuerTreeStateWithROR.revocationTree.root();
    return {
      credentials,
      newTreeState: {
        state: newIssuerTreeStateWithROR.state,
        claimsRoot,
        rootOfRoots,
        revocationRoot
      },
      oldTreeState
    };
  }
  /** {@inheritDoc IIdentityWallet.generateIden3SparseMerkleTreeProof} */
  // treeState -  optional, if it is not passed proof of claim inclusion will be generated on the latest state in the tree.
  async generateIden3SparseMerkleTreeProof(issuerDID, credentials, txId, blockNumber, blockTimestamp, treeState, opts) {
    for (let index = 0; index < credentials.length; index++) {
      const credential = credentials[index];
      const coreClaim = credential.getCoreClaimFromProof("BJJSignature2021" /* BJJSignature */) || await credential.toCoreClaim(opts);
      if (!coreClaim) {
        throw new Error(VerifiableConstants.ERRORS.ID_WALLET_CORE_CLAIM_REQUIRED_IN_SIG_PROOF);
      }
      const mtpWithProof = await this.generateCoreClaimMtp(issuerDID, coreClaim, treeState);
      const mtpProof = new Iden3SparseMerkleTreeProof({
        mtp: mtpWithProof.proof,
        issuerData: {
          id: issuerDID,
          state: {
            claimsTreeRoot: mtpWithProof.treeState.claimsRoot,
            revocationTreeRoot: mtpWithProof.treeState.revocationRoot,
            rootOfRoots: mtpWithProof.treeState.rootOfRoots,
            value: mtpWithProof.treeState.state,
            txId,
            blockNumber,
            blockTimestamp
          }
        },
        coreClaim
      });
      if (Array.isArray(credentials[index].proof)) {
        credentials[index].proof.push(mtpProof);
      } else {
        credentials[index].proof = credentials[index].proof ? [credentials[index].proof, mtpProof] : [mtpProof];
      }
    }
    return credentials;
  }
  /** {@inheritDoc IIdentityWallet.publishSpecificStateToRHS} */
  async publishSpecificStateToRHS(treeModel, rhsURL, revokedNonces) {
    await pushHashesToRHS(treeModel.state, treeModel, rhsURL, revokedNonces);
  }
  /** {@inheritDoc IIdentityWallet.publishStateToRHS} */
  async publishStateToRHS(issuerDID, rhsURL, revokedNonces) {
    const treeState = await this.getDIDTreeModel(issuerDID);
    await pushHashesToRHS(
      treeState.state,
      {
        revocationTree: treeState.revocationTree,
        claimsTree: treeState.claimsTree,
        state: treeState.state,
        rootsTree: treeState.rootsTree
      },
      rhsURL,
      revokedNonces
    );
  }
  /** {@inheritDoc IIdentityWallet.publishRevocationInfoByCredentialStatusType} */
  async publishRevocationInfoByCredentialStatusType(issuerDID, credentialStatusType, opts) {
    const rhsPublishers = this._credentialStatusPublisherRegistry.get(credentialStatusType);
    if (!rhsPublishers) {
      throw new Error(
        `there is no registered publisher to save  hash is not registered for ${credentialStatusType} is not registered`
      );
    }
    let nodes = [];
    const tree = opts?.treeModel ?? await this.getDIDTreeModel(issuerDID);
    nodes = await getNodesRepresentation(
      opts?.revokedNonces ?? [],
      {
        revocationTree: tree.revocationTree,
        claimsTree: tree.claimsTree,
        state: tree.state,
        rootsTree: tree.rootsTree
      },
      tree.state
    );
    if (!nodes.length) {
      return;
    }
    const rhsPublishersTask = rhsPublishers.map(
      (publisher) => publisher.publish({ nodes, ...opts, credentialStatusType, issuerDID })
    );
    await Promise.all(rhsPublishersTask);
  }
  async getCoreClaimFromCredential(credential) {
    const coreClaimFromSigProof = credential.getCoreClaimFromProof("BJJSignature2021" /* BJJSignature */);
    const coreClaimFromMtpProof = credential.getCoreClaimFromProof(
      "Iden3SparseMerkleTreeProof" /* Iden3SparseMerkleTreeProof */
    );
    if (coreClaimFromMtpProof && coreClaimFromSigProof && coreClaimFromMtpProof.hex() !== coreClaimFromSigProof.hex()) {
      throw new Error(VerifiableConstants.ERRORS.ID_WALLET_CORE_CLAIM_MISMATCH);
    }
    if (!coreClaimFromMtpProof && !coreClaimFromSigProof) {
      throw new Error(VerifiableConstants.ERRORS.ID_WALLET_CORE_CLAIM_IS_NOT_SET);
    }
    const coreClaim = coreClaimFromMtpProof ?? coreClaimFromSigProof;
    return coreClaim;
  }
  async findOwnedCredentialsByDID(did, query) {
    const credentials = await this._credentialWallet.findByQuery(query);
    if (!credentials.length) {
      throw new Error(VerifiableConstants.ERRORS.ID_WALLET_NO_CREDENTIAL_SATISFIED_QUERY);
    }
    const { genesisDID } = await this.getGenesisDIDMetadata(did);
    const profiles = await this.getProfilesByDID(genesisDID);
    return credentials.filter((cred) => {
      const credentialSubjectId = cred.credentialSubject["id"];
      return credentialSubjectId == genesisDID.string() || profiles.some((p) => {
        return p.id === credentialSubjectId;
      });
    });
  }
  /** {@inheritDoc IIdentityWallet.updateIdentityState} */
  async updateIdentityState(issuerDID, published, treeState) {
    const latestTreeState = await this.getDIDTreeModel(issuerDID);
    await this._storage.identity.saveIdentity({
      did: issuerDID.string(),
      state: treeState?.state ?? latestTreeState.state,
      isStatePublished: published,
      isStateGenesis: false
    });
  }
  /** {@inheritdoc IIdentityWallet.transitState} */
  async transitState(did, oldTreeState, isOldStateGenesis, ethSigner, prover) {
    const newTreeModel = await this.getDIDTreeModel(did);
    const claimsRoot = await newTreeModel.claimsTree.root();
    const rootOfRoots = await newTreeModel.rootsTree.root();
    const revocationRoot = await newTreeModel.revocationTree.root();
    const newTreeState = {
      revocationRoot,
      claimsRoot,
      state: newTreeModel.state,
      rootOfRoots
    };
    const userId = import_js_iden3_core43.DID.idFromDID(did);
    let proof;
    const isEthIdentity = isEthereumIdentity(did);
    let txId;
    if (!isEthIdentity) {
      if (!prover) {
        throw new Error(VerifiableConstants.ERRORS.ID_WALLET_PROVER_IS_REQUIRED);
      }
      const authInfo = await this._inputsGenerator.prepareAuthBJJCredential(did, oldTreeState);
      const challenge = import_js_crypto12.Poseidon.hash([oldTreeState.state.bigInt(), newTreeState.state.bigInt()]);
      const signature = await this.signChallenge(challenge, authInfo.credential);
      const circuitInputs = new StateTransitionInputs();
      circuitInputs.id = userId;
      circuitInputs.signature = signature;
      circuitInputs.isOldStateGenesis = isOldStateGenesis;
      const authClaimIncProofNewState = await this.generateCredentialMtp(
        did,
        authInfo.credential,
        newTreeState
      );
      circuitInputs.newTreeState = authClaimIncProofNewState.treeState;
      circuitInputs.authClaimNewStateIncProof = authClaimIncProofNewState.proof;
      circuitInputs.oldTreeState = oldTreeState;
      circuitInputs.authClaim = {
        claim: authInfo.coreClaim,
        incProof: authInfo.incProof,
        nonRevProof: authInfo.nonRevProof
      };
      const inputs = circuitInputs.inputsMarshal();
      proof = await prover.generate(inputs, "stateTransition" /* StateTransition */);
      txId = await this._storage.states.publishState(proof, ethSigner);
    } else {
      const oldUserState = oldTreeState.state;
      const newUserState = newTreeState.state;
      const userStateTransitionInfo = {
        userId,
        oldUserState,
        newUserState,
        isOldStateGenesis,
        methodId: BigInt(1),
        methodParams: "0x"
      };
      txId = await this._storage.states.publishStateGeneric(ethSigner, userStateTransitionInfo);
    }
    await this.updateIdentityState(did, true, newTreeState);
    return txId;
  }
  async getAuthBJJCredential(did, oldTreeState, {
    nonce,
    seed,
    id,
    type
  }) {
    const { authClaim, pubKey } = await this.createAuthCoreClaim(nonce, seed);
    const { hi, hv } = authClaim.hiHv();
    await this._storage.mt.addToMerkleTree(did.string(), 0 /* Claims */, hi, hv);
    const claimsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      did.string(),
      0 /* Claims */
    );
    const currentState = (0, import_js_merkletree29.hashElems)([
      (await claimsTree.root()).bigInt(),
      oldTreeState.revocationRoot.bigInt(),
      oldTreeState.rootOfRoots.bigInt()
    ]);
    return this.createAuthBJJCredential(did, pubKey, authClaim, currentState, {
      id,
      type
    });
  }
  /** {@inheritdoc IIdentityWallet.addBJJAuthCredential} */
  async addBJJAuthCredential(did, oldTreeState, isOldStateGenesis, ethSigner, opts, prover) {
    opts.seed = opts.seed ?? (0, import_js_crypto12.getRandomBytes)(32);
    opts.revocationOpts.nonce = opts.revocationOpts.nonce ?? (isOldStateGenesis ? 0 : opts.revocationOpts.nonce ?? new DataView((0, import_js_crypto12.getRandomBytes)(12).buffer).getUint32(0));
    const credential = await this.getAuthBJJCredential(did, oldTreeState, {
      nonce: opts.revocationOpts.nonce,
      seed: opts.seed,
      id: opts.revocationOpts.id,
      type: opts.revocationOpts.type
    });
    const addMtpToCredAndPublishRevState = async () => {
      const { receipt, block } = await this._transactionService.getTransactionReceiptAndBlock(txId);
      const credsWithIden3MTPProof = await this.generateIden3SparseMerkleTreeProof(
        did,
        [credential],
        txId,
        receipt?.blockNumber,
        block?.timestamp,
        void 0,
        {
          revNonce: opts.revocationOpts.nonce ?? 0,
          subjectPosition: "" /* None */,
          merklizedRootPosition: "" /* None */,
          updatable: false,
          version: 0,
          merklizeOpts: { documentLoader: cacheLoader() }
        }
      );
      await this._credentialWallet.saveAll(credsWithIden3MTPProof);
      await this.publishRevocationInfoByCredentialStatusType(did, opts.revocationOpts.type, {
        rhsUrl: opts.revocationOpts.id,
        onChain: opts.revocationOpts.onChain
      });
      return credsWithIden3MTPProof[0];
    };
    let txId = "";
    let attempt = 2;
    do {
      try {
        txId = await this.transitState(did, oldTreeState, isOldStateGenesis, ethSigner, prover);
        break;
      } catch (err) {
        console.warn(
          `Error while transiting state, retrying state transition, attempt: ${attempt}`,
          err
        );
      }
    } while (--attempt);
    if (!txId) {
      const oldTransitStateInfoJson = JSON.stringify(
        {
          claimsRoot: oldTreeState.claimsRoot.hex(),
          revocationRoot: oldTreeState.revocationRoot.hex(),
          rootOfRoots: oldTreeState.rootOfRoots.hex(),
          state: oldTreeState.state.hex(),
          isOldStateGenesis,
          credentialId: credential.id,
          did: did.string()
        },
        null,
        2
      );
      await this._credentialWallet.save(credential);
      throw new Error(`Error publishing state, info to publish: ${oldTransitStateInfoJson}`);
    }
    return addMtpToCredAndPublishRevState();
  }
};

// src/index.ts
var core = __toESM(require("@iden3/js-iden3-core"), 1);
var jsonLDMerklizer = __toESM(require("@iden3/js-jsonld-merklization"), 1);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AbstractMessageHandler,
  AbstractPrivateKeyStore,
  AgentResolver,
  AnonCryptPacker,
  AtomicQueryMTPV2Inputs,
  AtomicQueryMTPV2OnChainInputs,
  AtomicQueryMTPV2OnChainPubSignals,
  AtomicQueryMTPV2PubSignals,
  AtomicQuerySigV2Inputs,
  AtomicQuerySigV2OnChainCircuitInputs,
  AtomicQuerySigV2OnChainInputs,
  AtomicQuerySigV2OnChainPubSignals,
  AtomicQuerySigV2PubSignals,
  AtomicQueryV3Inputs,
  AtomicQueryV3OnChainInputs,
  AtomicQueryV3OnChainPubSignals,
  AtomicQueryV3PubSignals,
  AuthHandler,
  AuthMethod,
  AuthV2Inputs,
  AuthV2PubSignals,
  AuthV3Inputs,
  AuthV3PubSignals,
  BJJSignatureProof2021,
  BaseConfig,
  BjjProvider,
  BrowserDataSource,
  CACHE_KEY_VERSION,
  CircuitClaim,
  CircuitError,
  CircuitId,
  CircuitLoadMode,
  CircuitStorage,
  ContractRequestHandler,
  CredentialOfferStatus,
  CredentialProposalHandler,
  CredentialStatusPublisherRegistry,
  CredentialStatusResolverRegistry,
  CredentialStatusType,
  CredentialStorage,
  CredentialWallet,
  DEFAULT_CACHE_MAX_SIZE,
  DEFAULT_DID_CONTEXT,
  DIDDocumentBuilder,
  DIDDocumentJSONSchema,
  DIDDocumentSignature,
  DataPrepareHandlerFunc,
  DefaultKMSKeyResolver,
  DefaultZKPPacker,
  DidDocumentCredentialStatusResolver,
  DidResolverStateReadonlyStorage,
  DiscoverFeatureQueryType,
  DiscoveryProtocolFeatureType,
  DiscoveryProtocolHandler,
  DisplayMethodType,
  Ed25519Provider,
  ErrorEmptyAuthClaimNonRevProof,
  ErrorEmptyAuthClaimProof,
  ErrorEmptyChallengeSignature,
  ErrorEmptyClaimNonRevProof,
  ErrorEmptyClaimProof,
  ErrorEmptyClaimSignature,
  ErrorEmptyIssuerAuthClaimNonRevProof,
  ErrorEmptyIssuerAuthClaimProof,
  ErrorUserStateInRelayClaimProof,
  EthStateStorage,
  FSCircuitStorage,
  FetchHandler,
  FilterQuery,
  FunctionSignatures,
  Iden3OnchainSmtCredentialStatusPublisher,
  Iden3SmtRhsCredentialStatusPublisher,
  Iden3SparseMerkleTreeProof,
  IdentityStorage,
  IdentityWallet,
  InMemoryDataSource,
  InMemoryMerkleTreeStorage,
  InMemoryPrivateKeyStore,
  InMemoryProofStorage,
  IndexedDBDataSource,
  IndexedDBPrivateKeyStore,
  InputGenerator,
  IssuerResolver,
  JSON_SCHEMA_VALIDATORS_REGISTRY,
  JWK2020_CONTEXT_V1,
  JWSPacker,
  JoseService,
  JsonSchemaValidator,
  Jwk2020VerificationMethodBuilder,
  KMS,
  KmsKeyType,
  LDParser,
  LinkedMultiQueryInputs,
  LinkedMultiQueryPubSignals,
  LocalStoragePrivateKeyStore,
  MERKLE_TREE_TYPES,
  MerkleTreeIndexedDBStorage,
  MerkleTreeLocalStorage,
  MerkleTreeType,
  MerklizedRootPosition,
  MessageBus,
  MessageHandler,
  NativeProver,
  OnChainResolver,
  OnChainRevocationStorage,
  OnChainZKPVerifier,
  OnchainIssuer,
  Operators,
  P384Provider,
  PROTOCOL_CONSTANTS,
  PackageManager,
  Parser,
  PaymentFeatures,
  PaymentHandler,
  PaymentRequestDataType,
  PaymentType,
  PlainPacker,
  ProofNode,
  ProofPurpose,
  ProofService,
  ProofType,
  PubSignalsVerifier,
  Query,
  QueryOperators,
  RHSResolver,
  RefreshHandler,
  RefreshServiceType,
  RevocationStatusHandler,
  RsaOAEPKeyProvider,
  SDK_EVENTS,
  SOLANA_CHAIN_REF,
  Scalar,
  SearchError,
  Sec256k1Provider,
  SolanaNativePaymentRequest,
  SolanaNativePaymentSchema,
  SolanaPaymentInstruction,
  SolanaPaymentInstructionSchema,
  SolanaSplPaymentRequest,
  SolanaSplPaymentSchema,
  StandardJSONCredentialsQueryFilter,
  StateTransitionInputs,
  StateTransitionPubSignals,
  SubjectPosition,
  SupportedCurrencies,
  SupportedDataFormat,
  SupportedPaymentProofType,
  TransactionService,
  ValueProof,
  Vector,
  VerifiableConstants,
  VerificationHandlerFunc,
  W3CCredential,
  XSDNS,
  ZKPPacker,
  acceptHasProvingMethodAlg,
  availableTypesOperators,
  base58ToBytes,
  base64ToBytes,
  base64UrlToBytes,
  bigIntArrayToStringArray,
  bigIntCompare,
  buildAccept,
  buildAcceptFromProvingMethodAlg,
  buildDIDFromEthAddress,
  buildDIDFromEthPubKey,
  buildEvmPayment,
  buildFieldPath,
  buildSolanaPayment,
  buildTreeState,
  buildVerifierId,
  byteDecoder,
  byteEncoder,
  bytesToBase58,
  bytesToBase64,
  bytesToBase64url,
  bytesToHex,
  cacheLoader,
  calcChallengeAuth,
  calculateCoreSchemaHash,
  calculateGroupId,
  calculateMultiRequestId,
  calculateQueryHashV2,
  calculateQueryHashV3,
  calculateRequestId,
  checkCircuitOperator,
  checkCircuitQueriesLength,
  checkDataInField,
  checkQueryRequest,
  circuitValidator,
  comparatorOptions,
  core,
  createAuthorizationRequest,
  createAuthorizationRequestWithMessage,
  createDiscoveryFeatureDiscloseMessage,
  createDiscoveryFeatureQueryMessage,
  createInMemoryCache,
  createMerkleTreeMetaInfo,
  createPayment,
  createPaymentRequest,
  createProblemReport,
  createProblemReportMessage,
  createProposal,
  createProposalRequest,
  createSchemaHash,
  createVerifiablePresentation,
  createZkpRequestCacheKey,
  credentialSubjectKey,
  dataFillsSlot,
  decodeBase64url,
  defaultEthConnectionConfig,
  defaultMTLevels,
  defaultMTLevelsClaim,
  defaultMTLevelsOnChain,
  defaultProvingMethodAlg,
  defaultRSAOaepKmsIdPathGeneratingFunction,
  defaultValueArraySize,
  defineMerklizedRootPosition,
  encodeBase64url,
  existenceToInt,
  extractProof,
  extractPublicKeyBytes,
  factoryComparer,
  fieldToByteArray,
  fieldValueFromVerifiablePresentation,
  fillCoreClaimSlot,
  fillSlot,
  findCredentialType,
  findValue,
  generateProfileDID,
  getChallengeFromEthAddress,
  getCircuitIdsWithSubVersions,
  getERC20Decimals,
  getFieldSlotIndex,
  getFirstSupportedProfile,
  getGroupedCircuitIdsWithSubVersions,
  getIsGenesisStateById,
  getKMSIdByAuthCredential,
  getNodeAuxValue,
  getNodesRepresentation,
  getOperatorNameByValue,
  getPermitSignature,
  getProperties,
  getProvingMethodAlgFromJWZ,
  getRecipientsJWKs,
  getSerializationAttrFromContext,
  getSerializationAttrFromParsedContext,
  getUnmarshallerForCircuitId,
  getUserDIDFromCredential,
  hexToBytes,
  initDefaultPackerOptions,
  isAuthCircuit,
  isEthereumIdentity,
  isGenesisState,
  isGenesisStateId,
  isIdentityDoesNotExistError,
  isIssuerGenesis,
  isRootDoesNotExistError,
  isStateDoesNotExistError,
  isValidOperation,
  jsonLDMerklizer,
  keyPath,
  mergeObjects,
  notification,
  packEthIdentityProof,
  packMetadatas,
  packZkpProof,
  parseAcceptProfile,
  parseCoreClaimSlots,
  parseCredentialSubject,
  parseQueriesMetadata,
  parseQueryMetadata,
  parseSerializationAttr,
  prepareCircuitArrayValues,
  prepareSiblingsStr,
  prepareZkpProof,
  processProofAuth,
  processProofResponse,
  processZeroKnowledgeProofRequests,
  pushHashesToRHS,
  resolveDIDDocumentAuth,
  resolveDidDocument,
  resolvePath,
  resolveVerificationMethods,
  serializeSolanaPaymentInstruction,
  strMTHex,
  stringByPath,
  subjectPositionIndex,
  swapEndianness,
  toClaimNonRevStatus,
  toGISTProof,
  toPublicKeyJwk,
  toRevocationStatus,
  toTxDataArgs,
  transformQueryValueToBigInts,
  userStateError,
  validateDIDDocumentAuth,
  validateDisclosureNativeSDSupport,
  validateDisclosureV2Circuit,
  validateEmptyCredentialSubjectNoopNativeSupport,
  validateEmptyCredentialSubjectV2Circuit,
  validateOperators,
  validateTreeState,
  verifyEIP712TypedData,
  verifyExpiresTime,
  verifyFieldValueInclusionNativeExistsSupport,
  verifyFieldValueInclusionV2,
  verifyIden3SolanaPaymentRequest,
  witnessBuilder
});
//# sourceMappingURL=index.cjs.map