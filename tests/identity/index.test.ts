import { IdentityWallet } from '../../src';

describe('identity', () => {
  it('create identity', async () => {
    const wallet = new IdentityWallet();
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseedseed');

    const {did, credential} = await wallet.createIdentity(seedPhrase,"http://metamask.com/");
    console.log(did, credential);
    expect(did.toString()).toBe("did:iden3:polygon:mumbai:x5FK8BRpdZTCDp2v4g8jMugssmjUq4eL7oJtBXC1J")

  });
});
