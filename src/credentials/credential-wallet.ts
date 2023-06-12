import { buildDIDType, BytesHelper, DID, Id } from '@iden3/js-iden3-core';

import { IDataStorage } from '../storage/interfaces';
import {
  W3CCredential,
  ProofQuery,
  VerifiableConstants,
  SubjectPosition,
  MerklizedRootPosition,
  CredentialStatus,
  RevocationStatus,
  CredentialStatusType,
  IssuerData
} from './../verifiable';

import { JSONSchema } from '../schema-processor';
import * as uuid from 'uuid';
import { getStatusFromRHS, RevocationStatusDTO, getRevocationOnChain } from './revocation';
import { Proof } from '@iden3/js-merkletree';

// ErrAllClaimsRevoked all claims are revoked.
const ErrAllClaimsRevoked = 'all claims are revoked';

/**
 * Request to core library to create Core Claim from W3C Verifiable Credential
 *
 * @export
 * @beta
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
  credentialSubject: { [key: string]: string | object | number };
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
 * @export
 * @beta
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
   * @param {DID} issuerDID  - credential issuer identity
   * @param {IssuerData} issuerData - metadata of the issuer, usually contained in the BjjSignature / Iden3SparseMerkleTreeProof
   * @returns `Promise<RevocationStatus>`
   */
  getRevocationStatus(
    credStatus: CredentialStatus,
    issuerDID: DID,
    issuerData: IssuerData
  ): Promise<RevocationStatus>;
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
 * @export
 * @beta
 * @class CredentialWallet
 * @implements implements ICredentialWallet interface
 */
export class CredentialWallet implements ICredentialWallet {
  /**
   * Creates an instance of CredentialWallet.
   * @param {IDataStorage} _storage - - data storage to access credential / identity / Merkle tree data
   */
  constructor(private readonly _storage: IDataStorage) {}

  /**
   * {@inheritDoc ICredentialWallet.getAuthBJJCredential}
   */
  async getAuthBJJCredential(did: DID): Promise<W3CCredential> {
    // filter where the issuer of auth credential is given did

    const authBJJCredsOfIssuer = await this._storage.credential.findCredentialsByQuery({
      context: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_SCHEMA_JSONLD_URL,
      type: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_TYPE,
      allowedIssuers: [did.toString()]
    });

    if (!authBJJCredsOfIssuer.length) {
      throw new Error('no auth credentials found');
    }

    for (let index = 0; index < authBJJCredsOfIssuer.length; index++) {
      const authCred = authBJJCredsOfIssuer[index];
      const revocationStatus = await this.getRevocationStatusFromCredential(authCred);

      if (!revocationStatus.mtp.existence) {
        return authCred;
      }
    }
    throw new Error('all auth bjj credentials are revoked');
  }

  /**
   * {@inheritDoc ICredentialWallet.getRevocationStatusFromCredential}
   */
  async getRevocationStatusFromCredential(cred: W3CCredential): Promise<RevocationStatus> {
    const mtpProof = cred.getIden3SparseMerkleTreeProof();
    const sigProof = cred.getBJJSignature2021Proof();

    const issuerData: IssuerData | undefined = mtpProof
      ? mtpProof.issuerData
      : sigProof?.issuerData;
    if (!issuerData) {
      throw new Error('no sig / mtp proof to check issuer info');
    }
    const issuerDID = DID.parse(cred.issuer);

    console.log('getRevocationStatusFromCredential');
    return await this.getRevocationStatus(cred.credentialStatus, issuerDID, issuerData);
  }

  /**
   * {@inheritDoc ICredentialWallet.getRevocationStatus}
   */
  async getRevocationStatus(
    credStatus: CredentialStatus,
    issuerDID: DID,
    issuerData: IssuerData
  ): Promise<RevocationStatus> {
    console.log('getRevocationStatus');
    switch (credStatus.type) {
      case CredentialStatusType.SparseMerkleTreeProof: {
        const revStatusDTO = await (await fetch(credStatus.id)).json();
        return Object.assign(new RevocationStatusDTO(), revStatusDTO).toRevocationStatus();
      }
      case CredentialStatusType.Iden3ReverseSparseMerkleTreeProof: {
        try {
          return await getStatusFromRHS(issuerDID, credStatus, this._storage.states);
        } catch (e) {
          const errMsg = e['reason'] ?? e.message;
          if (
            errMsg.includes(VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST) &&
            isIssuerGenesis(issuerDID.toString(), issuerData.state.value)
          ) {
            return {
              mtp: new Proof(),
              issuer: {
                state: issuerData.state.value,
                revocationTreeRoot: issuerData.state.revocationTreeRoot,
                rootOfRoots: issuerData.state.rootOfRoots,
                claimsTreeRoot: issuerData.state.claimsTreeRoot
              }
            };
          }

          if (credStatus?.statusIssuer?.type === CredentialStatusType.SparseMerkleTreeProof) {
            return await (await fetch(credStatus.id)).json();
          }
          throw new Error(`can't fetch revocation status`);
        }
      }
      case CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023: {
        return await getRevocationOnChain(credStatus);
      }
    }

    throw new Error('revocation status unknown');
  }
  /**
   * {@inheritDoc ICredentialWallet.createCredential}
   */
  createCredential = (
    issuer: DID,
    request: CredentialRequest,
    schema: JSONSchema
  ): W3CCredential => {
    if (!schema.$metadata.uris['jsonLdContext']) {
      throw new Error('jsonLdContext is missing is the schema');
    }
    const context = [
      VerifiableConstants.JSONLD_SCHEMA.W3C_CREDENTIAL_2018,
      VerifiableConstants.JSONLD_SCHEMA.IDEN3_CREDENTIAL,
      schema.$metadata.uris['jsonLdContext']
    ];
    const credentialType = [
      VerifiableConstants.CREDENTIAL_TYPE.W3C_VERIFIABLE_CREDENTIAL,
      request.type
    ];

    const expirationDate =
      !request.expiration || request.expiration == 0 ? null : request.expiration;

    const issuerDID = issuer.toString();
    const credentialSubject = request.credentialSubject;
    credentialSubject['type'] = request.type;

    const cr = new W3CCredential();
    cr.id = `urn:${uuid.v4()}`;
    cr['@context'] = context;
    cr.type = credentialType;
    cr.expirationDate = expirationDate ? new Date(expirationDate * 1000).toISOString() : undefined;
    cr.issuanceDate = new Date().toISOString();
    cr.credentialSubject = credentialSubject;
    cr.issuer = issuerDID.toString();
    cr.credentialSchema = {
      id: request.credentialSchema,
      type: VerifiableConstants.JSON_SCHEMA_VALIDATOR
    };

    const id =
      request.revocationOpts.type === CredentialStatusType.SparseMerkleTreeProof
        ? `${request.revocationOpts.id.replace(/\/$/, '')}/${request.revocationOpts.nonce}`
        : request.revocationOpts.id;

    cr.credentialStatus = {
      id,
      revocationNonce: request.revocationOpts.nonce,
      type: request.revocationOpts.type
    };

    return cr;
  };
  /**
   * {@inheritDoc ICredentialWallet.findById}
   */
  async findById(id: string): Promise<W3CCredential | undefined> {
    return this._storage.credential.findCredentialById(id);
  }
  /**
   * {@inheritDoc ICredentialWallet.findByContextType}
   */
  async findByContextType(context: string, type: string): Promise<W3CCredential[]> {
    return this._storage.credential.findCredentialsByQuery({ context, type });
  }
  /**
   * {@inheritDoc ICredentialWallet.save}
   */
  async save(credential: W3CCredential): Promise<void> {
    return this._storage.credential.saveCredential(credential);
  }
  /**
   * {@inheritDoc ICredentialWallet.saveAll}
   */
  async saveAll(credentials: W3CCredential[]): Promise<void> {
    return this._storage.credential.saveAllCredentials(credentials);
  }
  /**
   * {@inheritDoc ICredentialWallet.remove}
   */
  async remove(id: string): Promise<void> {
    return this._storage.credential.removeCredential(id);
  }
  /**
   * {@inheritDoc ICredentialWallet.list}
   */
  async list(): Promise<W3CCredential[]> {
    return this._storage.credential.listCredentials();
  }
  /**
   * {@inheritDoc ICredentialWallet.findByQuery}
   */
  async findByQuery(query: ProofQuery): Promise<W3CCredential[]> {
    return this._storage.credential.findCredentialsByQuery(query);
  }

  /**
   * {@inheritDoc ICredentialWallet.filterByCredentialSubject}
   */
  async filterByCredentialSubject(
    credentials: W3CCredential[],
    subject: DID
  ): Promise<W3CCredential[]> {
    return credentials.filter((cred: W3CCredential) => {
      return cred.credentialSubject['id'] === subject.toString();
    });
  }
  async findNonRevokedCredential(creds: W3CCredential[]): Promise<{
    cred: W3CCredential;
    revStatus: RevocationStatus;
  }> {
    console.log('findNonRevokedCredential');
    for (const cred of creds) {
      const revStatus = await this.getRevocationStatusFromCredential(cred);
      if (revStatus.mtp.existence) {
        continue;
      }
      return { cred, revStatus };
    }
    throw new Error(ErrAllClaimsRevoked);
  }
}

/**
 * Checks if issuer did is created from given state is genesis
 *
 * @export
 * @param {string} issuer - did (string)
 * @param {string} state  - hex state
 * @returns boolean
 */
export function isIssuerGenesis(issuer: string, state: string): boolean {
  const did = DID.parse(issuer);
  const arr = BytesHelper.hexToBytes(state);
  const stateBigInt = BytesHelper.bytesToInt(arr);
  const type = buildDIDType(did.method, did.blockchain, did.networkId);
  return isGenesisStateId(did.id.bigInt(), stateBigInt, type);
}

/**
 * Checks if id is created from given state and type is genesis
 *
 * @export
 * @param {bigint} id
 * @param {bigint} state
 * @param {Uint8Array} type
 * @returns boolean - returns if id is genesis
 */
export function isGenesisStateId(id: bigint, state: bigint, type: Uint8Array): boolean {
  const idFromState = Id.idGenesisFromIdenState(type, state);
  return id.toString() === idFromState.bigInt().toString();
}
