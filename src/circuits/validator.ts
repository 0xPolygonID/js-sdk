import { AtomicQueryMTPV2OnChainPubSignals } from './atomic-query-mtp-v2-on-chain';
import { AtomicQuerySigV2OnChainPubSignals } from './atomic-query-sig-v2-on-chain';
import { AtomicQueryV3OnChainPubSignals } from './atomic-query-v3-on-chain';
import { AuthV2PubSignals } from './auth-v2';
import { AuthV3PubSignals } from './auth-v3';
import { IStateInfoPubSignals } from './common';
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

export type CircuitSubversion = {
  mtLevel?: number;
  mtLevelClaim?: number;
  mtLevelOnChain?: number;
  queryCount?: number;
  targetCircuitId: CircuitId;
  ctor?: new (opts?: {
    mtLevel?: number;
    mtLevelClaim?: number;
    mtLevelOnChain?: number;
  }) => IStateInfoPubSignals;
};

export type CircuitValidatorItem = {
  validation: { maxQueriesCount: number; supportedOperations: Operators[] };
  subVersions?: CircuitSubversion[];
  ctor?: new (opts?: {
    mtLevel?: number;
    mtLevelClaim?: number;
    mtLevelOnChain?: number;
  }) => IStateInfoPubSignals;
  mtLevel?: number;
  mtLevelClaim?: number;
  mtLevelOnChain?: number;
};

export const circuitValidator: {
  [k in CircuitId]: CircuitValidatorItem;
} = {
  [CircuitId.AtomicQueryMTPV2]: credentialAtomicQueryV2Validation,
  [CircuitId.AtomicQueryMTPV2OnChain]: {
    ...credentialAtomicQueryV2OnChainValidation,
    ctor: AtomicQueryMTPV2OnChainPubSignals
  },
  [CircuitId.AtomicQuerySigV2]: credentialAtomicQueryV2Validation,
  [CircuitId.AtomicQuerySigV2OnChain]: {
    ...credentialAtomicQueryV2OnChainValidation,
    ctor: AtomicQuerySigV2OnChainPubSignals
  },
  [CircuitId.AtomicQueryV3]: credentialAtomicQueryV3Validation,
  [CircuitId.AtomicQueryV3OnChain]: {
    ...credentialAtomicQueryV3Validation,
    ctor: AtomicQueryV3OnChainPubSignals
  },
  [CircuitId.AuthV2]: { ...noQueriesValidation, ctor: AuthV2PubSignals },
  [CircuitId.AuthV3]: { ...noQueriesValidation, ctor: AuthV3PubSignals },
  [CircuitId.AuthV3_8_32]: {
    ...noQueriesValidation,
    ctor: AuthV3PubSignals,
    mtLevel: 8,
    mtLevelClaim: 32
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
        targetCircuitId: (CircuitId.AtomicQueryV3OnChainStable + '-16-16-64-16-32') as CircuitId,
        ctor: AtomicQueryV3OnChainPubSignals
      }
    ],
    ctor: AtomicQueryV3OnChainPubSignals
  },
  [CircuitId.LinkedMultiQueryStable]: {
    validation: { maxQueriesCount: 10, supportedOperations: allOperations },
    subVersions: [
      {
        queryCount: 3,
        targetCircuitId: (CircuitId.LinkedMultiQueryStable + '3') as CircuitId
      },
      {
        queryCount: 5,
        targetCircuitId: (CircuitId.LinkedMultiQueryStable + '5') as CircuitId
      }
    ]
  }
};

export const getCircuitIdsWithSubVersions = (filterCircuitIds?: CircuitId[]): CircuitId[] => {
  return [
    ...Object.keys(circuitValidator).reduce((acc, key) => {
      const circuitId = key as CircuitId;

      const applyFilter = filterCircuitIds && filterCircuitIds.length > 0;
      // if filterCircuitIds is provided, only include circuits that are in the filterCircuitIds, else include all circuits
      if (applyFilter && !filterCircuitIds.includes(circuitId)) {
        return acc;
      }

      acc.add(circuitId);
      const targetCircuitIds =
        circuitValidator[circuitId]?.subVersions?.map((subversion) => subversion.targetCircuitId) ??
        [];
      targetCircuitIds.forEach((id) => acc.add(id));
      return acc;
    }, new Set<CircuitId>())
  ];
};

export const getGroupedCircuitIdsWithSubVersions = (filterCircuitId: CircuitId): CircuitId[] => {
  for (const key of Object.keys(circuitValidator)) {
    const circuitId = key as CircuitId;
    const subVersions = circuitValidator[circuitId]?.subVersions ?? [];
    const group = [...subVersions.map((subversion) => subversion.targetCircuitId), circuitId];

    if (group.includes(filterCircuitId)) {
      return group;
    }
  }

  const validatorItem = circuitValidator[filterCircuitId];
  if (validatorItem) {
    const subVersions = validatorItem.subVersions ?? [];
    return [...subVersions.map((subversion) => subversion.targetCircuitId), filterCircuitId];
  }

  return [filterCircuitId];
};

export const getCtorForCircuitId = (
  circuitIdToFind: CircuitId
):
  | {
      ctor: new (opts?: {
        mtLevel?: number;
        mtLevelClaim?: number;
        mtLevelOnChain?: number;
      }) => IStateInfoPubSignals;
      opts?: { mtLevel?: number; mtLevelClaim?: number; mtLevelOnChain?: number };
    }
  | undefined => {
  for (const key of Object.keys(circuitValidator)) {
    const circuitId = key as CircuitId;

    if (circuitId === circuitIdToFind && circuitValidator[circuitId].ctor) {
      return {
        ctor: circuitValidator[circuitId].ctor,
        opts:
          circuitValidator[circuitId].mtLevel ||
          circuitValidator[circuitId].mtLevelClaim ||
          circuitValidator[circuitId].mtLevelOnChain
            ? {
                mtLevel: circuitValidator[circuitId].mtLevel,
                mtLevelClaim: circuitValidator[circuitId].mtLevelClaim,
                mtLevelOnChain: circuitValidator[circuitId].mtLevelOnChain
              }
            : undefined
      };
    }

    const subVersions = circuitValidator[circuitId]?.subVersions ?? [];
    if (subVersions.length > 0) {
      const subVersion = subVersions.find(
        (subversion) => subversion.targetCircuitId === circuitIdToFind
      );
      if (subVersion && subVersion.ctor) {
        return {
          ctor: subVersion.ctor,
          opts:
            subVersion.mtLevel || subVersion.mtLevelClaim || subVersion.mtLevelOnChain
              ? {
                  mtLevel: subVersion.mtLevel,
                  mtLevelClaim: subVersion.mtLevelClaim,
                  mtLevelOnChain: subVersion.mtLevelOnChain
                }
              : undefined
        };
      }
    }
  }
};
