import { IStateStorage } from '../interfaces/state';
import { BigNumber, ethers, Signer } from 'ethers';
import { StateInfo } from '../entities/state';
import abi from './state-abi.json';
import { FullProof } from '../../proof';
import { StateTransitionPubSignals } from '../../circuits';
import { isIssuerGenesis } from '../../credentials';
import { DID } from '@iden3/js-iden3-core';

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

export class EthStateStorage implements IStateStorage {
  public stateContract: ethers.Contract;
  public provider: ethers.providers.JsonRpcProvider;

  constructor(private readonly ethConfig: EthConnectionConfig = defaultEthConnectionConfig) {
    this.provider = new ethers.providers.JsonRpcProvider(this.ethConfig.url);
    this.stateContract = new ethers.Contract(this.ethConfig.contractAddress, abi, this.provider);
  }

  async getLatestStateById(issuerId: bigint): Promise<StateInfo> {
    const rawData = await this.stateContract.getStateInfoById(issuerId);
    const stateInfo: StateInfo = {
      id: BigNumber.from(rawData[0]).toBigInt(),
      state: BigNumber.from(rawData[1]).toBigInt(),
      replacedByState: BigNumber.from(rawData[2]).toBigInt(),
      createdAtTimestamp: BigNumber.from(rawData[3]).toBigInt(),
      replacedAtTimestamp: BigNumber.from(rawData[4]).toBigInt(),
      createdAtBlock: BigNumber.from(rawData[5]).toBigInt(),
      replacedAtBlock: BigNumber.from(rawData[6]).toBigInt()
    };

    console.log(stateInfo);

    return stateInfo;
  }

  async publishState(proof: FullProof, signer: Signer): Promise<string> {
    const byteEncoder = new TextEncoder();
    const contract = this.stateContract.connect(signer);

    const stateTransitionPubSig = new StateTransitionPubSignals();
    stateTransitionPubSig.pubSignalsUnmarshal(
      byteEncoder.encode(JSON.stringify(proof.pub_signals))
    );
    const { userId, oldUserState, newUserState, isOldStateGenesis } = stateTransitionPubSig;

    const payload = [
      userId.bigInt().toString(),
      oldUserState.bigInt().toString(),
      newUserState.bigInt().toString(),
      isOldStateGenesis,
      proof.proof.pi_a.slice(0, 2),
      [
        [proof.proof.pi_b[0][1].toString(), proof.proof.pi_b[0][0].toString()],
        [proof.proof.pi_b[1][1].toString(), proof.proof.pi_b[1][0].toString()]
      ],
      proof.proof.pi_c.slice(0, 2)
    ];
    const g = await contract.estimateGas.transitState(...payload);

    const tx = await contract.transitState(...payload);

    const txnReceipt = await tx.wait();
    const status: number = txnReceipt.status;
    const txnHash: string = txnReceipt.transactionHash;

    if (status === 0) {
      throw new Error(`transaction: ${txnHash} failed to mined`);
    }

    return txnHash;
  }
}
