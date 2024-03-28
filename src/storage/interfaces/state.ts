import { ZKProof } from '@iden3/js-jwz';
import { Signer } from 'ethers';
import { RootInfo, StateInfo, StateProof } from '../entities/state';
import { Id } from '@iden3/js-iden3-core';
import { Hash } from '@iden3/js-merkletree';

export interface UserStateTransition {
  userId: Id;
  oldUserState: Hash;
  newUserState: Hash;
  isOldStateGenesis: boolean;
}

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
  publishState(
    proof: ZKProof | undefined,
    signer: Signer,
    userStateTransition?: UserStateTransition
  ): Promise<string>;
  /**
   * generates proof of inclusion / non-inclusion to global identity state for given identity
   *
   * @param {bigint} id - id to check
   * @returns `Promise<StateProof>`
   */
  getGISTProof(id: bigint): Promise<StateProof>;
  /**
   *
   *
   * @param {bigint} root - returns info about global state root
   * @returns `{Promise<RootInfo>}`
   */
  getGISTRootInfo(root: bigint): Promise<RootInfo>;
}
