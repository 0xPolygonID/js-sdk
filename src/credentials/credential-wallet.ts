import { IRevocationService } from './revocation';
import { IDataStorage } from '../storage/interfaces';
import { W3CCredential, ProofQuery, RHSCredentialStatus } from './../verifiable';

import { DID } from '@iden3/js-iden3-core';
import { CredentialStatusType, RevocationStatus } from '../schema-processor';
import axios from 'axios';

export interface ICredentialWallet {
  list(): Promise<W3CCredential[]>;
  save(credential: W3CCredential): Promise<void>;
  saveAll(credential: W3CCredential[]): Promise<void>;
  remove(id: string): Promise<void>;
  findByQuery(query: ProofQuery): Promise<W3CCredential[]>;
  findById(id: string): Promise<W3CCredential | undefined>;
  findByContextType(context: string, type: string): Promise<W3CCredential[]>;

  getAuthCredential(id: DID): W3CCredential;
  getRevocationStatus(cred: W3CCredential): Promise<RevocationStatus>;
  getSchemaLoader(url: string, type: string): Promise<any>;
  findAllBySchemaHash(hash: string): Promise<W3CCredential[]>;
  findClaimsForCircuitQuery(claims, circuitQuery, requestFiled): Promise<W3CCredential[]>;
}

export class CredentialWallet implements ICredentialWallet {
  constructor(private readonly _storage: IDataStorage, private readonly _rhs: IRevocationService) {}
  getSchemaLoader(url: string, type: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  findAllBySchemaHash(hash: string): Promise<W3CCredential[]> {
    throw new Error('Method not implemented.');
  }

  getAuthCredential(did: DID): W3CCredential {
    // filter where issuer of auth credential is current did
    throw new Error('Method not implemented.');
  }

  async getRevocationStatus(cred: W3CCredential): Promise<RevocationStatus> {
    if (cred.credentialStatus?.type === CredentialStatusType.SparseMerkleTreeProof) {
      return (await axios.get<RevocationStatus>(cred.credentialStatus.id)).data;
    }

    if (cred.credentialStatus?.type === CredentialStatusType.Iden3ReverseSparseMerkleTreeProof) {
      try {
        return await this._rhs.getStatusFromRHS(cred, this._storage.states);
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

  findClaimsForCircuitQuery(
    claims: any,
    circuitQuery: any,
    requestFiled: any
  ): Promise<W3CCredential[]> {
    console.log("don't know");
    throw new Error('Method not implemented.');
  }

  async findById(id: string): Promise<W3CCredential | undefined> {
    return this._storage.credential.findCredentialById(id);
  }

  async findByContextType(context: string, type: string): Promise<W3CCredential[]> {
    return this._storage.credential.findCredentialByQuery({ context, type });
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
    return this._storage.credential.findCredentialByQuery(query);
  }
}
