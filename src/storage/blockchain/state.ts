import { IStateStorage } from '../interfaces/state';
import { ethers, Signer } from 'ethers';
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
  constructor(private readonly ethConfig: EthConnectionConfig = defaultEthConnectionConfig) {
    const provider = new ethers.providers.JsonRpcProvider(this.ethConfig.url);
    this.stateContract = new ethers.Contract(this.ethConfig.contractAddress, abi, provider);
  }

  async getLatestStateById(issuerId: bigint): Promise<StateInfo> {
    return await this.stateContract.getStateInfoById(issuerId);
  }

  async publishState(proof: FullProof, signer: Signer): Promise<string> {
    const byteEncoder = new TextEncoder();
    const contract = this.stateContract.connect(signer);

    const stateTransitionPubSig = new StateTransitionPubSignals();
    stateTransitionPubSig.pubSignalsUnmarshal(
      byteEncoder.encode(JSON.stringify(proof.pub_signals))
    );
    const { userId, oldUserState, newUserState } = stateTransitionPubSig;
    const isOldStateGenesis = isIssuerGenesis(
      DID.parseFromId(userId).toString(),
      oldUserState.hex()
    );

    const tx = await contract.transitState(
      userId,
      oldUserState,
      newUserState,
      isOldStateGenesis,
      proof.proof.pi_a[2],
      proof.proof.pi_b[2][2],
      proof.proof.pi_c[2]
    );

    const txnReceipt = await tx.wait();
    const status:number = txnReceipt.status;
    const txnHash:string = txnReceipt.transactionHash;

    if (status === 0) {
      throw new Error(`transaction: ${txnHash} failed to mined`);
    }

    return txnHash;
  }
}
