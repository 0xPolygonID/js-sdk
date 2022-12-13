import { IStateStorage } from './../blockchain/index';
import {
  Iden3ReverseSparseMerkleTreeProof,
  W3CCredential
} from './../schema-processor/verifiable/credential';

import { Id } from '@iden3/js-iden3-core';
import { CredentialStatusType, RevocationStatus } from '../schema-processor';
import { ProofQuery } from '../proof';
import { IRepository } from './repository';
import axios from 'axios';
import { getStatusFromRHS } from './revocation';

export interface ICredentialWallet {
  list(): Promise<W3CCredential[]>;
  save(credential: W3CCredential): Promise<void>;
  saveAll(credential: W3CCredential[]): Promise<void>;
  remove(id: string): Promise<void>;
  findByQuery(query: ProofQuery): Promise<W3CCredential[]>;
  findById(id: string): Promise<W3CCredential | undefined>;
  findByContextType(context: string, type: string): Promise<W3CCredential[]>;

  getAuthCredential(id: Id): W3CCredential;
  findCredentialWithLatestVersion(id: Id, hash: string): W3CCredential;
  getRevocationStatus(cred: W3CCredential): Promise<RevocationStatus>;
  getSchemaLoader(url: string, type: string): Promise<any>;
  findAllBySchemaHash(hash: string): Promise<W3CCredential[]>;
  findClaimsForCircuitQuery(claims, circuitQuery, requestFiled): Promise<W3CCredential[]>;
}

export class CredentialWallet implements ICredentialWallet {
  constructor(private repository: IRepository, private readonly stateStorage: IStateStorage) {}

  getAuthCredential(id: Id): W3CCredential {
    throw new Error('Method not implemented.');
  }

  findCredentialWithLatestVersion(id: Id, hash: string): W3CCredential {
    throw new Error('Method not implemented.');
  }

  async getRevocationStatus(cred: W3CCredential): Promise<RevocationStatus> {
    if (cred.credentialStatus?.type === CredentialStatusType.SparseMerkleTreeProof) {
      return (await axios.get<RevocationStatus>(cred.credentialStatus.id)).data;
    }

    if (cred.credentialStatus?.type === CredentialStatusType.Iden3ReverseSparseMerkleTreeProof) {
      try {
        return await getStatusFromRHS(cred, this.stateStorage);
      } catch (e) {
        console.error(e);
        const status = cred.credentialStatus as Iden3ReverseSparseMerkleTreeProof;
        if (status?.statusIssuer.type === CredentialStatusType.SparseMerkleTreeProof) {
          return (await axios.get<RevocationStatus>(cred.credentialStatus.id)).data;
        }
        throw new Error(`can't fetch revocation status`);
      }
    }
    throw new Error('revocation status unknown');
  }

  getSchemaLoader(url: string, type: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  findAllBySchemaHash(hash: string): Promise<W3CCredential[]> {
    throw new Error('Method not implemented.');
  }

  findClaimsForCircuitQuery(
    claims: any,
    circuitQuery: any,
    requestFiled: any
  ): Promise<W3CCredential[]> {
    throw new Error('Method not implemented.');
  }

  async findById(id: string): Promise<W3CCredential | undefined> {
    return this.repository.findById(id);
  }

  async findByContextType(context: string, type: string): Promise<W3CCredential[]> {
    return this.repository.findByQuery({ context, type });
  }

  async save(credential: W3CCredential): Promise<void> {
    return this.repository.save(credential);
  }

  async saveAll(credentials: W3CCredential[]): Promise<void> {
    return this.repository.saveAll(credentials);
  }

  async remove(id): Promise<void> {
    return this.repository.remove(id);
  }

  async list(): Promise<W3CCredential[]> {
    return this.repository.list();
  }

  async findByQuery(query: ProofQuery): Promise<W3CCredential[]> {
    return this.repository.findByQuery(query);
  }
}
