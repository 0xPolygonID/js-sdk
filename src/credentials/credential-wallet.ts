import { buildDIDType, BytesHelper, DID, Id } from '@iden3/js-iden3-core';

import axios from 'axios';
import { IDataStorage } from '../storage/interfaces';
import {
  W3CCredential,
  ProofQuery,
  VerifiableConstants,
  SubjectPosition,
  MerklizedRootPosition,
  CredentialStatus,
  RHSCredentialStatus,
  RevocationStatus,
  CredentialStatusType,
  IssuerData
} from './../verifiable';

import { Schema } from '../schema-processor';
import * as uuid from 'uuid';
import { getStatusFromRHS } from './revocation';
import { Proof } from '@iden3/js-merkletree';

export interface ClaimRequest {
  credentialSchema: string;
  type: string;
  credentialSubject: { [key: string]: string | object | number };
  expiration?: number;
  version?: number;
  revNonce?: number;
  subjectPosition?: SubjectPosition;
  merklizedRootPosition?: MerklizedRootPosition;
}

/**
 * Interface to work with credential wallets
 *
 * @export
 * @interface ICredentialWallet
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
   * @param {(CredentialStatus | RHSCredentialStatus)} credStatus - credentialStatus field of the Verifiable Credential.  Supported types for credentialStatus field: SparseMerkleTreeProof, Iden3ReverseSparseMerkleTreeProof
   * @param {DID} issuerDID  - credential issuer identity 
   * @param {IssuerData} issuerData - metadata of the issuer, usually contained in the BjjSignature / Iden3SparseMerkleTreeProof
   * @returns `Promise<RevocationStatus>`
   */
  getRevocationStatus(
    credStatus: CredentialStatus | RHSCredentialStatus,
    issuerDID: DID,
    issuerData: IssuerData
  ): Promise<RevocationStatus>;
  /**
   * Creates a W3C verifiable Credential object
   *
   * @param {string} hostUrl - URL that will be used as a prefix for credential identifier
   * @param {DID} issuer - issuer identity
   * @param {ClaimRequest} request - specification of claim creation parameters
   * @param {Schema} schema - JSON schema for W3C Verifiable Credential
   * @param {string} [rhsUrl] - URL of reverse hash service, if it's not set - host url is used for 'SparseMerkleTreeProof' credential status type
   * @returns W3CCredential
   */
  createCredential(
    hostUrl: string,
    issuer: DID,
    request: ClaimRequest,
    schema: Schema,
    rhsUrl?: string
  ): W3CCredential;
}


/**
 *
 * Wallet instance is a wrapper of CRUD logic for W3C credentials, 
 * also it allows to fetch revocation statuses. 
 *
 * @export
 * @class CredentialWallet
 * @implements {ICredentialWallet}
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

    return await this.getRevocationStatus(cred.credentialStatus, issuerDID, issuerData);
  }

  /** 
  * {@inheritDoc ICredentialWallet.getRevocationStatus} 
  */
  async getRevocationStatus(
    credStatus: CredentialStatus | RHSCredentialStatus,
    issuerDID: DID,
    issuerData: IssuerData
  ): Promise<RevocationStatus> {
    if (credStatus.type === CredentialStatusType.SparseMerkleTreeProof) {
      return (await axios.get<RevocationStatus>(credStatus.id)).data;
    }

    if (credStatus.type === CredentialStatusType.Iden3ReverseSparseMerkleTreeProof) {
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

        const status = credStatus as RHSCredentialStatus;
        if (status?.statusIssuer?.type === CredentialStatusType.SparseMerkleTreeProof) {
          return (await axios.get<RevocationStatus>(credStatus.id)).data;
        }
        throw new Error(`can't fetch revocation status`);
      }
    }
    throw new Error('revocation status unknown');
  }
  /** 
  * {@inheritDoc ICredentialWallet.createCredential} 
  */
  createCredential = (
    hostUrl: string,
    issuer: DID,
    request: ClaimRequest,
    schema: Schema,
    rhsUrl?: string
  ): W3CCredential => {
    if (!schema.$metadata.uris['jsonLdContext']) {
      throw new Error('jsonLdContext is missing is the schema');
    }
    const context = [
      VerifiableConstants.JSONLD_SCHEMA.W3C_CREDENTIAL_2018,
      VerifiableConstants.JSONLD_SCHEMA.IDEN3_CREDENTIAL,
      schema.$metadata.uris['jsonLdContext']
    ];
    const credentialType = [VerifiableConstants.CREDENTIAL_TYPE.W3C_VERIFIABLE, request.type];

    const expirationDate =
      !request.expiration || request.expiration == 0 ? null: request.expiration;

    const issuerDID = issuer.toString();
    const credentialSubject = request.credentialSubject;
    credentialSubject['type'] = request.type;

    const cr = new W3CCredential();
    cr.id = `${hostUrl}/${uuid.v4()}`;
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

    if (rhsUrl) {
      cr.credentialStatus = {
        id: `${rhsUrl}`,
        revocationNonce: request.revNonce,
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof
      };
    } else {
      cr.credentialStatus = {
        id: `${hostUrl}/revocation/${request.revNonce}`,
        revocationNonce: request.revNonce,
        type: CredentialStatusType.SparseMerkleTreeProof
      };
    }

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
  async remove(id): Promise<void> {
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
}

/**
 * Checks if issuer did is created from given state is genesis
 *
 * @export
 * @param {string} issuer - did (string)
 * @param {string} state  - hex state 
 * @returns {*}  {boolean}
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
 * @returns {*}  {boolean} - returns if id is genesis
 */
export function isGenesisStateId(id: bigint, state: bigint, type: Uint8Array): boolean {
  const idFromState = Id.idGenesisFromIdenState(type, state);
  return id.toString() === idFromState.bigInt().toString();
}
