import { expect } from 'chai';
import {
  AbstractPrivateKeyStore,
  InMemoryPrivateKeyStore,
  KmsKeyType,
  Sec256k1Provider,
  Ed25519Provider,
  IKeyProvider,
  bytesToHex,
  BjjProvider
} from '../../src';
import { getRandomBytes } from '@iden3/js-crypto';
import { BytesHelper, Constants } from '@iden3/js-iden3-core';

const testFlow = async (provider: IKeyProvider) => {
  const seed1 = getRandomBytes(32);
  const seed2 = getRandomBytes(32);
  expect(seed1).to.not.deep.equal(seed2);
  let dataToSign1 = getRandomBytes(32);
  let dataToSign2 = getRandomBytes(32);
  if (provider instanceof BjjProvider) {
    // because challange should be in the finite field of Constant.Q
    dataToSign1 = BytesHelper.intToBytes(Constants.Q - 1n);
    dataToSign2 = BytesHelper.intToBytes(Constants.Q - 100n);
  }
  const [keyId1, keyId2, keyId3] = await Promise.all([
    provider.newPrivateKeyFromSeed(seed1),
    provider.newPrivateKeyFromSeed(seed2),
    provider.newPrivateKeyFromSeed(seed1)
  ]);
  const [signature1, signature2, signature3] = await Promise.all([
    provider.sign(keyId1, dataToSign1),
    provider.sign(keyId2, dataToSign2),
    provider.sign(keyId3, dataToSign1)
  ]);
  const [isPublicKey1Valid, isPublicKey2Valid, isPublicKey3Valid] = await Promise.all([
    provider.verify(dataToSign1, bytesToHex(signature1), keyId1),
    provider.verify(dataToSign2, bytesToHex(signature2), keyId2),
    provider.verify(dataToSign1, bytesToHex(signature3), keyId3)
  ]);
  expect(signature1).to.not.deep.equal(signature2);
  expect(signature1).to.deep.equal(signature3);
  expect(isPublicKey1Valid).to.be.true;
  expect(isPublicKey2Valid).to.be.true;
  expect(isPublicKey3Valid).to.be.true;
};

describe('Key store providers', () => {
  it('should signatures be valid and equal for the same data and private key', async () => {
    const keyStore: AbstractPrivateKeyStore = new InMemoryPrivateKeyStore();
    const ed25519Provider = new Ed25519Provider(KmsKeyType.Ed25519, keyStore);
    const secp256k1Provider = new Sec256k1Provider(KmsKeyType.Secp256k1, keyStore);
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, keyStore);
    await Promise.all([
      testFlow(bjjProvider),
      testFlow(ed25519Provider),
      testFlow(secp256k1Provider)
    ]);
  });
});
