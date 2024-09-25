/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-console */

import path from 'path';
import {
  IDataStorage,
  CredentialWallet,
  ProofService,
  CircuitId,
  AuthHandler,
  FSCircuitStorage,
  IAuthHandler,
  IdentityWallet,
  CredentialStatusType,
  AuthorizationRequestMessage,
  IPackageManager,
  RHSResolver,
  CredentialStatusResolverRegistry,
  PROTOCOL_CONSTANTS,
  InMemoryDataSource,
  Iden3MessageStorage,
  Iden3AttachmentType,
  IIden3MessageStorage,
  CredentialProposalHandler,
  ICredentialProposalHandler,
  MessageModel,
  Proposal,
  Iden3DirectiveType
} from '../../src';
import { DID } from '@iden3/js-iden3-core';
import { expect } from 'chai';
import * as uuid from 'uuid';
import {
  getInMemoryDataStorage,
  registerKeyProvidersInMemoryKMS,
  IPFS_URL,
  getPackageMgr,
  createIdentity,
  SEED_USER,
  MOCK_STATE_STORAGE
} from '../helpers';
import { MediaType } from '../../src/iden3comm/constants';

describe('directives', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;
  let proofService: ProofService;
  let authHandler: IAuthHandler;
  let packageMgr: IPackageManager;
  let userDID: DID;
  let issuerDID: DID;
  let messageStorage: IIden3MessageStorage;
  let proposalRequestHandler: ICredentialProposalHandler;

  beforeEach(async () => {
    const kms = registerKeyProvidersInMemoryKMS();
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
    messageStorage = new Iden3MessageStorage(new InMemoryDataSource<MessageModel>());
    authHandler = new AuthHandler(packageMgr, proofService, {
      messageStorage: messageStorage
    });

    proposalRequestHandler = new CredentialProposalHandler(packageMgr, idWallet, {
      agentUrl: 'http://localhost:8001/api/v1/agent',
      proposalResolverFn: () => Promise.resolve({} as Proposal),
      packerParams: {
        mediaType: MediaType.PlainMessage
      },
      messageStorage: messageStorage
    });

    const { did: didUser } = await createIdentity(idWallet, {
      seed: SEED_USER
    });
    userDID = didUser;

    const { did: didIssuer } = await createIdentity(idWallet);
    issuerDID = didIssuer;
  });

  it('request-response flow', async () => {
    // verifier sends auth request to user, user has no credential yet, but auth request contains directive
    const id = uuid.v4();
    const authReq: AuthorizationRequestMessage = {
      id,
      typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: {
        callbackUrl: 'http://localhost:8080/callback?id=1234442-123123-123123',
        reason: 'reason',
        message: 'message',
        did_doc: {},
        scope: [
          {
            id: 1,
            circuitId: CircuitId.AtomicQueryV3,
            optional: false,
            query: {
              allowedIssuers: ['*'],
              type: 'KYCAgeCredential',
              context:
                'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-nonmerklized.jsonld',
              credentialSubject: {
                documentType: {
                  $eq: 99
                }
              }
            }
          }
        ]
      },
      from: issuerDID.string(),
      attachments: [
        {
          data: {
            type: Iden3AttachmentType.Iden3Directives,
            context: 'https://directive.iden3.io/v1/context.json',
            directives: [
              {
                type: Iden3DirectiveType.TransparentPaymentDirective,
                purpose: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.PROPOSAL_REQUEST_MESSAGE_TYPE,
                credentials: [
                  {
                    context:
                      'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-nonmerklized.jsonld',
                    type: 'KYCAgeCredential'
                  }
                ],
                paymentData: {
                  txId: '0x123'
                }
              }
            ]
          }
        }
      ]
    };

    console.log(JSON.stringify(authReq, null, 2));

    const msgBytes = await packageMgr.packMessage(authReq.typ as MediaType, authReq, {});
    await expect(authHandler.handleAuthorizationRequest(userDID, msgBytes)).to.rejectedWith(
      'no credential satisfied query'
    );
    expect(authReq.thid).not.to.be.undefined;
    const metadata = await messageStorage.get(authReq.thid!);
    console.log('metadata', metadata);
    expect(await messageStorage.getMessagesByThreadId(authReq.thid!, 'pending')).not.to.be
      .undefined;

    // user wants to issue credential

    // user sends proposal request to issuer
    const { request: proposalReq, token } =
      await proposalRequestHandler.createProposalRequestPacked({
        thid: authReq.thid!,
        sender: userDID,
        receiver: issuerDID,
        credentials: []
      });
    console.log('proposalReq', proposalReq);
    expect(proposalReq).not.to.be.undefined;
    const [authRequest, proposalRequest] = (await messageStorage.load()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    expect(authRequest.type).to.be.eq(
      PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE
    );
    expect(proposalRequest.type).to.be.eq(
      PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.PROPOSAL_REQUEST_MESSAGE_TYPE
    );
    expect(proposalRequest.thid).not.to.be.eq(authRequest.thid);
    expect(proposalRequest.correlationId).to.be.eq(authReq.id);
    expect(proposalRequest.correlationThId).to.be.eq(authReq.thid);
    expect(token).not.to.be.undefined;
  });
});
