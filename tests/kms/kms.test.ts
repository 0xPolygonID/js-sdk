import { expect } from 'chai';
import {
  AbstractPrivateKeyStore,
  InMemoryPrivateKeyStore,
  KmsKeyType,
  Sec256k1Provider,
  Ed25519Provider,
  IKeyProvider,
  bytesToHex,
  BjjProvider,
  Sec256k2Provider
} from '../../src';
import { getRandomBytes } from '@iden3/js-crypto';
import { checkBigIntInField, BytesHelper } from '@iden3/js-iden3-core';

const testFlow = async (provider: IKeyProvider) => {
  const seed1 = getRandomBytes(32);
  const seed2 = getRandomBytes(32);
  expect(seed1).to.not.deep.equal(seed2);
  const dataToSign1 = getRandomBytes(32);
  const dataToSign2 = getRandomBytes(32);
  if (provider instanceof BjjProvider) {
    if (!checkBigIntInField(BytesHelper.bytesToInt(seed1))) {
      dataToSign1.set(new Uint8Array(16), 16);
      dataToSign2.set(new Uint8Array(16), 16);
    }
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

  it.skip('should fail to verify with wrong public key', async () => {
    const keyStore: AbstractPrivateKeyStore = new InMemoryPrivateKeyStore();

    const secp256k1Provider = new Sec256k1Provider(KmsKeyType.Secp256k1, keyStore);
    const secp256k2Provider = new Sec256k2Provider(KmsKeyType.Secp256k1, keyStore);
    const seed1 = new Uint8Array([
      81, 238, 246, 232, 216, 196, 154, 217, 213, 61, 101, 152, 98, 114, 212, 1, 163, 204, 186, 14,
      17, 69, 201, 157, 63, 168, 0, 120, 164, 130, 253, 156
    ]);

    const data = new Uint8Array([
      88, 25, 174, 24, 47, 161, 52, 187, 216, 36, 30, 241, 31, 7, 130, 31, 116, 85, 79, 16, 40, 44,
      138, 39, 177, 11, 161, 139, 34, 156, 157, 106
    ]);

    const [keyId1, keyId2] = await Promise.all([
      secp256k1Provider.newPrivateKeyFromSeed(seed1),
      secp256k2Provider.newPrivateKeyFromSeed(seed1)
    ]);

    const [signature1, signature2] = await Promise.all([
      secp256k1Provider.sign(keyId1, data),
      secp256k2Provider.sign(keyId2, data)
    ]);

    expect(signature1).to.deep.equal(signature2);
  });
});
