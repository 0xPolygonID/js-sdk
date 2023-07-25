import { expect } from 'chai';
import { getChainId, registerChainId } from '../../src';

describe('get already registred chain id', () => {
  it('try to get already registred by methodId', async () => {
    expect(getChainId('ethr')).to.be.equal(1);
  });
  it('try to get already registred by methodId and blockchain', async () => {
    expect(getChainId('ethr', 'eth')).to.be.equal(1);
  });
  it('try to get already registred by methodId, blockchain and network', async () => {
    expect(getChainId('ethr', 'eth', 'main')).to.be.equal(1);
  });
  it('try to get already registred by methodId, blockchain and network', async () => {
    expect(getChainId('ethr', 'eth', 'goerli')).to.be.equal(5);
  });
});

describe('try to regist custom chains', () => {
  it('registrt only method', async () => {
    registerChainId('ukr', 20);
    expect(getChainId('ukr')).to.be.equal(20);
  });
  it('registrt method and blockchain', async () => {
    registerChainId('ukr', 21, 'block');
    expect(getChainId('ukr', 'block')).to.be.equal(21);
  });
  it('registrt method, blockchain and network', async () => {
    registerChainId('ukr', 22, 'block', 'main');
    expect(getChainId('ukr', 'block', 'main')).to.be.equal(22);
  });
});

describe('try to get non registred chain id', () => {
  it('try to get non registred by methodId', async () => {
    expect(() => {
      getChainId('ukr');
    }).to.be.throw('chainId not found for ukr');
  });
});
