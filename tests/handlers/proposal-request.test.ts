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
  IProposalRequestHandler,
  ProposalRequestHandler,
  createProposalRequest,
  createProposal,
  CredentialRequest,
  ICredentialWallet,
  byteDecoder,
  CredentialsOfferMessage
} from '../../src';

import {
  MOCK_STATE_STORAGE,
  getInMemoryDataStorage,
  getPackageMgr,
  registerBJJIntoInMemoryKMS,
  createIdentity,
  SEED_USER,
  SEED_ISSUER,
  RHS_URL
} from '../helpers';

import { expect } from 'chai';
import path from 'path';
import { PROTOCOL_MESSAGE_TYPE } from '../../src/iden3comm/constants';

describe('proposal-request handler', () => {
  let packageMgr: IPackageManager;
  let idWallet: IdentityWallet;
  let credWallet: ICredentialWallet;
  let proposalRequestHandler: IProposalRequestHandler;

  beforeEach(async () => {
    const kms = registerBJJIntoInMemoryKMS();
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
    proposalRequestHandler = new ProposalRequestHandler(packageMgr, idWallet);
  });

  it('proposal-request handle request with cred exists in wallet (returns credential offer)', async () => {
    const { did: userDID, credential: cred } = await createIdentity(idWallet, {
      seed: SEED_USER
    });

    expect(cred).not.to.be.undefined;

    const { did: issuerDID, credential: issuerAuthCredential } = await createIdentity(idWallet, {
      seed: SEED_ISSUER
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

    const msgBytesRequest = byteEncoder.encode(JSON.stringify(proposalRequest));
    // const proposalResponse = createProposal(issuerDID, userDID, [
    //   {
    //     type: 'WebVerificationForm',
    //     url: 'http://issuer-agent.com/verify?anyUniqueIdentifierOfSession=55',
    //     description: 'you can pass the verification on our KYC provider by following the next link'
    //   }
    // ]);

    // const msgBytesResponse = byteEncoder.encode(JSON.stringify(proposalResponse));
    const response = await proposalRequestHandler.handleProposalRequest(msgBytesRequest);
    expect(response).not.to.be.undefined;
    const credentialOffer = JSON.parse(
      byteDecoder.decode(response)
    ) as unknown as CredentialsOfferMessage;
    expect(credentialOffer.type).to.be.eq(PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE);
    expect(credentialOffer.body.credentials.length).to.be.eq(1);
    expect(credentialOffer.body.credentials[0].id).to.be.eq(issuerCred.id);
  });

  it('proposal-request handle response: wrong sender', async () => {
    const { did: userDID, credential: cred } = await createIdentity(idWallet, {
      seed: SEED_USER
    });

    expect(cred).not.to.be.undefined;

    const { did: issuerDID, credential: issuerAuthCredential } = await createIdentity(idWallet, {
      seed: SEED_ISSUER
    });

    expect(issuerAuthCredential).not.to.be.undefined;
    const proposalRequest = createProposalRequest(userDID, issuerDID, {
      credentials: [{ type: 'KycAgeCredential', context: 'https://test.com' }]
    });

    const proposalResponse = createProposal(issuerDID, issuerDID, [
      {
        type: 'WebVerificationForm',
        url: 'http://issuer-agent.com/verify?anyUniqueIdentifierOfSession=55',
        description: 'you can pass the verification on our KYC provider by following the next link'
      }
    ]);

    try {
      await proposalRequestHandler.handleProposalResponse(proposalResponse, proposalRequest);
      expect.fail();
    } catch (err: unknown) {
      expect((err as Error).message).to.include(
        `sender of the request is not a target of response`
      );
    }
  });
});
