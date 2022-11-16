import { StateInfo } from '../blockchain';

export interface IStateStore {
  getLatestStateById(address: string, issuerId: bigint): StateInfo;
}
