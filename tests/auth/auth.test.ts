import { StateVerificationFunc, IPacker } from './../../src/iden3comm/types/packer';
import { DID } from '@iden3/js-iden3-core';
import { Token, ProvingMethodAlg, ProvingMethod, proving } from '@iden3/js-jwz';
import { DataPrepareHandlerFunc, VerificationHandlerFunc } from '../../src/iden3comm';
import ZKPPacker from '../../src/iden3comm/packers/zkp';
import {
  AuthDataPrepareFunc,
  IPacker,
  ProvingParams,
  VerificationParams
} from '../../src/iden3comm/types';
import { AuthV2PubSignals, CircuitId } from '../../src/circuits';
import { PROTOCOL_MESSAGE_TYPE } from '../../src/iden3comm/constants';
import { IdentityWallet } from '../../src';
import { CredentialWallet, ICredentialWallet } from '../../src/credentials';
import { IDataStorage, IStateStorage, StateProof } from '../../src/storage/interfaces';
import { IProofService, ProofService } from '../../src/proof';
import { InMemoryPrivateKeyStore } from '../../src/kms/store';
import { BjjProvider, KMS, KmsKeyType } from '../../src/kms';
import {
  InMemoryCredentialStorage,
  InMemoryIdentityStorage,
  InMemoryMerkleTreeStorage
} from '../../src/storage/memory';
import { InMemoryCircuitStorage } from '../../src/storage/memory/circuits';
import { FSKeyLoader } from '../../src/loaders';
import { defaultEthConnectionConfig, EthStateStorage } from '../../src/storage/blockchain/state';
import { CircuitData } from '../../src/storage/entities/circuitData';

describe('zkp packer tests', () => {
  const byteEncoder = new TextEncoder();
  const byteDecoder = new TextDecoder();

  let idWallet: IdentityWallet;
  let credWallet: ICredentialWallet;

  let dataStorage: IDataStorage;
  let proofService: IProofService;
  let packer: IPacker;

  let ethStorage: IStateStorage;
  const mockStateStorage: IStateStorage = {
    getLatestStateById: jest.fn(async () => {
      return {
        id: 25191641634853875207018381290409317860151551336133597267061715643603096065n,
        state: 15316103435703269893947162180693935798669021972402205481551466808302934202991n,
        replacedByState: 0n,
        createdAtTimestamp: 1672245326n,
        replacedAtTimestamp: 0n,
        createdAtBlock: 30258020n,
        replacedAtBlock: 0n
      };
    }),
    publishState: jest.fn(async () => {
      return '0xc837f95c984892dbcc3ac41812ecb145fedc26d7003202c50e1b87e226a9b33c';
    }),
    getGISTProof: jest.fn((): Promise<StateProof> => {
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
    })
  };

  beforeEach(async () => {
    const memoryKeyStore = new InMemoryPrivateKeyStore();
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, memoryKeyStore);
    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);

    dataStorage = {
      credential: new InMemoryCredentialStorage(),
      identity: new InMemoryIdentityStorage(),
      mt: new InMemoryMerkleTreeStorage(32),
      states: mockStateStorage
    };

    const circuitStorage = new InMemoryCircuitStorage();

    // todo: change this loader
    const loader = new FSKeyLoader('./test_data');

    circuitStorage.saveCircuitData(CircuitId.AuthV2, {
      wasm: await loader.load(`${CircuitId.StateTransition.toString()}/circuit.wasm`),
      provingKey: await loader.load(`${CircuitId.StateTransition.toString()}/circuit_final.zkey`),
      verificationKey: await loader.load(
        `${CircuitId.AtomicQueryMTPV2.toString()}/verification_key.json`
      )
    });

    const conf = defaultEthConnectionConfig;
    conf.url = ''; // TODO: add url here
    conf.contractAddress = '0xf6781AD281d9892Df285cf86dF4F6eBec2042d71';
    ethStorage = new EthStateStorage(conf);
    dataStorage.states = ethStorage;
    credWallet = new CredentialWallet(dataStorage);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    proofService = new ProofService(idWallet, credWallet, kms, circuitStorage, ethStorage);
    const zkPacker: IPacker = await initZKPPacker(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.authDataPrepare,
        proofService.verifyState
    );
  });

  it('test plain message packer', async () => {
  
  });
});

const initZKPPacker = async (
  circuitData: CircuitData,
  prepareFn: AuthDataPrepareFunc,
  stateVerificationFn: StateVerificationFunc
): Promise<IPacker> => {
  const authInputsHandler = new DataPrepareHandlerFunc(prepareFn);

  const verificationFn = new VerificationHandlerFunc(stateVerificationFn);
  const mapKey = JSON.stringify(proving.provingMethodGroth16AuthV2Instance);

  const verificationParamMap: Map<string, VerificationParams> = new Map([
    [
      mapKey,
      {
        key: circuitData.verificationKey,
        verificationFn
      }
    ]
  ]);

  const provingParamMap: Map<string, ProvingParams> = new Map();
  provingParamMap.set(mapKey, {
    dataPreparer: authInputsHandler,
    provingKey: circuitData.provingKey,
    wasm: circuitData.wasm
  });

  return new ZKPPacker(provingParamMap, verificationParamMap);
};
