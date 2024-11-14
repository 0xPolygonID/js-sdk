import { expect } from 'chai';
import { DidResolverStateReadonlyStorage, IStateStorage } from '../../src';
import { DID } from '@iden3/js-iden3-core';
import { Hash } from '@iden3/js-merkletree';

describe.skip('resolver readonly storage', () => {
  let stateStorage: IStateStorage;
  const did = DID.parse('did:polygonid:polygon:amoy:2qV7YACbSYpvuXySSqhBd6E4XAxzLE5kYmPqwxuvwD');
  const id = DID.idFromDID(did);
  beforeEach(async () => {
    stateStorage = new DidResolverStateReadonlyStorage('http://127.0.0.1:8080');
  });

  it('getLatestStateById', async () => {
    const latestState = await stateStorage.getLatestStateById(id.bigInt());
    expect(latestState).to.be.an('object');
    expect(latestState).to.have.property('id');
  });

  it('getStateInfoByIdAndState', async () => {
    const state = Hash.fromHex('f71ed95c0cf6a6b2a5ee867acfa0244d90be5bbe08b7805ed0766c7676dae521');
    const info = await stateStorage.getStateInfoByIdAndState(id.bigInt(), state.bigInt());
    expect(info).to.be.an('object');
    expect(info).to.have.property('id');
  });

  it('getGISTProof', async () => {
    const proof = await stateStorage.getGISTProof(id.bigInt());
    expect(proof).to.be.an('object');
    expect(proof).to.have.property('root');
  });

  it('getGISTRootInfo', async () => {
    const root = Hash.fromHex('44f40dd34c5b840ef1c55e3805febef589069dab35f8684857ba118778826d1b');
    const rootInfo = await stateStorage.getGISTRootInfo(root.bigInt(), id.bigInt());
    expect(rootInfo).to.be.an('object');
    expect(rootInfo).to.have.property('root');
  });
});
