/**
 * state information of identity from chain.
 *
 * @export
 * @beta
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
 * @export
 * @beta
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
 * @export
 * @beta
 * @interface   RootInfo
 */
export interface RootInfo {
  root: bigint;
  replacedByRoot: bigint;
  createdAtTimestamp: bigint;
  replacedAtTimestamp: bigint;
  createdAtBlock: bigint;
  replacedAtBlock: bigint;
}
