import { describe, expect, it } from 'vitest';
import {
  AbstractPrivateKeyStore,
  InMemoryPrivateKeyStore,
  KmsKeyType,
  Sec256k1Provider,
  Ed25519Provider,
  IKeyProvider,
  bytesToHex,
  BjjProvider,
  LitProtocolProvider,
  KMS,
  hexToBytes
} from '../../src';
import { getRandomBytes } from '@iden3/js-crypto';
import { BytesHelper, Constants } from '@iden3/js-iden3-core';
import * as ethers5 from 'ethers5';
import path from 'path';
import { getTestWallet, loadWalletsFromFile } from '../helpers';
import { LIT_NETWORK, LIT_RPC } from '@lit-protocol/constants';

const testFlow = async (provider: IKeyProvider) => {
  const seed1 = getRandomBytes(32);
  const seed2 = getRandomBytes(32);
  expect(seed1).to.not.deep.equal(seed2);
  let dataToSign1 = getRandomBytes(32);
  let dataToSign2 = getRandomBytes(32);
  if (provider instanceof BjjProvider) {
    // because challenge should be in the finite field of Constant.Q
    dataToSign1 = BytesHelper.intToBytes(Constants.Q - 1n);
    dataToSign2 = BytesHelper.intToBytes(Constants.Q - 100n);
  }
  const [keyId1, keyId2, keyId3] = await Promise.all([
    provider.newPrivateKeyFromSeed(seed1),
    provider.newPrivateKeyFromSeed(seed2),
    provider.newPrivateKeyFromSeed(seed1)
  ]);

  const providerKeys = await provider.list();
  expect(providerKeys.length).to.equal(2);
  expect(providerKeys[0].alias).to.include(provider.keyType);
  expect(providerKeys[1].alias).to.include(provider.keyType);

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
    const allKeys = await keyStore.list();
    expect(allKeys.length).to.equal(6);
  });
});

// For remote providers, we test them separately
// as they may require network access and have different setup steps
describe('Lit Protocol provider', () => {
  const WALLET_FILE_PATH = path.join(__dirname, 'data', 'lit-test-wallets.json');

  const testWallets = loadWalletsFromFile(WALLET_FILE_PATH);

  it('should generate valid PKP and sign message using Lit Network', async () => {
    const keyStore: AbstractPrivateKeyStore = new InMemoryPrivateKeyStore();
    const litProvider: LitProtocolProvider = new LitProtocolProvider(
      KmsKeyType.LitProtocolPKP,
      LIT_NETWORK.DatilDev,
      keyStore
    );
    const wallet1 = getTestWallet(testWallets, 0);
    const wallet2 = getTestWallet(testWallets, 1);
    const agentKms: KMS = new KMS();
    agentKms.registerKeyProvider(KmsKeyType.LitProtocolPKP, litProvider);

    const auxAgentKms: KMS = new KMS();
    const auxKeyStore: AbstractPrivateKeyStore = new InMemoryPrivateKeyStore();
    const auxLitProvider: LitProtocolProvider = new LitProtocolProvider(
      KmsKeyType.LitProtocolPKP,
      LIT_NETWORK.DatilDev,
      auxKeyStore
    );
    auxAgentKms.registerKeyProvider(KmsKeyType.LitProtocolPKP, auxLitProvider);

    // Can't run using Promise due to nonce
    const keyId1 = await agentKms.createKeyFromSeed(
      KmsKeyType.LitProtocolPKP,
      hexToBytes(wallet1.privateKey)
    );
    const keyId2 = await agentKms.createKeyFromSeed(
      KmsKeyType.LitProtocolPKP,
      hexToBytes(wallet2.privateKey)
    );
    const keyId3 = await agentKms.createKeyFromSeed(
      KmsKeyType.LitProtocolPKP,
      hexToBytes(wallet1.privateKey)
    );

    const publicKey3 = await agentKms.publicKey(keyId3);
    const keyId4 = await auxAgentKms.createKeyFromSeed(
      KmsKeyType.LitProtocolPKP,
      hexToBytes(publicKey3)
    );

    const [publicKey1, publicKey2, publicKey4] = await Promise.all([
      agentKms.publicKey(keyId1),
      agentKms.publicKey(keyId2),
      auxAgentKms.publicKey(keyId4)
    ]);

    expect(publicKey1).to.not.deep.equal(publicKey2);
    expect(publicKey1).to.not.deep.equal(publicKey3);
    expect(publicKey2).to.not.deep.equal(publicKey3);
    expect(publicKey4).to.deep.equal(publicKey3);

    const message = 'hello';
    const bytes_message = ethers5.utils.toUtf8Bytes(message);

    const [signature1, signature2, signature3] = await Promise.all([
      agentKms.sign(keyId1, bytes_message, { seed: hexToBytes(wallet1.privateKey) }),
      agentKms.sign(keyId2, bytes_message, { seed: hexToBytes(wallet2.privateKey) }),
      agentKms.sign(keyId3, bytes_message, { seed: hexToBytes(wallet1.privateKey) })
    ]);

    const signature4 = await auxAgentKms.sign(keyId4, bytes_message, {
      seed: hexToBytes(wallet1.privateKey)
    });

    expect(signature1).to.not.deep.equal(signature2);
    expect(signature2).to.not.deep.equal(signature3);
    expect(signature1).to.not.deep.equal(signature3);
    expect(signature4).to.not.deep.equal(signature1);

    const [isPublicKey1Valid, isPublicKey2Valid, isPublicKey3Valid, isPublicKey4Valid] =
      await Promise.all([
        agentKms.verify(bytes_message, ethers5.utils.hexlify(signature1), keyId1),
        agentKms.verify(bytes_message, ethers5.utils.hexlify(signature2), keyId2),
        agentKms.verify(bytes_message, ethers5.utils.hexlify(signature3), keyId3),
        auxAgentKms.verify(bytes_message, ethers5.utils.hexlify(signature4), keyId4)
      ]);

    expect(isPublicKey1Valid).to.be.true;
    expect(isPublicKey2Valid).to.be.true;
    expect(isPublicKey3Valid).to.be.true;
    expect(isPublicKey4Valid).to.be.true;
  });
});
