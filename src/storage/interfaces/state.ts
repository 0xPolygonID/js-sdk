import { StateInfo } from '../entities/state';

export interface IStateStorage {
  getLatestStateById(issuerId: bigint): Promise<StateInfo>;
}
