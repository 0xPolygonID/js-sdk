import { Blockchain, DidMethod, NetworkId } from '@iden3/js-iden3-core';
import {
  CredentialStatusType,
  IIdentityWallet,
  IStateStorage,
  IdentityCreationOptions,
  RootInfo,
  StateProof,
  VerifiableConstants,
  byteEncoder
} from '../src';

export const SEED_ISSUER: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedseed');
export const SEED_USER: Uint8Array = byteEncoder.encode('userseedseedseedseedseedseeduser');
const rhsURL = process.env.RHS_URL as string;

export const createIdentity = async (
  wallet: IIdentityWallet,
  opts?: Partial<IdentityCreationOptions>
) => {
  return await wallet.createIdentity({
    method: DidMethod.Iden3,
    blockchain: Blockchain.Polygon,
    networkId: NetworkId.Mumbai,
    seed: SEED_ISSUER,
    revocationOpts: {
      type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      id: rhsURL
    },
    ...opts
  });
};

export const MOCK_STATE_STORAGE: IStateStorage = {
  getLatestStateById: async () => {
    throw new Error(VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST);
  },
  publishState: async () => {
    return '0xc837f95c984892dbcc3ac41812ecb145fedc26d7003202c50e1b87e226a9b33c';
  },
  getGISTProof: (): Promise<StateProof> => {
    return Promise.resolve({
      root: 0n,
      existence: false,
      siblings: [],
      index: 0n,
      value: 0n,
      auxExistence: false,
      auxIndex: 0n,
      auxValue: 0n
    });
  },
  getGISTRootInfo: (): Promise<RootInfo> => {
    return Promise.resolve({
      root: 0n,
      replacedByRoot: 0n,
      createdAtTimestamp: 0n,
      replacedAtTimestamp: 0n,
      createdAtBlock: 0n,
      replacedAtBlock: 0n
    });
  }
};
