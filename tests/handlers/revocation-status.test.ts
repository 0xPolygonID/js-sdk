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
  IRevocationStatusHandler,
  RevocationStatusHandler,
  RevocationStatusRequestMessage,
  PROTOCOL_CONSTANTS,
  byteEncoder,
  defaultEthConnectionConfig
} from '../../src';

import {
  MOCK_STATE_STORAGE,
  getInMemoryDataStorage,
  getPackageMgr,
  registerKeyProvidersInMemoryKMS,
  createIdentity,
  SEED_USER,
  SEED_ISSUER
} from '../helpers';

import * as uuid from 'uuid';
import { expect } from 'chai';
import path from 'path';

describe('revocation status', () => {
  let packageMgr: IPackageManager;
  let rsHandlerr: IRevocationStatusHandler;
  let idWallet: IdentityWallet;

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
    const credWallet = new CredentialWallet(dataStorage, resolvers);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet, defaultEthConnectionConfig);

    const proofService = new ProofService(idWallet, credWallet, circuitStorage, MOCK_STATE_STORAGE);
    packageMgr = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthV2Inputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    );
    rsHandlerr = new RevocationStatusHandler(packageMgr, idWallet);
  });

  it('revocation status works', async () => {
    const { did: userDID, credential: cred } = await createIdentity(idWallet, {
      seed: SEED_USER
    });

    expect(cred).not.to.be.undefined;

    const { did: issuerDID, credential: issuerAuthCredential } = await createIdentity(idWallet, {
      seed: SEED_ISSUER
    });

    expect(issuerAuthCredential).not.to.be.undefined;
    const id = uuid.v4();
    const rsReq: RevocationStatusRequestMessage = {
      id,
      typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.REVOCATION_STATUS_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: {
        revocation_nonce: 1000
      },
      from: userDID.string(),
      to: issuerDID.string()
    };

    const msgBytes = byteEncoder.encode(JSON.stringify(rsReq));

    await rsHandlerr.handleRevocationStatusRequest(userDID, msgBytes);
  });

  it(`revocation status - no 'from' field`, async () => {
    const { did: userDID, credential: cred } = await createIdentity(idWallet, {
      seed: SEED_USER
    });

    expect(cred).not.to.be.undefined;

    const { did: issuerDID, credential: issuerAuthCredential } = await createIdentity(idWallet, {
      seed: SEED_ISSUER
    });

    expect(issuerAuthCredential).not.to.be.undefined;
    const id = uuid.v4();
    const rsReq: RevocationStatusRequestMessage = {
      id,
      typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.REVOCATION_STATUS_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: {
        revocation_nonce: 1000
      },
      to: issuerDID.string()
    };

    const msgBytes = byteEncoder.encode(JSON.stringify(rsReq));

    try {
      await rsHandlerr.handleRevocationStatusRequest(userDID, msgBytes);
      expect.fail();
    } catch (err: unknown) {
      expect((err as Error).message).to.be.equal(`failed request. empty 'from' field`);
    }
  });
});
