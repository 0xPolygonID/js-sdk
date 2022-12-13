import { IdentityWallet } from '../../src';
import { BjjProvider, KMS, KmsKeyType } from '../../src/kms';
import { InMemoryPrivateKeyStore } from '../../src/kms/store';
import { MerkleTreeType } from '../../src/storage/entities/mt';
import { IDataStorage } from '../../src/storage/interfaces/data-storage';
import { InMemoryCredentialStorage, InMemoryIdentityStorage } from '../../src/storage/memory';
import { InMemoryMerkleTreeStorage } from '../../src/storage/memory/merkletree';

describe('identity', () => {
  it('createIdentity', async () => {
    const memoryKeyStore = new InMemoryPrivateKeyStore();
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, memoryKeyStore);
    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);

    const dataStorage: IDataStorage = {
      credential: new InMemoryCredentialStorage(),
      identity: new InMemoryIdentityStorage(),
      mt: new InMemoryMerkleTreeStorage(40)
    };
    const wallet = new IdentityWallet(kms, dataStorage);
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity(seedPhrase, 'http://metamask.com/');
    expect(did.toString()).toBe(
      'did:iden3:polygon:mumbai:x5FK8BRpdZTCDp2v4g8jMugssmjUq4eL7oJtBXC1J'
    );
    const dbCred = await dataStorage.credential.findCredentialById(credential.id);
    expect(credential).toBe(dbCred);

    const claimsTree = await dataStorage.mt.getMerkleTreeByIdentifierAndType(
      did.toString(),
      MerkleTreeType.Claims
    );

    expect( claimsTree.root.bigInt()).not.toBe(0);

  });
  it('createProfile', async () => {
    const memoryKeyStore = new InMemoryPrivateKeyStore();
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, memoryKeyStore);
    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);

    const dataStorage: IDataStorage = {
      credential: new InMemoryCredentialStorage(),
      identity: new InMemoryIdentityStorage(),
      mt: new InMemoryMerkleTreeStorage(40)
    };
    const wallet = new IdentityWallet(kms, dataStorage);
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity(seedPhrase, 'http://metamask.com/');
    expect(did.toString()).toBe(
      'did:iden3:polygon:mumbai:x5FK8BRpdZTCDp2v4g8jMugssmjUq4eL7oJtBXC1J'
    );
      
    const profileDID = await wallet.createProfile(did, 10, 'http://polygonissuer.com/');
    expect(profileDID.toString()).toBe(
      'did:iden3:polygon:mumbai:x6eHDnzugJTh4jF31rJVvr151tgr8YzPpLmYy5Yy4'
    );
      
    const dbProfile = await dataStorage.identity.getProfileByVerifier('http://polygonissuer.com/');
    expect(dbProfile.id).toBe(profileDID.toString());
    expect(dbProfile.genesisIdentifier).toBe(profileDID.toString());
    expect(dbProfile.nonce).toBe(10);

  });
  it('sign', async () => {
    const memoryKeyStore = new InMemoryPrivateKeyStore();
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, memoryKeyStore);
    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);

    const dataStorage: IDataStorage = {
      credential: new InMemoryCredentialStorage(),
      identity: new InMemoryIdentityStorage(),
      mt: new InMemoryMerkleTreeStorage(40)
    };
    const wallet = new IdentityWallet(kms, dataStorage);
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity(seedPhrase, 'http://metamask.com/');
    expect(did.toString()).toBe(
      'did:iden3:polygon:mumbai:x5FK8BRpdZTCDp2v4g8jMugssmjUq4eL7oJtBXC1J'
    );
    
    var enc = new TextEncoder(); // always utf-8

    const message = enc.encode("payload");
    await wallet.sign(message,credential)

  });
});
