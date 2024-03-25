import { IKeyProvider } from '../kms';
import { AbstractPrivateKeyStore, KmsKeyId, KmsKeyType } from '../store';
import * as providerHelpers from '../provider-helpers';
import { getPublicKey, sign, verify } from 'noble-ed25519';
/**
 * Provider for Ed25519 keys
 * @public
 * @class Ed25519Provider
 * @implements implements IKeyProvider interface
 */
export class Ed25519Provider implements IKeyProvider {
  /**
   * key type that is handled by Ed25519Provider
   * @type {KmsKeyType}
   */
  keyType: KmsKeyType;
  private _keyStore: AbstractPrivateKeyStore;
  /**
   * Creates an instance of Ed25519Provider.
   * @param {KmsKeyType} keyType - kms key type
   * @param {AbstractPrivateKeyStore} keyStore - key store for kms
   */
  constructor(keyType: KmsKeyType, keyStore: AbstractPrivateKeyStore) {
    this.keyType = keyType;
    this._keyStore = keyStore;
  }
  /**
   * generates a ed25519 key from a seed phrase
   * @param {Uint8Array} seed - byte array seed
   * @returns kms key identifier
   */
  async newPrivateKeyFromSeed(seed: Uint8Array): Promise<KmsKeyId> {
    if (seed.length !== 32) {
      throw new Error('Seed should be 32 bytes');
    }

    const privateKey = seed;
    const publicKey = await getPublicKey(privateKey);
    const kmsId = {
      type: this.keyType,
      id: providerHelpers.keyPath(this.keyType, Buffer.from(publicKey).toString('hex'))
    };
    await this._keyStore.importKey({
      alias: kmsId.id,
      key: Buffer.from(privateKey).toString('hex')
    });

    return kmsId;
  }

  /**
   * Gets public key by kmsKeyId
   *
   * @param {KmsKeyId} keyId - key identifier
   */
  async publicKey(keyId: KmsKeyId): Promise<string> {
    const privateKeyHex = await this.privateKey(keyId);
    return getPublicKey(privateKeyHex);
  }

  /**
   * signs prepared payload of size,
   * with a key id
   *
   * @param {KmsKeyId} keyId  - key identifier
   * @param {Uint8Array} data - data to sign (32 bytes)
   * @returns Uint8Array signature
   */
  async sign(keyId: KmsKeyId, data: Uint8Array): Promise<Uint8Array> {
    const privateKeyHex = await this.privateKey(keyId);
    const publicKeyHex = await getPublicKey(privateKeyHex);
    const signature = await sign(data, privateKeyHex);
    const isValid = await verify(signature, data, publicKeyHex);
    if (!isValid) {
      throw new Error('Signature is invalid');
    }
    return signature;
  }

  private async privateKey(keyId: KmsKeyId): Promise<string> {
    return this._keyStore.get({ alias: keyId.id });
  }
}
