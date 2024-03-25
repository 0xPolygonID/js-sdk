import { expect } from 'chai';
import {
  AbstractPrivateKeyStore,
  InMemoryPrivateKeyStore,
  KmsKeyType,
  Sec256k1Provider,
  Ed25519Provider
} from '../../src';
import { getRandomBytes } from '@iden3/js-crypto';
import { ed25519 } from '@noble/curves/ed25519';

describe('secp256k1 KMS', () => {
  it('should sec256k1 signatures be equal for the same data and private key', async () => {
    const keyStore: AbstractPrivateKeyStore = new InMemoryPrivateKeyStore();
    const secp256k1 = new Sec256k1Provider(KmsKeyType.Secp256k1, keyStore);
    const seed = getRandomBytes(32);
    const dataToSign = getRandomBytes(32);
    const [keyId1, keyId2] = await Promise.all([
      secp256k1.newPrivateKeyFromSeed(seed),
      secp256k1.newPrivateKeyFromSeed(seed)
    ]);
    const [signature1, signature2] = await Promise.all([
      secp256k1.sign(keyId1, dataToSign),
      secp256k1.sign(keyId2, dataToSign)
    ]);
    expect(signature1).to.deep.equal(signature2);
  });
});

describe('ed25519 KMS', () => {
  it('should ed25519 signatures be valid and equal for the same data and private key', async () => {
    const keyStore: AbstractPrivateKeyStore = new InMemoryPrivateKeyStore();
    const ed25519Provider = new Ed25519Provider(KmsKeyType.Ed25519, keyStore);
    const seed = getRandomBytes(32);
    const dataToSign = getRandomBytes(32);
    const [keyId1, keyId2] = await Promise.all([
      ed25519Provider.newPrivateKeyFromSeed(seed),
      ed25519Provider.newPrivateKeyFromSeed(seed)
    ]);
    const [signature1, signature2] = await Promise.all([
      ed25519Provider.sign(keyId1, dataToSign),
      ed25519Provider.sign(keyId2, dataToSign)
    ]);
    const publicKey1 = await ed25519Provider.publicKey(keyId1);
    const isPublicKey1Valid = await ed25519.verify(signature1, dataToSign, publicKey1);
    expect(signature1).to.deep.equal(signature2);
    expect(isPublicKey1Valid).to.be.true;
  });
});
