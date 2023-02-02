import { Identity, Profile } from './../../src/storage/entities/identity';
import { IdentityStorage } from './../../src/storage/shared/identity-storage';
import { defaultEthConnectionConfig, EthStateStorage } from './../../src/storage/blockchain/state';
import { PlainPacker } from './../../src/iden3comm/packers/plain';
import { AuthHandler, CredentialStorage, IAuthHandler, IdentityWallet } from '../../src';
import { BjjProvider, KMS, KmsKeyType } from '../../src/kms';
import { InMemoryPrivateKeyStore } from '../../src/kms/store';
import { IDataStorage, IStateStorage } from '../../src/storage/interfaces';
import { InMemoryDataSource, InMemoryMerkleTreeStorage } from '../../src/storage/memory';
import { ClaimRequest, CredentialWallet } from '../../src/credentials';
import { ProofService, ZKPRequest } from '../../src/proof';
import { InMemoryCircuitStorage } from '../../src/storage/memory/circuits';
import { CircuitId } from '../../src/circuits';
import { FSKeyLoader } from '../../src/loaders';
import { VerifiableConstants, W3CCredential } from '../../src/verifiable';
import { RootInfo, StateProof } from '../../src/storage/entities/state';
import path from 'path';
import { CircuitData } from '../../src/storage/entities/circuitData';
import {
  AuthDataPrepareFunc,
  AuthorizationRequestMessage,
  AuthorizationRequestMessageBody,
  DataPrepareHandlerFunc,
  IPackageManager,
  PackageManager,
  ProvingParams,
  StateVerificationFunc,
  VerificationHandlerFunc,
  VerificationParams,
  ZeroKnowledgeProofRequest
} from '../../src/iden3comm';
import { proving } from '@iden3/js-jwz';
import ZKPPacker from '../../src/iden3comm/packers/zkp';
import * as uuid from 'uuid';
import { MediaType, PROTOCOL_MESSAGE_TYPE } from '../../src/iden3comm/constants';
import { byteEncoder } from '../../src/iden3comm/utils';
import { Token } from '@iden3/js-jwz';
jest.mock('@digitalbazaar/http-client', () => ({}));

describe.skip('auth', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;
  let proofService: ProofService;
  let authHandler: IAuthHandler;
  let packageMgr: IPackageManager;
  const rhsUrl = 'http://localhost:8080';

  const mockStateStorage: IStateStorage = {
    getLatestStateById: jest.fn(async () => {
      throw new Error(VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST);
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
    }),
    getGISTRootInfo: jest.fn((): Promise<RootInfo> => {
      return Promise.resolve({
        root: 0n,
        replacedByRoot: 0n,
        createdAtTimestamp: 0n,
        replacedAtTimestamp: 0n,
        createdAtBlock: 0n,
        replacedAtBlock: 0n
      });
    })
  };

  const getPackageMgr = async (
    circuitData: CircuitData,
    prepareFn: AuthDataPrepareFunc,
    stateVerificationFn: StateVerificationFunc
  ): Promise<IPackageManager> => {
    const authInputsHandler = new DataPrepareHandlerFunc(prepareFn);

    const verificationFn = new VerificationHandlerFunc(stateVerificationFn);
    const mapKey = proving.provingMethodGroth16AuthV2Instance.methodAlg.toString();
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

    const mgr: IPackageManager = new PackageManager();
    const packer = new ZKPPacker(provingParamMap, verificationParamMap);
    const plainPacker = new PlainPacker();
    mgr.registerPackers([packer, plainPacker]);

    return mgr;
  };

  beforeEach(async () => {
    const memoryKeyStore = new InMemoryPrivateKeyStore();
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, memoryKeyStore);
    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);
    dataStorage = {
      credential: new CredentialStorage(new InMemoryDataSource<W3CCredential>()),
      identity: new IdentityStorage(
        new InMemoryDataSource<Identity>(),
        new InMemoryDataSource<Profile>()
      ),
      mt: new InMemoryMerkleTreeStorage(40),
      states: new EthStateStorage(defaultEthConnectionConfig)
    };

    const circuitStorage = new InMemoryCircuitStorage();

    const loader = new FSKeyLoader(path.join(__dirname, '../proofs/testdata'));

    await circuitStorage.saveCircuitData(CircuitId.AuthV2, {
      circuitId: CircuitId.AuthV2.toString(),
      wasm: await loader.load(`${CircuitId.AuthV2.toString()}/circuit.wasm`),
      provingKey: await loader.load(`${CircuitId.AuthV2.toString()}/circuit_final.zkey`),
      verificationKey: await loader.load(`${CircuitId.AuthV2.toString()}/verification_key.json`)
    });

    await circuitStorage.saveCircuitData(CircuitId.AtomicQuerySigV2, {
      circuitId: CircuitId.AtomicQuerySigV2.toString(),
      wasm: await loader.load(`${CircuitId.AtomicQuerySigV2.toString()}/circuit.wasm`),
      provingKey: await loader.load(`${CircuitId.AtomicQuerySigV2.toString()}/circuit_final.zkey`),
      verificationKey: await loader.load(
        `${CircuitId.AtomicQuerySigV2.toString()}/verification_key.json`
      )
    });

    await circuitStorage.saveCircuitData(CircuitId.StateTransition, {
      circuitId: CircuitId.StateTransition.toString(),
      wasm: await loader.load(`${CircuitId.StateTransition.toString()}/circuit.wasm`),
      provingKey: await loader.load(`${CircuitId.StateTransition.toString()}/circuit_final.zkey`),
      verificationKey: await loader.load(
        `${CircuitId.AtomicQueryMTPV2.toString()}/verification_key.json`
      )
    });

    credWallet = new CredentialWallet(dataStorage);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    proofService = new ProofService(idWallet, credWallet, kms, circuitStorage, mockStateStorage);
    packageMgr = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthV2Inputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    );
    authHandler = new AuthHandler(packageMgr, proofService);
  });

  it('request-response flow', async () => {
    const seedPhraseIssuer: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedseed');
    const seedPhrase: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseeduser');

    const { did: userDID, credential: cred } = await idWallet.createIdentity(
      'http://metamask.com/',
      rhsUrl,
      seedPhrase
    );
    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity(
      'http://metamask.com/',
      rhsUrl,
      seedPhraseIssuer
    );

    const claimReq: ClaimRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v2.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.toString(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 1693526400
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq, 'http://metamask.com/', {
      withPublish: false,
      withRHS: 'http://metamask.com/'
    });

    await credWallet.save(issuerCred);

    const proofReq: ZKPRequest = {
      id: 1,
      circuitId: CircuitId.AtomicQuerySigV2,
      optional: false,
      query: {
        allowedIssuers: ['*'],
        type: claimReq.type,
        context:
          'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld',
        req: {
          documentType: {
            $eq: 99
          }
        }
      }
    };

    const authReqBody: AuthorizationRequestMessageBody = {
      callbackUrl: 'http://localhost:8080/callback?id=1234442-123123-123123',
      reason: 'reason',
      message: 'mesage',
      did_doc: {},
      scope: [proofReq as ZeroKnowledgeProofRequest]
    };

    const id = uuid.v4();
    const authReq: AuthorizationRequestMessage = {
      id,
      typ: MediaType.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: authReqBody,
      from: issuerDID.id.string()
    };

    const msgBytes = byteEncoder.encode(JSON.stringify(authReq));
    const authRes = await authHandler.handleAuthorizationRequest(userDID, msgBytes);

    const tokenStr = authRes.token;
    console.log(tokenStr);
    expect(tokenStr).toBeDefined();
    const token = await Token.parse(tokenStr);
    expect(token).toBeDefined();
  });
});
