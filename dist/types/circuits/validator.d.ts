import { IUnmarshallerPubSignals } from './common';
import { Operators } from './comparer';
import { CircuitId } from './models';
export type CircuitSubversion = {
    mtLevel?: number;
    mtLevelClaim?: number;
    mtLevelOnChain?: number;
    queryCount?: number;
    targetCircuitId: CircuitId;
};
export type CircuitValidatorItem = {
    validation: {
        maxQueriesCount: number;
        supportedOperations: Operators[];
    };
    subVersions?: CircuitSubversion[];
    unmarshaller?: new (opts?: {
        mtLevel?: number;
        mtLevelClaim?: number;
        mtLevelOnChain?: number;
    }) => IUnmarshallerPubSignals;
    mtLevel?: number;
    mtLevelClaim?: number;
    mtLevelOnChain?: number;
};
export declare const circuitValidator: {
    [k in CircuitId]: CircuitValidatorItem;
};
export declare const getCircuitIdsWithSubVersions: (filterCircuitIds?: CircuitId[]) => CircuitId[];
export declare const getGroupedCircuitIdsWithSubVersions: (filterCircuitId: CircuitId) => CircuitId[];
export declare const getUnmarshallerForCircuitId: (circuitIdToFind: CircuitId) => {
    unmarshaller: new (opts?: {
        mtLevel?: number;
        mtLevelClaim?: number;
        mtLevelOnChain?: number;
    }) => IUnmarshallerPubSignals;
    opts?: {
        mtLevel?: number;
        mtLevelClaim?: number;
        mtLevelOnChain?: number;
    };
} | undefined;
//# sourceMappingURL=validator.d.ts.map