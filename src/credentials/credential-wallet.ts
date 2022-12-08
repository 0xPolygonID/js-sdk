import { W3CCredential } from './../schema-processor/verifiable/credential';

import { Id } from '@iden3/js-iden3-core';
import { RevocationStatus } from '../schema-processor';
export interface ICredentialWallet {
  getAuthCredential(id: Id): W3CCredential;
  findCredentialWithLatestVersion(id: Id, hash: string): W3CCredential;
  getRevocationStatus(cred: W3CCredential): RevocationStatus;
  list(): Promise<W3CCredential[]>;
  save(credential: W3CCredential): Promise<void>;
  findByQuery(query): Promise<W3CCredential[]>;
  findById(id: Id): Promise<W3CCredential>;
  findAllBySchemaHash(hash: string): Promise<W3CCredential[]>;
  getSchemaLoader(url: string, type: string): Promise<any>;
  findClaimsForCircuitQuery(claims, circuitQuery, requestFiled): Promise<W3CCredential[]>;
}
