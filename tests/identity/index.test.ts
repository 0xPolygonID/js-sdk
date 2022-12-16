import { IRevocationService, RevocationService } from './../../src/credentials/revocation';
import { IdentityWallet } from '../../src';
import { BjjProvider, KMS, KmsKeyType } from '../../src/kms';
import { InMemoryPrivateKeyStore } from '../../src/kms/store';
import { MerkleTreeType } from '../../src/storage/entities/mt';
import { IDataStorage } from '../../src/storage/interfaces';
import {
  InMemoryCredentialStorage,
  InMemoryIdentityStorage,
  InMemoryMerkleTreeStorage
} from '../../src/storage/memory';
import { defaultEthConnectionConfig, EthStateStorage } from '../../src/storage/blockchain';
import { ClaimRequest, CredentialWallet } from '../../src/credentials';

describe('identity', () => {
  let wallet: IdentityWallet;
  let dataStorage: IDataStorage;
  beforeEach(async () => {
    const memoryKeyStore = new InMemoryPrivateKeyStore();
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, memoryKeyStore);
    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);

    dataStorage = {
      credential: new InMemoryCredentialStorage(),
      identity: new InMemoryIdentityStorage(),
      mt: new InMemoryMerkleTreeStorage(40),
      states: new EthStateStorage(defaultEthConnectionConfig)
    };
    const credWallet = new CredentialWallet(dataStorage);
    wallet = new IdentityWallet(kms, dataStorage, credWallet);
  });
  it('createIdentity', async () => {
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhrase
    );
    expect(did.toString()).toBe(
      'did:iden3:polygon:mumbai:x5FK8BRpdZTCDp2v4g8jMugssmjUq4eL7oJtBXC1J'
    );
    const dbCred = await dataStorage.credential.findCredentialById(credential.id);
    expect(credential).toBe(dbCred);

    const claimsTree = await dataStorage.mt.getMerkleTreeByIdentifierAndType(
      did.toString(),
      MerkleTreeType.Claims
    );

    expect(claimsTree?.root.bigInt()).not.toBe(0);
  });
  it('createProfile', async () => {
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhrase
    );
    expect(did.toString()).toBe(
      'did:iden3:polygon:mumbai:x5FK8BRpdZTCDp2v4g8jMugssmjUq4eL7oJtBXC1J'
    );

    const profileDID = await wallet.createProfile(did, 10, 'http://polygonissuer.com/');
    expect(profileDID.toString()).toBe(
      'did:iden3:polygon:mumbai:x6eHDnzugJTh4jF31rJVvr151tgr8YzPpLmYy5Yy4'
    );

    const dbProfile = await dataStorage.identity.getProfileByVerifier('http://polygonissuer.com/');
    expect(dbProfile.id).toBe(profileDID.toString());
    expect(dbProfile.genesisIdentifier).toBe(did.toString());
    expect(dbProfile.nonce).toBe(10);
  });
  it('sign', async () => {
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhrase
    );
    expect(did.toString()).toBe(
      'did:iden3:polygon:mumbai:x5FK8BRpdZTCDp2v4g8jMugssmjUq4eL7oJtBXC1J'
    );

    const enc = new TextEncoder(); // always utf-8

    const message = enc.encode('payload');
    const sig = await wallet.sign(message, credential);
    console.log(sig.hex());

    expect(sig.hex()).toBe(
      '5fdb4fc15898ee2eeed2ed13c5369a4f28870e51ac1aae8ad1f2108d2d39f38969881d7553344c658e63344e4ddc151fabfed5bf8fcf8663c183248b714d8b03'
    );
  });
  it('generateMtp', async () => {
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhrase
    );
    expect(did.toString()).toBe(
      'did:iden3:polygon:mumbai:x5FK8BRpdZTCDp2v4g8jMugssmjUq4eL7oJtBXC1J'
    );

    const proof = await wallet.generateClaimMtp(did, credential);

    expect(proof.proof.existence).toBe(true);
  });
  it('generateNonRevProof', async () => {
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhrase
    );
    expect(did.toString()).toBe(
      'did:iden3:polygon:mumbai:x5FK8BRpdZTCDp2v4g8jMugssmjUq4eL7oJtBXC1J'
    );

    const proof = await wallet.generateNonRevocationMtp(did, credential);

    expect(proof.proof.existence).toBe(false);
  });

  it('generateNonRevProof', async () => {
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhrase
    );
    expect(did.toString()).toBe(
      'did:iden3:polygon:mumbai:x5FK8BRpdZTCDp2v4g8jMugssmjUq4eL7oJtBXC1J'
    );

    const proof = await wallet.generateNonRevocationMtp(did, credential);

    expect(proof.proof.existence).toBe(false);
  });

  it('issueCredential', async () => {
    const seedPhraseIssuer: Uint8Array = new TextEncoder().encode(
      'seedseedseedseedseedseedseedseed'
    );
    const seedPhraseUser: Uint8Array = new TextEncoder().encode('userseedseedseedseedseedseeduser');

    const { did: issuerDID, credential: issuerAuthCredential } = await wallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhraseIssuer

    );

    expect(issuerDID.toString()).toBe(
      'did:iden3:polygon:mumbai:x5FK8BRpdZTCDp2v4g8jMugssmjUq4eL7oJtBXC1J'
    );

    const { did: userDID, credential: userAuthCredential } = await wallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhraseUser
    );

    var claimReq: ClaimRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v2.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.toString(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 12345678888
    };
    await wallet.issueCredential(issuerDID, claimReq, 'http://metamask.com/');
  });
});
