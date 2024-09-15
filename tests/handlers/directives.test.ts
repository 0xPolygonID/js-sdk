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
  Metadata,
  MetadataStorage,
  Iden3AttachmentType,
  IMetadataStorage,
  CredentialProposalHandler,
  ICredentialProposalHandler
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
  let metadataStorage: IMetadataStorage;
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
    metadataStorage = new MetadataStorage(new InMemoryDataSource<Metadata>());
    authHandler = new AuthHandler(packageMgr, proofService, {
      metadataStorage
    });

    proposalRequestHandler = new CredentialProposalHandler(packageMgr, idWallet, {
      agentUrl: 'http://localhost:8001/api/v1/agent',
      proposalResolverFn: async (context: string, type: string) => {
        if (
          context ===
            'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-nonmerklized.jsonld' &&
          type === 'KYCAgeCredential'
        ) {
          return {
            credentials: [
              {
                type,
                context
              }
            ],
            type: 'WebVerificationForm',
            url: 'http://issuer-agent.com/verify?anyUniqueIdentifierOfSession=55',
            description:
              'you can pass the verification on our KYC provider by following the next link'
          };
        }

        throw new Error(`not supported credential, type: ${type}, context: ${context}`);
      },
      packerParams: {
        mediaType: MediaType.PlainMessage
      },
      metadataStorage
    });

    const { did: didUser } = await createIdentity(idWallet, {
      seed: SEED_USER
    });
    userDID = didUser;

    const { did: didIssuer } = await createIdentity(idWallet);
    issuerDID = didIssuer;
  });

  it.only('request-response flow', async () => {
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
                type: 'TransparentPaymentDirective',
                purpose: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.PROPOSAL_REQUEST_MESSAGE_TYPE,
                credential: [
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

    const msgBytes = await packageMgr.packMessage(authReq.typ as MediaType, authReq, {});
    await expect(authHandler.handleAuthorizationRequest(userDID, msgBytes)).to.rejectedWith(
      'no credential satisfied query'
    );
    expect(authReq.thid).not.to.be.undefined;
    const metadata = await metadataStorage.get(authReq.thid!);
    console.log('metadata', metadata);
    expect(
      await metadataStorage.getUnprocessedMetadataForThreadIdAndPurpose(
        authReq.thid!,
        PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.PROPOSAL_REQUEST_MESSAGE_TYPE
      )
    ).not.to.be.undefined;

    // user wants to issue credential

    // user sends proposal request to issuer
    const proposalReq = await proposalRequestHandler.createProposalRequestPacked({
      thid: authReq.thid!,
      sender: userDID,
      receiver: issuerDID,
      credentials: []
    });
    console.log('proposalReq', proposalReq);
    expect(proposalReq).not.to.be.undefined;
  });
});
