import { describe, expect, it } from 'vitest';
import { getCircuitIdsWithSubVersions } from '../../src';
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
      'linkedMultiQuery10'
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
        filterCircuitIds: [CircuitId.LinkedMultiQuery10Stable],
        expectedCircuitIds: ['linkedMultiQuery3', 'linkedMultiQuery5', 'linkedMultiQuery10']
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
});
