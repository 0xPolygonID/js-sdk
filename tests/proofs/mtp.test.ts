import { byteDecoder, byteEncoder } from './../../src/iden3comm/utils/index';
import { MediaTypes, PROTOCOL_MESSAGE_TYPE } from './../../src/iden3comm/constants';
import {
  AuthorizationRequestMessage,
  AuthorizationRequestMessageBody,
  ZeroKnowledgeProofRequest
} from './../../src/iden3comm/types/protocol/auth';
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
import { IProofService, ProofService, ZKPRequest } from '../../src/proof';
import { InMemoryCircuitStorage } from '../../src/storage/memory/circuits';
import { CircuitId } from '../../src/circuits';
import { FSKeyLoader } from '../../src/loaders';
import { ethers, Signer } from 'ethers';
import { defaultEthConnectionConfig, EthStateStorage } from '../../src/storage/blockchain/state';
import { RootInfo, StateProof } from '../../src/storage/entities/state';
import path from 'path';
import {
  AuthDataPrepareFunc,
  DataPrepareHandlerFunc,
  IPacker,
  ProvingParams,
  StateVerificationFunc,
  VerificationHandlerFunc,
  VerificationParams
} from '../../src/iden3comm';
import { CircuitData } from '../../src/storage/entities/circuitData';
import { proving } from '@iden3/js-jwz';
import ZKPPacker from '../../src/iden3comm/packers/zkp';

describe('mtp proofs', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;
  let proofService: IProofService;

  let ethStorage: EthStateStorage;
  let authHandler: IAuthHandler;
  let packer: IPacker;

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

    const conf = defaultEthConnectionConfig;
    // conf.url = ''; // TODO: add url here
    // conf.contractAddress = '0xf6781AD281d9892Df285cf86dF4F6eBec2042d71';
    ethStorage = new EthStateStorage(conf);
    dataStorage.states = ethStorage;
    credWallet = new CredentialWallet(dataStorage);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    proofService = new ProofService(idWallet, credWallet, kms, circuitStorage, mockStateStorage);
    packer = await initZKPPacker(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.authDataPrepare,
      proofService.verifyState
    );
    authHandler = new AuthHandler(packer, proofService);
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

  it.only('mtpv2-non-merklized', async () => {
    const rhsURL = 'http://localhost:8080';

    const seedPhraseIssuer: Uint8Array = new TextEncoder().encode(
      'seedseedseedseedseedseedseedseed'
    );
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseeduser');

    const { did: userDID, credential } = await idWallet.createIdentity(
      'http://metamask.com/',
      rhsURL,
      seedPhrase
    );

    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity(
      'http://metamask.com/',
      rhsURL,
      seedPhraseIssuer
    );
    await credWallet.save(issuerAuthCredential);

    const claimReq: ClaimRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v2.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.toString(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 1693526400,
      revNonce: 1000
    };

    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq, 'http://metamask.com/', {
      withPublish: true,
      withRHS: rhsURL
    });

    await credWallet.save(issuerCred);

    const res = await idWallet.addCredentialsToMerkleTree([issuerCred], issuerDID);

    // publish to rhs

    await idWallet.publishStateToRHS(issuerDID, rhsURL);

    // you must store stat info (e.g. state and it's roots)

    const ethSigner = new ethers.Wallet(
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      new ethers.providers.JsonRpcProvider()
    );

    const txId = await proofService.transitState(
      issuerDID,
      res.oldTreeState,
      true,
      dataStorage.states,
      ethSigner
    );

    const credsWithIden3MTPProof = await idWallet.generateIden3SparseMerkleTreeProof(
      issuerDID,
      res.credentials,
      txId
    );

    credWallet.saveAll(credsWithIden3MTPProof);

    const proofReq: ZKPRequest = {
      id: 1,
      circuitId: CircuitId.AtomicQueryMTPV2,
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

    authHandler = new AuthHandler(packer, proofService);
    const authReqBody: AuthorizationRequestMessageBody = {
      callbackUrl: 'http://localhost:8080/callback?id=1234442-123123-123123',
      reason: 'reason',
      message: 'mesage',
      did_doc: {},
      scope: [proofReq as ZeroKnowledgeProofRequest]
    };

    const authReq: AuthorizationRequestMessage = {
      id: '1234442-123123-123123',
      typ: MediaTypes.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_V2_REQUEST_MESSAGE_TYPE,
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

  it.skip('mtpv2-merklized', async () => {
    const rhsURL = 'http://ec2-34-247-165-109.eu-west-1.compute.amazonaws.com:9999'; //TODO:add

    const seedPhraseIssuer: Uint8Array = new TextEncoder().encode(
      'seedseedseedseedseedseedseedsnew'
    );
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseeduser');

    const { did: userDID, credential } = await idWallet.createIdentity(
      'http://metamask.com/',
      rhsURL,
      seedPhrase
    );

    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity(
      'http://metamask.com/',
      rhsURL,
      seedPhraseIssuer
    );
    await credWallet.save(issuerAuthCredential);

    const claimReq: ClaimRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.toString(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 1693526400,
      revNonce: 1000
    };

    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq, 'http://metamask.com/', {
      withPublish: false,
      withRHS: rhsURL
    });

    await credWallet.save(issuerCred);

    const res = await idWallet.addCredentialsToMerkleTree([issuerCred], issuerDID);

    // publish to rhs

    await idWallet.publishStateToRHS(issuerDID, rhsURL);

    // you must store stat info (e.g. state and it's roots)

    const ethSigner = new ethers.Wallet('', ethStorage.provider);

    const txId = await proofService.transitState(
      issuerDID,
      res.oldTreeState,
      true,
      dataStorage.states,
      ethSigner
    );

    const credsWithIden3MTPProof = await idWallet.generateIden3SparseMerkleTreeProof(
      issuerDID,
      res.credentials,
      txId
    );

    credWallet.saveAll(credsWithIden3MTPProof);

    const proofReq: ZKPRequest = {
      id: 1,
      circuitId: CircuitId.AtomicQueryMTPV2,
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
