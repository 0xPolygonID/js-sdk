import { DID } from '@iden3/js-iden3-core';
import { IDataStorage } from '../storage/interfaces';
import { W3CCredential, ProofQuery, SubjectPosition, MerklizedRootPosition, CredentialStatus, RevocationStatus, CredentialStatusType } from './../verifiable';
import { JSONSchema } from '../schema-processor';
import { CredentialStatusResolverRegistry } from './status/resolver';
import { CredentialStatusResolveOptions } from './status/resolver';
/**
 * Request to core library to create Core Claim from W3C Verifiable Credential
 *
 * @public
 * @interface CredentialRequest
 */
export interface CredentialRequest {
    /**
     * JSON credential schema
     */
    credentialSchema: string;
    /**
     * Credential type
     */
    type: string;
    /**
     * Credential subject, usually contains claims and identifier
     */
    credentialSubject: {
        [key: string]: string | object | number | boolean;
    };
    /**
     * expiration time
     */
    expiration?: number;
    /**
     * claim version
     */
    version?: number;
    /**
     * subject position (index / value / none)
     */
    subjectPosition?: SubjectPosition;
    /**
     * merklizedRootPosition (index / value / none)
     */
    merklizedRootPosition?: MerklizedRootPosition;
    /**
     * Revocation options
     *
     * @type {{
     *     id: string;
     *     nonce?: number;
     *     type: CredentialStatusType;
     *   }}
     * @memberof CredentialRequest
     */
    revocationOpts: {
        id: string;
        nonce?: number;
        type: CredentialStatusType;
    };
}
/**
 * Interface to work with credential wallets
 *
 * @public
 * @interface   ICredentialWallet
 */
export interface ICredentialWallet {
    /**
     * List of W3C Credential
     *
     * @returns `Promise<W3CCredential[]`
     */
    list(): Promise<W3CCredential[]>;
    /**
     * saves W3C credential (upsert)
     * @param {W3CCredential} credential - credential to save
     * @returns `Promise<void>`
     *
     */
    save(credential: W3CCredential): Promise<void>;
    /**
     * saves the batch of W3C credentials (upsert)
     * @param {W3CCredential[]} credentials - credentials to save
     * @returns `Promise<void>`
     */
    saveAll(credentials: W3CCredential[]): Promise<void>;
    /**
     *
     * removes W3C credentials from data storage
     * @param {string} id
     * @returns `Promise<void>`
     */
    remove(id: string): Promise<void>;
    /**
     * Find credential using iden3 query language
     *
     * @param {ProofQuery} query  - protocol query to find credential
     * @returns `Promise<W3CCredential[]>`
     */
    findByQuery(query: ProofQuery): Promise<W3CCredential[]>;
    /**
     * Finds the credential by its id
     *
     * @param {string} id - id of credential
     * @returns `Promise<W3CCredential | undefined>`
     */
    findById(id: string): Promise<W3CCredential | undefined>;
    /**
     * Finds credentials by JSON-LD schema and type
     *
     * @param {string} context - the URL of JSON-LD schema where type is defined
     * @returns `Promise<W3CCredential[]>`
     */
    findByContextType(context: string, type: string): Promise<W3CCredential[]>;
    /**
     * Filters given credentials with given credential subject
     *
     * @param {W3CCredential[]} credentials - credentials to filter
     * @param {DID} subject - credential subject id
     * @returns `Promise<W3CCredential[]>`
     */
    filterByCredentialSubject(credentials: W3CCredential[], subject: DID): Promise<W3CCredential[]>;
    /**
     * Finds Auth BJJ credential for given user
     *
     * @param {DID} did - the issuer of Auth BJJ credential
     * @returns `Promise<W3CCredential>` W3CCredential with AuthBJJCredential type
     */
    getAuthBJJCredential(did: DID): Promise<W3CCredential>;
    /**
     * Fetches or Builds a revocation status for a given credential
     * Supported types for credentialStatus field: SparseMerkleTreeProof, Iden3ReverseSparseMerkleTreeProof
     *
     * @param {W3CCredential} cred - credential for which lib should build revocation status
     * @returns `Promise<RevocationStatus>`
     */
    getRevocationStatusFromCredential(cred: W3CCredential): Promise<RevocationStatus>;
    /**
     * Fetches Revocation status depended on type
     *
     * @param {(CredentialStatus )} credStatus - credentialStatus field of the Verifiable Credential.  Supported types for credentialStatus field: SparseMerkleTreeProof, Iden3ReverseSparseMerkleTreeProof
     * @param {CredentialStatusResolveOptions} credentialStatusResolveOptions - options to resolve credential status
     * @returns `Promise<RevocationStatus>`
     */
    getRevocationStatus(credStatus: CredentialStatus, credentialStatusResolveOptions?: CredentialStatusResolveOptions): Promise<RevocationStatus>;
    /**
     * Creates a W3C verifiable Credential object
     *
     * @param {string} hostUrl - URL that will be used as a prefix for credential identifier
     * @param {DID} issuer - issuer identity
     * @param {CredentialRequest} request - specification of claim creation parameters
     * @param {JSONSchema} schema - JSON schema for W3C Verifiable Credential
     * @returns W3CCredential
     */
    createCredential(issuer: DID, request: CredentialRequest, schema: JSONSchema): W3CCredential;
    /**
     * Finds non-revoked credential from a given list by resolving their credential status
     *
     * @param {W3CCredential[]} creds
     * @returns `{Promise<{
     *     cred: W3CCredential;
     *     revStatus: RevocationStatus;
     *   }>` not revoked credential and it's revocation status
     */
    findNonRevokedCredential(creds: W3CCredential[]): Promise<{
        cred: W3CCredential;
        revStatus: RevocationStatus;
    }>;
}
/**
 *
 * Wallet instance is a wrapper of CRUD logic for W3C credentials,
 * also it allows to fetch revocation statuses.
 *
 * @public
 * @class CredentialWallet
 * @implements implements ICredentialWallet interface
 */
export declare class CredentialWallet implements ICredentialWallet {
    private readonly _storage;
    private readonly _credentialStatusResolverRegistry?;
    /**
     * Creates an instance of CredentialWallet.
     * @param {IDataStorage} _storage - data storage to access credential / identity / Merkle tree data
     * @param {CredentialStatusResolverRegistry} _credentialStatusResolverRegistry - list of credential status resolvers
     * if _credentialStatusResolverRegistry is not provided, default resolvers will be used
     */
    constructor(_storage: IDataStorage, _credentialStatusResolverRegistry?: CredentialStatusResolverRegistry | undefined);
    /**
     * {@inheritDoc ICredentialWallet.getAuthBJJCredential}
     */
    getAuthBJJCredential(did: DID): Promise<W3CCredential>;
    /**
     * {@inheritDoc ICredentialWallet.getRevocationStatusFromCredential}
     */
    getRevocationStatusFromCredential(cred: W3CCredential): Promise<RevocationStatus>;
    /**
     * {@inheritDoc ICredentialWallet.getRevocationStatus}
     */
    getRevocationStatus(credStatus: CredentialStatus, credentialStatusResolveOptions?: CredentialStatusResolveOptions): Promise<RevocationStatus>;
    /**
     * {@inheritDoc ICredentialWallet.createCredential}
     */
    createCredential: (issuer: DID, request: CredentialRequest, schema: JSONSchema) => W3CCredential;
    /**
     * {@inheritDoc ICredentialWallet.findById}
     */
    findById(id: string): Promise<W3CCredential | undefined>;
    /**
     * {@inheritDoc ICredentialWallet.findByContextType}
     */
    findByContextType(context: string, type: string): Promise<W3CCredential[]>;
    /**
     * {@inheritDoc ICredentialWallet.save}
     */
    save(credential: W3CCredential): Promise<void>;
    /**
     * {@inheritDoc ICredentialWallet.saveAll}
     */
    saveAll(credentials: W3CCredential[]): Promise<void>;
    /**
     * {@inheritDoc ICredentialWallet.remove}
     */
    remove(id: string): Promise<void>;
    /**
     * {@inheritDoc ICredentialWallet.list}
     */
    list(): Promise<W3CCredential[]>;
    /**
     * {@inheritDoc ICredentialWallet.findByQuery}
     */
    findByQuery(query: ProofQuery): Promise<W3CCredential[]>;
    /**
     * {@inheritDoc ICredentialWallet.filterByCredentialSubject}
     */
    filterByCredentialSubject(credentials: W3CCredential[], subject: DID): Promise<W3CCredential[]>;
    findNonRevokedCredential(creds: W3CCredential[]): Promise<{
        cred: W3CCredential;
        revStatus: RevocationStatus;
    }>;
}
