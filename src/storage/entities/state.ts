import { ProofJSON } from '@iden3/js-merkletree';
/**
 * state information of identity from chain.
 *
 * @public
 * @interface   StateInfo
 */
export interface StateInfo {
  id?: bigint;
  state?: bigint;
  replacedByState?: bigint;
  createdAtTimestamp?: bigint;
  replacedAtTimestamp?: bigint;
  createdAtBlock?: bigint;
  replacedAtBlock?: bigint;
}

/**
 * state proof of identity from chain
 *
 * @public
 * @interface   StateProof
 */
export interface StateProof {
  root: bigint;
  existence: boolean;
  siblings: bigint[];
  index: bigint;
  value: bigint;
  auxExistence: boolean;
  auxIndex: bigint;
  auxValue: bigint;
}

/**
 * global identity state root info from chain
 *
 * @public
 * @interface   RootInfo
 */
export interface RootInfo {
  root: bigint;
  replacedByRoot: bigint;
  createdAtTimestamp: bigint;
  replacedAtTimestamp: bigint;
  createdAtBlock: bigint;
  replacedAtBlock: bigint;
  proof?: ProofJSON;
}

/**
 * identity state message
 *
 * @public
 * @interface IdentityStateMsg
 */
export interface IdentityStateMsg {
  timestamp: number;
  id: bigint;
  state: bigint;
  replacedAtTimestamp: number;
}

/**
 * global state message
 *
 * @public
 * @interface GlobalStateMsg
 */
export interface GlobalStateMsg {
  timestamp: number;
  idType: string;
  root: bigint;
  replacedAtTimestamp: number;
}

/**
 * identity state update
 *
 * @public
 * @interface IdentityStateUpdate
 */
export interface IdentityStateUpdate {
  idStateMsg: IdentityStateMsg;
  signature: string;
}

/**
 * global state update
 *
 * @public
 * @interface GlobalStateUpdate
 */
export interface GlobalStateUpdate {
  globalStateMsg: GlobalStateMsg;
  signature: string;
}
