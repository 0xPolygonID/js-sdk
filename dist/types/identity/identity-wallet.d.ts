import { KMS, KmsKeyId, KmsKeyType } from '../kms';
import { Blockchain, Claim, DID, DidMethod, NetworkId } from '@iden3/js-iden3-core';
import { Signature } from '@iden3/js-crypto';
import { IDataStorage } from '../storage/interfaces/data-storage';
import { W3CCredential, MerkleTreeProofWithTreeState, CredentialStatusType, ProofQuery } from '../verifiable';
import { CredentialRequest, ICredentialWallet } from '../credentials';
import { TreesModel } from '../credentials/rhs';
import { TreeState } from '../circuits';
import { Options } from '@iden3/js-jsonld-merklization';
import { Profile } from '../storage';
/**
 * DID creation options
 * seed - seed to generate BJJ keypair
 * revocationOpts -

 * @interface IdentityCreationOptions
 */
export interface IdentityCreationOptions {
    method?: DidMethod;
    blockchain?: Blockchain;
    networkId?: NetworkId;
    revocationOpts: {
        id: string;
        type: CredentialStatusType;
        nonce?: number;
    };
    seed?: Uint8Array;
}
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
    createIdentity(opts: IdentityCreationOptions): Promise<{
        did: DID;
        credential: W3CCredential;
    }>;
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
    issueCredential(issuerDID: DID, req: CredentialRequest): Promise<W3CCredential>;
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
    generateCredentialMtp(did: DID, credential: W3CCredential, treeState?: TreeState): Promise<MerkleTreeProofWithTreeState>;
    /**
     * Generates proof of credential revocation nonce inclusion / non-inclusion to the given revocation tree
     * and its root or to the current root of the Revocation tree in the given Merkle tree storage.
     *
     * @param {DID} did
     * @param {W3CCredential} credential
     * @param {TreeState} [treeState]
     * @returns `Promise<MerkleTreeProofWithTreeState>` -  MerkleTreeProof and TreeState on which proof has been generated
     */
    generateNonRevocationMtp(did: DID, credential: W3CCredential, treeState?: TreeState): Promise<MerkleTreeProofWithTreeState>;
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
    generateIden3SparseMerkleTreeProof(issuerDID: DID, credentials: W3CCredential[], txId: string, blockNumber?: number, blockTimestamp?: number): Promise<W3CCredential[]>;
    /**
     * Adds verifiable credentials to issuer Claims Merkle tree
     *
     * @param {W3CCredential[]} credentials - credentials to include in the claims tree
     * @param {DID} issuerDID - issuer did
     * @returns `Promise<Iden3ProofCreationResult>`- old tree state and tree state with included credentials
     */
    addCredentialsToMerkleTree(credentials: W3CCredential[], issuerDID: DID): Promise<Iden3ProofCreationResult>;
    /**
     *
     *
     * @param {DID} issuerDID - issuer did
     * @param {string} rhsURL - reverse hash service URL
     * @param {number[]} [revokedNonces] - revoked nonces for the period from the last published
     * @returns `Promise<void>`
     */
    publishStateToRHS(issuerDID: DID, rhsURL: string, revokedNonces?: number[]): Promise<void>;
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
    getGenesisDIDMetadata(did: DID): Promise<{
        nonce: number;
        genesisDID: DID;
    }>;
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
export declare class IdentityWallet implements IIdentityWallet {
    private readonly _kms;
    private readonly _storage;
    private readonly _credentialWallet;
    /**
     * Constructs a new instance of the `IdentityWallet` class
     *
     * @param {KMS} _kms - Key Management System that allows signing data with BJJ key
     * @param {IDataStorage} _storage - data storage to access credential / identity / Merkle tree data
     * @param {ICredentialWallet} _credentialWallet - credential wallet instance to quickly access credential CRUD functionality
     * @public
     */
    constructor(_kms: KMS, _storage: IDataStorage, _credentialWallet: ICredentialWallet);
    /**
     * {@inheritDoc IIdentityWallet.createIdentity}
     */
    createIdentity(opts: IdentityCreationOptions): Promise<{
        did: DID;
        credential: W3CCredential;
    }>;
    /** {@inheritDoc IIdentityWallet.getGenesisDIDMetadata} */
    getGenesisDIDMetadata(did: DID): Promise<{
        nonce: number;
        genesisDID: DID;
    }>;
    /** {@inheritDoc IIdentityWallet.createProfile} */
    createProfile(did: DID, nonce: number, verifier: string): Promise<DID>;
    /**
     *
     * gets profile identity by genesis identifiers
     *
     * @param {string} genesisIdentifier - genesis identifier from which profile has been derived
     * @returns `{Promise<Profile[]>}`
     */
    getProfilesByDID(did: DID): Promise<Profile[]>;
    /** {@inheritDoc IIdentityWallet.generateKey} */
    generateKey(keyType: KmsKeyType): Promise<KmsKeyId>;
    getProfileByVerifier(verifier: string): Promise<Profile | undefined>;
    /** {@inheritDoc IIdentityWallet.getDIDTreeModel} */
    getDIDTreeModel(did: DID): Promise<TreesModel>;
    /** {@inheritDoc IIdentityWallet.generateClaimMtp} */
    generateCredentialMtp(did: DID, credential: W3CCredential, treeState?: TreeState): Promise<MerkleTreeProofWithTreeState>;
    /** {@inheritDoc IIdentityWallet.generateNonRevocationMtp} */
    generateNonRevocationMtp(did: DID, credential: W3CCredential, treeState?: TreeState): Promise<MerkleTreeProofWithTreeState>;
    /** {@inheritDoc IIdentityWallet.sign} */
    sign(message: Uint8Array, credential: W3CCredential): Promise<Signature>;
    /** {@inheritDoc IIdentityWallet.signChallenge} */
    signChallenge(challenge: bigint, credential: W3CCredential): Promise<Signature>;
    /** {@inheritDoc IIdentityWallet.issueCredential} */
    issueCredential(issuerDID: DID, req: CredentialRequest, opts?: Options): Promise<W3CCredential>;
    /** {@inheritDoc IIdentityWallet.revokeCredential} */
    revokeCredential(issuerDID: DID, credential: W3CCredential): Promise<number>;
    /** {@inheritDoc IIdentityWallet.addCredentialsToMerkleTree} */
    addCredentialsToMerkleTree(credentials: W3CCredential[], issuerDID: DID): Promise<Iden3ProofCreationResult>;
    /** {@inheritDoc IIdentityWallet.generateIden3SparseMerkleTreeProof} */
    generateIden3SparseMerkleTreeProof(issuerDID: DID, credentials: W3CCredential[], txId: string, blockNumber?: number, blockTimestamp?: number): Promise<W3CCredential[]>;
    /** {@inheritDoc IIdentityWallet.publishStateToRHS} */
    publishStateToRHS(issuerDID: DID, rhsURL: string, revokedNonces?: number[]): Promise<void>;
    private getKMSIdByAuthCredential;
    private defineMTRootPosition;
    getCoreClaimFromCredential(credential: W3CCredential): Promise<Claim>;
    findOwnedCredentialsByDID(did: DID, query: ProofQuery): Promise<W3CCredential[]>;
}
