import { expect } from 'chai';
import { getChainId, registerChainId } from '../../src';

describe('on chain', () => {
  it('try to add new chain id', async () => {
    registerChainId('ukr', 'main', 20);
  });
  it('try to get new chain id', async () => {
    expect(getChainId('ukr', 'main')).to.be.equal(20);
  });
});
