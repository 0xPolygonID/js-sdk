import { IKeyProvider } from '../kms';
import { AbstractPrivateKeyStore, KmsKeyId, KmsKeyType } from '../store';
import * as providerHelpers from '../provider-helpers';
import { ed25519 } from '@noble/curves/ed25519';

/**
 * Provider for Ed25519 keys
 * @public
 * @class Ed25519Provider
 * @implements IKeyProvider interface
 */
export class Ed25519Provider implements IKeyProvider {
  /**
   * Creates an instance of Ed25519Provider.
   * @param {KmsKeyType} keyType - kms key type
   * @param {AbstractPrivateKeyStore} keyStore - key store for kms
   */
  constructor(
    public readonly keyType: KmsKeyType,
    private readonly _keyStore: AbstractPrivateKeyStore
  ) {}

  /**
   * generates a ed25519 key from a seed phrase
   * @param {Uint8Array} seed - byte array seed
   * @returns {Promise<KmsKeyId>} kms key identifier
   */
  async newPrivateKeyFromSeed(seed: Uint8Array): Promise<KmsKeyId> {
    if (seed.length !== 32) {
      throw new Error('Seed should be 32 bytes');
    }

    const publicKey = ed25519.getPublicKey(seed);
    const kmsId = {
      type: this.keyType,
      id: providerHelpers.keyPath(this.keyType, Buffer.from(publicKey).toString('hex'))
    };

    await this._keyStore.importKey({
      alias: kmsId.id,
      key: Buffer.from(seed).toString('hex')
    });

    return kmsId;
  }

  /**
   * Gets public key by kmsKeyId
   * @param {KmsKeyId} keyId - key identifier
   * @returns {Promise<string>} Public key as a hex string
   */
  async publicKey(keyId: KmsKeyId): Promise<string> {
    const privateKeyHex = await this.privateKey(keyId);
    const privateKey = Buffer.from(privateKeyHex, 'hex');
    const publicKey = ed25519.getPublicKey(privateKey);
    return Buffer.from(publicKey).toString('hex');
  }

  /**
   * signs prepared payload of size,
   * with a key id
   * @param {KmsKeyId} keyId  - key identifier
   * @param {Uint8Array} data - data to sign (32 bytes)
   * @returns {Promise<Uint8Array>} signature
   */
  async sign(keyId: KmsKeyId, data: Uint8Array): Promise<Uint8Array> {
    const privateKeyHex = await this.privateKey(keyId);
    const privateKey = Buffer.from(privateKeyHex, 'hex');
    const signature = await ed25519.sign(data, privateKey);
    const publicKey = ed25519.getPublicKey(privateKey);
    const isValid = await ed25519.verify(signature, data, publicKey);
    if (!isValid) {
      throw new Error('Signature is invalid');
    }
    return signature;
  }

  /**
   * Retrieves the private key for a given keyId from the key store.
   * @param {KmsKeyId} keyId - The identifier of the key to retrieve.
   * @returns {Promise<string>} The private key associated with the keyId.
   */
  private async privateKey(keyId: KmsKeyId): Promise<string> {
    return this._keyStore.get({ alias: keyId.id });
  }
}
