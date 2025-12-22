import { Operators, QueryOperators } from './comparer';
import { CircuitId } from './models';

const allOperations = Object.values(QueryOperators);
const v2Operations = [
  Operators.NOOP,
  Operators.EQ,
  Operators.LT,
  Operators.GT,
  Operators.IN,
  Operators.NIN,
  Operators.NE,
  Operators.SD
];
const v2OnChainOperations = [
  Operators.EQ,
  Operators.LT,
  Operators.GT,
  Operators.IN,
  Operators.NIN,
  Operators.NE
];

const noQueriesValidation = { validation: { maxQueriesCount: 0, supportedOperations: [] } };
const credentialAtomicQueryV2Validation = {
  validation: { maxQueriesCount: 1, supportedOperations: v2Operations }
};
const credentialAtomicQueryV2OnChainValidation = {
  validation: { maxQueriesCount: 1, supportedOperations: v2OnChainOperations }
};
const credentialAtomicQueryV3Validation = {
  validation: { maxQueriesCount: 1, supportedOperations: allOperations }
};

export type CircuitValidatorItem = {
  validation: { maxQueriesCount: number; supportedOperations: Operators[] };
  subVersions?: {
    mtLevel?: number;
    mtLevelClaim?: number;
    mtLevelOnChain?: number;
    queryCount?: number;
    targetCircuitId: CircuitId;
  }[];
};

export const circuitValidator: {
  [k in CircuitId]: CircuitValidatorItem;
} = {
  [CircuitId.AtomicQueryMTPV2]: credentialAtomicQueryV2Validation,
  [CircuitId.AtomicQueryMTPV2OnChain]: credentialAtomicQueryV2OnChainValidation,
  [CircuitId.AtomicQuerySigV2]: credentialAtomicQueryV2Validation,
  [CircuitId.AtomicQuerySigV2OnChain]: credentialAtomicQueryV2OnChainValidation,
  [CircuitId.AtomicQueryV3]: credentialAtomicQueryV3Validation,
  [CircuitId.AtomicQueryV3OnChain]: credentialAtomicQueryV3Validation,
  [CircuitId.AuthV2]: noQueriesValidation,
  [CircuitId.AuthV3]: {
    ...noQueriesValidation,
    subVersions: [
      {
        targetCircuitId: (CircuitId.AuthV3 + '-8-32') as CircuitId,
        mtLevel: 8,
        mtLevelOnChain: 32
      }
    ]
  },
  [CircuitId.StateTransition]: noQueriesValidation,
  [CircuitId.LinkedMultiQuery10]: {
    validation: { maxQueriesCount: 10, supportedOperations: allOperations }
  },

  [CircuitId.AtomicQueryV3Stable]: {
    ...credentialAtomicQueryV3Validation,
    subVersions: [
      {
        mtLevel: 16,
        mtLevelClaim: 16,
        targetCircuitId: (CircuitId.AtomicQueryV3Stable + '-16-16-64') as CircuitId
      }
    ]
  },
  [CircuitId.AtomicQueryV3OnChainStable]: {
    ...credentialAtomicQueryV3Validation,
    subVersions: [
      {
        mtLevel: 16,
        mtLevelClaim: 16,
        mtLevelOnChain: 32,
        targetCircuitId: (CircuitId.AtomicQueryV3OnChainStable + '-16-16-64-16-32') as CircuitId
      }
    ]
  },
  [CircuitId.LinkedMultiQuery10Stable]: {
    validation: { maxQueriesCount: 10, supportedOperations: allOperations },
    subVersions: [
      {
        queryCount: 3,
        targetCircuitId: (CircuitId.LinkedMultiQuery10Stable.slice(0, -2) + '3') as CircuitId
      },
      {
        queryCount: 5,
        targetCircuitId: (CircuitId.LinkedMultiQuery10Stable.slice(0, -2) + '5') as CircuitId
      }
    ]
  }
};

export const getCircuitIdsWithSubVersions = (filterCircuitIds?: CircuitId[]): CircuitId[] => {
  return Object.keys(circuitValidator).reduce((acc, key) => {
    const circuitId = key as CircuitId;

    const applyFilter = filterCircuitIds && filterCircuitIds.length > 0;
    // if filterCircuitIds is provided, only include circuits that are in the filterCircuitIds, else include all circuits
    if (applyFilter && !filterCircuitIds.includes(circuitId)) {
      return acc;
    }

    acc.push(circuitId);
    const targetCircuitIds =
      circuitValidator[circuitId]?.subVersions?.map((subversion) => subversion.targetCircuitId) ??
      [];
    acc.push(...targetCircuitIds);
    return acc;
  }, [] as CircuitId[]);
};

export const getGroupedCircuitIdsWithSubVersions = (filterCircuitId: CircuitId): CircuitId[] => {
  return Object.keys(circuitValidator).reduce<CircuitId[]>((acc, key) => {
    const circuitId = key as CircuitId;

    const subVersions = circuitValidator[circuitId]?.subVersions ?? [];

    const group = [...subVersions.map((subversion) => subversion.targetCircuitId), circuitId];

    if (filterCircuitId && !group.includes(filterCircuitId)) {
      return acc;
    }

    return group;
  }, []);
};
