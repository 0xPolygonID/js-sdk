import { IdentityWallet } from '../../src';
import { BjjProvider, KMS, KmsKeyType } from '../../src/identity/kms';
import { IDataStorage } from '../../src/storage/interfaces/data-storage';
import { InMemoryCredentialStorage, InMemoryIdentityStorage } from '../../src/storage/memory';
import { InMemoryMerkleTreeStorage } from '../../src/storage/memory/merkletree';

describe('identity', () => {
  it('createIdentity', async () => {

    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub);
    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);


    const dataStorage: IDataStorage = {
      credential: new InMemoryCredentialStorage(),
      identity: new InMemoryIdentityStorage(),
      mt:new InMemoryMerkleTreeStorage(40)
      

    }
    const wallet = new IdentityWallet(kms,dataStorage);
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity(seedPhrase, 'http://metamask.com/');
    console.log(did, credential);
    expect(did.toString()).toBe(
      'did:iden3:polygon:mumbai:x5FK8BRpdZTCDp2v4g8jMugssmjUq4eL7oJtBXC1J'
    );
  });
});
