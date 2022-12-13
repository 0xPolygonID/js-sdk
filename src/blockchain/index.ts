import { ethers } from 'ethers';
import abi from './abi.json';
export interface EthConnectionConfig {
  url: string;
  defaultGasLimit: number;
  minGasPrice?: string;
  maxGasPrice?: string;
  confirmationBlockCount: number;
  confirmationTimeout: number;
  contractAddress: string;
  receiptTimeout: number;
  rpcResponseTimeout: number;
  waitReceiptCycleTime: number;
  waitBlockCycleTime: number;
}

export const defaultEthConnectionConfig: EthConnectionConfig = {
  url: 'http://localhost:8545',
  defaultGasLimit: 600000,
  minGasPrice: '0',
  maxGasPrice: '100000000000',
  confirmationBlockCount: 5,
  confirmationTimeout: 600000,
  contractAddress: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
  receiptTimeout: 600000,
  rpcResponseTimeout: 5000,
  waitReceiptCycleTime: 30000,
  waitBlockCycleTime: 3000
};
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
export interface IStateStorage {
  getLatestStateById(issuerId: string): Promise<StateInfo>;
}

export class StateStorage implements IStateStorage {
  public stateContract: ethers.Contract;
  constructor(private readonly ethConfig: EthConnectionConfig = defaultEthConnectionConfig) {
    const provider = new ethers.providers.JsonRpcProvider(this.ethConfig.url);
    this.stateContract = new ethers.Contract(this.ethConfig.contractAddress, abi, provider);
  }

  async getLatestStateById(issuerId: string): Promise<StateInfo> {
    return await this.stateContract.getStateInfoById(issuerId);
  }
}
