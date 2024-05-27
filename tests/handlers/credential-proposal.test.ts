import {
  IPackageManager,
  IdentityWallet,
  CredentialWallet,
  CredentialStatusResolverRegistry,
  RHSResolver,
  CredentialStatusType,
  FSCircuitStorage,
  ProofService,
  CircuitId,
  byteEncoder,
  ICredentialProposalHandler,
  CredentialProposalHandler,
  createProposalRequest,
  createProposal,
  CredentialRequest,
  ICredentialWallet,
  byteDecoder,
  CredentialsOfferMessage,
  ProposalMessage,
  Proposal,
  PlainPacker,
  PackageManager
} from '../../src';

import {
  MOCK_STATE_STORAGE,
  getInMemoryDataStorage,
  getPackageMgr,
  registerKeyProvidersInMemoryKMS,
  createIdentity,
  SEED_USER,
  SEED_ISSUER,
  RHS_URL
} from '../helpers';

import { expect } from 'chai';
import path from 'path';
import { MediaType, PROTOCOL_MESSAGE_TYPE } from '../../src/iden3comm/constants';
import { DID } from '@iden3/js-iden3-core';

describe('proposal-request handler', () => {
  let packageMgr: IPackageManager;
  let idWallet: IdentityWallet;
  let credWallet: ICredentialWallet;
  let proposalRequestHandler: ICredentialProposalHandler;
  const agentUrl = 'http://localhost:8001/api/v1/agent';
  let userDID, issuerDID: DID;
  const packageManager: IPackageManager = new PackageManager();
  packageManager.registerPackers([new PlainPacker()]);

  const proposalResolverFn = (context: string, type: string): Promise<Proposal> => {
    if (
      context ===
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-nonmerklized.jsonld' &&
      type === 'KYCAgeCredential'
    ) {
      return Promise.resolve({
        credentials: [
          {
            type,
            context
          }
        ],
        type: 'WebVerificationForm',
        url: 'http://issuer-agent.com/verify?anyUniqueIdentifierOfSession=55',
        description: 'you can pass the verification on our KYC provider by following the next link'
      });
    }

    throw new Error(`not supported credential, type: ${type}, context: ${context}`);
  };

  beforeEach(async () => {
    const kms = registerKeyProvidersInMemoryKMS();
    const dataStorage = getInMemoryDataStorage(MOCK_STATE_STORAGE);
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

    const proofService = new ProofService(idWallet, credWallet, circuitStorage, MOCK_STATE_STORAGE);
    packageMgr = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthV2Inputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    );
    proposalRequestHandler = new CredentialProposalHandler(packageMgr, idWallet, credWallet, {
      agentUrl,
      proposalResolverFn,
      packerParams: {
        mediaType: MediaType.PlainMessage
      }
    });

    const userIdentity = await createIdentity(idWallet, {
      seed: SEED_USER
    });

    userDID = userIdentity.did;

    const issuerIdentity = await createIdentity(idWallet, {
      seed: SEED_ISSUER
    });

    issuerDID = issuerIdentity.did;
  });

  it('proposal-request handle request with cred exists in wallet (returns credential offer)', async () => {
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

    const proposalRequest = createProposalRequest(userDID, issuerDID, {
      credentials: [
        {
          type: 'KYCAgeCredential',
          context:
            'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-nonmerklized.jsonld'
        }
      ]
    });

    const msgBytesRequest = await packageManager.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(JSON.stringify(proposalRequest)),
      {}
    );

    const response = await proposalRequestHandler.handleProposalRequest(msgBytesRequest);
    expect(response).not.to.be.undefined;
    const credentialOffer = JSON.parse(byteDecoder.decode(response)) as CredentialsOfferMessage;
    expect(credentialOffer.type).to.be.eq(PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE);
    expect(credentialOffer.body.credentials.length).to.be.eq(1);
    expect(credentialOffer.body.credentials[0].id).to.be.eq(issuerCred.id);
  });

  it('proposal-request handle request with cred NOT exists in wallet (returns proposal message)', async () => {
    const proposalRequest = createProposalRequest(userDID, issuerDID, {
      credentials: [
        {
          type: 'KYCAgeCredential',
          context:
            'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-nonmerklized.jsonld'
        }
      ]
    });

    const msgBytesRequest = await packageManager.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(JSON.stringify(proposalRequest)),
      {}
    );

    const response = await proposalRequestHandler.handleProposalRequest(msgBytesRequest);
    expect(response).not.to.be.undefined;
    const credentialOffer = JSON.parse(byteDecoder.decode(response)) as ProposalMessage;
    expect(credentialOffer.type).to.be.eq(PROTOCOL_MESSAGE_TYPE.PROPOSAL_MESSAGE_TYPE);
    expect(credentialOffer.body?.proposals.length).to.be.eq(1);
    expect(credentialOffer.body?.proposals[0].type).to.be.eq('WebVerificationForm');
    expect(credentialOffer.body?.proposals[0].url).to.be.eq(
      'http://issuer-agent.com/verify?anyUniqueIdentifierOfSession=55'
    );
  });

  it('proposal-request handle not supported credential type in the request', async () => {
    const proposalRequest = createProposalRequest(userDID, issuerDID, {
      credentials: [
        {
          type: 'KYCAgeCredential',
          context:
            'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-nonmerklized.jsonld'
        },
        {
          type: 'AnimaProofOfLife',
          context:
            'https://raw.githubusercontent.com/anima-protocol/claims-polygonid/main/schemas/json-ld/pol-v1.json-ld'
        }
      ]
    });

    const msgBytesRequest = await packageManager.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(JSON.stringify(proposalRequest)),
      {}
    );

    try {
      await proposalRequestHandler.handleProposalRequest(msgBytesRequest);
      expect.fail();
    } catch (err: unknown) {
      expect((err as Error).message).to.be.eq(
        `not supported credential, type: AnimaProofOfLife, context: https://raw.githubusercontent.com/anima-protocol/claims-polygonid/main/schemas/json-ld/pol-v1.json-ld`
      );
    }
  });

  it('proposal-request handle response: wrong sender', async () => {
    const proposalRequest = createProposalRequest(userDID, issuerDID, {
      credentials: [{ type: 'KycAgeCredential', context: 'https://test.com' }]
    });

    const proposalMessage = createProposal(issuerDID, issuerDID, [
      {
        type: 'WebVerificationForm',
        url: 'http://issuer-agent.com/verify?anyUniqueIdentifierOfSession=55',
        description: 'you can pass the verification on our KYC provider by following the next link'
      }
    ]);

    try {
      await proposalRequestHandler.handleProposal(proposalMessage, { proposalRequest });
      expect.fail();
    } catch (err: unknown) {
      expect((err as Error).message).to.include(
        `sender of the request is not a target of response`
      );
    }
  });
});
