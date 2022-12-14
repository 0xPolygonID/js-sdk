// StateInfo information about state from chain.
//todo: replace string with bigint
export interface StateInfo {
    id?: bigint;
    state?: bigint;
    replacedByState?: bigint;
    createdAtTimestamp?: bigint;
    replacedAtTimestamp?: bigint;
    createdAtBlock?: bigint;
    replacedAtBlock?: bigint;
  }