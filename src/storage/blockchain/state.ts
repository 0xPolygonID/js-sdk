import { RootInfo, StateProof } from './../entities/state';
import { ZKProof } from '@iden3/js-jwz';
import { IStateStorage, UserStateTransition } from '../interfaces/state';
import { Contract, ContractTransaction, JsonRpcProvider, Signer, TransactionRequest } from 'ethers';
import { StateInfo } from '../entities/state';
import { StateTransitionPubSignals } from '../../circuits';
import { byteEncoder } from '../../utils';
import abi from './abi/State.json';
import { DID, getChainId, Id } from '@iden3/js-iden3-core';

/**
 * Configuration of ethereum based blockchain connection
 *
 * @public
 * @interface   EthConnectionConfig
 */
export interface EthConnectionConfig {
  url: string;
  defaultGasLimit: number;
  minGasPrice?: string;
  maxGasPrice?: string; // eip-1559 transaction do not support gasPrice
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  confirmationBlockCount: number;
  confirmationTimeout: number;
  contractAddress: string;
  receiptTimeout: number;
  rpcResponseTimeout: number;
  waitReceiptCycleTime: number;
  waitBlockCycleTime: number;
  chainId?: number;
}

export /** @type {EthConnectionConfig} - default configuration for EthConnectionConfig */
const defaultEthConnectionConfig: EthConnectionConfig = {
  url: 'http://localhost:8545',
  defaultGasLimit: 600000,
  minGasPrice: '0',
  maxGasPrice: '100000000000',
  confirmationBlockCount: 5,
  confirmationTimeout: 600000,
  contractAddress: '',
  receiptTimeout: 600000,
  rpcResponseTimeout: 5000,
  waitReceiptCycleTime: 30000,
  waitBlockCycleTime: 3000
};

/**
 *
 *
 * @public
 * @class EthStateStorage
 * @implements implements IStateStorage interface
 */
export class EthStateStorage implements IStateStorage {
  public readonly stateContract: Contract;
  public readonly provider: JsonRpcProvider;

  /**
   * Creates an instance of EthStateStorage.
   * @param {EthConnectionConfig} [ethConfig=defaultEthConnectionConfig]
   */
  constructor(private readonly ethConfig: EthConnectionConfig | EthConnectionConfig[]) {
    const config = Array.isArray(ethConfig) ? ethConfig[0] : ethConfig;
    this.provider = new JsonRpcProvider(config.url);
    this.stateContract = new Contract(config.contractAddress, abi, this.provider);
  }

  /** {@inheritdoc IStateStorage.getLatestStateById} */
  async getLatestStateById(id: bigint): Promise<StateInfo> {
    const { stateContract } = this.getStateContractAndProviderForId(id);
    const rawData = await stateContract.getStateInfoById(id);
    const stateInfo: StateInfo = {
      id: BigInt(rawData[0]),
      state: BigInt(rawData[1]),
      replacedByState: BigInt(rawData[2]),
      createdAtTimestamp: BigInt(rawData[3]),
      replacedAtTimestamp: BigInt(rawData[4]),
      createdAtBlock: BigInt(rawData[5]),
      replacedAtBlock: BigInt(rawData[6])
    };

    return stateInfo;
  }

  /** {@inheritdoc IStateStorage.getStateInfoByIdAndState} */
  async getStateInfoByIdAndState(id: bigint, state: bigint): Promise<StateInfo> {
    const { stateContract } = this.getStateContractAndProviderForId(id);
    const rawData = await stateContract.getStateInfoByIdAndState(id, state);
    const stateInfo: StateInfo = {
      id: BigInt(rawData[0]),
      state: BigInt(rawData[1]),
      replacedByState: BigInt(rawData[2]),
      createdAtTimestamp: BigInt(rawData[3]),
      replacedAtTimestamp: BigInt(rawData[4]),
      createdAtBlock: BigInt(rawData[5]),
      replacedAtBlock: BigInt(rawData[6])
    };

    return stateInfo;
  }

  /** {@inheritdoc IStateStorage.publishState} */
  async publishState(
    proof: ZKProof,
    signer: Signer,
    userStateTranstion: UserStateTransition
  ): Promise<string> {
    const { userId, oldUserState, newUserState, isOldStateGenesis } = userStateTranstion;
    const { stateContract, provider } = this.getStateContractAndProviderForId(userId.bigInt());
    const contract = stateContract.connect(signer) as Contract;
    const feeData = await provider.getFeeData();

    const maxFeePerGas = defaultEthConnectionConfig.maxFeePerGas
      ? BigInt(defaultEthConnectionConfig.maxFeePerGas)
      : feeData.maxFeePerGas;
    const maxPriorityFeePerGas = defaultEthConnectionConfig.maxPriorityFeePerGas
      ? BigInt(defaultEthConnectionConfig.maxPriorityFeePerGas)
      : feeData.maxPriorityFeePerGas;

    let gasLimit: bigint;
    let txData: ContractTransaction;

    if (proof) {
      const stateTransitionPubSig = new StateTransitionPubSignals();
      stateTransitionPubSig.pubSignalsUnmarshal(
        byteEncoder.encode(JSON.stringify(proof.pub_signals))
      );
      const {
        userId: userIdPub,
        oldUserState: oldUserStatePub,
        newUserState: newUserStatePub,
        isOldStateGenesis: isOldStateGenesisPub
      } = stateTransitionPubSig;

      if (
        userIdPub.bigInt() !== userId.bigInt() ||
        oldUserStatePub.bigInt() !== oldUserState.bigInt() ||
        newUserStatePub.bigInt() !== newUserState.bigInt() ||
        isOldStateGenesisPub !== isOldStateGenesis
      ) {
        throw new Error(`public inputs do not match with user state transition`);
      }

      const payload = [
        userId.bigInt().toString(),
        oldUserState.bigInt().toString(),
        newUserState.bigInt().toString(),
        isOldStateGenesis,
        proof.proof.pi_a.slice(0, 2),
        [
          [proof.proof.pi_b[0][1], proof.proof.pi_b[0][0]],
          [proof.proof.pi_b[1][1], proof.proof.pi_b[1][0]]
        ],
        proof.proof.pi_c.slice(0, 2)
      ];
      gasLimit = await contract.transitState.estimateGas(...payload);
      txData = await contract.transitState.populateTransaction(...payload);
    } else {
      const payload = [
        userId.bigInt().toString(),
        oldUserState.bigInt().toString(),
        newUserState.bigInt().toString(),
        isOldStateGenesis,
        BigInt(1),
        '0x'
      ];
      gasLimit = await contract.transitStateGeneric.estimateGas(...payload);
      txData = await contract.transitStateGeneric.populateTransaction(...payload);
    }

    const request: TransactionRequest = {
      to: txData.to,
      data: txData.data,
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas
    };
    const tx = await signer.sendTransaction(request);
    const txnReceipt = await tx.wait();
    if (!txnReceipt) {
      throw new Error(`transaction: ${tx.hash} failed to mined`);
    }
    const status: number | null = txnReceipt.status;
    const txnHash: string = txnReceipt.hash;

    if (!status) {
      throw new Error(`transaction: ${txnHash} failed to mined`);
    }

    return txnHash;
  }

  /** {@inheritdoc IStateStorage.getGISTProof} */
  async getGISTProof(id: bigint): Promise<StateProof> {
    const { stateContract } = this.getStateContractAndProviderForId(id);
    const data = await stateContract.getGISTProof(id);

    return {
      root: BigInt(data.root.toString()),
      existence: data.existence,
      siblings: data.siblings?.map(
        (sibling: { toString: () => string | number | bigint | boolean }) =>
          BigInt(sibling.toString())
      ),
      index: BigInt(data.index.toString()),
      value: BigInt(data.value.toString()),
      auxExistence: data.auxExistence,
      auxIndex: BigInt(data.auxIndex.toString()),
      auxValue: BigInt(data.auxValue.toString())
    };
  }

  /** {@inheritdoc IStateStorage.getGISTRootInfo} */
  async getGISTRootInfo(id: bigint): Promise<RootInfo> {
    const { stateContract } = this.getStateContractAndProviderForId(id);
    const data = await stateContract.getGISTRootInfo(id);

    return {
      root: BigInt(data.root.toString()),
      replacedByRoot: BigInt(data.replacedByRoot.toString()),
      createdAtTimestamp: BigInt(data.createdAtTimestamp.toString()),
      replacedAtTimestamp: BigInt(data.replacedAtTimestamp.toString()),
      createdAtBlock: BigInt(data.createdAtBlock.toString()),
      replacedAtBlock: BigInt(data.replacedAtBlock.toString())
    };
  }

  private getStateContractAndProviderForId(id: bigint): {
    stateContract: Contract;
    provider: JsonRpcProvider;
  } {
    const idTyped = Id.fromBigInt(id as bigint);
    if (!Array.isArray(this.ethConfig)) {
      return {
        stateContract: this.stateContract,
        provider: this.provider
      };
    }

    const chainId = getChainId(DID.blockchainFromId(idTyped), DID.networkIdFromId(idTyped));
    const config = this.networkByChainId(chainId);

    const provider = new JsonRpcProvider(config.url);
    const stateContract = new Contract(config.contractAddress, abi, this.provider);

    return { stateContract, provider };
  }

  private networkByChainId(chainId: number): EthConnectionConfig {
    if (Array.isArray(this.ethConfig)) {
      const network = this.ethConfig.find((c) => c.chainId === chainId);
      if (!network) {
        throw new Error(`chainId "${chainId}" not supported`);
      }
      return network;
    }

    return this.ethConfig as EthConnectionConfig;
  }
}
