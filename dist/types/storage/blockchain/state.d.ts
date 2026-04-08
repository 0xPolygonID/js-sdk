import { RootInfo, StateProof } from './../entities/state';
import { ZKProof } from '@iden3/js-jwz';
import { IStateStorage, UserStateTransitionInfo } from '../interfaces/state';
import { Contract, JsonRpcProvider, Signer } from 'ethers';
import { StateInfo } from '../entities/state';
import { ICache } from '../memory';
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
    maxGasPrice?: string;
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
export declare const defaultEthConnectionConfig: EthConnectionConfig;
/**
 *
 *
 * @public
 * @class EthStateStorage
 * @implements implements IStateStorage interface
 */
export declare class EthStateStorage implements IStateStorage {
    private readonly ethConfig;
    readonly stateContract: Contract;
    private readonly provider;
    private readonly _transactionService;
    private _latestStateResolveCache;
    private _stateResolveCache;
    private _rootResolveCache;
    private _gistProofResolveCache;
    private _latestStateCacheOptions;
    private _stateCacheOptions;
    private _rootCacheOptions;
    private _gistProofCacheOptions;
    private _disableCache;
    /**
     * Creates an instance of EthStateStorage.
     * @param {EthConnectionConfig} [ethConfig=defaultEthConnectionConfig]
     */
    constructor(ethConfig: EthConnectionConfig | EthConnectionConfig[], options?: EthStateStorageOptions);
    /** {@inheritdoc IStateStorage.getLatestStateById} */
    getLatestStateById(id: bigint): Promise<StateInfo>;
    /** {@inheritdoc IStateStorage.getStateInfoByIdAndState} */
    getStateInfoByIdAndState(id: bigint, state: bigint): Promise<StateInfo>;
    /** {@inheritdoc IStateStorage.publishState} */
    publishState(proof: ZKProof, signer: Signer): Promise<string>;
    /** {@inheritdoc IStateStorage.publishStateGeneric} */
    publishStateGeneric(signer: Signer, userStateTransitionInfo: UserStateTransitionInfo): Promise<string>;
    /** {@inheritdoc IStateStorage.getGISTProof} */
    getGISTProof(id: bigint): Promise<StateProof>;
    /** {@inheritdoc IStateStorage.getGISTRootInfo} */
    getGISTRootInfo(root: bigint, id: bigint): Promise<RootInfo>;
    /** {@inheritdoc IStateStorage.getRpcProvider} */
    getRpcProvider(): JsonRpcProvider;
    /** enable caching */
    enableCache(): void;
    /** disable caching */
    disableCache(): void;
    private getStateContractAndProviderForId;
    private networkByChainId;
    private getGistProofCacheKey;
    private getLatestStateCacheKey;
    private getStateCacheKey;
    private getRootCacheKey;
}
//# sourceMappingURL=state.d.ts.map