import { DID, getUnixTimestamp } from '@iden3/js-iden3-core';

import axios from 'axios';
import { IDataStorage } from '../storage/interfaces';
import {
  W3CCredential,
  ProofQuery,
  VerifiableConstants,
  SubjectPosition,
  MerklizedRootPosition
} from './../verifiable';

import {
  CredentialStatusType,
  RevocationStatus,
  RHSCredentialStatus,
  Schema
} from '../schema-processor';
import * as uuid from 'uuid';
import { getStatusFromRHS } from './revocation';

export interface ClaimRequest {
  credentialSchema: string;
  type: string;
  credentialSubject: { [key: string]: any };
  expiration?: number;
  version?: number;
  revNonce?: number;
  subjectPosition?: SubjectPosition;
  merklizedRootPosition?: MerklizedRootPosition;
}

export interface ICredentialWallet {
  list(): Promise<W3CCredential[]>;
  save(credential: W3CCredential): Promise<void>;
  saveAll(credential: W3CCredential[]): Promise<void>;
  remove(id: string): Promise<void>;
  findByQuery(query: ProofQuery): Promise<W3CCredential[]>;
  findById(id: string): Promise<W3CCredential | undefined>;
  findByContextType(context: string, type: string): Promise<W3CCredential[]>;

  getAuthBJJCredential(did: DID): Promise<W3CCredential>;
  getRevocationStatus(cred: W3CCredential): Promise<RevocationStatus>;
  findClaimsForCircuitQuery(claims, circuitQuery, requestFiled): Promise<W3CCredential[]>;
  createCredential(
    hostUrl: string,
    issuer: DID,
    request: ClaimRequest,
    schema: Schema,
    rhsUrl?: string
  ): W3CCredential;
}

export class CredentialWallet implements ICredentialWallet {
  constructor(private readonly _storage: IDataStorage) {}

  async getAuthBJJCredential(did: DID): Promise<W3CCredential> {
    // filter where issuer of auth credential is current did

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
      const revocationStatus = await this.getRevocationStatus(authCred);

      if (!revocationStatus.mtp.existence) {
        return authCred;
      }
    }
    throw new Error('all auth bjj credentials are revoked');
  }

  async getRevocationStatus(cred: W3CCredential): Promise<RevocationStatus> {
    if (cred.credentialStatus?.type === CredentialStatusType.SparseMerkleTreeProof) {
      return (await axios.get<RevocationStatus>(cred.credentialStatus.id)).data;
    }

    if (cred.credentialStatus?.type === CredentialStatusType.Iden3ReverseSparseMerkleTreeProof) {
      try {
        return await getStatusFromRHS(cred, this._storage.states, cred.credentialStatus.id);
      } catch (e) {
        console.error(e);
        const status = cred.credentialStatus as RHSCredentialStatus;
        if (status?.statusIssuer?.type === CredentialStatusType.SparseMerkleTreeProof) {
          return (await axios.get<RevocationStatus>(cred.credentialStatus.id)).data;
        }
        throw new Error(`can't fetch revocation status`);
      }
    }
    throw new Error('revocation status unknown');
  }

  createCredential = (
    hostUrl: string,
    issuer: DID,
    request: ClaimRequest,
    schema: Schema,
    rhsUrl?: string
  ): W3CCredential => {
    const context = [
      VerifiableConstants.JSONLD_SCHEMA.W3C_CREDENTIAL_2018,
      VerifiableConstants.JSONLD_SCHEMA.IDEN3_CREDENTIAL,
      schema.$metadata.uris['jsonLdContext']
    ];
    const credentialType = [VerifiableConstants.CREDENTIAL_TYPE.W3C_VERIFIABLE, request.type];

    const expirationDate = request.expiration;
    const issuanceDate = getUnixTimestamp(new Date());

    const issuerDID = issuer.toString();
    const credentialSubject = request.credentialSubject;
    credentialSubject['type'] = request.type;

    const cr = new W3CCredential();
    cr.id = `${hostUrl}/${uuid.v4()}`;
    cr['@context'] = context;
    cr.type = credentialType;
    cr.expirationDate = expirationDate;
    cr.issuanceDate = issuanceDate;
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

  findClaimsForCircuitQuery(
    claims: any,
    circuitQuery: any,
    requestFiled: any
  ): Promise<W3CCredential[]> {
    throw new Error('Method not implemented.');
  }

  async findById(id: string): Promise<W3CCredential | undefined> {
    return this._storage.credential.findCredentialById(id);
  }

  async findByContextType(context: string, type: string): Promise<W3CCredential[]> {
    return this._storage.credential.findCredentialsByQuery({ context, type });
  }

  async save(credential: W3CCredential): Promise<void> {
    return this._storage.credential.saveCredential(credential);
  }

  async saveAll(credentials: W3CCredential[]): Promise<void> {
    return this._storage.credential.saveAllCredentials(credentials);
  }

  async remove(id): Promise<void> {
    return this._storage.credential.removeCredential(id);
  }

  async list(): Promise<W3CCredential[]> {
    return this._storage.credential.listCredentials();
  }

  async findByQuery(query: ProofQuery): Promise<W3CCredential[]> {
    return this._storage.credential.findCredentialsByQuery(query);
  }
}
