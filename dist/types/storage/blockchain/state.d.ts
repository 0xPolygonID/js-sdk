import { RootInfo, StateProof } from './../entities/state';
import { ZKProof } from '@iden3/js-jwz';
import { IStateStorage } from '../interfaces/state';
import { ethers, Signer } from 'ethers';
import { StateInfo } from '../entities/state';
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
    confirmationBlockCount: number;
    confirmationTimeout: number;
    contractAddress: string;
    receiptTimeout: number;
    rpcResponseTimeout: number;
    waitReceiptCycleTime: number;
    waitBlockCycleTime: number;
    chainId: number | null;
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
    readonly stateContract: ethers.Contract;
    readonly provider: ethers.providers.JsonRpcProvider;
    /**
     * Creates an instance of EthStateStorage.
     * @param {EthConnectionConfig} [ethConfig=defaultEthConnectionConfig]
     */
    constructor(ethConfig?: EthConnectionConfig);
    /** {@inheritdoc IStateStorage.getLatestStateById} */
    getLatestStateById(id: bigint): Promise<StateInfo>;
    /** {@inheritdoc IStateStorage.publishState} */
    publishState(proof: ZKProof, signer: Signer): Promise<string>;
    /** {@inheritdoc IStateStorage.getGISTProof} */
    getGISTProof(id: bigint): Promise<StateProof>;
    /** {@inheritdoc IStateStorage.getGISTRootInfo} */
    getGISTRootInfo(id: bigint): Promise<RootInfo>;
}
