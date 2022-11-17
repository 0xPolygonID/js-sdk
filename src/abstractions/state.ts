import { StateInfo } from '../blockchain';

export interface IStateStorage {
  getLatestStateById(address: string, issuerId: bigint): StateInfo;
}
