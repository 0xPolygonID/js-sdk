import { describe, expect, it } from 'vitest';
import { getCircuitIdsWithSubVersions, getGroupedCircuitIdsWithSubVersions } from '../../src';
import { CircuitId } from '../../src/circuits/models';

describe('validator', () => {
  it('should validate the circuit inputs', () => {
    const allCircuitIds = [
      'credentialAtomicQueryMTPV2',
      'credentialAtomicQueryMTPV2OnChain',
      'credentialAtomicQuerySigV2',
      'credentialAtomicQuerySigV2OnChain',
      'credentialAtomicQueryV3-beta.1',
      'credentialAtomicQueryV3OnChain-beta.1',
      'authV2',
      'authV3',
      'authV3-8-32',
      'stateTransition',
      'linkedMultiQuery10-beta.1',
      'credentialAtomicQueryV3',
      'credentialAtomicQueryV3-16-16-64',
      'credentialAtomicQueryV3OnChain',
      'credentialAtomicQueryV3OnChain-16-16-64-16-32',
      'linkedMultiQuery3',
      'linkedMultiQuery5',
      'linkedMultiQuery'
    ];
    const testCases = [
      {
        filterCircuitIds: [],
        expectedCircuitIds: allCircuitIds
      },
      {
        filterCircuitIds: undefined,
        expectedCircuitIds: allCircuitIds
      },
      {
        filterCircuitIds: [CircuitId.LinkedMultiQueryStable],
        expectedCircuitIds: ['linkedMultiQuery3', 'linkedMultiQuery5', 'linkedMultiQuery']
      },
      {
        filterCircuitIds: [CircuitId.AtomicQueryV3Stable],
        expectedCircuitIds: ['credentialAtomicQueryV3', 'credentialAtomicQueryV3-16-16-64']
      }
    ];

    testCases.forEach((testCase) => {
      const circuitIds = getCircuitIdsWithSubVersions(testCase.filterCircuitIds);
      expect(circuitIds.sort()).toEqual(testCase.expectedCircuitIds.sort());
    });
  });

  it('should validate the grouped circuit ids with sub versions', () => {
    const testCases = [
      {
        filterCircuitId: CircuitId.AuthV3,
        expectedCircuitIds: ['authV3']
      },
      {
        filterCircuitId: 'authV3-8-32' as CircuitId,
        expectedCircuitIds: ['authV3-8-32']
      },
      {
        filterCircuitId: CircuitId.AtomicQueryV3Stable,
        expectedCircuitIds: ['credentialAtomicQueryV3', 'credentialAtomicQueryV3-16-16-64']
      },
      {
        filterCircuitId: 'credentialAtomicQueryV3-16-16-64' as CircuitId,
        expectedCircuitIds: ['credentialAtomicQueryV3', 'credentialAtomicQueryV3-16-16-64']
      },
      {
        filterCircuitId: CircuitId.AtomicQueryV3OnChainStable,
        expectedCircuitIds: [
          'credentialAtomicQueryV3OnChain',
          'credentialAtomicQueryV3OnChain-16-16-64-16-32'
        ]
      },
      {
        filterCircuitId: CircuitId.LinkedMultiQueryStable,
        expectedCircuitIds: ['linkedMultiQuery', 'linkedMultiQuery5', 'linkedMultiQuery3']
      },
      {
        filterCircuitId: 'linkedMultiQuery3' as CircuitId,
        expectedCircuitIds: ['linkedMultiQuery', 'linkedMultiQuery5', 'linkedMultiQuery3']
      }
    ];
    testCases.forEach((testCase) => {
      const circuitIds = getGroupedCircuitIdsWithSubVersions(testCase.filterCircuitId);
      expect(circuitIds.sort()).toEqual(testCase.expectedCircuitIds.sort());
    });
  });
});
