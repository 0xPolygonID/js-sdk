import { RootInfo, StateProof } from './../entities/state';
import { ZKProof } from '@iden3/js-jwz';
import { IStateStorage } from '../interfaces/state';
import { BigNumber, ethers, Signer } from 'ethers';
import { StateInfo } from '../entities/state';
import abi from './state-abi.json';
import { StateTransitionPubSignals } from '../../circuits';

/**
 * Configuration of ethereum based blockchain connection
 *
 * @export
 * @beta
 * @interface   EthConnectionConfig
 */
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

export /** @type {EthConnectionConfig} - default configuration for EthConnectionConfig */
const defaultEthConnectionConfig: EthConnectionConfig = {
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

/**
 *
 *
 * @export
 * @beta
 * @class EthStateStorage
 * @implements implements IStateStorage interface
 */
export class EthStateStorage implements IStateStorage {
  public readonly stateContract: ethers.Contract;
  public readonly provider: ethers.providers.JsonRpcProvider;

  /**
   * Creates an instance of EthStateStorage.
   * @param {EthConnectionConfig} [ethConfig=defaultEthConnectionConfig]
   */
  constructor(private readonly ethConfig: EthConnectionConfig = defaultEthConnectionConfig) {
    this.provider = new ethers.providers.JsonRpcProvider(this.ethConfig.url);
    this.stateContract = new ethers.Contract(this.ethConfig.contractAddress, abi, this.provider);
  }

  /** {@inheritdoc IStateStorage.getLatestStateById} */
  async getLatestStateById(id: bigint): Promise<StateInfo> {
    const rawData = await this.stateContract.getStateInfoById(id);
    const stateInfo: StateInfo = {
      id: BigNumber.from(rawData[0]).toBigInt(),
      state: BigNumber.from(rawData[1]).toBigInt(),
      replacedByState: BigNumber.from(rawData[2]).toBigInt(),
      createdAtTimestamp: BigNumber.from(rawData[3]).toBigInt(),
      replacedAtTimestamp: BigNumber.from(rawData[4]).toBigInt(),
      createdAtBlock: BigNumber.from(rawData[5]).toBigInt(),
      replacedAtBlock: BigNumber.from(rawData[6]).toBigInt()
    };

    return stateInfo;
  }

  /** {@inheritdoc IStateStorage.publishState} */
  async publishState(proof: ZKProof, signer: Signer): Promise<string> {
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

    await contract.estimateGas.transitState(...payload);

    const tx = await contract.transitState(...payload);

    const txnReceipt = await tx.wait();
    const status: number = txnReceipt.status;
    const txnHash: string = txnReceipt.transactionHash;

    if (status === 0) {
      throw new Error(`transaction: ${txnHash} failed to mined`);
    }

    return txnHash;
  }

  /** {@inheritdoc IStateStorage.getGISTProof} */
  async getGISTProof(id: bigint): Promise<StateProof> {
    const data = await this.stateContract.getGISTProof(id);

    return {
      root: BigInt(data.root.toString()),
      existence: data.existence,
      siblings: data.siblings?.map((sibling) => BigInt(sibling.toString())),
      index: BigInt(data.index.toString()),
      value: BigInt(data.value.toString()),
      auxExistence: data.auxExistence,
      auxIndex: BigInt(data.auxIndex.toString()),
      auxValue: BigInt(data.auxValue.toString())
    };
  }

  /** {@inheritdoc IStateStorage.getGISTRootInfo} */
  async getGISTRootInfo(id: bigint): Promise<RootInfo> {
    const data = await this.stateContract.getGISTRootInfo(id);

    return {
      root: BigInt(data.root.toString()),
      replacedByRoot: BigInt(data.replacedByRoot.toString()),
      createdAtTimestamp: BigInt(data.createdAtTimestamp.toString()),
      replacedAtTimestamp: BigInt(data.replacedAtTimestamp.toString()),
      createdAtBlock: BigInt(data.createdAtBlock.toString()),
      replacedAtBlock: BigInt(data.replacedAtBlock.toString())
    };
  }
}
