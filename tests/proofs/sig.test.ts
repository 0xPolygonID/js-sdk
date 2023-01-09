import { AuthHandler, IAuthHandler, IdentityWallet } from '../../src';
import { BjjProvider, KMS, KmsKeyType } from '../../src/kms';
import { InMemoryPrivateKeyStore } from '../../src/kms/store';
import { IDataStorage, IStateStorage } from '../../src/storage/interfaces';
import {
  InMemoryCredentialStorage,
  InMemoryIdentityStorage,
  InMemoryMerkleTreeStorage
} from '../../src/storage/memory';
import { ClaimRequest, CredentialWallet } from '../../src/credentials';
import { ProofService, ZKPRequest } from '../../src/proof';
import { InMemoryCircuitStorage } from '../../src/storage/memory/circuits';
import { CircuitId } from '../../src/circuits';
import { FSKeyLoader } from '../../src/loaders';
import { VerifiableConstants } from '../../src/verifiable';
import { RootInfo, StateProof } from '../../src/storage/entities/state';
import path from 'path';
import { CircuitData } from '../../src/storage/entities/circuitData';
import {
  AuthDataPrepareFunc,
  AuthorizationRequestMessage,
  AuthorizationRequestMessageBody,
  DataPrepareHandlerFunc,
  IPackageManger,
  PackageManger,
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
import { byteDecoder, byteEncoder } from '../../src/iden3comm/utils';

describe.skip('sig proofs', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;
  let proofService: ProofService;
  let authHandler: IAuthHandler;

  const mockStateStorage: IStateStorage = {
    getLatestStateById: jest.fn(async () => {
      throw new Error(VerifiableConstants.ERRORS.IDENENTITY_DOES_NOT_EXIST);
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
  ): Promise<IPackageManger> => {
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

    const mgr: IPackageManger = new PackageManger();
    const packer = new ZKPPacker(provingParamMap, verificationParamMap);
    mgr.registerPackers([packer]);

    return mgr;
  };

  beforeEach(async () => {
    const memoryKeyStore = new InMemoryPrivateKeyStore();
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, memoryKeyStore);
    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);

    dataStorage = {
      credential: new InMemoryCredentialStorage(),
      identity: new InMemoryIdentityStorage(),
      mt: new InMemoryMerkleTreeStorage(40),
      states: mockStateStorage
    };

    const circuitStorage = new InMemoryCircuitStorage();

    const loader = new FSKeyLoader(path.join(__dirname, './testdata'));

    circuitStorage.saveCircuitData(CircuitId.AuthV2, {
      wasm: await loader.load(`${CircuitId.AuthV2.toString()}/circuit.wasm`),
      provingKey: await loader.load(`${CircuitId.AuthV2.toString()}/circuit_final.zkey`),
      verificationKey: await loader.load(`${CircuitId.AuthV2.toString()}/verification_key.json`)
    });

    circuitStorage.saveCircuitData(CircuitId.AtomicQueryMTPV2, {
      wasm: await loader.load(`${CircuitId.AtomicQueryMTPV2.toString()}/circuit.wasm`),
      provingKey: await loader.load(`${CircuitId.AtomicQueryMTPV2.toString()}/circuit_final.zkey`),
      verificationKey: await loader.load(
        `${CircuitId.AtomicQueryMTPV2.toString()}/verification_key.json`
      )
    });

    circuitStorage.saveCircuitData(CircuitId.StateTransition, {
      wasm: await loader.load(`${CircuitId.StateTransition.toString()}/circuit.wasm`),
      provingKey: await loader.load(`${CircuitId.StateTransition.toString()}/circuit_final.zkey`),
      verificationKey: await loader.load(
        `${CircuitId.AtomicQueryMTPV2.toString()}/verification_key.json`
      )
    });

    credWallet = new CredentialWallet(dataStorage);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    proofService = new ProofService(idWallet, credWallet, kms, circuitStorage, mockStateStorage);
    const packageMgr = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthV2Inputs,
      proofService.verifyState
    );
    authHandler = new AuthHandler(packageMgr, proofService);
  });
  it.skip('sigv2-non-merklized', async () => {
    const seedPhraseIssuer: Uint8Array = new TextEncoder().encode(
      'seedseedseedseedseedseedseedseed'
    );
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseeduser');

    const { did: userDID, credential: cred } = await idWallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhrase
    );
    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
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
      withRHS: 'http://rhs.node'
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
    const { proof, credential } = await proofService.generateProof(proofReq, userDID);
    console.log(proof);

    const authReqBody: AuthorizationRequestMessageBody = {
      callbackUrl: 'http://localhost:8080/callback?id=1234442-123123-123123',
      reason: 'reason',
      message: 'mesage',
      did_doc: {},
      scope: [proofReq as ZeroKnowledgeProofRequest]
    };

    const authReq: AuthorizationRequestMessage = {
      id: uuid.v4(),
      typ: MediaType.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE,
      thid: '1234442-123123-123123',
      body: authReqBody,
      from: issuerDID.id.string(),
      to: userDID.id.string()
    };

    const authRes = await authHandler.handleAuthorizationRequest(
      userDID,
      byteEncoder.encode(JSON.stringify(authReq))
    );

    console.log(JSON.stringify(byteDecoder.decode(authRes)));
  });
  it.skip('sigv2-merklized', async () => {
    const seedPhraseIssuer: Uint8Array = new TextEncoder().encode(
      'seedseedseedseedseedseedseedseed'
    );
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseeduser');

    const { did: userDID, credential } = await idWallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhrase
    );

    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhraseIssuer
    );
    const claimReq: ClaimRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json',
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
      withRHS: 'http://rhs.node'
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
    const { proof, credential: cred } = await proofService.generateProof(proofReq, userDID);
    console.log(proof);
  });
});
