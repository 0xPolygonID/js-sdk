import { Iden3Credential } from './../schema-processor/verifiable/credential';
import { Id } from '@iden3/js-iden3-core';
import { RevocationStatus } from '../schema-processor';
export interface ICredentialWallet {
  getAuthCredential(id: Id): Iden3Credential;
  findCredentialWithLatestVersion(id: Id, hash: string): Iden3Credential;
  getRevocationStatus(cred: Iden3Credential): RevocationStatus;
  list(): Promise<Iden3Credential[]>;
  save(credential: Iden3Credential): Promise<void>;
  findByQuery(query): Promise<Iden3Credential[]>;
  findById(id: Id): Promise<Iden3Credential>;
  findAllBySchemaHash(hash: string): Promise<Iden3Credential[]>;
  getSchemaLoader(url: string, type: string): Promise<any>;
  findClaimsForCircuitQuery(claims, circuitQuery, requestFiled): Promise<Iden3Credential[]>;
}
