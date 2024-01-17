import { KMS, KmsKeyId, KmsKeyType } from '../kms';
import {
  Blockchain,
  buildDIDType,
  BytesHelper,
  Claim,
  ClaimOptions,
  DID,
  DidMethod,
  getUnixTimestamp,
  Id,
  NetworkId,
  SchemaHash
} from '@iden3/js-iden3-core';
import { poseidon, PublicKey, sha256, Signature, Hex, getRandomBytes } from '@iden3/js-crypto';
import { hashElems, ZERO_HASH } from '@iden3/js-merkletree';

import { generateProfileDID, subjectPositionIndex } from './common';
import * as uuid from 'uuid';
import {
  JSONSchema,
  Parser,
  CoreClaimOptions,
  JsonSchemaValidator,
  cacheLoader
} from '../schema-processor';
import { IDataStorage, MerkleTreeType, Profile } from '../storage';
import {
  VerifiableConstants,
  BJJSignatureProof2021,
  MerklizedRootPosition,
  SubjectPosition,
  W3CCredential,
  MerkleTreeProofWithTreeState,
  Iden3SparseMerkleTreeProof,
  ProofType,
  CredentialStatusType,
  ProofQuery
} from '../verifiable';
import {
  CredentialRequest,
  getKMSIdByAuthCredential,
  getNodesRepresentation,
  ICredentialWallet,
  ProofNode,
  pushHashesToRHS,
  TreesModel
} from '../credentials';
import { TreeState } from '../circuits';
import { byteEncoder } from '../utils';
import { Options } from '@iden3/js-jsonld-merklization';
import { TransactionReceipt } from 'ethers';
import {
  CredentialStatusPublisherRegistry,
  Iden3SmtRhsCredentialStatusPublisher
} from '../credentials/status/credential-status-publisher';

/**
 * DID creation options
 * seed - seed to generate BJJ key pair
 * revocationOpts -

 * @type IdentityCreationOptions
 */
export type IdentityCreationOptions = {
  method?: string;
  blockchain?: string;
  networkId?: string;
  revocationOpts: {
    id: string;
    type: CredentialStatusType;
    nonce?: number;
    onChain?: {
      txCallback?: (tx: TransactionReceipt) => Promise<void>;
    };
  };
  seed?: Uint8Array;
};

/**
 * Options for RevocationInfoOptions.
 */
export type RevocationInfoOptions = {
  revokedNonces?: number[];
  treeModel?: TreesModel;
  rhsUrl?: string;
  onChain?: {
    txCallback?: (tx: TransactionReceipt) => Promise<void>;
  };
};

/**
 *  Proof creation result
 *
 * @public
 * @interface   Iden3ProofCreationResult
 */
export interface Iden3ProofCreationResult {
  credentials: W3CCredential[];
  oldTreeState: TreeState;
  newTreeState: TreeState;
}
/**
 * Interface for IdentityWallet
 * @public
 */
export interface IIdentityWallet {
  /**
   * Create Identity creates Auth BJJ credential,
   * Merkle trees for claims, revocations and root of roots,
   * adds auth BJJ credential to claims tree and generates mtp of inclusion
   * based on the resulting state it provides an identifier in DID form.
   *
   * @param {IdentityCreationOptions} opts - default is did:iden3:polygon:mumbai** with generated key.
   * @returns `Promise<{ did: DID; credential: W3CCredential }>` - returns did and Auth BJJ credential
   * @public
   */

  createIdentity(opts: IdentityCreationOptions): Promise<{ did: DID; credential: W3CCredential }>;

  /**
   * Creates profile based on genesis identifier
   *
   * @param {DID} did - identity to derive profile from
   * @param {number} nonce - unique integer number to generate a profile
   * @param {string} verifier - verifier identity/alias in a string from
   * @returns `Promise<DID>` - profile did
   */
  createProfile(did: DID, nonce: number, verifier: string): Promise<DID>;

  /**
   * Generates a new key
   *
   * @param {KmsKeyType} keyType - supported key type by KMS
   * @returns `Promise<KmsKeyId>` - creates a new key BJJ or ECDSA
   */
  generateKey(keyType: KmsKeyType): Promise<KmsKeyId>;

  /**
   * Issues new credential from issuer according to the claim request
   *
   * @param {DID} issuerDID - issuer identity
   * @param {CredentialRequest} req - claim request
   * @returns `Promise<W3CCredential>` - returns created W3CCredential
   */
  issueCredential(issuerDID: DID, req: CredentialRequest, opts?: Options): Promise<W3CCredential>;

  /**
   * Gets a tree model for given did that includes claims tree, revocation tree, the root of roots tree and calculated state hash
   *
   * @param {DID} did - did which trees info we need to receive
   * @returns `Promise<TreesModel>`
   * */
  getDIDTreeModel(did: DID): Promise<TreesModel>;

  /**
   * Generates proof of credential inclusion / non-inclusion to the given claims tree
   * and its root or to the current root of the Claims tree in the given Merkle tree storage.
   *
   * @param {DID} did - issuer did
   * @param {W3CCredential} credential - credential to generate mtp
   * @param {TreeState} [treeState] - tree state when to generate a proof
   * @returns `Promise<MerkleTreeProofWithTreeState>` - MerkleTreeProof and TreeState on which proof has been generated
   */
  generateCredentialMtp(
    did: DID,
    credential: W3CCredential,
    treeState?: TreeState
  ): Promise<MerkleTreeProofWithTreeState>;

  /**
   * Generates proof of credential revocation nonce inclusion / non-inclusion to the given revocation tree
   * and its root or to the current root of the Revocation tree in the given Merkle tree storage.
   *
   * @param {DID} did
   * @param {W3CCredential} credential
   * @param {TreeState} [treeState]
   * @returns `Promise<MerkleTreeProofWithTreeState>` -  MerkleTreeProof and TreeState on which proof has been generated
   */
  generateNonRevocationMtp(
    did: DID,
    credential: W3CCredential,
    treeState?: TreeState
  ): Promise<MerkleTreeProofWithTreeState>;

  /**
   * Signs a payload of arbitrary size with an Auth BJJ Credential that identifies a key for signing.
   *
   * @param {Uint8Array} payload
   * @param {W3CCredential} credential - Auth BJJ Credential
   * @returns `Promise<Signature>`-  the signature object with R8 and S params
   */
  sign(payload: Uint8Array, credential: W3CCredential): Promise<Signature>;

  /**
   * Signs a big integer with an Auth BJJ Credential that identifies a key for signing.
   *
   *
   * @param {bigint} payload - big number in Field
   * @param {W3CCredential} credential - Auth BJJ credential
   * @returns `Promise<Signature>` - the signature object with R8 and S params
   */
  signChallenge(payload: bigint, credential: W3CCredential): Promise<Signature>;

  /**
   *
   *
   * @param {DID} issuerDID  - identifier of the issuer
   * @param {W3CCredential} credential - credential to revoke
   * @returns `Promise<number>` a revocation nonce of credential
   */
  revokeCredential(issuerDID: DID, credential: W3CCredential): Promise<number>;

  /**
   * Generate Iden3SparseMerkleTree proof of inclusion to issuer state of specific credentials
   *
   * @param {DID} issuerDID - issuer did
   * @param {W3CCredential[]} credentials - list of verifiable credentials to generate a proof
   * @param {string} txId - transaction hash in which state transition has been done
   * @param {number} [blockNumber] - block number in which state transition has been done
   * @param {number} [blockTimestamp] - block timestamp in which state transition has been done
   * @returns `Promise<W3CCredential[]>` credentials with an Iden3SparseMerkleTreeProof
   */
  generateIden3SparseMerkleTreeProof(
    issuerDID: DID,
    credentials: W3CCredential[],
    txId: string,
    blockNumber?: number,
    blockTimestamp?: number
  ): Promise<W3CCredential[]>;

  /**
   * Adds verifiable credentials to issuer Claims Merkle tree
   *
   * @param {W3CCredential[]} credentials - credentials to include in the claims tree
   * @param {DID} issuerDID - issuer did
   * @returns `Promise<Iden3ProofCreationResult>`- old tree state and tree state with included credentials
   */
  addCredentialsToMerkleTree(
    credentials: W3CCredential[],
    issuerDID: DID
  ): Promise<Iden3ProofCreationResult>;

  /**
   * Publishes issuer state to the reverse hash service by given URL
   *
   * @deprecated use publishRevocationInfoByCredentialStatusType instead with the same arguments in opts
   * @param {DID} issuerDID - issuer did
   * @param {string} rhsURL - reverse hash service URL
   * @param {number[]} [revokedNonces] - revoked nonces for the period from the last published
   * @returns `Promise<void>`
   */
  publishStateToRHS(
    issuerDID: DID,
    rhsURL: string,
    revokedNonces?: number[],
    opts?: object
  ): Promise<void>;

  /**
   * Publishes specific state to the reverse hash service by given URL
   * @deprecated use publishRevocationInfoByCredentialStatusType instead with the same arguments in opts
   * @param {TreesModel} treeModel - trees model to publish
   * @param {string} rhsURL - reverse hash service URL
   * @param {number[]} [revokedNonces] - revoked nonces for the period from the last published
   * @returns `Promise<void>`
   */
  publishSpecificStateToRHS(
    treeModel: TreesModel,
    rhsURL: string,
    revokedNonces?: number[],
    opts?: object
  ): Promise<void>;

  /**
   * Publishes revocation info by credential status predefined publishers
   *
   * @param {(RevocationInfoOptions)} opts
   * @returns {Promise<void>}
   * @memberof IIdentityWallet
   */
  publishRevocationInfoByCredentialStatusType(
    issuerDID: DID,
    credentialStatusType: CredentialStatusType,
    opts?: RevocationInfoOptions
  ): Promise<void>;

  /**
   * Extracts core claim from signature or merkle tree proof. If both proof persists core claim must be the same
   *
   * @public
   * @param {W3CCredential} credential - credential to extract core claim
   * @returns `{Promise<Claim>}`
   */
  getCoreClaimFromCredential(credential: W3CCredential): Promise<Claim>;

  /**
   *
   * gets profile identity by genesis identifiers
   *
   * @param {string} did - genesis identifier from which profile has been derived
   * @returns `{Promise<Profile[]>}`
   */
  getProfilesByDID(did: DID): Promise<Profile[]>;

  /**
   *
   * gets profile nonce by it's id. if profile is genesis identifier - 0 is returned
   *
   * @param {string} did -  profile that has been derived or genesis identity
   * @returns `{Promise<{nonce:number, genesisIdentifier: DID}>}`
   */
  getGenesisDIDMetadata(did: DID): Promise<{ nonce: number; genesisDID: DID }>;

  /**
   *
   * find all credentials that belong to any profile or genesis identity for the given did
   *
   * @param {string} did -  profile that has been derived or genesis identity
   * @returns `{Promise<W3CCredential[]>}`
   */
  findOwnedCredentialsByDID(did: DID, query: ProofQuery): Promise<W3CCredential[]>;
  /**
   *
   * gets profile identity by verifier
   *
   * @param {string} verifier -  identifier of the verifier
   * @returns `{Promise<Profile>}`
   */
  getProfileByVerifier(verifier: string): Promise<Profile | undefined>;

  /**
   *
   * updates latest identity state in storage with given state or latest from the trees.
   *
   * @param {DID} issuerDID -  identifier of the issuer
   * @param {boolean} published - if states is published onchain
   * @param {TreeState} treeState -  contains state to upgrade
   * @returns `{Promise<void>}`
   */
  updateIdentityState(issuerDID: DID, published: boolean, treeState?: TreeState): Promise<void>;
}

/**
 * @public
 * Wallet instance to manage the digital identity based on iden3 protocol
 * allows to: create identity/profile, sign payloads (bigint / bytes), generate keys,
 * generate Merkle tree proofs of inclusion / non-inclusion to Merkle trees, issue credentials with a BJJSignature and Iden3SparseMerkleTree Proofs,
 * revoke credentials, add credentials to Merkle trees, push states to reverse hash service
 *
 *
 * @class IdentityWallet - class
 * @implements implements IIdentityWallet interface
 */
export class IdentityWallet implements IIdentityWallet {
  private readonly _credentialStatusPublisherRegistry: CredentialStatusPublisherRegistry;

  /**
   * Constructs a new instance of the `IdentityWallet` class
   *
   * @param {KMS} _kms - Key Management System that allows signing data with BJJ key
   * @param {IDataStorage} _storage - data storage to access credential / identity / Merkle tree data
   * @param {ICredentialWallet} _credentialWallet - credential wallet instance to quickly access credential CRUD functionality
   * @public
   */
  public constructor(
    private readonly _kms: KMS,
    private readonly _storage: IDataStorage,
    private readonly _credentialWallet: ICredentialWallet,
    private readonly _opts?: {
      credentialStatusPublisherRegistry?: CredentialStatusPublisherRegistry;
    }
  ) {
    if (!_opts?.credentialStatusPublisherRegistry) {
      this._credentialStatusPublisherRegistry = new CredentialStatusPublisherRegistry();
      this._credentialStatusPublisherRegistry.register(
        CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        new Iden3SmtRhsCredentialStatusPublisher()
      );
    } else {
      this._credentialStatusPublisherRegistry = this._opts
        ?.credentialStatusPublisherRegistry as CredentialStatusPublisherRegistry;
    }
  }

  /**
   * {@inheritDoc IIdentityWallet.createIdentity}
   */
  async createIdentity(
    opts: IdentityCreationOptions
  ): Promise<{ did: DID; credential: W3CCredential }> {
    const tmpIdentifier = opts.seed ? uuid.v5(Hex.encode(sha256(opts.seed)), uuid.NIL) : uuid.v4();

    opts.method = opts.method ?? DidMethod.Iden3;
    opts.blockchain = opts.blockchain ?? Blockchain.Polygon;
    opts.networkId = opts.networkId ?? NetworkId.Mumbai;

    await this._storage.mt.createIdentityMerkleTrees(tmpIdentifier);

    opts.seed = opts.seed ?? getRandomBytes(32);

    const keyId = await this._kms.createKeyFromSeed(KmsKeyType.BabyJubJub, opts.seed);

    const pubKeyHex = await this._kms.publicKey(keyId);

    const pubKey = PublicKey.newFromHex(pubKeyHex);

    const schemaHash = SchemaHash.authSchemaHash;

    const authClaim = Claim.newClaim(
      schemaHash,
      ClaimOptions.withIndexDataInts(pubKey.p[0], pubKey.p[1]),
      ClaimOptions.withRevocationNonce(BigInt(0))
    );
    const revNonce = opts.revocationOpts.nonce ?? 0;
    authClaim.setRevocationNonce(BigInt(revNonce));

    await this._storage.mt.addToMerkleTree(
      tmpIdentifier,
      MerkleTreeType.Claims,
      authClaim.hiHv().hi,
      authClaim.hiHv().hv
    );

    const claimsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      tmpIdentifier,
      MerkleTreeType.Claims
    );

    const currentState = hashElems([
      (await claimsTree.root()).bigInt(),
      ZERO_HASH.bigInt(),
      ZERO_HASH.bigInt()
    ]);

    const didType = buildDIDType(opts.method, opts.blockchain, opts.networkId);
    const identifier = Id.idGenesisFromIdenState(didType, currentState.bigInt());
    const did = DID.parseFromId(identifier);

    await this._storage.mt.bindMerkleTreeToNewIdentifier(tmpIdentifier, did.string());

    const schema = JSON.parse(VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_SCHEMA_JSON);

    const authData = authClaim.getExpirationDate();
    const expiration = authData ? getUnixTimestamp(authData) : 0;

    const request: CredentialRequest = {
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
        nonce: revNonce,
        id: opts.revocationOpts.id.replace(/\/$/, ''),
        type: opts.revocationOpts.type,
        issuerState: currentState.hex()
      }
    };

    let credential: W3CCredential = new W3CCredential();
    try {
      credential = this._credentialWallet.createCredential(did, request, schema);
    } catch (e) {
      throw new Error(`Error create w3c credential ${(e as Error).message}`);
    }

    const index = authClaim.hIndex();
    const ctr = await claimsTree.root();

    const { proof } = await claimsTree.generateProof(index, ctr);

    const mtpProof: Iden3SparseMerkleTreeProof = new Iden3SparseMerkleTreeProof({
      mtp: proof,
      issuerData: {
        id: did,
        state: {
          rootOfRoots: ZERO_HASH,
          revocationTreeRoot: ZERO_HASH,
          claimsTreeRoot: ctr,
          value: currentState
        }
      },
      coreClaim: authClaim
    });

    credential.proof = [mtpProof];

    await this.publishRevocationInfoByCredentialStatusType(did, opts.revocationOpts.type, {
      rhsUrl: opts.revocationOpts.id,
      onChain: opts.revocationOpts.onChain
    });

    await this._storage.identity.saveIdentity({
      did: did.string(),
      state: currentState,
      isStatePublished: false,
      isStateGenesis: true
    });

    await this._credentialWallet.save(credential);

    return {
      did,
      credential
    };
  }

  /** {@inheritDoc IIdentityWallet.getGenesisDIDMetadata} */
  async getGenesisDIDMetadata(did: DID): Promise<{ nonce: number; genesisDID: DID }> {
    // check if it is a genesis identity
    const identity = await this._storage.identity.getIdentity(did.string());

    if (identity) {
      return { nonce: 0, genesisDID: DID.parse(identity.did) };
    }
    const profile = await this._storage.identity.getProfileById(did.string());

    if (!profile) {
      throw new Error('profile or identity not found');
    }
    return { nonce: profile.nonce, genesisDID: DID.parse(profile.genesisIdentifier) };
  }

  /** {@inheritDoc IIdentityWallet.createProfile} */
  async createProfile(did: DID, nonce: number, verifier: string): Promise<DID> {
    const profileDID = generateProfileDID(did, nonce);

    const identityProfiles = await this._storage.identity.getProfilesByGenesisIdentifier(
      did.string()
    );

    const existingProfile = identityProfiles.find(
      (p) => p.nonce == nonce || p.verifier == verifier
    );
    if (existingProfile) {
      throw new Error('profile with given nonce or verifier already exists');
    }

    await this._storage.identity.saveProfile({
      id: profileDID.string(),
      nonce,
      genesisIdentifier: did.string(),
      verifier
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
  async getProfilesByDID(did: DID): Promise<Profile[]> {
    return this._storage.identity.getProfilesByGenesisIdentifier(did.string());
  }
  /** {@inheritDoc IIdentityWallet.generateKey} */
  async generateKey(keyType: KmsKeyType): Promise<KmsKeyId> {
    const key = await this._kms.createKeyFromSeed(keyType, getRandomBytes(32));
    return key;
  }

  async getProfileByVerifier(verifier: string): Promise<Profile | undefined> {
    return this._storage.identity.getProfileByVerifier(verifier);
  }
  /** {@inheritDoc IIdentityWallet.getDIDTreeModel} */
  async getDIDTreeModel(did: DID): Promise<TreesModel> {
    const didStr = did.string();
    const claimsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      didStr,
      MerkleTreeType.Claims
    );
    const revocationTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      didStr,
      MerkleTreeType.Revocations
    );
    const rootsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      didStr,
      MerkleTreeType.Roots
    );
    const state = hashElems([
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
  async generateCredentialMtp(
    did: DID,
    credential: W3CCredential,
    treeState?: TreeState
  ): Promise<MerkleTreeProofWithTreeState> {
    const coreClaim = await this.getCoreClaimFromCredential(credential);
    // todo: Parser.parseClaim

    const treesModel = await this.getDIDTreeModel(did);

    const claimsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      did.string(),
      MerkleTreeType.Claims
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
  async generateNonRevocationMtp(
    did: DID,
    credential: W3CCredential,
    treeState?: TreeState
  ): Promise<MerkleTreeProofWithTreeState> {
    const coreClaim = await this.getCoreClaimFromCredential(credential);

    const revNonce = coreClaim.getRevocationNonce();

    const treesModel = await this.getDIDTreeModel(did);

    const revocationTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      did.string(),
      MerkleTreeType.Revocations
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
  async sign(message: Uint8Array, credential: W3CCredential): Promise<Signature> {
    const keyKMSId = getKMSIdByAuthCredential(credential);
    const payload = poseidon.hashBytes(message);

    const signature = await this._kms.sign(keyKMSId, BytesHelper.intToBytes(payload));

    return Signature.newFromCompressed(signature);
  }

  /** {@inheritDoc IIdentityWallet.signChallenge} */
  async signChallenge(challenge: bigint, credential: W3CCredential): Promise<Signature> {
    const keyKMSId = getKMSIdByAuthCredential(credential);

    const signature = await this._kms.sign(keyKMSId, BytesHelper.intToBytes(challenge));

    return Signature.newFromCompressed(signature);
  }

  /** {@inheritDoc IIdentityWallet.issueCredential} */
  async issueCredential(
    issuerDID: DID,
    req: CredentialRequest,
    opts?: Options
  ): Promise<W3CCredential> {
    req.revocationOpts.id = req.revocationOpts.id.replace(/\/$/, '');

    let schema: object;

    const loader = opts?.documentLoader ?? cacheLoader(opts);
    try {
      schema = (await loader(req.credentialSchema)).document;
    } catch (e) {
      throw new Error(`can't load credential schema ${req.credentialSchema}`);
    }

    const jsonSchema = schema as JSONSchema;
    let credential: W3CCredential = new W3CCredential();

    const issuerRoots = await this.getDIDTreeModel(issuerDID);
    req.revocationOpts.issuerState = issuerRoots.state.hex();

    req.revocationOpts.nonce =
      typeof req.revocationOpts.nonce === 'number'
        ? req.revocationOpts.nonce
        : Math.round(Math.random() * 10000);

    req.subjectPosition = req.subjectPosition ?? SubjectPosition.Index;

    try {
      credential = this._credentialWallet.createCredential(issuerDID, req, jsonSchema);

      const encodedCred = byteEncoder.encode(JSON.stringify(credential));
      const encodedSchema = byteEncoder.encode(JSON.stringify(schema));

      await new JsonSchemaValidator().validate(encodedCred, encodedSchema);
    } catch (e) {
      throw new Error(`Error create w3c credential ${(e as Error).message}`);
    }

    const issuerAuthBJJCredential = await this._credentialWallet.getAuthBJJCredential(issuerDID);

    const coreClaimOpts: CoreClaimOptions = {
      revNonce: req.revocationOpts.nonce,
      subjectPosition: req.subjectPosition,
      merklizedRootPosition: req.merklizedRootPosition ?? MerklizedRootPosition.None,
      updatable: false,
      version: 0,
      merklizeOpts: { ...opts, documentLoader: loader }
    };

    const coreClaim = await Parser.parseClaim(credential, coreClaimOpts);

    const { hi, hv } = coreClaim.hiHv();

    const coreClaimHash = poseidon.hash([hi, hv]);

    const signature = await this.signChallenge(coreClaimHash, issuerAuthBJJCredential);

    if (!issuerAuthBJJCredential.proof) {
      throw new Error('issuer auth credential must have proof');
    }

    const mtpAuthBJJProof = issuerAuthBJJCredential.getIden3SparseMerkleTreeProof();
    if (!mtpAuthBJJProof) {
      throw new Error('mtp is required for auth bjj key to issue new credentials');
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

  /** {@inheritDoc IIdentityWallet.revokeCredential} */
  async revokeCredential(issuerDID: DID, credential: W3CCredential): Promise<number> {
    const issuerTree = await this.getDIDTreeModel(issuerDID);

    const coreClaim = credential.getCoreClaimFromProof(ProofType.BJJSignature);

    if (!coreClaim) {
      throw new Error('credential must have coreClaim representation in the signature proof');
    }
    const nonce = coreClaim.getRevocationNonce();

    await issuerTree.revocationTree.add(nonce, BigInt(0));

    return Number(BigInt.asUintN(64, nonce));
  }

  /** {@inheritDoc IIdentityWallet.addCredentialsToMerkleTree} */
  async addCredentialsToMerkleTree(
    credentials: W3CCredential[],
    issuerDID: DID
  ): Promise<Iden3ProofCreationResult> {
    const oldIssuerTree = await this.getDIDTreeModel(issuerDID);
    let claimsRoot = await oldIssuerTree.claimsTree.root();
    let rootOfRoots = await oldIssuerTree.rootsTree.root();
    let revocationRoot = await oldIssuerTree.revocationTree.root();
    const oldTreeState: TreeState = {
      state: oldIssuerTree.state,
      claimsRoot,
      revocationRoot,
      rootOfRoots
    };

    for (let index = 0; index < credentials.length; index++) {
      const credential = credentials[index];

      // credential must have a bjj signature proof
      const coreClaim = credential.getCoreClaimFromProof(ProofType.BJJSignature);

      if (!coreClaim) {
        throw new Error('credential must have coreClaim representation in the signature proof');
      }

      await this._storage.mt.addToMerkleTree(
        issuerDID.string(),
        MerkleTreeType.Claims,
        coreClaim.hIndex(),
        coreClaim.hValue()
      );
    }

    const newIssuerTreeState = await this.getDIDTreeModel(issuerDID);
    const claimTreeRoot = await newIssuerTreeState.claimsTree.root();
    await this._storage.mt.addToMerkleTree(
      issuerDID.string(),
      MerkleTreeType.Roots,
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
      oldTreeState: oldTreeState
    };
  }

  /** {@inheritDoc IIdentityWallet.generateIden3SparseMerkleTreeProof} */
  // treeState -  optional, if it is not passed proof of claim inclusion will be generated on the latest state in the tree.
  async generateIden3SparseMerkleTreeProof(
    issuerDID: DID,
    credentials: W3CCredential[],
    txId: string,
    blockNumber?: number,
    blockTimestamp?: number,
    treeState?: TreeState
  ): Promise<W3CCredential[]> {
    for (let index = 0; index < credentials.length; index++) {
      const credential = credentials[index];

      const mtpWithProof = await this.generateCredentialMtp(issuerDID, credential, treeState);

      // TODO: return coreClaim from generateCredentialMtp and use it below
      // credential must have a bjj signature proof
      const coreClaim = credential.getCoreClaimFromProof(ProofType.BJJSignature);

      if (!coreClaim) {
        throw new Error('credential must have coreClaim representation in the signature proof');
      }

      const mtpProof: Iden3SparseMerkleTreeProof = new Iden3SparseMerkleTreeProof({
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
        (credentials[index].proof as unknown[]).push(mtpProof);
      } else {
        credentials[index].proof = [credentials[index].proof, mtpProof];
      }
    }
    return credentials;
  }

  /** {@inheritDoc IIdentityWallet.publishSpecificStateToRHS} */
  async publishSpecificStateToRHS(
    treeModel: TreesModel,
    rhsURL: string,
    revokedNonces?: number[]
  ): Promise<void> {
    await pushHashesToRHS(treeModel.state, treeModel, rhsURL, revokedNonces);
  }

  /** {@inheritDoc IIdentityWallet.publishStateToRHS} */
  async publishStateToRHS(issuerDID: DID, rhsURL: string, revokedNonces?: number[]): Promise<void> {
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
  async publishRevocationInfoByCredentialStatusType(
    issuerDID: DID,
    credentialStatusType: CredentialStatusType,
    opts?: RevocationInfoOptions
  ): Promise<void> {
    const rhsPublishers = this._credentialStatusPublisherRegistry.get(credentialStatusType);
    if (!rhsPublishers) {
      throw new Error(
        `there is no registered publisher to save  hash is not registered for ${credentialStatusType} is not registered`
      );
    }

    let nodes: ProofNode[] = [];
    if (opts?.treeModel) {
      nodes = await getNodesRepresentation(
        opts.revokedNonces,
        {
          revocationTree: opts.treeModel.revocationTree,
          claimsTree: opts.treeModel.claimsTree,
          state: opts.treeModel.state,
          rootsTree: opts.treeModel.rootsTree
        },
        opts.treeModel.state
      );
    } else {
      const treeState = await this.getDIDTreeModel(issuerDID);
      nodes = await getNodesRepresentation(
        opts?.revokedNonces,
        {
          revocationTree: treeState.revocationTree,
          claimsTree: treeState.claimsTree,
          state: treeState.state,
          rootsTree: treeState.rootsTree
        },
        treeState.state
      );
    }

    if (!nodes.length) {
      return;
    }

    const rhsPublishersTask = rhsPublishers.map((publisher) =>
      publisher.publish({ nodes, ...opts, credentialStatusType, issuerDID })
    );

    await Promise.all(rhsPublishersTask);
  }

  public async getCoreClaimFromCredential(credential: W3CCredential): Promise<Claim> {
    const coreClaimFromSigProof = credential.getCoreClaimFromProof(ProofType.BJJSignature);

    const coreClaimFromMtpProof = credential.getCoreClaimFromProof(
      ProofType.Iden3SparseMerkleTreeProof
    );

    if (
      coreClaimFromMtpProof &&
      coreClaimFromSigProof &&
      coreClaimFromMtpProof.hex() !== coreClaimFromSigProof.hex()
    ) {
      throw new Error('core claim representations is set in both proofs but they are not equal');
    }
    if (!coreClaimFromMtpProof && !coreClaimFromSigProof) {
      throw new Error('core claim is not set in credential proofs');
    }

    //eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    const coreClaim = coreClaimFromMtpProof ?? coreClaimFromSigProof!;

    return coreClaim;
  }

  async findOwnedCredentialsByDID(did: DID, query: ProofQuery): Promise<W3CCredential[]> {
    const credentials = await this._credentialWallet.findByQuery(query);
    if (!credentials.length) {
      throw new Error(`no credential satisfied query`);
    }

    const { genesisDID } = await this.getGenesisDIDMetadata(did);

    const profiles = await this.getProfilesByDID(genesisDID);

    return credentials.filter((cred) => {
      const credentialSubjectId = cred.credentialSubject['id'] as string; // credential subject
      return (
        credentialSubjectId == genesisDID.string() ||
        profiles.some((p) => {
          return p.id === credentialSubjectId;
        })
      );
    });
  }

  /** {@inheritDoc IIdentityWallet.updateIdentityState} */
  async updateIdentityState(
    issuerDID: DID,
    published: boolean,
    treeState?: TreeState
  ): Promise<void> {
    const latestTreeState = await this.getDIDTreeModel(issuerDID);

    await this._storage.identity.saveIdentity({
      did: issuerDID.string(),
      state: treeState?.state ?? latestTreeState.state,
      isStatePublished: published,
      isStateGenesis: false
    });
  }
}
