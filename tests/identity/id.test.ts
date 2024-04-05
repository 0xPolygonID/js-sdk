/* eslint-disable no-console */
import {
  IdentityWallet,
  byteEncoder,
  MerkleTreeType,
  IDataStorage,
  CredentialRequest,
  ICredentialWallet,
  CredentialWallet,
  CredentialStatusResolverRegistry,
  RHSResolver,
  CredentialStatusType,
  EthStateStorage
} from '../../src';
import {
  MOCK_STATE_STORAGE,
  SEED_USER,
  createIdentity,
  RHS_URL,
  getInMemoryDataStorage,
  registerKeyProvidersInMemoryKMS,
  WALLET_KEY,
  createEthereumBasedIdentity
} from '../helpers';
import { expect } from 'chai';
import { Wallet } from 'ethers';

describe('identity', () => {
  let credWallet: ICredentialWallet;
  let idWallet: IdentityWallet;
  let dataStorage: IDataStorage;

  const expectedDID = 'did:iden3:polygon:amoy:xCRp75DgAdS63W65fmXHz6p9DwdonuRU9e46DifhX';

  const createClaimReq = (
    credentialSubjectId: string,
    opts?: Partial<CredentialRequest>
  ): CredentialRequest => {
    return {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/kyc-nonmerklized.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: credentialSubjectId,
        birthday: 19960424,
        documentType: 99
      },
      expiration: 12345678888,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: RHS_URL
      },
      ...opts
    };
  };

  beforeEach(async () => {
    dataStorage = getInMemoryDataStorage(MOCK_STATE_STORAGE);
    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );
    credWallet = new CredentialWallet(dataStorage, resolvers);
    idWallet = new IdentityWallet(registerKeyProvidersInMemoryKMS(), dataStorage, credWallet);
  });

  it('createIdentity', async () => {
    const { did, credential } = await createIdentity(idWallet);

    expect(did.string()).to.equal(expectedDID);
    const dbCred = await dataStorage.credential.findCredentialById(credential.id);
    expect(credential).to.deep.equal(dbCred);

    const claimsTree = await dataStorage.mt.getMerkleTreeByIdentifierAndType(
      did.string(),
      MerkleTreeType.Claims
    );

    expect((await claimsTree.root()).bigInt()).not.to.equal(0);
  });

  it('createProfile', async () => {
    const { did } = await createIdentity(idWallet);

    expect(did.string()).to.equal(expectedDID);

    const profileDID = await idWallet.createProfile(did, 10, 'http://polygonissuer.com/');
    expect(profileDID.string()).to.equal(
      'did:iden3:polygon:amoy:xHMd1mimHu3Gc1nhe3DXrimqUCNtgYP8gcuGAHgxm'
    );

    const dbProfile = await dataStorage.identity.getProfileByVerifier('http://polygonissuer.com/');
    expect(dbProfile).not.to.be.undefined;
    if (dbProfile) {
      expect(dbProfile.id).to.equal(profileDID.string());
      expect(dbProfile.genesisIdentifier).to.equal(did.string());
      expect(dbProfile.nonce).to.equal(10);
    }
  });

  it('sign', async () => {
    const { did, credential } = await createIdentity(idWallet);
    expect(did.string()).to.equal(expectedDID);

    const enc = byteEncoder; // always utf-8

    const message = enc.encode('payload');
    const sig = await idWallet.sign(message, credential);

    expect(sig.hex()).to.equal(
      '5fdb4fc15898ee2eeed2ed13c5369a4f28870e51ac1aae8ad1f2108d2d39f38969881d7553344c658e63344e4ddc151fabfed5bf8fcf8663c183248b714d8b03'
    );
  });

  it('generateMtp', async () => {
    const { did, credential } = await createIdentity(idWallet);
    expect(did.string()).to.equal(expectedDID);

    const proof = await idWallet.generateCredentialMtp(did, credential);

    expect(proof.proof.existence).to.equal(true);
  });

  it('generateNonRevProof', async () => {
    const { did, credential } = await createIdentity(idWallet);
    expect(did.string()).to.equal(expectedDID);

    const proof = await idWallet.generateNonRevocationMtp(did, credential);

    expect(proof.proof.existence).to.equal(false);
  });

  it('generateNonRevProof', async () => {
    const { did, credential } = await createIdentity(idWallet);
    expect(did.string()).to.equal(expectedDID);

    const proof = await idWallet.generateNonRevocationMtp(did, credential);

    expect(proof.proof.existence).to.equal(false);
  });

  it('issueCredential', async () => {
    const { did: issuerDID, credential: issuerAuthCredential } = await createIdentity(idWallet);

    expect(issuerDID.string()).to.equal(expectedDID);

    expect(issuerAuthCredential).not.to.be.undefined;

    const { did: userDID, credential: userAuthCredential } = await createIdentity(idWallet, {
      seed: SEED_USER
    });

    expect(userAuthCredential).not.to.be.undefined;

    const claimReq: CredentialRequest = createClaimReq(userDID.string());
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    expect(issuerCred.credentialSubject.id).to.equal(userDID.string());
  });

  it('build non-inclusion proof from issuer data', async () => {
    const { did: issuerDID } = await createIdentity(idWallet);

    const { did: userDID } = await createIdentity(idWallet, {
      seed: SEED_USER
    });

    const claimReq: CredentialRequest = createClaimReq(userDID.string());
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);
    issuerCred.credentialStatus.id = RHS_URL;

    await credWallet.getRevocationStatusFromCredential(issuerCred);
  });

  it('createIdentity Secp256k1', async () => {
    const ethSigner = new Wallet(WALLET_KEY, (dataStorage.states as EthStateStorage).provider);

    const { did, credential } = await createEthereumBasedIdentity(idWallet, {
      ethereumBasedIdentityOpts: {
        ethSigner
      }
    });

    expect(did.string()).to.equal(
      'did:iden3:polygon:amoy:x6x5sor7zpxsu478u36QvEgaRUfPjmzqFo5PHHzbM'
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const dbCred = await dataStorage.credential.findCredentialById(credential!.id);
    expect(credential).to.deep.equal(dbCred);

    const claimsTree = await dataStorage.mt.getMerkleTreeByIdentifierAndType(
      did.string(),
      MerkleTreeType.Claims
    );

    expect((await claimsTree.root()).bigInt()).not.to.equal(0);
  });
});
