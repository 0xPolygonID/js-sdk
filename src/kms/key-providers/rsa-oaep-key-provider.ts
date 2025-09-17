import { IKeyProvider } from '../kms';
import { KmsKeyId, KmsKeyType } from '../store/types';
import { AbstractPrivateKeyStore } from '../store/abstract-key-store';
import { byteEncoder } from '../../utils';
import * as providerHelpers from '../provider-helpers';
import { ethers } from 'ethers';
const { subtle } = globalThis.crypto;

const defaultParams: RsaHashedKeyGenParams = {
  name: 'RSA-OAEP',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]), // 65537
  hash: 'SHA-256'
};

export const defaultRSAOaepKmsIdPathGeneratingFunction = (publicKey: JsonWebKey) => {
  const pathBytes = byteEncoder.encode((publicKey.n as string) + (publicKey.e as string));
  return ethers.keccak256(pathBytes);
};

export class RsaOAEPKeyProvider implements IKeyProvider {
  private readonly _capabilities: KeyUsage[] = ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey'];

  keyType: KmsKeyType = KmsKeyType.RsaOaep256;

  constructor(
    private readonly _keyStore: AbstractPrivateKeyStore,
    private readonly _params: RsaHashedKeyGenParams = defaultParams,
    private readonly _kmsIdPathGeneratingFunction: (
      publicKey: JsonWebKey
    ) => string = defaultRSAOaepKmsIdPathGeneratingFunction
  ) {}

  /**
   * get private key store
   *
   * @returns private key store
   */
  async getPkStore(): Promise<AbstractPrivateKeyStore> {
    return this._keyStore;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async newPrivateKeyFromSeed(seed: Uint8Array): Promise<KmsKeyId> {
    throw new Error('Not implemented for RSA OAEP, use newPrivateKey instead');
  }

  async newPrivateKey(): Promise<KmsKeyId> {
    const keyPair = (await subtle.generateKey(
      this._params as AlgorithmIdentifier,
      true,
      this._capabilities
    )) as CryptoKeyPair;

    // Export the private key as JWK
    const jwk = await subtle.exportKey('jwk', keyPair.privateKey);

    const publicKey = await this.publicKeyFromPrivateKey(jwk);

    const kmsId = {
      type: this.keyType,
      id: providerHelpers.keyPath(this.keyType, this._kmsIdPathGeneratingFunction(publicKey))
    };

    await this._keyStore.importKey({
      alias: kmsId.id,
      key: JSON.stringify(jwk)
    });

    return kmsId;
  }

  async publicKey(keyId: KmsKeyId): Promise<string> {
    const privateKey = await this._keyStore.get({ alias: keyId.id });
    const privateKeyJwk = JSON.parse(privateKey);
    // Extract only the public components from the private key
    const publicKey = {
      kty: privateKeyJwk.kty, // Key type (RSA)
      n: privateKeyJwk.n, // Modulus component
      e: privateKeyJwk.e, // Exponent
      alg: 'RSA-OAEP-256', // Algorithm
      ext: true
    };

    return Promise.resolve(JSON.stringify(publicKey));
  }

  async publicKeyFromPrivateKey(privateKey: JsonWebKey): Promise<JsonWebKey> {
    const publicKey = {
      kty: privateKey.kty,
      n: privateKey.n,
      e: privateKey.e,
      alg: privateKey.alg,
      ext: true
    };

    return publicKey;
  }

  list(): Promise<{ alias: string; key: string }[]> {
    return this._keyStore.list();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sign(keyId: KmsKeyId, data: Uint8Array): Promise<Uint8Array> {
    throw new Error('Sign is not supported by RSA OAEP');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async verify(message: Uint8Array, signatureHex: string, keyId: KmsKeyId): Promise<boolean> {
    throw new Error('Signature verification is not supported by RSA OAEP');
  }
}
