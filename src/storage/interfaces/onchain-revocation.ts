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
   * @param {bigint} id - id to check
   * @returns `Promise<StateInfo>`
   */
  getRevocationStatusByIdAndState(
    issuerID: bigint,
    state: bigint,
    nonce: number
  ): Promise<RevocationStatus>;
}
