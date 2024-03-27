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
  createProposal
} from '../../src';

import {
  MOCK_STATE_STORAGE,
  getInMemoryDataStorage,
  getPackageMgr,
  registerBJJIntoInMemoryKMS,
  createIdentity,
  SEED_USER,
  SEED_ISSUER
} from '../helpers';

import { expect } from 'chai';
import path from 'path';

describe('proposal-request handler', () => {
  let packageMgr: IPackageManager;
  let idWallet: IdentityWallet;
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
    const credWallet = new CredentialWallet(dataStorage, resolvers);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    const proofService = new ProofService(idWallet, credWallet, circuitStorage, MOCK_STATE_STORAGE);
    packageMgr = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthV2Inputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    );
    proposalRequestHandler = new ProposalRequestHandler(packageMgr);
  });

  it('proposal-request handle request', async () => {
    const { did: userDID, credential: cred } = await createIdentity(idWallet, {
      seed: SEED_USER
    });

    expect(cred).not.to.be.undefined;

    const { did: issuerDID, credential: issuerAuthCredential } = await createIdentity(idWallet, {
      seed: SEED_ISSUER
    });

    expect(issuerAuthCredential).not.to.be.undefined;
    const proposalRequest = createProposalRequest(userDID.string(), issuerDID.string(), {
      credentials: [{ type: 'KycAgeCredential', context: 'https://test.com' }]
    });

    const msgBytesRequest = byteEncoder.encode(JSON.stringify(proposalRequest));

    const proposalResponse = createProposal(issuerDID.string(), userDID.string(), [
      {
        type: 'WebVerificationForm',
        url: 'http://issuer-agent.com/verify?anyUniqueIdentifierOfSession=55',
        description: 'you can pass the verification on our KYC provider by following the next link'
      }
    ]);

    const msgBytesResponse = byteEncoder.encode(JSON.stringify(proposalResponse));

    await proposalRequestHandler.handleProposalRequest(msgBytesRequest, msgBytesResponse);
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
    const proposalRequest = createProposalRequest(userDID.string(), issuerDID.string(), {
      credentials: [{ type: 'KycAgeCredential', context: 'https://test.com' }]
    });

    const proposalResponse = createProposal(issuerDID.string(), issuerDID.string(), [
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
