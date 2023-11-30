import { RevocationStatus } from '../../verifiable';
/**
 * Interface that defines methods for onchain revocation store
 *
 * @public
 * @interface   IOnchainRevocationStore
 */
export interface IOnchainRevocationStore {
  /**
   * gets latest state of identity
   *
   * @param {bigint} issuerID - issuer id
   * @param {bigint} state - issuer state
   * @param {number} nonce - revocation nonce
   * @returns `Promise<StateInfo>`
   */
  getRevocationStatusByIdAndState(
    issuerID: bigint,
    state: bigint,
    nonce: number
  ): Promise<RevocationStatus>;
}
