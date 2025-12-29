import { RootInfo, StateProof } from './../entities/state';
import { ZKProof } from '@iden3/js-jwz';
import { IStateStorage, UserStateTransitionInfo } from '../interfaces/state';
import { Contract, JsonRpcProvider, Signer, TransactionRequest } from 'ethers';
import { StateInfo } from '../entities/state';
import { StateTransitionPubSignals } from '../../circuits';
import { byteEncoder, getIsGenesisStateById } from '../../utils';
import abi from './abi/State.json';
import { DID, getChainId, Id } from '@iden3/js-iden3-core';
import { ITransactionService, TransactionService } from '../../blockchain';
import { prepareZkpProof } from './common';
import { ICache, createInMemoryCache } from '../memory';
import { PROTOCOL_CONSTANTS } from '../../iden3comm';
import { DEFAULT_CACHE_MAX_SIZE, VerifiableConstants } from '../../verifiable';
import { isIdentityDoesNotExistError, isStateDoesNotExistError } from './errors';

/**
 * Configuration options for caching behavior
 */
export type ResolverCacheOptions = {
  /** TTL in milliseconds for latest states/roots (shorter since they can change) */
  notReplacedTtl?: number;
  /** TTL in milliseconds for historical states/roots (longer since they can change with less probability) */
  replacedTtl?: number;
  /** Maximum number of entries to store in cache */
  maxSize?: number;
};

/**
 * Simplified cache config with a single TTL (used for latest/gist proofs etc.)
 */
export type SimpleCacheOptions = {
  /** TTL in milliseconds for latest states/gist proof */
  ttl?: number;
  /** Maximum number of entries to store in cache */
  maxSize?: number;
};

/**
 * EthStateStorageOptions options for the Ethereum state storage.
 */
export type EthStateStorageOptions = {
  /** Disable caching */
  disableCache?: boolean;
  /** Configuration for latest state resolution caching */
  latestStateCacheOptions?: {
    /** Custom cache implementation (if not provided, uses in-memory cache) */
    cache?: ICache<StateInfo>;
  } & SimpleCacheOptions;
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
  gistProofCacheOptions?: {
    /** Custom cache implementation for GIST proofs (if not provided, uses in-memory cache) */
    cache?: ICache<StateProof>;
  } & SimpleCacheOptions;
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

const defaultStateInfo: Partial<StateInfo> = {
  state: 0n,
  replacedByState: 0n,
  createdAtTimestamp: 0n,
  replacedAtTimestamp: 0n,
  createdAtBlock: 0n,
  replacedAtBlock: 0n
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

  private _latestStateResolveCache: ICache<StateInfo>;
  private _stateResolveCache: ICache<StateInfo>;
  private _rootResolveCache: ICache<RootInfo>;
  private _gistProofResolveCache: ICache<StateProof>;

  private _latestStateCacheOptions: Required<SimpleCacheOptions>;
  private _stateCacheOptions: Required<ResolverCacheOptions>;
  private _rootCacheOptions: Required<ResolverCacheOptions>;
  private _gistProofCacheOptions: Required<SimpleCacheOptions>;

  private _disableCache = false;

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
    this._latestStateCacheOptions = {
      ttl:
        options?.latestStateCacheOptions?.ttl ?? PROTOCOL_CONSTANTS.DEFAULT_PROOF_VERIFY_DELAY / 2,
      maxSize: options?.latestStateCacheOptions?.maxSize ?? DEFAULT_CACHE_MAX_SIZE
    };
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
    this._gistProofCacheOptions = {
      ttl: PROTOCOL_CONSTANTS.DEFAULT_AUTH_VERIFY_DELAY / 2,
      maxSize: options?.gistProofCacheOptions?.maxSize ?? DEFAULT_CACHE_MAX_SIZE
    };

    // Initialize cache instances
    this._latestStateResolveCache =
      options?.latestStateCacheOptions?.cache ??
      createInMemoryCache({
        maxSize: this._latestStateCacheOptions.maxSize,
        ttl: this._latestStateCacheOptions.ttl
      });
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

    this._gistProofResolveCache =
      options?.gistProofCacheOptions?.cache ??
      createInMemoryCache({
        maxSize: this._gistProofCacheOptions.maxSize,
        ttl: this._gistProofCacheOptions.ttl
      });

    this._disableCache = options?.disableCache ?? false;
  }

  /** {@inheritdoc IStateStorage.getLatestStateById} */
  async getLatestStateById(id: bigint): Promise<StateInfo> {
    const cacheKey = this.getLatestStateCacheKey(id);
    if (!this._disableCache) {
      const cachedResult = await this._latestStateResolveCache?.get(cacheKey);
      if (cachedResult) {
        // If cached result indicates non-existence, throw error
        if (cachedResult.state === 0n && cachedResult.createdAtTimestamp === 0n) {
          throw new Error(VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST_CUSTOM_ERROR);
        }
        return cachedResult;
      }
    }

    const { stateContract } = this.getStateContractAndProviderForId(id);
    let rawData: string[] = [];
    try {
      rawData = await stateContract.getStateInfoById(id);
    } catch (e) {
      if (isIdentityDoesNotExistError(e) && !this._disableCache) {
        // Cache a placeholder to avoid repeated calls for non-existing identities
        await this._latestStateResolveCache?.set(
          cacheKey,
          {
            id,
            ...defaultStateInfo
          },
          this._latestStateCacheOptions.ttl
        );
      }
      throw e;
    }
    const stateInfo: StateInfo = {
      id: BigInt(rawData[0]),
      state: BigInt(rawData[1]),
      replacedByState: BigInt(rawData[2]),
      createdAtTimestamp: BigInt(rawData[3]),
      replacedAtTimestamp: BigInt(rawData[4]),
      createdAtBlock: BigInt(rawData[5]),
      replacedAtBlock: BigInt(rawData[6])
    };

    !this._disableCache &&
      (await this._latestStateResolveCache?.set(
        cacheKey,
        stateInfo,
        this._latestStateCacheOptions.ttl
      ));
    return stateInfo;
  }

  /** {@inheritdoc IStateStorage.getStateInfoByIdAndState} */
  async getStateInfoByIdAndState(id: bigint, state: bigint): Promise<StateInfo> {
    const cacheKey = this.getStateCacheKey(id, state);
    if (!this._disableCache) {
      // Check cache first
      const cachedResult = await this._stateResolveCache?.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
    }

    const { stateContract } = this.getStateContractAndProviderForId(id);

    let stateInfo: StateInfo;

    try {
      const rawData = await stateContract.getStateInfoByIdAndState(id, state);
      stateInfo = {
        id: BigInt(rawData[0]),
        state: BigInt(rawData[1]),
        replacedByState: BigInt(rawData[2]),
        createdAtTimestamp: BigInt(rawData[3]),
        replacedAtTimestamp: BigInt(rawData[4]),
        createdAtBlock: BigInt(rawData[5]),
        replacedAtBlock: BigInt(rawData[6])
      };
    } catch (e) {
      if (!isStateDoesNotExistError(e)) {
        throw e;
      }
      const isGenesis = getIsGenesisStateById(Id.fromBigInt(id), state);

      if (!isGenesis) {
        throw new Error('State is not genesis and not registered in the smart contract');
      }

      stateInfo = {
        id,
        ...defaultStateInfo,
        state
      };
    }

    const ttl =
      stateInfo.replacedAtTimestamp === 0n
        ? this._stateCacheOptions.notReplacedTtl
        : this._stateCacheOptions.replacedTtl;
    !this._disableCache && (await this._stateResolveCache?.set(cacheKey, stateInfo, ttl));

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
    await this._latestStateResolveCache?.delete(this.getLatestStateCacheKey(userId.bigInt()));

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
    await this._latestStateResolveCache?.delete(this.getLatestStateCacheKey(userId.bigInt()));
    return txnHash;
  }

  /** {@inheritdoc IStateStorage.getGISTProof} */
  async getGISTProof(id: bigint): Promise<StateProof> {
    const cacheKey = this.getGistProofCacheKey(id);
    if (!this._disableCache) {
      // Check cache first
      const cachedResult = await this._gistProofResolveCache?.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
    }

    const { stateContract } = this.getStateContractAndProviderForId(id);
    const data = await stateContract.getGISTProof(id);

    const stateProof = {
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

    !this._disableCache &&
      (await this._gistProofResolveCache?.set(
        cacheKey,
        stateProof,
        this._gistProofCacheOptions.ttl
      ));
    return stateProof;
  }

  /** {@inheritdoc IStateStorage.getGISTRootInfo} */
  async getGISTRootInfo(root: bigint, id: bigint): Promise<RootInfo> {
    const idTyped = Id.fromBigInt(id as bigint);
    const chainId = getChainId(DID.blockchainFromId(idTyped), DID.networkIdFromId(idTyped));
    const cacheKey = this.getRootCacheKey(chainId, root);
    if (!this._disableCache) {
      // Check cache first
      const cachedResult = await this._rootResolveCache?.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
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
    !this._disableCache && (await this._rootResolveCache?.set(cacheKey, rootInfo, ttl));
    return rootInfo;
  }

  /** {@inheritdoc IStateStorage.getRpcProvider} */
  getRpcProvider(): JsonRpcProvider {
    return this.provider;
  }

  /** enable caching */
  enableCache(): void {
    this._disableCache = false;
  }

  /** disable caching */
  disableCache(): void {
    this._disableCache = true;
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

  private getGistProofCacheKey(id: bigint): string {
    return `gist:${id.toString()}`;
  }

  private getLatestStateCacheKey(id: bigint): string {
    return `latest-state:${id.toString()}`;
  }

  private getStateCacheKey(id: bigint, state: bigint): string {
    return `state:${id.toString()}-${state.toString()}`;
  }

  private getRootCacheKey(chainId: number, root: bigint): string {
    return `root:${chainId.toString()}-${root.toString()}`;
  }
}
