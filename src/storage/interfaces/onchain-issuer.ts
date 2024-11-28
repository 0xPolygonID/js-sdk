import { Id } from '@iden3/js-iden3-core';
import { W3CCredential } from '../../verifiable';

/**
 * Interface that allows the processing of the on-chain issuer
 *
 * @beta
 * @interface IOnchainIssuer
 */
export interface IOnchainIssuer {
  getCredential(userId: Id, credentialId: bigint): Promise<W3CCredential>;
  getUserCredentialIds(userId: Id): Promise<bigint[]>;
}
