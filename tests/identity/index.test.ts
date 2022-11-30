import { IdentityWallet } from '../../src';

describe('identity', () => {
  it('create identity', async () => {
    const wallet = new IdentityWallet();
    await wallet.createIdentity(Uint8Array.from([1]));
    expect(true).toBeTruthy();
  });
});
