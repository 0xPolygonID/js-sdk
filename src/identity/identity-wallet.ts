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
import { Hex, poseidon, PublicKey, Signature } from '@iden3/js-crypto';
import { hashElems, ZERO_HASH } from '@iden3/js-merkletree';

import { subjectPositionIndex } from './common';
import * as uuid from 'uuid';
import { Schema, Parser, CoreClaimOptions } from '../schema-processor';
import { IDataStorage } from '../storage/interfaces/data-storage';
import { MerkleTreeType } from '../storage/entities/mt';
import { getRandomBytes, keyPath } from '../kms/provider-helpers';
import { UniversalSchemaLoader } from '../loaders';
import {
  VerifiableConstants,
  BJJSignatureProof2021,
  MerklizedRootPosition,
  SubjectPosition,
  W3CCredential,
  MerkleTreeProofWithTreeState,
  Iden3SparseMerkleTreeProof,
  ProofType
} from '../verifiable';
import { ClaimRequest, ICredentialWallet } from '../credentials';
import { pushHashesToRHS, TreesModel } from '../credentials/revocation';
import { TreeState } from '../circuits';

// CredentialIssueOptions
/**
 * Credential issue options
 * with publishing to chain and to reverse hash service
 *
 * @export
 * @beta
 * @interface   CredentialIssueOptions
 */
export interface CredentialIssueOptions {
  /**
   * option to show if reverse hash service is used to check the Credential Status
   *
   */
  withRHS: string;
}
/**
 *  Proof creation result
 *
 * @export
 * @beta
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
 * @beta
 */
export interface IIdentityWallet {
  /**
   * Create Identity creates Auth BJJ credential,
   * Merkle trees for claims, revocations and root of roots,
   * adds auth BJJ credential to claims tree and generates mtp of inclusion
   * based on the resulting state it provides an identifier in DID form.
   *
   * @param {string} hostUrl - hostUrl is used as a part of the identifier of Auth BJJ credential
   * @param {string} rhsUrl - rhsUrl is url to reverse hash service, so revocation status can be fetched for Auth BJJ credential
   * @param {Uint8Array} seed - if present the BJJ private key will be created from the given seed
   * @returns `Promise<{ did: DID; credential: W3CCredential }>` - returns did and Auth BJJ credential
   * @beta
   */
  createIdentity(
    hostUrl: string,
    rhsUrl: string,
    seed?: Uint8Array
  ): Promise<{ did: DID; credential: W3CCredential }>;

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
   * @param {ClaimRequest} req - claim request
   * @param {string} hostUrl - url that will be a part of credential id prefix
   * @param {CredentialIssueOptions} [opts] - with / without RHS
   * @returns `Promise<W3CCredential>` - returns created W3CCredential
   */
  issueCredential(
    issuerDID: DID,
    req: ClaimRequest,
    hostUrl: string,
    opts?: CredentialIssueOptions
  ): Promise<W3CCredential>;

  /**
   * Gets a tree model for given did that includes claims tree, revocation tree, the root of roots tree and calculated state hash
   *
   * @param {DID} did - did which trees info we need to receive
   * @returns `Promise<TreesModel>`
   * */
  getDIDTreeState(did: DID): Promise<TreesModel>;

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
   *
   *
   * @param {DID} issuerDID - issuer did
   * @param {string} rhsURL - reverse hash service URL
   * @param {number[]} [revokedNonces] - revoked nonces for the period from the last published
   * @returns `Promise<void>`
   */
  publishStateToRHS(issuerDID: DID, rhsURL: string, revokedNonces?: number[]): Promise<void>;
}

/**
 * @public
 * Wallet instance to manage the digital identity based on iden3 protocol
 * allows to: create identity/profile, sign payloads (bigint / bytes), generate keys,
 * generate Merkle tree proofs of inclusion / non-inclusion to Merkle trees, issue credentials with a BJJSignature and Iden3SparseMerkleTree Proofs,
 * revoke credentials, add credentials to Merkle trees, push states to reverse hash service
 *
 *
 * @export
 * @beta
 * @class IdentityWallet - class
 * @beta
 * @implements implements IIdentityWallet interface
 */
export class IdentityWallet implements IIdentityWallet {
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
    private readonly _credentialWallet: ICredentialWallet
  ) {}

  /**
   * {@inheritDoc IIdentityWallet.createIdentity}
   */
  async createIdentity(
    hostUrl: string,
    rhsUrl: string,
    seed?: Uint8Array
  ): Promise<{ did: DID; credential: W3CCredential }> {
    const tmpIdentifier = uuid.v4();

    await this._storage.mt.createIdentityMerkleTrees(tmpIdentifier);

    if (!seed) {
      seed = getRandomBytes(32);
    }

    const keyID = await this._kms.createKeyFromSeed(KmsKeyType.BabyJubJub, seed);

    const pubKey = await this._kms.publicKey(keyID);

    const schemaHash = SchemaHash.authSchemaHash;

    const authClaim = Claim.newClaim(
      schemaHash,
      ClaimOptions.withIndexDataInts(pubKey.p[0], pubKey.p[1]),
      ClaimOptions.withRevocationNonce(BigInt(0))
    );
    const revNonce = 0;
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

    const currentState = await hashElems([
      claimsTree.root.bigInt(),
      ZERO_HASH.bigInt(),
      ZERO_HASH.bigInt()
    ]);

    const didType = buildDIDType(DidMethod.Iden3, Blockchain.Polygon, NetworkId.Mumbai);
    const identifier = Id.idGenesisFromIdenState(didType, currentState.bigInt());
    const did = DID.parseFromId(identifier);

    await this._storage.mt.bindMerkleTreeToNewIdentifier(tmpIdentifier, did.toString());

    const schema = JSON.parse(VerifiableConstants.AUTH.AUTH_BJJ_CREDENTAIL_SCHEMA_JSON);

    const authData = authClaim.getExpirationDate();
    const expiration = authData ? getUnixTimestamp(authData) : 0;

    const request: ClaimRequest = {
      credentialSchema: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_SCHEMA_JSON_URL,
      type: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_TYPE,
      credentialSubject: {
        x: pubKey.p[0].toString(),
        y: pubKey.p[1].toString()
      },
      subjectPosition: subjectPositionIndex(authClaim.getIdPosition()),
      version: 0,
      expiration,
      revNonce: revNonce
    };

    hostUrl = hostUrl.replace(/\/$/, '');

    let credential: W3CCredential = new W3CCredential();
    try {
      credential = this._credentialWallet.createCredential(hostUrl, did, request, schema, rhsUrl);
    } catch (e) {
      throw new Error('Error create Iden3Credential');
    }

    const index = authClaim.hIndex();

    const { proof } = await claimsTree.generateProof(index, claimsTree.root);

    const claimsTreeHex = claimsTree.root.hex();
    const stateHex = currentState.hex();

    const mtpProof: Iden3SparseMerkleTreeProof = {
      type: ProofType.Iden3SparseMerkleTreeProof,
      mtp: proof,
      issuerData: {
        id: did.toString(),
        state: {
          rootOfRoots: ZERO_HASH.hex(),
          revocationTreeRoot: ZERO_HASH.hex(),
          claimsTreeRoot: claimsTreeHex,
          value: stateHex
        },
        authCoreClaim: authClaim.hex(),
        credentialStatus: credential.credentialStatus,
        mtp: proof
      },
      coreClaim: authClaim.hex()
    };

    credential.proof = [mtpProof];

    await this._storage.identity.saveIdentity({
      identifier: did.toString(),
      state: currentState,
      published: false,
      genesis: true
    });

    await this._credentialWallet.save(credential);

    return {
      did,
      credential
    };
  }

  /** {@inheritDoc IIdentityWallet.createProfile} */
  async createProfile(did: DID, nonce: number, verifier: string): Promise<DID> {
    const id = did.id;

    const identityProfiles = await this._storage.identity.getProfilesByGenesisIdentifier(
      did.toString()
    );

    const existingProfile = identityProfiles.find(
      (p) => p.nonce == nonce || p.verifier == verifier
    );
    if (existingProfile) {
      throw new Error('profile with given nonce or verifier already exists');
    }

    const profile = Id.profileId(id, BigInt(nonce));
    const profileDID = DID.parseFromId(profile);

    await this._storage.identity.saveProfile({
      id: profileDID.toString(),
      nonce,
      genesisIdentifier: did.toString(),
      verifier
    });
    return profileDID;
  }

  /** {@inheritDoc IIdentityWallet.generateKey} */
  async generateKey(keyType: KmsKeyType): Promise<KmsKeyId> {
    const key = await this._kms.createKeyFromSeed(keyType, getRandomBytes(32));
    return key;
  }

  /** {@inheritDoc IIdentityWallet.getDIDTreeState} */
  async getDIDTreeState(did: DID): Promise<TreesModel> {
    const claimsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      did.toString(),
      MerkleTreeType.Claims
    );
    const revocationTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      did.toString(),
      MerkleTreeType.Revocations
    );
    const rootsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      did.toString(),
      MerkleTreeType.Roots
    );
    const state = await hashElems([
      claimsTree.root.bigInt(),
      revocationTree.root.bigInt(),
      rootsTree.root.bigInt()
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

    const treesModel = await this.getDIDTreeState(did);

    const claimsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      did.toString(),
      MerkleTreeType.Claims
    );

    const { proof } = await claimsTree.generateProof(
      coreClaim.hIndex(),
      treeState ? treeState.claimsRoot : treesModel.claimsTree.root
    );

    return {
      proof,
      treeState: treeState ?? {
        state: treesModel.state,
        claimsRoot: treesModel.claimsTree.root,
        rootOfRoots: treesModel.rootsTree.root,
        revocationRoot: treesModel.revocationTree.root
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

    const treesModel = await this.getDIDTreeState(did);

    const revocationTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      did.toString(),
      MerkleTreeType.Revocations
    );

    const { proof } = await revocationTree.generateProof(
      revNonce,
      treeState ? treeState.revocationRoot : treesModel.revocationTree.root
    );

    return {
      proof,
      treeState: treeState ?? {
        state: treesModel.state,
        claimsRoot: treesModel.claimsTree.root,
        rootOfRoots: treesModel.rootsTree.root,
        revocationRoot: treesModel.revocationTree.root
      }
    };
  }

  /** {@inheritDoc IIdentityWallet.sign} */
  async sign(message: Uint8Array, credential: W3CCredential): Promise<Signature> {
    const keyKMSId = this.getKMSIdByAuthCredential(credential);
    const payload = poseidon.hashBytes(message);

    const signature = await this._kms.sign(keyKMSId, BytesHelper.intToBytes(payload));

    return Signature.newFromCompressed(signature);
  }

  /** {@inheritDoc IIdentityWallet.signChallenge} */
  async signChallenge(challenge: bigint, credential: W3CCredential): Promise<Signature> {
    const keyKMSId = this.getKMSIdByAuthCredential(credential);

    const signature = await this._kms.sign(keyKMSId, BytesHelper.intToBytes(challenge));

    return Signature.newFromCompressed(signature);
  }

  /** {@inheritDoc IIdentityWallet.issueCredential} */
  async issueCredential(
    issuerDID: DID,
    req: ClaimRequest,
    hostUrl: string,
    opts?: CredentialIssueOptions
  ): Promise<W3CCredential> {
    if (!opts) {
      opts = {
        withRHS: ''
      };
    }
    hostUrl = hostUrl.replace(/\/$/, '');

    const schema = await new UniversalSchemaLoader('ipfs.io').load(req.credentialSchema);

    const jsonSchema: Schema = JSON.parse(new TextDecoder().decode(schema));

    let credential: W3CCredential = new W3CCredential();

    let revNonce = 0;
    if (!req.revNonce) {
      req.revNonce = Math.round(Math.random() * 10000);
    }
    req.subjectPosition = req.subjectPosition ?? SubjectPosition.Index;

    revNonce = req.revNonce;

    try {
      credential = this._credentialWallet.createCredential(
        hostUrl,
        issuerDID,
        req,
        jsonSchema,
        opts.withRHS
      );
    } catch (e) {
      throw new Error('Error create Iden3Credential');
    }

    const issuerAuthBJJCredential = await this._credentialWallet.getAuthBJJCredential(issuerDID);

    const coreClaimOpts: CoreClaimOptions = {
      revNonce: revNonce,
      subjectPosition: req.subjectPosition,
      merklizedRootPosition: this.defineMTRootPosition(jsonSchema, req.merklizedRootPosition),
      updatable: false,
      version: 0
    };

    const coreClaim = await new Parser().parseClaim(
      credential,
      `${jsonSchema.$metadata.uris['jsonLdContext']}#${req.type}`,
      schema,
      coreClaimOpts
    );

    const { hi, hv } = coreClaim.hiHv();

    const coreClaimHash = poseidon.hash([hi, hv]);

    const keyKMSId = this.getKMSIdByAuthCredential(issuerAuthBJJCredential);

    const signature = await this._kms.sign(keyKMSId, BytesHelper.intToBytes(coreClaimHash));

    if (!issuerAuthBJJCredential.proof) {
      throw new Error('issuer auth credential must have proof');
    }
    const mtpAuthBJJProof = issuerAuthBJJCredential.proof[0] as Iden3SparseMerkleTreeProof;

    const sigProof: BJJSignatureProof2021 = {
      type: ProofType.BJJSignature,
      issuerData: {
        id: issuerDID.toString(),
        state: mtpAuthBJJProof.issuerData.state,
        authCoreClaim: mtpAuthBJJProof.coreClaim,
        mtp: mtpAuthBJJProof.mtp,
        credentialStatus: mtpAuthBJJProof.issuerData.credentialStatus
      },
      coreClaim: coreClaim.hex(),
      signature: Hex.encodeString(signature)
    };
    credential.proof = [sigProof];

    return credential;
  }

  /** {@inheritDoc IIdentityWallet.revokeCredential} */
  async revokeCredential(issuerDID: DID, credential: W3CCredential): Promise<number> {
    const issuerTree = await this.getDIDTreeState(issuerDID);

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
    const oldIssuerTree = await this.getDIDTreeState(issuerDID);

    const oldTreeState: TreeState = {
      revocationRoot: oldIssuerTree.revocationTree.root,
      claimsRoot: oldIssuerTree.claimsTree.root,
      state: oldIssuerTree.state,
      rootOfRoots: oldIssuerTree.rootsTree.root
    };

    for (let index = 0; index < credentials.length; index++) {
      const credential = credentials[index];

      // credential must have a bjj signature proof
      const coreClaim = await credential.getCoreClaimFromProof(ProofType.BJJSignature);

      if (!coreClaim) {
        throw new Error('credential must have coreClaim representation in the signature proof');
      }

      await this._storage.mt.addToMerkleTree(
        issuerDID.toString(),
        MerkleTreeType.Claims,
        coreClaim.hIndex(),
        coreClaim.hValue()
      );
    }

    const newIssuerTreeState = await this.getDIDTreeState(issuerDID);

    await this._storage.mt.addToMerkleTree(
      issuerDID.toString(),
      MerkleTreeType.Roots,
      newIssuerTreeState.claimsTree.root.bigInt(),
      BigInt(0)
    );
    const newIssuerTreeStateWithROR = await this.getDIDTreeState(issuerDID);

    return {
      credentials,
      newTreeState: {
        revocationRoot: newIssuerTreeStateWithROR.revocationTree.root,
        claimsRoot: newIssuerTreeStateWithROR.claimsTree.root,
        state: newIssuerTreeStateWithROR.state,
        rootOfRoots: newIssuerTreeStateWithROR.rootsTree.root
      },
      oldTreeState: oldTreeState
    };
  }

  /** {@inheritDoc IIdentityWallet.generateIden3SparseMerkleTreeProof} */
  async generateIden3SparseMerkleTreeProof(
    issuerDID: DID,
    credentials: W3CCredential[],
    txId: string,
    blockNumber?: number,
    blockTimestamp?: number
  ): Promise<W3CCredential[]> {
    for (let index = 0; index < credentials.length; index++) {
      const credential = credentials[index];

      const mtpWithProof = await this.generateCredentialMtp(issuerDID, credential);

      // credential must have a bjj signature proof
      const coreClaim = credential.getCoreClaimFromProof(ProofType.BJJSignature);

      if (!coreClaim) {
        throw new Error('credential must have coreClaim representation in the signature proof');
      }

      const mtpProof: Iden3SparseMerkleTreeProof = {
        type: ProofType.Iden3SparseMerkleTreeProof,
        mtp: mtpWithProof.proof,
        issuerData: {
          id: issuerDID.toString(),
          state: {
            claimsTreeRoot: mtpWithProof.treeState.claimsRoot.hex(),
            revocationTreeRoot: mtpWithProof.treeState.revocationRoot.hex(),
            rootOfRoots: mtpWithProof.treeState.rootOfRoots.hex(),
            value: mtpWithProof.treeState.state.hex(),
            txId,
            blockNumber,
            blockTimestamp
          },
          mtp: mtpWithProof.proof
        },
        coreClaim: coreClaim.hex()
      };
      if (Array.isArray(credentials[index].proof)) {
        (credentials[index].proof as unknown[]).push(mtpProof);
      } else {
        credentials[index].proof = mtpProof;
      }
    }
    return credentials;
  }

  /** {@inheritDoc IIdentityWallet.publishStateToRHS} */
  async publishStateToRHS(issuerDID: DID, rhsURL: string, revokedNonces?: number[]): Promise<void> {
    const treeState = await this.getDIDTreeState(issuerDID);

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

  private getKMSIdByAuthCredential(credential: W3CCredential): KmsKeyId {
    if (credential.type.indexOf('AuthBJJCredential') === -1) {
      throw new Error("can't sign with not AuthBJJCredential credential");
    }
    const x = credential.credentialSubject['x'] as unknown as string;
    const y = credential.credentialSubject['y'] as unknown as string;

    const pb: PublicKey = new PublicKey([BigInt(x), BigInt(y)]);
    const kp = keyPath(KmsKeyType.BabyJubJub, pb.hex());
    return { type: KmsKeyType.BabyJubJub, id: kp };
  }

  private defineMTRootPosition(schema: Schema, position?: string): string {
    if (schema.$metadata?.serialization) {
      return '';
    }
    if (position) {
      return position;
    }
    return MerklizedRootPosition.Index;
  }

  private async getCoreClaimFromCredential(credential: W3CCredential): Promise<Claim> {
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
}
