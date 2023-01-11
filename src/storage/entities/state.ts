// StateInfo information about state from chain.
export interface StateInfo {
  id?: bigint;
  state?: bigint;
  replacedByState?: bigint;
  createdAtTimestamp?: bigint;
  replacedAtTimestamp?: bigint;
  createdAtBlock?: bigint;
  replacedAtBlock?: bigint;
}

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

export interface RootInfo {
  root: bigint;
  replacedByRoot: bigint;
  createdAtTimestamp: bigint;
  replacedAtTimestamp: bigint;
  createdAtBlock: bigint;
  replacedAtBlock: bigint;
}
