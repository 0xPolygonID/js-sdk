import { DID } from '@iden3/js-iden3-core';
import { W3CCredential } from '../../verifiable';

/**
 * Interface that allows the processing of the on-chain issuer
 *
 * @beta
 * @interface IOnchainIssuer
 */
export interface IOnchainIssuer {
  getCredential(issuerDID: DID, userDID: DID, credentialId: bigint): Promise<W3CCredential>;
  getUserCredentialIds(issuerDID: DID, userDID: DID): Promise<bigint[]>;
}
