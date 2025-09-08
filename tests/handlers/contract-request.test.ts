/* eslint-disable no-console */
import { Identity, Profile } from '../../src/storage/entities/identity';
import { IdentityStorage } from '../../src/storage/shared/identity-storage';
import { PlainPacker } from '../../src/iden3comm/packers/plain';
import {
  CredentialStorage,
  FSCircuitStorage,
  IdentityWallet,
  byteEncoder,
  EthStateStorage,
  OnChainZKPVerifier,
  defaultEthConnectionConfig,
  hexToBytes,
  FunctionSignatures,
  KMS,
  buildVerifierId
} from '../../src';
import { IDataStorage, IStateStorage, IOnChainZKPVerifier } from '../../src/storage/interfaces';
import { InMemoryDataSource, InMemoryMerkleTreeStorage } from '../../src/storage/memory';
import { CredentialRequest, CredentialWallet } from '../../src/credentials';
import {
  calculateQueryHashV3,
  IProofService,
  parseQueryMetadata,
  ProofService
} from '../../src/proof';
import { CircuitId, Operators } from '../../src/circuits';
import {
  CredentialStatusType,
  ProofType,
  VerifiableConstants,
  W3CCredential
} from '../../src/verifiable';
import { RootInfo, StateProof } from '../../src/storage/entities/state';
import path from 'path';
import { CircuitData } from '../../src/storage/entities/circuitData';
import {
  AuthDataPrepareFunc,
  AuthProof,
  ContractInvokeHandlerOptions,
  ContractInvokeRequest,
  ContractInvokeRequestBody,
  ContractInvokeResponse,
  ContractInvokeTransactionData,
  ContractMessageHandlerOptions,
  ContractRequestHandler,
  DataPrepareHandlerFunc,
  IContractRequestHandler,
  IPackageManager,
  JWSPacker,
  PackageManager,
  ProvingParams,
  StateVerificationFunc,
  VerificationHandlerFunc,
  VerificationParams,
  ZeroKnowledgeInvokeResponse,
  ZeroKnowledgeProofRequest,
  ZeroKnowledgeProofResponse,
  ZKPPacker
} from '../../src/iden3comm';
import { proving } from '@iden3/js-jwz';
import * as uuid from 'uuid';
import { MediaType, PROTOCOL_MESSAGE_TYPE } from '../../src/iden3comm/constants';
import { Blockchain, BytesHelper, DID, DidMethod, NetworkId } from '@iden3/js-iden3-core';
import { describe, expect, it, beforeEach } from 'vitest';
import { CredentialStatusResolverRegistry } from '../../src/credentials';
import { RHSResolver } from '../../src/credentials';
import { Contract, ethers, JsonRpcProvider, Signer } from 'ethers';
import {
  createIdentity,
  getInMemoryDataStorage,
  registerKeyProvidersInMemoryKMS,
  RPC_URL,
  SEED_USER
} from '../helpers';
import { AbstractMessageHandler } from '../../src/iden3comm/handlers/message-handler';
import { schemaLoaderForTests } from '../mocks/schema';
import { DIDResolutionResult } from 'did-resolver';
import { getDocumentLoader } from '@iden3/js-jsonld-merklization';
import zkpVerifierABI from '../../src/storage/blockchain/abi/ZkpVerifier.json';

describe('contract-request', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;
  let proofService: IProofService;
  let contractRequestHandler: IContractRequestHandler;
  let packageMgr: IPackageManager;
  const rhsUrl = process.env.RHS_URL as string;
  const rpcUrl = process.env.RPC_URL as string;
  const ipfsNodeURL = process.env.IPFS_URL as string;
  const walletKey = process.env.WALLET_KEY as string;

  const seedPhraseIssuer: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedseed');
  const seedPhrase: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseeduser');

  let merklizeOpts;
  const mockStateStorage: IStateStorage = {
    getLatestStateById: async () => {
      throw new Error(VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST);
    },
    getStateInfoByIdAndState: async () => {
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
    },
    getRpcProvider() {
      return new JsonRpcProvider(RPC_URL);
    }
  };

  const mockZKPVerifier: IOnChainZKPVerifier = {
    submitZKPResponse: async (
      signer: Signer,
      txData: ContractInvokeTransactionData,
      zkProofResponses: ZeroKnowledgeProofResponse[]
    ) => {
      const response = new Map<string, ZeroKnowledgeProofResponse>();
      response.set('txhash1', zkProofResponses[0]);
      return response;
    },

    submitZKPResponseV2: async (
      signer: Signer,
      txData: ContractInvokeTransactionData,
      zkProofResponses: ZeroKnowledgeProofResponse[]
    ) => {
      const response = new Map<string, ZeroKnowledgeProofResponse[]>();
      response.set('txhash1', zkProofResponses);
      return response;
    },

    submitResponse: async (
      ethSigner: Signer,
      txData: ContractInvokeTransactionData,
      responses: ZeroKnowledgeProofResponse[],
      authProof: AuthProof
    ) => {
      const response = new Map<string, ZeroKnowledgeInvokeResponse>();
      response.set('txhash1', {
        responses,
        crossChainProof: {
          globalStateProofs: [],
          identityStateProofs: []
        },
        authProof: authProof
      });
      return response;
    },

    prepareTxArgsSubmitV1: async () => {
      return [];
    },

    prepareTxArgsSubmitV2: async () => {
      return [];
    },

    prepareTxArgsSubmit: async () => {
      return {} as any; //eslint-disable-line @typescript-eslint/no-explicit-any
    }
  };

  const getPackageMgr = async (
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
    const jwsPacker = new JWSPacker(new KMS(), {
      resolve: () => Promise.resolve({ didDocument: {} } as DIDResolutionResult)
    });
    mgr.registerPackers([packer, plainPacker, jwsPacker]);

    return mgr;
  };

  beforeEach(async () => {
    const kms = registerKeyProvidersInMemoryKMS();
    dataStorage = {
      credential: new CredentialStorage(new InMemoryDataSource<W3CCredential>()),
      identity: new IdentityStorage(
        new InMemoryDataSource<Identity>(),
        new InMemoryDataSource<Profile>()
      ),
      mt: new InMemoryMerkleTreeStorage(40),
      states: mockStateStorage
    };
    merklizeOpts = {
      documentLoader: schemaLoaderForTests({
        ipfsNodeURL: ipfsNodeURL
      })
    };
    const circuitStorage = new FSCircuitStorage({
      dirname: path.join(__dirname, '../proofs/testdata')
    });

    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );
    credWallet = new CredentialWallet(dataStorage, resolvers);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    proofService = new ProofService(
      idWallet,
      credWallet,
      circuitStorage,
      mockStateStorage,
      merklizeOpts
    );
    packageMgr = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthInputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    );
    contractRequestHandler = new ContractRequestHandler(packageMgr, proofService, mockZKPVerifier);
  });

  it('contract request flow', async () => {
    const { did: userDID, credential: cred } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Amoy,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });

    expect(cred).not.to.be.undefined;

    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Amoy,
      seed: seedPhraseIssuer,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });
    expect(issuerAuthCredential).not.to.be.undefined;

    const claimReq: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/kyc-nonmerklized.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.string(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq, merklizeOpts);

    await credWallet.save(issuerCred);

    const proofReq: ZeroKnowledgeProofRequest = {
      id: 1,
      circuitId: CircuitId.AtomicQueryV3OnChain,
      optional: false,
      query: {
        allowedIssuers: ['*'],
        type: claimReq.type,
        context:
          'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-nonmerklized.jsonld',
        credentialSubject: {
          documentType: {
            $eq: 99
          }
        }
      }
    };

    const transactionData: ContractInvokeTransactionData = {
      contract_address: '0x134b1be34911e39a8397ec6289782989729807a4',
      method_id: 'b68967e2',
      chain_id: 80001
    };

    const ciRequestBody: ContractInvokeRequestBody = {
      reason: 'reason',
      transaction_data: transactionData,
      scope: [proofReq as ZeroKnowledgeProofRequest]
    };

    const id = uuid.v4();
    const ciRequest: ContractInvokeRequest = {
      id,
      typ: MediaType.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: ciRequestBody
    };

    const ethSigner = new ethers.Wallet(walletKey);

    const options: ContractInvokeHandlerOptions = {
      ethSigner,
      challenge: BigInt(112312)
    };
    const msgBytes = byteEncoder.encode(JSON.stringify(ciRequest));
    const ciResponse = await contractRequestHandler.handleContractInvokeRequest(
      userDID,
      msgBytes,
      options
    );

    expect((ciResponse as Map<string, ZeroKnowledgeProofResponse>).has('txhash1')).to.be.true;
  });

  it('contract universal verifier v2 request flow', async () => {
    const { did: userDID, credential: cred } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Amoy,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });

    expect(cred).not.to.be.undefined;

    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Amoy,
      seed: seedPhraseIssuer,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });
    expect(issuerAuthCredential).not.to.be.undefined;

    const claimReq: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/kyc-nonmerklized.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.string(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    await credWallet.save(issuerCred);

    const proofReq: ZeroKnowledgeProofRequest = {
      id: 1,
      circuitId: CircuitId.AtomicQueryV3OnChain,
      optional: false,
      query: {
        allowedIssuers: ['*'],
        type: claimReq.type,
        context:
          'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-nonmerklized.jsonld',
        credentialSubject: {
          documentType: {
            $eq: 99
          }
        }
      }
    };

    const transactionData: ContractInvokeTransactionData = {
      contract_address: '0x134b1be34911e39a8397ec6289782989729807a4',
      method_id: '06c86a91',
      chain_id: 80001
    };

    const ciRequestBody: ContractInvokeRequestBody = {
      reason: 'reason',
      transaction_data: transactionData,
      scope: [proofReq as ZeroKnowledgeProofRequest]
    };

    const id = uuid.v4();
    const ciRequest: ContractInvokeRequest = {
      id,
      typ: MediaType.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: ciRequestBody,
      from: 'did:iden3:polygon:amoy:x6x5sor7zpySUbxeFoAZUYbUh68LQ4ipcvJLRYM6c',
      to: userDID.string()
    };

    const ethSigner = new ethers.Wallet(walletKey);

    const challenge = BytesHelper.bytesToInt(hexToBytes(ethSigner.address));
    const options: ContractMessageHandlerOptions = {
      ethSigner,
      challenge,
      senderDid: userDID
    };
    const ciResponse = await (contractRequestHandler as unknown as AbstractMessageHandler).handle(
      ciRequest,
      options
    );

    expect(ciResponse).not.be.undefined;
  });

  it('contract universal verifier v2 request flow with empty scope', async () => {
    const { did: userDID, credential: cred } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Amoy,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });

    expect(cred).not.to.be.undefined;

    const transactionData: ContractInvokeTransactionData = {
      contract_address: '0x134b1be34911e39a8397ec6289782989729807a4',
      method_id: '06c86a91',
      chain_id: 80001
    };

    const ciRequestBody: ContractInvokeRequestBody = {
      reason: 'reason',
      transaction_data: transactionData,
      scope: []
    };

    const id = uuid.v4();
    const ciRequest: ContractInvokeRequest = {
      id,
      typ: MediaType.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: ciRequestBody,
      from: 'did:iden3:polygon:amoy:x6x5sor7zpySUbxeFoAZUYbUh68LQ4ipcvJLRYM6c',
      to: userDID.string()
    };

    const ethSigner = new ethers.Wallet(walletKey);

    const challenge = BytesHelper.bytesToInt(hexToBytes(ethSigner.address));
    const options: ContractMessageHandlerOptions = {
      ethSigner,
      challenge,
      senderDid: userDID
    };
    const ciResponse = await (contractRequestHandler as unknown as AbstractMessageHandler).handle(
      ciRequest,
      options
    );

    expect(ciResponse).not.be.undefined;
  });

  it('contract universal verifier v2 request flow with ethereum identity', async () => {
    const { did: userDID, credential: cred } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Amoy,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });

    expect(cred).not.to.be.undefined;

    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Amoy,
      seed: seedPhraseIssuer,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });
    expect(issuerAuthCredential).not.to.be.undefined;

    const claimReq: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/kyc-nonmerklized.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.string(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    await credWallet.save(issuerCred);

    const proofReq: ZeroKnowledgeProofRequest = {
      id: 1,
      circuitId: CircuitId.AtomicQueryV3OnChain,
      optional: false,
      query: {
        allowedIssuers: ['*'],
        type: claimReq.type,
        context:
          'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-nonmerklized.jsonld',
        credentialSubject: {
          documentType: {
            $eq: 99
          }
        }
      }
    };

    const transactionData: ContractInvokeTransactionData = {
      contract_address: '0x134b1be34911e39a8397ec6289782989729807a4',
      method_id: '06c86a91',
      chain_id: 80001
    };

    const ciRequestBody: ContractInvokeRequestBody = {
      reason: 'reason',
      transaction_data: transactionData,
      scope: [proofReq as ZeroKnowledgeProofRequest],
      accept: ['iden3comm/v1;env=application/iden3comm-signed-json;alg=ES256K-R']
    };

    const id = uuid.v4();
    const ciRequest: ContractInvokeRequest = {
      id,
      typ: MediaType.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: ciRequestBody,
      from: 'did:iden3:polygon:amoy:x6x5sor7zpySUbxeFoAZUYbUh68LQ4ipcvJLRYM6c',
      to: userDID.string()
    };

    const ethSigner = new ethers.Wallet(walletKey);

    const challenge = BytesHelper.bytesToInt(hexToBytes(ethSigner.address));
    const options: ContractMessageHandlerOptions = {
      ethSigner,
      challenge,
      senderDid: userDID
    };
    const ciResponse = await (contractRequestHandler as unknown as AbstractMessageHandler).handle(
      ciRequest,
      options
    );

    expect(ciResponse).not.be.undefined;
    expect((ciResponse as unknown as ContractInvokeResponse).body.transaction_data.txHash).not.be
      .undefined;
  });

  it('$noop operator not supported for OnChain V2', async () => {
    const { did: userDID, credential: cred } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Amoy,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });

    expect(cred).not.to.be.undefined;

    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Amoy,
      seed: seedPhraseIssuer,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });
    expect(issuerAuthCredential).not.to.be.undefined;

    const claimReq: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.string(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq, merklizeOpts);

    await credWallet.save(issuerCred);

    const proofReq: ZeroKnowledgeProofRequest = {
      id: 1,
      circuitId: CircuitId.AtomicQueryMTPV2OnChain,
      optional: false,
      query: {
        allowedIssuers: ['*'],
        type: claimReq.type,
        context:
          'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld'
      }
    };

    const transactionData: ContractInvokeTransactionData = {
      contract_address: '0x134b1be34911e39a8397ec6289782989729807a4',
      method_id: 'b68967e2',
      chain_id: 80001
    };

    const ciRequestBody: ContractInvokeRequestBody = {
      reason: 'reason',
      transaction_data: transactionData,
      scope: [proofReq as ZeroKnowledgeProofRequest]
    };

    const id = uuid.v4();
    const ciRequest: ContractInvokeRequest = {
      id,
      typ: MediaType.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: ciRequestBody
    };

    const ethSigner = new ethers.Wallet(walletKey);

    const options: ContractInvokeHandlerOptions = {
      ethSigner,
      challenge: BigInt(112312)
    };
    const msgBytes = byteEncoder.encode(JSON.stringify(ciRequest));

    try {
      await contractRequestHandler.handleContractInvokeRequest(userDID, msgBytes, options);
      expect.fail();
    } catch (err: unknown) {
      expect((err as Error).message).to.be.eq(
        `operator $noop is not supported by credentialAtomicQueryMTPV2OnChain`
      );
    }
  });

  // SKIPPED : integration test
  it.skip('contract request flow - integration test', async () => {
    const stateEthConfig = defaultEthConnectionConfig;
    stateEthConfig.url = rpcUrl;
    stateEthConfig.contractAddress = '0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124';
    stateEthConfig.chainId = 80002;

    const kms = registerKeyProvidersInMemoryKMS();
    dataStorage = {
      credential: new CredentialStorage(new InMemoryDataSource<W3CCredential>()),
      identity: new IdentityStorage(
        new InMemoryDataSource<Identity>(),
        new InMemoryDataSource<Profile>()
      ),
      mt: new InMemoryMerkleTreeStorage(40),
      states: new EthStateStorage(stateEthConfig)
    };
    const circuitStorage = new FSCircuitStorage({
      dirname: path.join(__dirname, '../proofs/testdata')
    });

    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );
    credWallet = new CredentialWallet(dataStorage, resolvers);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    proofService = new ProofService(idWallet, credWallet, circuitStorage, dataStorage.states, {
      ipfsNodeURL
    });
    packageMgr = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthInputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    );

    const { did: userDID, credential: cred } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Amoy,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });

    expect(cred).not.to.be.undefined;

    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Amoy,
      seed: seedPhraseIssuer,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });
    expect(issuerAuthCredential).not.to.be.undefined;

    const claimReq: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.string(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    await credWallet.save(issuerCred);

    const proofReq: ZeroKnowledgeProofRequest = {
      id: 200,
      circuitId: CircuitId.AtomicQuerySigV2OnChain,
      optional: false,
      query: {
        allowedIssuers: ['*'],
        type: claimReq.type,
        context:
          'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld',
        credentialSubject: {
          birthday: {
            $lt: 20020101
          }
        }
      }
    };

    const contractAddress = '0x2b23e5cF70D133fFaA7D8ba61E1bAC4637253880';
    const conf = defaultEthConnectionConfig;
    conf.contractAddress = contractAddress;
    conf.url = rpcUrl;
    conf.chainId = 80002;

    const zkpVerifier = new OnChainZKPVerifier([conf]);
    contractRequestHandler = new ContractRequestHandler(packageMgr, proofService, zkpVerifier);

    const transactionData: ContractInvokeTransactionData = {
      contract_address: contractAddress,
      method_id: 'b68967e2',
      chain_id: conf.chainId
    };

    const ciRequestBody: ContractInvokeRequestBody = {
      reason: 'reason',
      transaction_data: transactionData,
      scope: [proofReq as ZeroKnowledgeProofRequest]
    };

    const id = uuid.v4();
    const ciRequest: ContractInvokeRequest = {
      id,
      typ: MediaType.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: ciRequestBody
    };

    const ethSigner = new ethers.Wallet(walletKey);

    const challenge = BytesHelper.bytesToInt(hexToBytes(ethSigner.address));

    const options: ContractInvokeHandlerOptions = {
      ethSigner,
      challenge
    };
    const msgBytes = byteEncoder.encode(JSON.stringify(ciRequest));
    const ciResponse = await contractRequestHandler.handleContractInvokeRequest(
      userDID,
      msgBytes,
      options
    );

    expect(ciResponse).not.be.undefined;
    expect(
      (
        (ciResponse as Map<string, ZeroKnowledgeProofResponse>).values().next()
          .value as ZeroKnowledgeProofResponse
      ).id
    ).to.be.equal(proofReq.id);
  });
  // V3 integration test
  it.skip('contract request flow V3 - integration test', async () => {
    const stateEthConfig = defaultEthConnectionConfig;
    stateEthConfig.url = rpcUrl;
    stateEthConfig.contractAddress = '0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124';

    const kms = registerKeyProvidersInMemoryKMS();
    dataStorage = {
      credential: new CredentialStorage(new InMemoryDataSource<W3CCredential>()),
      identity: new IdentityStorage(
        new InMemoryDataSource<Identity>(),
        new InMemoryDataSource<Profile>()
      ),
      mt: new InMemoryMerkleTreeStorage(40),
      states: new EthStateStorage(stateEthConfig)
    };
    const circuitStorage = new FSCircuitStorage({
      dirname: path.join(__dirname, '../proofs/testdata')
    });

    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );
    credWallet = new CredentialWallet(dataStorage, resolvers);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    proofService = new ProofService(idWallet, credWallet, circuitStorage, dataStorage.states, {
      ipfsNodeURL
    });
    packageMgr = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthInputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    );

    const { did: userDID, credential: cred } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Amoy,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });

    expect(cred).not.to.be.undefined;

    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Amoy,
      seed: seedPhraseIssuer,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });
    expect(issuerAuthCredential).not.to.be.undefined;

    const claimReq: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.string(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    await credWallet.save(issuerCred);

    const proofReqs: ZeroKnowledgeProofRequest[] = [
      {
        id: 2000000,
        circuitId: CircuitId.AtomicQueryV3OnChain,
        optional: false,
        query: {
          groupId: 1,
          allowedIssuers: ['*'],
          type: claimReq.type,
          context:
            'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld',
          credentialSubject: {
            birthday: {
              $lt: 20020101
            }
          }
        }
      },
      {
        id: 1000000,
        circuitId: CircuitId.AtomicQueryV3OnChain,
        optional: false,
        query: {
          groupId: 1,
          allowedIssuers: ['*'],
          type: claimReq.type,
          proofType: ProofType.BJJSignature,
          context:
            'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld',
          credentialSubject: {
            birthday: {
              $eq: 19960424
            }
          }
        }
      }
    ];

    const erc20Verifier = '0xc5Cd536cb9Cc3BD24829502A39BE593354986dc4';
    const verifierDid = 'did:polygonid:polygon:amoy:2qQ68JkRcf3ymy9wtzKyY3Dajst9c6cHCDZyx7NrTz';
    const conf = defaultEthConnectionConfig;
    conf.contractAddress = erc20Verifier;
    conf.url = rpcUrl;
    conf.chainId = 80002;

    const zkpVerifier = new OnChainZKPVerifier([conf]);
    contractRequestHandler = new ContractRequestHandler(packageMgr, proofService, zkpVerifier);

    const transactionData: ContractInvokeTransactionData = {
      contract_address: erc20Verifier,
      method_id: 'b68967e2',
      chain_id: conf.chainId
    };

    const ciRequestBody: ContractInvokeRequestBody = {
      reason: 'reason',
      transaction_data: transactionData,
      scope: [...proofReqs]
    };

    const id = uuid.v4();
    const ciRequest: ContractInvokeRequest = {
      id,
      typ: MediaType.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE,
      thid: id,
      from: verifierDid,
      body: ciRequestBody
    };

    const ethSigner = new ethers.Wallet(walletKey);

    const challenge = BytesHelper.bytesToInt(hexToBytes(ethSigner.address));

    const options: ContractInvokeHandlerOptions = {
      ethSigner,
      challenge
    };
    const msgBytes = byteEncoder.encode(JSON.stringify(ciRequest));
    const ciResponse = await contractRequestHandler.handleContractInvokeRequest(
      userDID,
      msgBytes,
      options
    );

    expect(ciResponse).not.be.undefined;
    expect(
      (
        (ciResponse as Map<string, ZeroKnowledgeProofResponse>).values().next()
          .value as ZeroKnowledgeProofResponse
      ).id
    ).to.be.equal(proofReqs[0].id);
  });

  // cross chain integration test
  it.skip('cross chain contract request flow - integration test', async () => {
    const CONTRACTS = {
      AMOY_STATE_CONTRACT: '0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124',
      AMOY_UNIVERSAL_VERIFIER: '0x1Df0B05F15b5ea9648B8a081aca8ad0dE065bD1F',
      PRIVADO_STATE_CONTRACT: '0x975556428F077dB5877Ea2474D783D6C69233742',
      AUTH_V2_AMOY_VALIDATOR: '0x1a593E1aD3843b4363Dfa42585c4bBCA885553c0'
    };

    const networkConfigs = {
      amoy: (contractAddress) => ({
        ...defaultEthConnectionConfig,
        url: '<>',
        contractAddress,
        chainId: 80002
      }),
      privadoMain: (contractAddress) => ({
        ...defaultEthConnectionConfig,
        url: '<>',
        contractAddress,
        chainId: 21000
      }),
      privadoTest: (contractAddress) => ({
        ...defaultEthConnectionConfig,
        url: 'https://rpc-testnet.privado.id',
        contractAddress,
        chainId: 21001
      }),
      lineaSepolia: (contractAddress) => ({
        ...defaultEthConnectionConfig,
        url: '<>',
        contractAddress,
        chainId: 80001
      })
    };

    const issuerAmoyStateEthConfig = networkConfigs.amoy(CONTRACTS.AMOY_STATE_CONTRACT);

    const issuerPrivadoTestStateEthConfig = networkConfigs.privadoTest(
      CONTRACTS.PRIVADO_STATE_CONTRACT
    );

    // const userStateEthConfig = networkConfigs.amoy(CONTRACTS.AMOY_STATE_CONTRACT);
    const userStateEthConfig = networkConfigs.privadoMain(CONTRACTS.PRIVADO_STATE_CONTRACT);

    const kms = registerKeyProvidersInMemoryKMS();
    dataStorage = getInMemoryDataStorage(
      new EthStateStorage([
        issuerAmoyStateEthConfig,
        userStateEthConfig,
        issuerPrivadoTestStateEthConfig
      ])
    );

    const circuitStorage = new FSCircuitStorage({
      dirname: path.join(__dirname, '../proofs/testdata')
    });

    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );
    credWallet = new CredentialWallet(dataStorage, resolvers);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    proofService = new ProofService(idWallet, credWallet, circuitStorage, dataStorage.states, {
      ipfsNodeURL
    });
    packageMgr = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthInputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    );

    const { did: userDID } = await createIdentity(idWallet, {
      seed: SEED_USER,
      blockchain: Blockchain.Privado,
      networkId: NetworkId.Main
    });

    const { did: issuerDID, credential: issuerAuthCredential } = await createIdentity(idWallet);
    expect(issuerAuthCredential).not.to.be.undefined;

    const claimReq: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.string(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    await credWallet.save(issuerCred);

    // ADD proofReq to scope
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const proofReqs: ZeroKnowledgeProofRequest[] = [
      {
        id: 138,
        circuitId: CircuitId.AtomicQuerySigV2OnChain,
        optional: false,
        query: {
          skipClaimRevocationCheck: true,
          allowedIssuers: ['*'],
          type: claimReq.type,
          context:
            'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld',
          credentialSubject: {
            birthday: {
              $ne: 20500101
            }
          }
        }
      }
    ];

    const zkpVerifierNetworkConfig = networkConfigs.amoy(CONTRACTS.AMOY_UNIVERSAL_VERIFIER);

    const zkpVerifier = new OnChainZKPVerifier([zkpVerifierNetworkConfig], {
      didResolverUrl: 'https://resolver.privado.id'
    });
    contractRequestHandler = new ContractRequestHandler(packageMgr, proofService, zkpVerifier);

    const transactionData: ContractInvokeTransactionData = {
      contract_address: zkpVerifierNetworkConfig.contractAddress,
      method_id: FunctionSignatures.SubmitZKPResponseV2,
      chain_id: zkpVerifierNetworkConfig.chainId
    };

    const ciRequestBody: ContractInvokeRequestBody = {
      reason: 'reason',
      transaction_data: transactionData,
      scope: proofReqs
    };

    const id = uuid.v4();
    const ciRequest: ContractInvokeRequest = {
      id,
      typ: MediaType.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: ciRequestBody,
      from: 'did:iden3:polygon:amoy:x6x5sor7zpySUbxeFoAZUYbUh68LQ4ipcvJLRYM6c'
    };

    const ethSigner = new ethers.Wallet(walletKey);

    const challenge = BytesHelper.bytesToInt(hexToBytes(ethSigner.address));

    const options: ContractMessageHandlerOptions = {
      ethSigner,
      challenge,
      senderDid: userDID
    };
    const ciResponse = await (contractRequestHandler as unknown as AbstractMessageHandler).handle(
      ciRequest,
      options
    );

    expect(ciResponse).not.be.undefined;
    console.log(ciResponse);
    expect((ciResponse as unknown as ContractInvokeResponse).body.transaction_data.txHash).not.be
      .undefined;
  });

  it.skip('contract request flow V3 sig `email-verified` Transak req - integration test', async () => {
    const privadoTestRpcUrl = '<>'; // issuer RPC URL - privado test
    const privadoMainRpcUrl = '<>';
    const privadoTestStateContract = '0x975556428F077dB5877Ea2474D783D6C69233742';
    const amoyVerifierRpcUrl = '<>'; // verifier RPC URL - amoy
    const verifierAddress = '0xE31725a735dd00eB0cc8aaf6b6eAB898f1BA9A69';
    const amoyStateAddress = '0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124';

    const issuerStateEthConfig = {
      ...defaultEthConnectionConfig,
      url: privadoTestRpcUrl,
      contractAddress: privadoTestStateContract,
      chainId: 21001
    };

    const userStateEthConfig = {
      ...defaultEthConnectionConfig,
      url: privadoMainRpcUrl,
      contractAddress: privadoTestStateContract,
      chainId: 21000
    };

    const amoyStateEthConfig = {
      ...defaultEthConnectionConfig,
      url: amoyVerifierRpcUrl,
      contractAddress: amoyStateAddress,
      chainId: 80002
    };

    const kms = registerKeyProvidersInMemoryKMS();
    dataStorage = {
      credential: new CredentialStorage(new InMemoryDataSource<W3CCredential>()),
      identity: new IdentityStorage(
        new InMemoryDataSource<Identity>(),
        new InMemoryDataSource<Profile>()
      ),
      mt: new InMemoryMerkleTreeStorage(40),
      states: new EthStateStorage([issuerStateEthConfig, userStateEthConfig, amoyStateEthConfig])
    };
    const circuitStorage = new FSCircuitStorage({
      dirname: path.join(__dirname, '../proofs/testdata')
    });

    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );
    credWallet = new CredentialWallet(dataStorage, resolvers);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    proofService = new ProofService(idWallet, credWallet, circuitStorage, dataStorage.states, {
      ipfsGatewayURL: 'https://ipfs.io'
    });
    packageMgr = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthInputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    );

    const { did: userDID, credential: cred } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Privado,
      networkId: NetworkId.Main,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });

    expect(cred).not.to.be.undefined;

    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Privado,
      networkId: NetworkId.Test,
      seed: seedPhraseIssuer,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });
    expect(issuerAuthCredential).not.to.be.undefined;

    const profileDID = await idWallet.createProfile(userDID, 777, issuerDID.string());

    const claimReq: CredentialRequest = {
      credentialSchema: 'ipfs://QmYgooZFeXYi1QQm6iUpiEteMJ822pUSuxonXUpqNgFVnQ',
      type: 'IndividualKYC',
      credentialSubject: {
        id: profileDID.string(),
        'full-name': 'full-name',
        country: 'USA',
        state: 'Florida',
        city: 'homeland',
        street: 'groove',
        'zip-code': '123',
        phone: '333',
        email: 'me-eme-e@gmail.com',
        'email-verified': true
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq, {
      ipfsGatewayURL: 'https://ipfs.io'
    });

    await credWallet.save(issuerCred);

    const proofReqs: ZeroKnowledgeProofRequest[] = [
      {
        id: 1,
        circuitId: CircuitId.AtomicQueryV3OnChain,
        optional: false,
        query: {
          allowedIssuers: ['*'],
          type: claimReq.type,
          proofType: ProofType.BJJSignature,
          context: 'ipfs://Qmdhuf9fhqzweDa1TgoajDEj7Te7p28eeeZVfiioAjUC15',
          credentialSubject: {
            'email-verified': {
              $eq: true
            }
          }
        },
        params: {
          nullifierSessionId: '8372131'
        }
      }
    ];

    const zkpVerifier = new OnChainZKPVerifier([amoyStateEthConfig], {
      didResolverUrl: 'https://resolver.privado.id'
    });

    contractRequestHandler = new ContractRequestHandler(packageMgr, proofService, zkpVerifier);

    const transactionData: ContractInvokeTransactionData = {
      contract_address: verifierAddress,
      method_id: 'fd41d8d4',
      chain_id: amoyStateEthConfig.chainId
    };

    const verifierDid = 'did:iden3:polygon:amoy:x6x5sor7zpy1YGS4yjcmnzQSC7FZC7q7DPgNMT79q';

    const ciRequestBody: ContractInvokeRequestBody = {
      reason: 'reason',
      transaction_data: transactionData,
      scope: proofReqs
    };

    const id = uuid.v4();
    const ciRequest: ContractInvokeRequest = {
      id,
      typ: MediaType.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: ciRequestBody,
      from: verifierDid
    };

    console.log(JSON.stringify(ciRequest));
    const ethSigner = new ethers.Wallet(walletKey);

    const challenge = BytesHelper.bytesToInt(hexToBytes(ethSigner.address));

    const options: ContractInvokeHandlerOptions = {
      ethSigner,
      challenge
    };
    const msgBytes = byteEncoder.encode(JSON.stringify(ciRequest));
    const ciResponse = await contractRequestHandler.handleContractInvokeRequest(
      userDID,
      msgBytes,
      options
    );

    expect(ciResponse).not.be.undefined;
    expect(
      (
        (ciResponse as Map<string, ZeroKnowledgeProofResponse>).values().next()
          .value as ZeroKnowledgeProofResponse
      ).id
    ).to.be.equal(proofReqs[0].id);
  });

  // universal verifier v2 integration test
  it.skip('universal verifier v2 request flow - integration test', async () => {
    const CONTRACTS = {
      AMOY_STATE_CONTRACT: '0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124',
      AMOY_UNIVERSAL_VERIFIER: '0xDc74b7a576625cc777DEcdae623567Efaa834e6C',
      PRIVADO_TEST_STATE_CONTRACT: '0xE5BfD683F1Ca574B5be881b7DbbcFDCE9DDBAb90',
      PRIVADO_MAIN_STATE_CONTRACT: '0x0DDd8701C91d8d1Ba35c9DbA98A45fe5bA8A877E'
    };

    const networkConfigs = {
      amoy: (contractAddress) => ({
        ...defaultEthConnectionConfig,
        url: '<>',
        contractAddress,
        chainId: 80002
      }),
      privadoMain: (contractAddress) => ({
        ...defaultEthConnectionConfig,
        url: 'https://rpc-mainnet.privado.id',
        contractAddress,
        chainId: 21000
      }),
      privadoTest: (contractAddress) => ({
        ...defaultEthConnectionConfig,
        url: 'https://rpc-testnet.privado.id',
        contractAddress,
        chainId: 21001
      })
    };

    const issuerAmoyStateEthConfig = networkConfigs.amoy(CONTRACTS.AMOY_STATE_CONTRACT);

    const issuerPrivadoTestStateEthConfig = networkConfigs.privadoTest(
      CONTRACTS.PRIVADO_TEST_STATE_CONTRACT
    );

    const userStateEthConfig = networkConfigs.privadoMain(CONTRACTS.PRIVADO_MAIN_STATE_CONTRACT);

    const kms = registerKeyProvidersInMemoryKMS();
    dataStorage = getInMemoryDataStorage(
      new EthStateStorage([
        issuerAmoyStateEthConfig,
        userStateEthConfig,
        issuerPrivadoTestStateEthConfig
      ])
    );

    const circuitStorage = new FSCircuitStorage({
      dirname: path.join(__dirname, '../proofs/testdata')
    });

    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );
    credWallet = new CredentialWallet(dataStorage, resolvers);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    proofService = new ProofService(idWallet, credWallet, circuitStorage, dataStorage.states, {
      ipfsNodeURL
    });
    packageMgr = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthInputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    );

    const { did: userDID } = await createIdentity(idWallet, {
      seed: SEED_USER,
      blockchain: Blockchain.Privado,
      networkId: NetworkId.Main
    });

    const { did: issuerDID, credential: issuerAuthCredential } = await createIdentity(idWallet, {
      blockchain: Blockchain.Privado,
      networkId: NetworkId.Test
    });
    expect(issuerAuthCredential).not.to.be.undefined;

    // Verifier Id in the privado main network
    const verifierId = buildVerifierId(CONTRACTS.AMOY_UNIVERSAL_VERIFIER, {
      blockchain: Blockchain.Privado,
      networkId: NetworkId.Main,
      method: DidMethod.Iden3
    });
    const verifierDID = DID.parseFromId(verifierId);

    const profileDID = await idWallet.createProfile(userDID, 50, verifierDID.string());

    const claimReq: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: profileDID.string(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    await credWallet.save(issuerCred);

    const requestId = 1766847064778388173357292599684296758876525335676835296354363273782128356n;

    // ADD proofReq to scope
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const proofReqs: ZeroKnowledgeProofRequest[] = [
      {
        id: requestId.toString(),
        circuitId: CircuitId.AtomicQueryV3OnChain,
        params: {
          nullifierSessionId: 11837215
        },
        query: {
          groupId: 0,
          allowedIssuers: ['*'],
          proofType: ProofType.BJJSignature,
          type: claimReq.type,
          context:
            'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld',
          credentialSubject: {
            birthday: {
              $ne: 20020101
            }
          }
        }
      }
    ];

    const zkpVerifierNetworkConfig = networkConfigs.amoy(CONTRACTS.AMOY_UNIVERSAL_VERIFIER);

    const zkpVerifier = new OnChainZKPVerifier([zkpVerifierNetworkConfig], {
      didResolverUrl: 'https://resolver.privado.id'
    });
    contractRequestHandler = new ContractRequestHandler(packageMgr, proofService, zkpVerifier);

    const transactionData: ContractInvokeTransactionData = {
      contract_address: zkpVerifierNetworkConfig.contractAddress,
      method_id: FunctionSignatures.SubmitResponse,
      chain_id: zkpVerifierNetworkConfig.chainId
    };

    const ciRequestBody: ContractInvokeRequestBody = {
      reason: 'reason',
      transaction_data: transactionData,
      scope: proofReqs
    };

    const id = uuid.v4();
    const ciRequest: ContractInvokeRequest = {
      id,
      typ: MediaType.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: ciRequestBody,
      from: verifierDID.string(),
      to: profileDID.string()
    };

    const ethSigner = new ethers.Wallet(walletKey);

    const challenge = BytesHelper.bytesToInt(hexToBytes(ethSigner.address));

    const options: ContractMessageHandlerOptions = {
      ethSigner,
      challenge,
      senderDid: profileDID
    };
    const ciResponse = await (contractRequestHandler as unknown as AbstractMessageHandler).handle(
      ciRequest,
      options
    );

    expect(ciResponse).not.be.undefined;
    console.log(ciResponse);
    expect((ciResponse as unknown as ContractInvokeResponse).body.transaction_data.txHash).not.be
      .undefined;
  });

  it.skip('universal verifier v2 request flow with empty scope - integration test', async () => {
    const CONTRACTS = {
      AMOY_STATE_CONTRACT: '0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124',
      AMOY_UNIVERSAL_VERIFIER: '0xDc74b7a576625cc777DEcdae623567Efaa834e6C',
      PRIVADO_TEST_STATE_CONTRACT: '0xE5BfD683F1Ca574B5be881b7DbbcFDCE9DDBAb90',
      PRIVADO_MAIN_STATE_CONTRACT: '0x0DDd8701C91d8d1Ba35c9DbA98A45fe5bA8A877E'
    };

    const networkConfigs = {
      amoy: (contractAddress) => ({
        ...defaultEthConnectionConfig,
        url: '<>',
        contractAddress,
        chainId: 80002
      }),
      privadoMain: (contractAddress) => ({
        ...defaultEthConnectionConfig,
        url: 'https://rpc-mainnet.privado.id',
        contractAddress,
        chainId: 21000
      }),
      privadoTest: (contractAddress) => ({
        ...defaultEthConnectionConfig,
        url: 'https://rpc-testnet.privado.id',
        contractAddress,
        chainId: 21001
      })
    };

    const issuerAmoyStateEthConfig = networkConfigs.amoy(CONTRACTS.AMOY_STATE_CONTRACT);

    const issuerPrivadoTestStateEthConfig = networkConfigs.privadoTest(
      CONTRACTS.PRIVADO_TEST_STATE_CONTRACT
    );

    const userStateEthConfig = networkConfigs.privadoMain(CONTRACTS.PRIVADO_MAIN_STATE_CONTRACT);

    const kms = registerKeyProvidersInMemoryKMS();
    dataStorage = getInMemoryDataStorage(
      new EthStateStorage([
        issuerAmoyStateEthConfig,
        userStateEthConfig,
        issuerPrivadoTestStateEthConfig
      ])
    );

    const circuitStorage = new FSCircuitStorage({
      dirname: path.join(__dirname, '../proofs/testdata')
    });

    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );
    credWallet = new CredentialWallet(dataStorage, resolvers);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    proofService = new ProofService(idWallet, credWallet, circuitStorage, dataStorage.states, {
      ipfsNodeURL
    });
    packageMgr = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthInputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    );

    const { did: userDID } = await createIdentity(idWallet, {
      seed: SEED_USER,
      blockchain: Blockchain.Privado,
      networkId: NetworkId.Main
    });

    // Verifier Id in the privado main network
    const verifierId = buildVerifierId(CONTRACTS.AMOY_UNIVERSAL_VERIFIER, {
      blockchain: Blockchain.Privado,
      networkId: NetworkId.Main,
      method: DidMethod.Iden3
    });
    const verifierDID = DID.parseFromId(verifierId);

    const profileDID = await idWallet.createProfile(userDID, 50, verifierDID.string());

    const zkpVerifierNetworkConfig = networkConfigs.amoy(CONTRACTS.AMOY_UNIVERSAL_VERIFIER);

    const zkpVerifier = new OnChainZKPVerifier([zkpVerifierNetworkConfig], {
      didResolverUrl: 'https://resolver.privado.id'
    });
    contractRequestHandler = new ContractRequestHandler(packageMgr, proofService, zkpVerifier);

    const transactionData: ContractInvokeTransactionData = {
      contract_address: zkpVerifierNetworkConfig.contractAddress,
      method_id: FunctionSignatures.SubmitResponse,
      chain_id: zkpVerifierNetworkConfig.chainId
    };

    const ciRequestBody: ContractInvokeRequestBody = {
      reason: 'reason',
      transaction_data: transactionData,
      scope: []
    };

    const id = uuid.v4();
    const ciRequest: ContractInvokeRequest = {
      id,
      typ: MediaType.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: ciRequestBody,
      from: verifierDID.string(),
      to: profileDID.string()
    };

    const ethSigner = new ethers.Wallet(walletKey);

    const challenge = BytesHelper.bytesToInt(hexToBytes(ethSigner.address));

    const options: ContractMessageHandlerOptions = {
      ethSigner,
      challenge,
      senderDid: profileDID
    };
    const ciResponse = await (contractRequestHandler as unknown as AbstractMessageHandler).handle(
      ciRequest,
      options
    );

    expect(ciResponse).not.be.undefined;
    console.log(ciResponse);
    expect((ciResponse as unknown as ContractInvokeResponse).body.transaction_data.txHash).not.be
      .undefined;
  });

  // universal verifier v2 integration test
  it.skip('universal verifier v1 set request flow - integration test (noop)', async () => {
    const CONTRACTS = {
      AMOY_STATE_CONTRACT: '0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124',
      AMOY_UNIVERSAL_VERIFIER: '0xfcc86A79fCb057A8e55C6B853dff9479C3cf607c',
      PRIVADO_TEST_STATE_CONTRACT: '0xEF75Eb00E6Ac36b5C215aEBe6CD7Bca9b2Eb33be',
      PRIVADO_MAIN_STATE_CONTRACT: '0x0DDd8701C91d8d1Ba35c9DbA98A45fe5bA8A877E',
      VALIDATOR_ADDRESS_V3: '0xd179f29d00Cd0E8978eb6eB847CaCF9E2A956336'
    };

    const networkConfigs = {
      amoy: (contractAddress) => ({
        ...defaultEthConnectionConfig,
        url: rpcUrl,
        contractAddress,
        chainId: 80002
      }),
      privadoMain: (contractAddress) => ({
        ...defaultEthConnectionConfig,
        url: 'https://rpc-mainnet.privado.id',
        contractAddress,
        chainId: 21000
      }),
      privadoTest: (contractAddress) => ({
        ...defaultEthConnectionConfig,
        url: 'https://rpc-testnet.privado.id',
        contractAddress,
        chainId: 21001
      })
    };

    const issuerAmoyStateEthConfig = networkConfigs.amoy(CONTRACTS.AMOY_STATE_CONTRACT);

    const issuerAmoyTestStateEthConfig = networkConfigs.amoy(CONTRACTS.PRIVADO_TEST_STATE_CONTRACT);

    const userStateEthConfig = networkConfigs.privadoMain(CONTRACTS.PRIVADO_MAIN_STATE_CONTRACT);

    const kms = registerKeyProvidersInMemoryKMS();
    dataStorage = getInMemoryDataStorage(
      new EthStateStorage([
        issuerAmoyStateEthConfig,
        userStateEthConfig,
        issuerAmoyTestStateEthConfig
      ])
    );

    const circuitStorage = new FSCircuitStorage({
      dirname: path.join(__dirname, '../proofs/testdata')
    });

    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );
    credWallet = new CredentialWallet(dataStorage, resolvers);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    proofService = new ProofService(idWallet, credWallet, circuitStorage, dataStorage.states, {
      ipfsNodeURL
    });
    packageMgr = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthInputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    );

    const { did: userDID } = await createIdentity(idWallet, {
      seed: SEED_USER,
      blockchain: Blockchain.Privado,
      networkId: NetworkId.Main
    });

    const { did: issuerDID, credential: issuerAuthCredential } = await createIdentity(idWallet, {
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Amoy
    });
    expect(issuerAuthCredential).not.to.be.undefined;

    // Verifier Id in the privado main network
    const verifierId = buildVerifierId(CONTRACTS.AMOY_UNIVERSAL_VERIFIER, {
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Amoy,
      method: DidMethod.Iden3
    });
    const verifierDID = DID.parseFromId(verifierId);

    const profileDID = await idWallet.createProfile(userDID, 50, verifierDID.string());

    const claimReq: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: profileDID.string(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    await credWallet.save(issuerCred);

    const requestId = Date.now();

    // ADD proofReq to scope
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const proofReqs: ZeroKnowledgeProofRequest[] = [
      {
        id: requestId.toString(),
        circuitId: CircuitId.AtomicQueryV3OnChain,
        query: {
          groupId: 0,
          allowedIssuers: ['*'],
          type: claimReq.type,
          context:
            'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld'
        }
      }
    ];

    const zkpVerifierNetworkConfig = networkConfigs.amoy(CONTRACTS.AMOY_UNIVERSAL_VERIFIER);

    const zkpVerifier = new OnChainZKPVerifier([zkpVerifierNetworkConfig], {
      didResolverUrl: 'https://resolver-dev.privado.id'
    });

    const context =
      'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld';
    let ldSchema: object;
    try {
      ldSchema = (await getDocumentLoader()(context)).document;
    } catch (e) {
      throw new Error(`can't load ld context from url ${context}`);
    }
    const contextJSON = JSON.stringify(ldSchema);

    const metadataAsInQueryBuilder = await parseQueryMetadata(
      {
        fieldName: '',
        operator: Operators.NOOP,
        operatorValue: undefined
      },
      contextJSON,
      claimReq.type,
      {}
    );
    const schemaHash = (await issuerCred.toCoreClaim()).getSchemaHash();

    const queryHashV3 = calculateQueryHashV3(
      metadataAsInQueryBuilder.values,
      schemaHash,
      metadataAsInQueryBuilder.slotIndex,
      metadataAsInQueryBuilder.operator,
      metadataAsInQueryBuilder.claimPathKey.toString(),
      metadataAsInQueryBuilder.values.length,
      metadataAsInQueryBuilder.merklizedSchema ? 1 : 0,
      1,
      verifierId.bigInt().toString(),
      '0'
    );

    const queryToSet = {
      requestId: proofReqs[0].id,
      schema: schemaHash,
      claimPathKey: metadataAsInQueryBuilder.claimPathKey,
      operator: metadataAsInQueryBuilder.operator,
      value: metadataAsInQueryBuilder.values.map((value) => value.toString()),
      slotIndex: metadataAsInQueryBuilder.slotIndex,
      queryHash: queryHashV3,
      circuitIds: [proofReqs[0].circuitId],
      allowedIssuers: proofReqs[0].query.allowedIssuers.includes('*')
        ? []
        : proofReqs[0].query.allowedIssuers,
      skipClaimRevocationCheck: false,
      verifierID: verifierId.bigInt(),
      nullifierSessionID: 0,
      groupID: 0,
      proofType: 0
    };

    // set request
    let ethSigner = new ethers.Wallet(walletKey);

    const provider = new JsonRpcProvider(
      issuerAmoyStateEthConfig.url,
      issuerAmoyStateEthConfig.chainId
    );
    ethSigner = ethSigner.connect(provider);

    contractRequestHandler = new ContractRequestHandler(packageMgr, proofService, zkpVerifier);

    const transactionData: ContractInvokeTransactionData = {
      contract_address: zkpVerifierNetworkConfig.contractAddress,
      method_id: FunctionSignatures.SubmitZKPResponseV2,
      chain_id: zkpVerifierNetworkConfig.chainId
    };

    const ciRequestBody: ContractInvokeRequestBody = {
      reason: 'reason',
      transaction_data: transactionData,
      scope: proofReqs
    };

    const id = uuid.v4();
    const ciRequest: ContractInvokeRequest = {
      id,
      typ: MediaType.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: ciRequestBody,
      from: verifierDID.string(),
      to: profileDID.string()
    };

    // Define the flat struct as a tuple type
    const type =
      'tuple(' +
      'uint256 schema,' +
      'uint256 claimPathKey,' +
      'uint256 operator,' +
      'uint256 slotIndex,' +
      'uint256[] value,' +
      'uint256 queryHash,' +
      'uint256[] allowedIssuers,' +
      'string[] circuitIds,' +
      'bool skipClaimRevocationCheck,' +
      'uint256 groupID,' +
      'uint256 nullifierSessionID,' +
      'uint256 proofType,' +
      'uint256 verifierID' +
      ')';

    // Fill in mock data (replace with your actual `query` values)
    const query = {
      schema: queryToSet.schema.bigInt(),
      claimPathKey: queryToSet.claimPathKey,
      operator: queryToSet.operator,
      slotIndex: queryToSet.slotIndex,
      value: queryToSet.value,
      queryHash: queryToSet.queryHash,
      allowedIssuers: queryToSet.allowedIssuers.map((i) =>
        DID.idFromDID(DID.parse(i)).bigInt().toString()
      ), // Assuming didToIdString() returns uint256 string
      circuitIds: queryToSet.circuitIds,
      skipClaimRevocationCheck: queryToSet.skipClaimRevocationCheck,
      groupID: queryToSet.groupID,
      nullifierSessionID: queryToSet.nullifierSessionID,
      proofType: queryToSet.proofType,
      verifierID: queryToSet.verifierID
    };

    // Encode using ethers.js
    const encoded = new ethers.AbiCoder().encode([type], [query]);

    const verifierContract = new Contract(
      CONTRACTS.AMOY_UNIVERSAL_VERIFIER,
      zkpVerifierABI,
      ethSigner
    );

    const tx = await verifierContract.setZKPRequest(queryToSet.requestId, {
      metadata: JSON.stringify(ciRequest),
      validator: CONTRACTS.VALIDATOR_ADDRESS_V3,
      data: encoded
    });

    await tx.wait();

    const challenge = BytesHelper.bytesToInt(hexToBytes(ethSigner.address));

    const options: ContractMessageHandlerOptions = {
      ethSigner,
      challenge,
      senderDid: profileDID
    };
    const ciResponse = await (contractRequestHandler as unknown as AbstractMessageHandler).handle(
      ciRequest,
      options
    );

    expect(ciResponse).not.be.undefined;
    expect((ciResponse as unknown as ContractInvokeResponse).body.transaction_data.txHash).not.be
      .undefined;
  });
});
