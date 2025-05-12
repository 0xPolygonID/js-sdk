import { IdentityWallet } from '../../../src';
import { IDataStorage } from '../../../src/storage/interfaces';
import { CredentialRequest, CredentialWallet } from '../../../src/credentials';
import { CredentialStatusType } from '../../../src/verifiable';
import { expect } from 'chai';
import {
  MOCK_STATE_STORAGE,
  SEED_USER,
  createIdentity,
  getInMemoryDataStorage,
  registerKeyProvidersInMemoryKMS
} from '../../helpers';
import { DID } from '@iden3/js-iden3-core';
import { schemaLoaderForTests } from '../../mocks/schema';

describe('SparseMerkleTreeProof', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;

  let userDID: DID;
  let issuerDID: DID;
  const walletUrl = 'https://user-wallet.com';
  const issuerWalletUrl = 'https://issuer.com';
  const merklizeOpts = {
    documentLoader: schemaLoaderForTests()
  };

  beforeEach(async () => {
    const kms = registerKeyProvidersInMemoryKMS();
    dataStorage = getInMemoryDataStorage(MOCK_STATE_STORAGE);

    credWallet = new CredentialWallet(dataStorage);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

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
    const issuedCredential = await idWallet.issueCredential(issuerDID, credRequest, merklizeOpts);

    await credWallet.save(issuedCredential);

    expect(issuedCredential).not.to.be.undefined;
  });
});
