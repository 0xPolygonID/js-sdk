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
  FunctionSignatures
} from '../../src';
import { IDataStorage, IStateStorage, IOnChainZKPVerifier } from '../../src/storage/interfaces';
import { InMemoryDataSource, InMemoryMerkleTreeStorage } from '../../src/storage/memory';
import { CredentialRequest, CredentialWallet } from '../../src/credentials';
import { IProofService, ProofService } from '../../src/proof';
import { CircuitId } from '../../src/circuits';
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
  AuthProofResponse,
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
import { Blockchain, BytesHelper, DidMethod, NetworkId } from '@iden3/js-iden3-core';
import { expect } from 'chai';
import { CredentialStatusResolverRegistry } from '../../src/credentials';
import { RHSResolver } from '../../src/credentials';
import { ethers, JsonRpcProvider, Signer } from 'ethers';
import {
  createIdentity,
  getInMemoryDataStorage,
  registerKeyProvidersInMemoryKMS,
  RPC_URL,
  SEED_USER
} from '../helpers';
import { AbstractMessageHandler } from '../../src/iden3comm/handlers/message-handler';

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
      const response = new Map<string, ZeroKnowledgeInvokeResponse>();
      response.set('txhash1', { responses: zkProofResponses });
      return response;
    },

    submitResponse: async (
      ethSigner: Signer,
      txData: ContractInvokeTransactionData,
      authResponse: AuthProofResponse,
      responses: ZeroKnowledgeProofResponse[]
    ) => {
      const response = new Map<string, ZeroKnowledgeInvokeResponse>();
      response.set('txhash1', {
        responses,
        crossChainProofs: ['0x123456'],
        authProofs: [authResponse]
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
      return [];
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
    mgr.registerPackers([packer, plainPacker]);

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

    proofService = new ProofService(idWallet, credWallet, circuitStorage, mockStateStorage, {
      ipfsNodeURL
    });
    packageMgr = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthV2Inputs.bind(proofService),
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

  it('contract universal verifier v3 request flow', async () => {
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
    console.dir(ciResponse, { depth: null });
    expect((ciResponse as unknown as ContractInvokeResponse).body.scope[0].txHash).not.be.undefined;
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
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

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
      proofService.generateAuthV2Inputs.bind(proofService),
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
      proofService.generateAuthV2Inputs.bind(proofService),
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
      proofService.generateAuthV2Inputs.bind(proofService),
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
    expect((ciResponse as unknown as ContractInvokeResponse).body.scope[0].txHash).not.be.undefined;
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
      proofService.generateAuthV2Inputs.bind(proofService),
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
});
