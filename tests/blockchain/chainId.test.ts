import { expect } from 'chai';
import {
  getChainId,
  registerChainId,
  registerDefaultNetworkForMethodId,
  getChainIdByDIDsParts
} from '../../src';

describe('try to get already registred', () => {
  it('get by blokchain', async () => {
    registerDefaultNetworkForMethodId('eth', 1);
  });
  it('get by blokchain and network', async () => {
    registerDefaultNetworkForMethodId('polygon:mumbai', 80001);
  });
});

describe('get chainId by did parts', () => {
  it('register default chaiId', async () => {
    registerDefaultNetworkForMethodId('dima', 12);
  });
  it('register blockchain', async () => {
    registerChainId('kolez', 13, 'zagreb');
  });
  it('get default chainId by method did', () => {
    expect(getChainIdByDIDsParts('dima')).to.be.equal(12);
  });
  it('get chaiId by chainId and network', () => {
    expect(getChainIdByDIDsParts('dima', 'kolez', 'zagreb')).to.be.equal(13);
  });
});

describe('try to get non registred chain id', () => {
  it('try to get non registred by methodId', async () => {
    expect(() => {
      getChainId('ukr');
    }).to.be.throw('chainId not found for ukr');
  });
});
