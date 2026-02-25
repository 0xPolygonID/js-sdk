import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DID } from '@iden3/js-iden3-core';

import {
  EthStateStorage,
  EthConnectionConfig,
  VerifiableConstants,
  defaultEthConnectionConfig
} from '../../src';

const { mockContract, MockContract, MockJsonRpcProvider } = vi.hoisted(() => {
  const mockContractObj = {
    getStateInfoByIdAndState: vi.fn(),
    getStateInfoById: vi.fn(),
    getGISTProof: vi.fn(),
    getGISTRootInfo: vi.fn(),
    connect: vi.fn(),
    transitState: {
      estimateGas: vi.fn(),
      populateTransaction: vi.fn()
    },
    transitStateGeneric: {
      estimateGas: vi.fn(),
      populateTransaction: vi.fn()
    }
  };

  const mockProviderObj = {
    getFeeData: vi.fn().mockResolvedValue({
      maxFeePerGas: 100n,
      maxPriorityFeePerGas: 50n
    })
  };

  return {
    mockContract: mockContractObj,
    mockProvider: mockProviderObj,
    MockContract: function () {
      return mockContractObj;
    },
    MockJsonRpcProvider: function () {
      return mockProviderObj;
    }
  };
});

vi.mock('ethers', () => ({
  Contract: MockContract,
  JsonRpcProvider: MockJsonRpcProvider
}));

describe('EthStateStorage', () => {
  let ethStateStorage: EthStateStorage;

  const testConfig: EthConnectionConfig = { ...defaultEthConnectionConfig, chainId: 80002 };

  const testDID = DID.parse(
    'did:polygonid:polygon:amoy:2qQ68JkRcf3xrHPQPWZei3YeVzHPP58wYNxx2mEouR'
  );
  const testId = DID.idFromDID(testDID);
  const testIdBigInt = testId.bigInt();
  const testStateBigInt = 123456789n;

  beforeEach(() => {
    vi.clearAllMocks();
    ethStateStorage = new EthStateStorage(testConfig);
  });

  describe('getStateInfoByIdAndState - Genesis State Caching', () => {
    it('should cache genesis state when called twice', async () => {
      const stateDoesNotExistError = new Error(VerifiableConstants.ERRORS.STATE_DOES_NOT_EXIST);

      mockContract.getStateInfoByIdAndState.mockRejectedValue(stateDoesNotExistError);

      const result1 = await ethStateStorage.getStateInfoByIdAndState(testIdBigInt, testStateBigInt);

      expect(mockContract.getStateInfoByIdAndState).toHaveBeenCalledTimes(1);
      expect(mockContract.getStateInfoByIdAndState).toHaveBeenCalledWith(
        testIdBigInt,
        testStateBigInt
      );

      expect(result1).toEqual({
        id: testIdBigInt,
        state: testStateBigInt,
        replacedByState: 0n,
        createdAtTimestamp: 0n,
        replacedAtTimestamp: 0n,
        createdAtBlock: 0n,
        replacedAtBlock: 0n
      });

      const result2 = await ethStateStorage.getStateInfoByIdAndState(testIdBigInt, testStateBigInt);

      expect(mockContract.getStateInfoByIdAndState).toHaveBeenCalledTimes(1);

      expect(result2).toEqual(result1);
    });
  });
});
