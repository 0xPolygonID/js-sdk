import { Blockchain, DidMethod, NetworkId } from '@iden3/js-iden3-core';
import {
  AuthDataPrepareFunc,
  BjjProvider,
  CircuitData,
  CredentialStatusType,
  CredentialStorage,
  DataPrepareHandlerFunc,
  IIdentityWallet,
  IPackageManager,
  IStateStorage,
  Identity,
  IdentityCreationOptions,
  IdentityStorage,
  InMemoryDataSource,
  InMemoryMerkleTreeStorage,
  InMemoryPrivateKeyStore,
  KMS,
  KmsKeyType,
  PackageManager,
  PlainPacker,
  Profile,
  ProvingParams,
  RootInfo,
  StateProof,
  StateVerificationFunc,
  VerifiableConstants,
  VerificationHandlerFunc,
  VerificationParams,
  W3CCredential,
  ZKPPacker,
  byteEncoder
} from '../src';
import { proving } from '@iden3/js-jwz';

export const SEED_ISSUER: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedseed');
export const SEED_USER: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseeduser');
export const RHS_URL = process.env.RHS_URL as string;
export const RHS_CONTRACT_ADDRESS = process.env.RHS_CONTRACT_ADDRESS as string;
export const STATE_CONTRACT = process.env.STATE_CONTRACT_ADDRESS as string;
export const RPC_URL = process.env.RPC_URL as string;
export const WALLET_KEY = process.env.WALLET_KEY as string;
export const IPFS_URL = process.env.IPFS_URL as string;

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
      id: RHS_URL
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

export const registerBJJIntoInMemoryKMS = (): KMS => {
  const memoryKeyStore = new InMemoryPrivateKeyStore();
  const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, memoryKeyStore);
  const kms = new KMS();
  kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);
  return kms;
};

export const getInMemoryDataStorage = (states: IStateStorage) => {
  return {
    credential: new CredentialStorage(new InMemoryDataSource<W3CCredential>()),
    identity: new IdentityStorage(
      new InMemoryDataSource<Identity>(),
      new InMemoryDataSource<Profile>()
    ),
    mt: new InMemoryMerkleTreeStorage(40),
    states
  };
};

export const getPackageMgr = async (
  circuitData: CircuitData,
  prepareFn: AuthDataPrepareFunc,
  stateVerificationFn: StateVerificationFunc
): Promise<IPackageManager> => {
  const authInputsHandler = new DataPrepareHandlerFunc(prepareFn);

  const verificationFn = new VerificationHandlerFunc(stateVerificationFn);
  const mapKey = proving.provingMethodGroth16AuthV2Instance.methodAlg.toString();

  if (!circuitData.verificationKey) {
    throw new Error(`verification key doesn't exist for ${circuitData.circuitId}`);
  }
  const verificationParamMap: Map<string, VerificationParams> = new Map([
    [
      mapKey,
      {
        key: circuitData.verificationKey,
        verificationFn
      }
    ]
  ]);

  if (!circuitData.provingKey) {
    throw new Error(`proving doesn't exist for ${circuitData.circuitId}`);
  }
  if (!circuitData.wasm) {
    throw new Error(`wasm file doesn't exist for ${circuitData.circuitId}`);
  }
  const provingParamMap: Map<string, ProvingParams> = new Map();
  provingParamMap.set(mapKey, {
    dataPreparer: authInputsHandler,
    provingKey: circuitData.provingKey,
    wasm: circuitData.wasm
  });

  const mgr: IPackageManager = new PackageManager();
  const packer = new ZKPPacker(provingParamMap, verificationParamMap);
  const plainPacker = new PlainPacker();
  mgr.registerPackers([packer, plainPacker]);

  return mgr;
};
