import { RootInfo, StateInfo, StateProof } from '../entities';
import { IStateStorage } from '../interfaces';
import { JsonRpcProvider } from 'ethers';
export declare class DidResolverStateReadonlyStorage implements IStateStorage {
    private readonly resolverUrl;
    constructor(resolverUrl: string);
    getLatestStateById(id: bigint): Promise<StateInfo>;
    getStateInfoByIdAndState(id: bigint, state: bigint): Promise<StateInfo>;
    getGISTProof(id: bigint): Promise<StateProof>;
    getGISTRootInfo(root: bigint, userId: bigint): Promise<RootInfo>;
    getRpcProvider(): JsonRpcProvider;
    publishState(): Promise<string>;
    publishStateGeneric(): Promise<string>;
    private getStateInfo;
    private getIden3StateInfo2023;
}
//# sourceMappingURL=did-resolver-readonly-storage.d.ts.map