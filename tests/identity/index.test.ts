import { IdentityWallet } from '../../src';

describe('identity', () => {
  it('create identity', async () => {
    const wallet = new IdentityWallet();
    const {identifier, credential} = await wallet.createIdentity(Uint8Array.from([1]));
    console.log(identifier, credential);
    expect(true).toBeTruthy();
  });
});
