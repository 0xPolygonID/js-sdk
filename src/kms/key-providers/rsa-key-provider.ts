import { IKeyProvider } from '../kms';
import { KmsKeyId, KmsKeyType } from '../store/types';
import { AbstractPrivateKeyStore } from '../store/abstract-key-store';
import { byteDecoder, hexToBytes } from '../../utils';
import * as providerHelpers from '../provider-helpers';
const { subtle } = globalThis.crypto;

export class RsaKeyProvider implements IKeyProvider {
  private readonly _capabilities: KeyUsage[] = ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey'];

  private readonly _params = {
    name: 'RSA-OAEP',
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]), // 65537
    hash: 'SHA-256'
  };

  keyType: KmsKeyType = KmsKeyType.RsaOaep256;

  constructor(private readonly _keyStore: AbstractPrivateKeyStore) {}

  /**
   * get private key store
   *
   * @returns private key store
   */
  async getPkStore(): Promise<AbstractPrivateKeyStore> {
    return this._keyStore;
  }

  async newPrivateKeyFromSeed(seed: Uint8Array): Promise<KmsKeyId> {
    // assume this is kid
    const seedHash = byteDecoder.decode(seed);

    const kmsId = {
      type: this.keyType,
      id: providerHelpers.keyPath(this.keyType, seedHash)
    };

    const keyPair = await subtle.generateKey(this._params, true, this._capabilities);

    // Export the private key as JWK
    const jwk = await subtle.exportKey('jwk', keyPair.privateKey);

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

  list(): Promise<{ alias: string; key: string }[]> {
    return this._keyStore.list();
  }

  async sign(keyId: KmsKeyId, data: Uint8Array): Promise<Uint8Array> {
    const privateKey = await this._keyStore.get({ alias: keyId.id });
    const privateKeyJwk = JSON.parse(privateKey);
    const signature = await globalThis.crypto.subtle.sign(
      {
        name: 'RSA-PSS',
        saltLength: 32
      },
      privateKeyJwk,
      data
    );
    return new Uint8Array(signature);
  }

  async verify(message: Uint8Array, signatureHex: string, keyId: KmsKeyId): Promise<boolean> {
    const publicKey = await this.publicKey(keyId);
    const publicKeyJwk = JSON.parse(publicKey);
    const signature = hexToBytes(signatureHex);
    const isValid = await globalThis.crypto.subtle.verify(
      {
        name: 'RSA-PSS',
        saltLength: 32
      },
      publicKeyJwk,
      signature,
      message
    );
    return isValid;
  }

  async generatePrivateKey(): Promise<JsonWebKey> {
    // Generate RSA key pair
    const keyPair = await subtle.generateKey(
      this._params,
      true, // extractable
      this._capabilities // usages
    );

    // Export the private key as JWK
    const jwk = await subtle.exportKey('jwk', keyPair.privateKey);
    return jwk;
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
}
