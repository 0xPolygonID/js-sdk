import { IKeyProvider } from '../kms';
import { AbstractPrivateKeyStore, KmsKeyId, KmsKeyType } from '../store';
import * as providerHelpers from '../provider-helpers';
import { bytesToHex } from '../../utils';
import { secp256k1 } from '@noble/curves/secp256k1';
import { sha256 } from '@iden3/js-crypto';

/**
 * Provider for Secp256k1
 * @public
 * @class Secp256k1Provider
 * @implements implements IKeyProvider interface
 */
export class Sec256k1Provider implements IKeyProvider {
  /**
   * key type that is handled by BJJ Provider
   * @type {KmsKeyType}
   */
  keyType: KmsKeyType;
  private _keyStore: AbstractPrivateKeyStore;

  /**
   * Creates an instance of BjjProvider.
   * @param {KmsKeyType} keyType - kms key type
   * @param {AbstractPrivateKeyStore} keyStore - key store for kms
   */
  constructor(keyType: KmsKeyType, keyStore: AbstractPrivateKeyStore) {
    if (keyType !== KmsKeyType.Secp256k1) {
      throw new Error('Key type must be Secp256k1');
    }
    this.keyType = keyType;
    this._keyStore = keyStore;
  }
  /**
   * generates a baby jub jub key from a seed phrase
   * @param {Uint8Array} seed - byte array seed
   * @returns kms key identifier
   */
  async newPrivateKeyFromSeed(seed: Uint8Array): Promise<KmsKeyId> {
    if (seed.length !== 32) {
      throw new Error('Seed should be 32 bytes');
    }
    const publicKey = secp256k1.getPublicKey(seed);
    const kmsId = {
      type: this.keyType,
      id: providerHelpers.keyPath(this.keyType, bytesToHex(publicKey))
    };

    await this._keyStore.importKey({
      alias: kmsId.id,
      key: bytesToHex(seed).padStart(64, '0')
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
    const publicKey = secp256k1.getPublicKey(privateKeyHex);
    return bytesToHex(publicKey);
  }

  /**
   * signs prepared payload of size,
   * with a key id
   *
   * @param {KmsKeyId} keyId  - key identifier
   * @param {Uint8Array} data - data to sign (32 bytes)
   * @returns Uint8Array signature
   */
  /**
   * signs prepared payload of size,
   * with a key id
   * @param {KmsKeyId} keyId  - key identifier
   * @param {Uint8Array} data - data to sign (32 bytes)
   * @returns {Promise<Uint8Array>} signature
   */
  async sign(keyId: KmsKeyId, data: Uint8Array): Promise<Uint8Array> {
    const privateKeyHex = await this.privateKey(keyId);
    const signature = secp256k1.sign(sha256(data), privateKeyHex);
    return signature.toCompactRawBytes();
  }

  /**
   * Verifies a signature for the given message and key identifier.
   * @param message - The message to verify the signature against.
   * @param signatureHex - The signature to verify, as a hexadecimal string.
   * @param keyId - The key identifier to use for verification.
   * @returns A Promise that resolves to a boolean indicating whether the signature is valid.
   */
  async verify(message: Uint8Array, signatureHex: string, keyId: KmsKeyId): Promise<boolean> {
    const publicKeyHex = await this.publicKey(keyId);
    return secp256k1.verify(signatureHex, sha256(message), publicKeyHex);
  }

  private async privateKey(keyId: KmsKeyId): Promise<string> {
    return this._keyStore.get({ alias: keyId.id });
  }
}
