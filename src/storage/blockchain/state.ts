import { RootInfo, StateProof } from './../entities/state';
import { ZKProof } from '@iden3/js-jwz';
import { IStateStorage, UserStateTransitionInfo } from '../interfaces/state';
import { Contract, JsonRpcProvider, Signer, TransactionRequest } from 'ethers';
import { StateInfo } from '../entities/state';
import { StateTransitionPubSignals } from '../../circuits';
import { byteEncoder } from '../../utils';
import abi from './abi/State.json';
import { DID, getChainId, Id } from '@iden3/js-iden3-core';
import { ITransactionService, TransactionService } from '../../blockchain';
import { prepareZkpProof } from './common';
import { ICache, createInMemoryCache } from '../memory';
import { PROTOCOL_CONSTANTS } from '../../iden3comm';
import { DEFAULT_CACHE_MAX_SIZE } from '../../verifiable';

/**
 * Configuration options for caching behavior
 */
export type ResolverCacheOptions = {
  /** TTL in milliseconds for latest states/roots (shorter since they can change) */
  notReplacedTtl?: number;
  /** TTL in milliseconds for historical states/roots (longer since they're they can change with less probability) */
  replacedTtl?: number;
  /** Maximum number of entries to store in cache */
  maxSize?: number;
};

/**
 * EthStateStorageOptions options for the Ethereum state storage.
 */
export type EthStateStorageOptions = {
  /** Configuration for state resolution caching */
  stateCacheOptions?: {
    /** Custom cache implementation (if not provided, uses in-memory cache) */
    cache?: ICache<StateInfo>;
  } & ResolverCacheOptions;
  /** Configuration for GIST root resolution caching */
  rootCacheOptions?: {
    /** Custom cache implementation (if not provided, uses in-memory cache) */
    cache?: ICache<RootInfo>;
  } & ResolverCacheOptions;
};

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
  private readonly provider: JsonRpcProvider;
  private readonly _transactionService: ITransactionService;

  private _stateResolveCache: ICache<StateInfo>;
  private _rootResolveCache: ICache<RootInfo>;
  private _stateCacheOptions: Required<ResolverCacheOptions>;
  private _rootCacheOptions: Required<ResolverCacheOptions>;

  /**
   * Creates an instance of EthStateStorage.
   * @param {EthConnectionConfig} [ethConfig=defaultEthConnectionConfig]
   */
  constructor(
    private readonly ethConfig: EthConnectionConfig | EthConnectionConfig[],
    options?: EthStateStorageOptions
  ) {
    const config = Array.isArray(ethConfig) ? ethConfig[0] : ethConfig;
    this.provider = new JsonRpcProvider(config.url);
    this.stateContract = new Contract(config.contractAddress, abi, this.provider);
    this._transactionService = new TransactionService(this.getRpcProvider());

    // Store cache options for later use
    this._stateCacheOptions = {
      notReplacedTtl:
        options?.stateCacheOptions?.notReplacedTtl ??
        PROTOCOL_CONSTANTS.DEFAULT_PROOF_VERIFY_DELAY / 2,
      replacedTtl:
        options?.stateCacheOptions?.replacedTtl ?? PROTOCOL_CONSTANTS.DEFAULT_PROOF_VERIFY_DELAY,
      maxSize: options?.stateCacheOptions?.maxSize ?? DEFAULT_CACHE_MAX_SIZE
    };
    this._rootCacheOptions = {
      replacedTtl:
        options?.rootCacheOptions?.replacedTtl ?? PROTOCOL_CONSTANTS.DEFAULT_AUTH_VERIFY_DELAY,
      notReplacedTtl:
        options?.rootCacheOptions?.notReplacedTtl ??
        PROTOCOL_CONSTANTS.DEFAULT_AUTH_VERIFY_DELAY / 2,
      maxSize: options?.rootCacheOptions?.maxSize ?? DEFAULT_CACHE_MAX_SIZE
    };

    // Initialize cache instances
    this._stateResolveCache =
      options?.stateCacheOptions?.cache ??
      createInMemoryCache({
        maxSize: this._stateCacheOptions.maxSize,
        ttl: this._stateCacheOptions.replacedTtl
      });

    this._rootResolveCache =
      options?.rootCacheOptions?.cache ??
      createInMemoryCache({
        maxSize: this._rootCacheOptions.maxSize,
        ttl: this._rootCacheOptions.replacedTtl
      });
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
    const cacheKey = this.getCacheKey(id, state);
    // Check cache first
    const cachedResult = await this._stateResolveCache?.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

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

    const ttl =
      stateInfo.replacedAtTimestamp === 0n
        ? this._stateCacheOptions.notReplacedTtl
        : this._stateCacheOptions.replacedTtl;
    await this._stateResolveCache?.set(cacheKey, stateInfo, ttl);
    return stateInfo;
  }

  /** {@inheritdoc IStateStorage.publishState} */
  async publishState(proof: ZKProof, signer: Signer): Promise<string> {
    const stateTransitionPubSig = new StateTransitionPubSignals();
    stateTransitionPubSig.pubSignalsUnmarshal(
      byteEncoder.encode(JSON.stringify(proof.pub_signals))
    );
    const { userId, oldUserState, newUserState, isOldStateGenesis } = stateTransitionPubSig;

    const { stateContract, provider } = this.getStateContractAndProviderForId(userId.bigInt());
    const contract = stateContract.connect(signer) as Contract;

    const preparedZkpProof = prepareZkpProof(proof.proof);
    const payload = [
      userId.bigInt().toString(),
      oldUserState.bigInt().toString(),
      newUserState.bigInt().toString(),
      isOldStateGenesis,
      preparedZkpProof.a,
      preparedZkpProof.b,
      preparedZkpProof.c
    ];

    const feeData = await provider.getFeeData();

    const maxFeePerGas = defaultEthConnectionConfig.maxFeePerGas
      ? BigInt(defaultEthConnectionConfig.maxFeePerGas)
      : feeData.maxFeePerGas;
    const maxPriorityFeePerGas = defaultEthConnectionConfig.maxPriorityFeePerGas
      ? BigInt(defaultEthConnectionConfig.maxPriorityFeePerGas)
      : feeData.maxPriorityFeePerGas;

    const gasLimit = await contract.transitState.estimateGas(...payload);
    const txData = await contract.transitState.populateTransaction(...payload);

    const request: TransactionRequest = {
      to: txData.to,
      data: txData.data,
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas
    };

    const { txnHash } = await this._transactionService.sendTransactionRequest(signer, request);

    return txnHash;
  }

  /** {@inheritdoc IStateStorage.publishStateGeneric} */
  async publishStateGeneric(
    signer: Signer,
    userStateTransitionInfo: UserStateTransitionInfo
  ): Promise<string> {
    const { userId, oldUserState, newUserState, isOldStateGenesis, methodId, methodParams } =
      userStateTransitionInfo;
    const { stateContract, provider } = this.getStateContractAndProviderForId(userId.bigInt());
    const contract = stateContract.connect(signer) as Contract;
    const feeData = await provider.getFeeData();

    const maxFeePerGas = defaultEthConnectionConfig.maxFeePerGas
      ? BigInt(defaultEthConnectionConfig.maxFeePerGas)
      : feeData.maxFeePerGas;
    const maxPriorityFeePerGas = defaultEthConnectionConfig.maxPriorityFeePerGas
      ? BigInt(defaultEthConnectionConfig.maxPriorityFeePerGas)
      : feeData.maxPriorityFeePerGas;

    const payload = [
      userId.bigInt().toString(),
      oldUserState.bigInt().toString(),
      newUserState.bigInt().toString(),
      isOldStateGenesis,
      methodId, //BigInt(1),
      methodParams //'0x'
    ];
    const gasLimit = await contract.transitStateGeneric.estimateGas(...payload);
    const txData = await contract.transitStateGeneric.populateTransaction(...payload);

    const request: TransactionRequest = {
      to: txData.to,
      data: txData.data,
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas
    };

    const { txnHash } = await this._transactionService.sendTransactionRequest(signer, request);

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
  async getGISTRootInfo(root: bigint, id: bigint): Promise<RootInfo> {
    const cacheKey = this.getRootCacheKey(root);
    // Check cache first
    const cachedResult = await this._rootResolveCache?.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const { stateContract } = this.getStateContractAndProviderForId(id);
    const data = await stateContract.getGISTRootInfo(root);

    const rootInfo = {
      root: BigInt(data.root.toString()),
      replacedByRoot: BigInt(data.replacedByRoot.toString()),
      createdAtTimestamp: BigInt(data.createdAtTimestamp.toString()),
      replacedAtTimestamp: BigInt(data.replacedAtTimestamp.toString()),
      createdAtBlock: BigInt(data.createdAtBlock.toString()),
      replacedAtBlock: BigInt(data.replacedAtBlock.toString())
    };

    const ttl =
      rootInfo.replacedAtTimestamp == 0n
        ? this._rootCacheOptions.notReplacedTtl
        : this._rootCacheOptions.replacedTtl;
    await this._rootResolveCache?.set(cacheKey, rootInfo, ttl);
    return rootInfo;
  }

  /** {@inheritdoc IStateStorage.getRpcProvider} */
  getRpcProvider(): JsonRpcProvider {
    return this.provider;
  }

  private getStateContractAndProviderForId(id: bigint): {
    stateContract: Contract;
    provider: JsonRpcProvider;
  } {
    const idTyped = Id.fromBigInt(id as bigint);
    const chainId = getChainId(DID.blockchainFromId(idTyped), DID.networkIdFromId(idTyped));
    const config = this.networkByChainId(chainId);

    const provider = new JsonRpcProvider(config.url);
    const stateContract = new Contract(config.contractAddress, abi, provider);

    return { stateContract, provider };
  }

  private networkByChainId(chainId: number): EthConnectionConfig {
    const config = Array.isArray(this.ethConfig) ? this.ethConfig : [this.ethConfig];
    const network = config.find((c) => c.chainId === chainId);
    if (!network) {
      throw new Error(`chainId "${chainId}" not supported`);
    }
    return network;
  }

  private getCacheKey(id: bigint, state: bigint): string {
    return `${id.toString()}-${state.toString()}`;
  }

  private getRootCacheKey(root: bigint): string {
    return root.toString();
  }
}
