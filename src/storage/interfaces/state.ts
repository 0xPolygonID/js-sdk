import { StateInfo } from '../entities/state';

export interface IStateStorage {
  getLatestStateById(issuerId: string): Promise<StateInfo>;
}
