import { expect } from 'chai';
import {
  getChainId,
  registerChainId,
  registerDefaultNetworkForMethodId,
  getChainIdByDIDsParts
} from '../../src';

describe('try to get already registered', () => {
  it('get by blockchain', async () => {
    expect(getChainId('eth')).to.be.equal(1);
  });
  it('get by blockchain and network', async () => {
    expect(getChainId('polygon', 'mumbai')).to.be.equal(80001);
  });
});

describe('get chainId by did parts', () => {
  it('register default chaiId', async () => {
    registerDefaultNetworkForMethodId('testMethodId', 12);
  });
  it('register blockchain', async () => {
    registerChainId('testChain', 13, 'testNetwork');
  });
  it('get default chainId by method did', () => {
    expect(getChainIdByDIDsParts('testMethodId')).to.be.equal(12);
  });
  it('get chaiId by chainId and network', () => {
    expect(getChainIdByDIDsParts('testMethodIds', 'testChain', 'testNetwork')).to.be.equal(13);
  });
});

describe('try to get non registered chain id', () => {
  it('try to get non registered by blockchain', async () => {
    expect(() => {
      getChainId('testChain2');
    }).to.be.throw('chainId not found for testChain2');
  });
});
