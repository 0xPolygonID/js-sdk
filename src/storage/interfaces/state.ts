import { ZKProof } from '@iden3/js-jwz';
import { Signer } from 'ethers';
import { RootInfo, StateInfo, StateProof } from '../entities/state';

/**
 * Interface that defines methods for state storage
 *
 * @public
 * @interface   IStateStorage
 */
export interface IStateStorage {
  /**
   * gets latest state of identity
   *
   * @param {bigint} id - id to check
   * @returns `Promise<StateInfo>`
   */
  getLatestStateById(id: bigint): Promise<StateInfo>;

  /**
   * gets state info of identity by id and state
   *
   * @param {bigint} id - id to check
   * @param {bigint} state - state to check
   * @returns `Promise<StateInfo>`
   */
  getStateInfoByIdAndState(id: bigint, state: bigint): Promise<StateInfo>;
  /**
   * method to publish state onchain
   *
   * @param {ZKProof} proof - proof to publish
   * @param {Signer} signer  - signer of transaction
   * @returns `Promise<string>` - transaction identifier
   */
  publishState(proof: ZKProof, signer: Signer): Promise<string>;
  /**
   * generates proof of inclusion / non-inclusion to global identity state for given identity
   *
   * @param {bigint} id - id to check
   * @returns `Promise<StateProof>`
   */
  getGISTProof(id: bigint): Promise<StateProof>;

  /**
   * gets root info of global identity state tree
   *
   * @param {bigint} root - root to check
   * @param {bigint} userId - user id
   * @returns `Promise<RootInfo>`
   */
  getGISTRootInfo(root: bigint, userId: bigint): Promise<RootInfo>;
}
