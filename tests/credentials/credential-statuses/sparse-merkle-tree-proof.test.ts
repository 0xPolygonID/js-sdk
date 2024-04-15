import { defaultEthConnectionConfig, IdentityWallet } from '../../../src';
import { IDataStorage } from '../../../src/storage/interfaces';
import { CredentialRequest, CredentialWallet } from '../../../src/credentials';
import { CredentialStatusType } from '../../../src/verifiable';
import { expect } from 'chai';
import {
  MOCK_STATE_STORAGE,
  SEED_USER,
  createIdentity,
  getInMemoryDataStorage,
  registerKeyProvidersInMemoryKMS,
  RPC_URL
} from '../../helpers';
import { DID } from '@iden3/js-iden3-core';
import fetchMock from '@gr2m/fetch-mock';
import { Proof, ZERO_HASH } from '@iden3/js-merkletree';

describe('SparseMerkleTreeProof', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;

  let userDID: DID;
  let issuerDID: DID;
  const walletUrl = 'https://user-wallet.com';
  const issuerWalletUrl = 'https://issuer.com';

  beforeEach(async () => {
    const kms = registerKeyProvidersInMemoryKMS();
    dataStorage = getInMemoryDataStorage(MOCK_STATE_STORAGE);

    credWallet = new CredentialWallet(dataStorage);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet, {
      ...defaultEthConnectionConfig,
      url: RPC_URL
    });

    const { did: didUser, credential: userAuthCredential } = await createIdentity(idWallet, {
      seed: SEED_USER,
      revocationOpts: {
        type: CredentialStatusType.SparseMerkleTreeProof,
        id: walletUrl
      }
    });
    userDID = didUser;

    expect(userAuthCredential).not.to.be.undefined;

    const { did: didIssuer, credential: issuerAuthCredential } = await createIdentity(idWallet, {
      revocationOpts: {
        type: CredentialStatusType.SparseMerkleTreeProof,
        id: issuerWalletUrl
      }
    });
    expect(issuerAuthCredential).not.to.be.undefined;
    issuerDID = didIssuer;
    const mockRevStatus = JSON.stringify({
      mtp: new Proof(),
      issuer: {
        state: ZERO_HASH.hex(),
        claimsTreeRoot: ZERO_HASH.hex(),
        revocationTreeRoot: ZERO_HASH.hex(),
        rootOfRoots: ZERO_HASH.hex()
      }
    });
    fetchMock.spy();
    fetchMock.mock(`begin:${walletUrl}`, mockRevStatus);
    fetchMock.mock(`begin:${issuerWalletUrl}`, mockRevStatus);
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it('issue credential', async () => {
    const credRequest: CredentialRequest = {
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
        type: CredentialStatusType.SparseMerkleTreeProof,
        id: walletUrl
      }
    };
    const issuedCredential = await idWallet.issueCredential(issuerDID, credRequest);

    await credWallet.save(issuedCredential);

    expect(issuedCredential).not.to.be.undefined;
  });
});
