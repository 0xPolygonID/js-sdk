import { Blockchain, DidMethod, NetworkId } from '@iden3/js-iden3-core';
import {
  AuthDataPrepareFunc,
  BjjProvider,
  CircuitData,
  CredentialStatusType,
  CredentialStorage,
  DataPrepareHandlerFunc,
  EthereumBasedIdentityCreationOptions,
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
  Sec256k1Provider,
  StateProof,
  StateVerificationFunc,
  VerifiableConstants,
  VerificationHandlerFunc,
  VerificationParams,
  W3CCredential,
  ZKPPacker,
  byteEncoder,
  VerifyOpts
} from '../src';
import { proving } from '@iden3/js-jwz';
import { JsonRpcProvider } from 'ethers';

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
    networkId: NetworkId.Amoy,
    seed: SEED_ISSUER,
    revocationOpts: {
      type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      id: RHS_URL
    },
    ...opts
  });
};

export const createEthereumBasedIdentity = async (
  wallet: IIdentityWallet,
  opts?: Partial<EthereumBasedIdentityCreationOptions>
) => {
  return await wallet.createEthereumBasedIdentity({
    method: DidMethod.Iden3,
    blockchain: Blockchain.Polygon,
    networkId: NetworkId.Amoy,
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
  getStateInfoByIdAndState: async (id: bigint, state: bigint) => {
    const validTestIds = [
      '19898531390599208021876718705689344940605246460654065917270282371355906561',
      '26675680708205250151451142983868154544835349648265874601395279235340702210',
      '27752766823371471408248225708681313764866231655187366071881070918984471042',
      '21803003425107230045260507608510138502859759480520560654156359021447614978',
      '25191641634853875207018381290409317860151551336133597267061715643603096065',
      '25198543381200665770805816046271594885604002445105767653616878167826895617'
    ];
    if (validTestIds.includes(id.toString())) {
      return { id, state };
    }
    throw new Error(VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST);
  },
  publishState: async () => {
    return '0xc837f95c984892dbcc3ac41812ecb145fedc26d7003202c50e1b87e226a9b33c';
  },
  publishStateGeneric: async () => {
    return '0xc837f95c984892dbcc3ac41812ecb145fedc26d7003202c50e1b87e226a9b33c';
  },
  getGISTProof: (): Promise<StateProof> => {
    return Promise.resolve({
      root: 17849981720634212802664189929671140762557483236708097723884172641124691222298n,
      existence: false,
      siblings: [
        326134006790980215127990638838603607927393129620216601356067855450776136958n,
        16040166254748400928224657755817560385397468295441098176890118618372305780319n,
        7420244680292574553634398111118115717735331415360971314725970615241423752349n,
        6507662880357714762049811645379966577560455837856926574999515093494263945636n,
        0n,
        11595029294867301124773898482486523127938324454211741981988612719540601500230n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n
      ],
      index: 6215769198018398530415546468862662728220697074975785700954864316151489646001n,
      value: 4640764522093738397338399033214568021338945005386791807140524881813261975471n,
      auxExistence: true,
      auxIndex: 6362438263702490742533732866233615008788456433702165759669012876424014585585n,
      auxValue: 4640764522093738397338399033214568021338945005386791807140524881813261975471n
    });
  },
  getGISTRootInfo: (): Promise<RootInfo> => {
    return Promise.resolve({
      root: 17849981720634212802664189929671140762557483236708097723884172641124691222298n,
      replacedByRoot: 0n,
      createdAtTimestamp: 1712319821n,
      replacedAtTimestamp: 0n,
      createdAtBlock: 5499734n,
      replacedAtBlock: 0n
    });
  },
  getRpcProvider: (): JsonRpcProvider => {
    return new JsonRpcProvider(RPC_URL);
  }
};

export const registerKeyProvidersInMemoryKMS = (): KMS => {
  const memoryKeyStore = new InMemoryPrivateKeyStore();
  const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, memoryKeyStore);
  const kms = new KMS();
  kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);
  const sec256k1Provider = new Sec256k1Provider(KmsKeyType.Secp256k1, memoryKeyStore);
  kms.registerKeyProvider(KmsKeyType.Secp256k1, sec256k1Provider);
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

export const TEST_VERIFICATION_OPTS: VerifyOpts = {
  acceptedStateTransitionDelay: 5 * 60 * 1000, // 5 minutes
  acceptedProofGenerationDelay: 10 * 365 * 24 * 60 * 60 * 1000 // 10 years
};
