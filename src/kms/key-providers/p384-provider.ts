import { IKeyProvider } from '../kms';
import { AbstractPrivateKeyStore, KmsKeyId, KmsKeyType } from '../store';
import * as providerHelpers from '../provider-helpers';
import { p384 } from '@noble/curves/p384';
import { bytesToHex } from '../../utils';

/**
 * Provider for P384  keys
 * @public
 * @class P384 Provider
 * @implements IKeyProvider interface
 */
export class P384Provider implements IKeyProvider {
  readonly keyType: KmsKeyType = KmsKeyType.P384;
  /**
   * Creates an instance of P384 Provider.
   * @param {AbstractPrivateKeyStore} keyStore - key store for kms
   */
  constructor(private readonly _keyStore: AbstractPrivateKeyStore) {}

  /**
   * get all keys
   * @returns list of keys
   */
  async list(): Promise<
    {
      alias: string;
      key: string;
    }[]
  > {
    const allKeysFromKeyStore = await this._keyStore.list();
    return allKeysFromKeyStore.filter((key) => key.alias.startsWith(this.keyType));
  }

  /**
   * get private key store
   *
   * @returns private key store
   */
  async getPkStore(): Promise<AbstractPrivateKeyStore> {
    return this._keyStore;
  }

  /**
   * generates a p384  key from a seed phrase
   * @param {Uint8Array} seed - byte array seed
   * @returns {Promise<KmsKeyId>} kms key identifier
   */
  async newPrivateKeyFromSeed(seed: Uint8Array): Promise<KmsKeyId> {
    if (seed.length !== 48) {
      throw new Error('Seed should be 48 bytes');
    }

    const publicKey = p384.getPublicKey(seed);
    const kmsId = {
      type: this.keyType,
      id: providerHelpers.keyPath(this.keyType, bytesToHex(publicKey))
    };

    await this._keyStore.importKey({
      alias: kmsId.id,
      key: bytesToHex(seed)
    });

    return kmsId;
  }

  async newPrivateKey(): Promise<KmsKeyId> {
    const seed = globalThis.crypto.getRandomValues(new Uint8Array(48));
    return this.newPrivateKeyFromSeed(seed);
  }

  /**
   * Gets public key by kmsKeyId
   * @param {KmsKeyId} keyId - key identifier
   * @returns {Promise<string>} Public key as a hex string
   */
  async publicKey(keyId: KmsKeyId): Promise<string> {
    const privateKeyHex = await this.privateKey(keyId);
    const publicKey = p384.getPublicKey(privateKeyHex);
    return bytesToHex(publicKey);
  }

  /**
   * signs prepared payload of size,
   * with a key id
   * @param {KmsKeyId} keyId  - key identifier
   * @param {Uint8Array} digest - data to sign (32 bytes)
   * @returns {Promise<Uint8Array>} signature
   */
  async sign(keyId: KmsKeyId, digest: Uint8Array): Promise<Uint8Array> {
    const privateKeyHex = await this.privateKey(keyId);
    const signature = p384.sign(digest, privateKeyHex);
    return signature.toCompactRawBytes();
  }

  /**
   * Verifies a signature for the given message and key identifier.
   * @param digest - The message to verify the signature against.
   * @param signatureHex - The signature to verify, as a hexadecimal string.
   * @param keyId - The key identifier to use for verification.
   * @returns A Promise that resolves to a boolean indicating whether the signature is valid.
   */
  async verify(digest: Uint8Array, signatureHex: string, keyId: KmsKeyId): Promise<boolean> {
    const publicKeyHex = await this.publicKey(keyId);
    return p384.verify(signatureHex, digest, publicKeyHex);
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
