/* eslint-disable no-console */

import path from 'path';
import {
  IDataStorage,
  CredentialRequest,
  CredentialWallet,
  ProofService,
  CircuitId,
  FSCircuitStorage,
  IdentityWallet,
  CredentialStatusType,
  AuthorizationRequestMessage,
  AuthorizationRequestMessageBody,
  IPackageManager,
  ZeroKnowledgeProofRequest,
  RHSResolver,
  CredentialStatusResolverRegistry,
  PROTOCOL_CONSTANTS,
  AuthHandler,
  ContractInvokeTransactionData,
  ContractInvokeRequestBody,
  ContractInvokeRequest
} from '../../src';
import { DID } from '@iden3/js-iden3-core';
import { expect } from 'chai';
import * as uuid from 'uuid';
import {
  MOCK_STATE_STORAGE,
  getInMemoryDataStorage,
  registerBJJIntoInMemoryKMS,
  IPFS_URL,
  getPackageMgr,
  createIdentity,
  SEED_USER,
  RHS_URL,
  WALLET_KEY
} from '../helpers';
import { ProtocolMessageHandler } from '../../src/iden3comm/handlers/protocol-message-handler';
import { ContractRequestHandler } from '../../src/iden3comm/handlers/contract-request';
import { mockZKPVerifier } from './contract-request.test';
import { MediaType, PROTOCOL_MESSAGE_TYPE } from '../../src/iden3comm/constants';
import { ethers } from 'ethers';

describe('auth', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;
  let proofService: ProofService;
  let packageMgr: IPackageManager;

  let userDID: DID;
  let issuerDID: DID;
  let proofRequest: ZeroKnowledgeProofRequest;
  let protocolHandler: ProtocolMessageHandler;

  beforeEach(async () => {
    const kms = registerBJJIntoInMemoryKMS();
    dataStorage = getInMemoryDataStorage(MOCK_STATE_STORAGE);
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

    proofService = new ProofService(idWallet, credWallet, circuitStorage, MOCK_STATE_STORAGE, {
      ipfsNodeURL: IPFS_URL
    });

    packageMgr = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthV2Inputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    );

    const authHandler = new AuthHandler(packageMgr, proofService);

    const contractRequestHandler = new ContractRequestHandler(
      packageMgr,
      proofService,
      mockZKPVerifier
    );

    protocolHandler = new ProtocolMessageHandler(authHandler, contractRequestHandler);

    const { did: didUser, credential: userAuthCredential } = await createIdentity(idWallet, {
      seed: SEED_USER
    });
    userDID = didUser;

    expect(userAuthCredential).not.to.be.undefined;

    const { did: didIssuer, credential: issuerAuthCredential } = await createIdentity(idWallet);
    expect(issuerAuthCredential).not.to.be.undefined;
    issuerDID = didIssuer;

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
        id: RHS_URL
      }
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    await credWallet.save(issuerCred);

    proofRequest = {
      id: 1,
      circuitId: CircuitId.AtomicQuerySigV2,
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
  });

  it('handle auth ', async () => {
    const authReqBody: AuthorizationRequestMessageBody = {
      callbackUrl: 'http://localhost:8080/callback?id=1234442-123123-123123',
      reason: 'reason',
      message: 'mesage',
      did_doc: {},
      scope: [proofRequest]
    };

    const authReq: AuthorizationRequestMessage = {
      id: uuid.v4(),
      typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE,
      thid: uuid.v4(),
      body: authReqBody,
      from: issuerDID.string()
    };

    const resp = await protocolHandler.handle({ params: { did: userDID }, message: authReq });
    expect(resp).not.to.be.undefined;
  });

  it.only('handle contract invoke ', async () => {
    const transactionData: ContractInvokeTransactionData = {
      contract_address: '0x134b1be34911e39a8397ec6289782989729807a4',
      method_id: '123',
      chain_id: 80001
    };

    const ciRequestBody: ContractInvokeRequestBody = {
      reason: 'reason',
      transaction_data: transactionData,
      scope: [{ ...proofRequest, circuitId: CircuitId.AtomicQueryV3OnChain }]
    };

    const id = uuid.v4();
    const message: ContractInvokeRequest = {
      id,
      typ: MediaType.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: ciRequestBody
    };

    const ethSigner = new ethers.Wallet(WALLET_KEY);

    const resp = await protocolHandler.handle({
      params: { did: userDID, ethSigner, challenge: BigInt(112312) },
      message
    });
    expect(resp).to.be.null;
  });
});
