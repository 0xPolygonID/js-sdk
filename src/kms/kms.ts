import { PublicKey } from '@iden3/js-crypto';
import { KmsKeyId, KmsKeyType } from './store';
export interface IKeyProvider {
  keyType: KmsKeyType;
  publicKey(keyID: KmsKeyId): Promise<PublicKey>;
  sign(keyId: KmsKeyId, data: Uint8Array): Promise<Uint8Array>;
  newPrivateKeyFromSeed(key: Uint8Array): Promise<KmsKeyId>;
}
/** 
 * Key management system class contains different key providers.
 * allows to register custom provider, create key, get public key and sign
 *
 *
 * @export
 * @class KMS
 */
export class KMS {
  private registry: {
    [keyType in KmsKeyType]: IKeyProvider;
  } = {
    BJJ: null,
    ETH: null
  };

  /**
   * register key provider in the KMS 
   *
   * @param {KmsKeyType} keyType - kms key type
   * @param {IKeyProvider} keyProvider - key provider implementation
   */
  registerKeyProvider(keyType: KmsKeyType, keyProvider: IKeyProvider): void {
    if (this.registry[keyType]) {
      throw new Error('present keyType');
    }
    this.registry[keyType] = keyProvider;
  }

  /**
   * generates a new key and returns it kms key id
   *
   * @param {KmsKeyType} keyType
   * @param {Uint8Array} bytes
   * @returns kms key id
   */
  async createKeyFromSeed(keyType: KmsKeyType, bytes: Uint8Array): Promise<KmsKeyId> {
    const keyProvider = this.registry[keyType];
    if (!keyProvider) {
      throw new Error(`keyProvider not found for: ${keyType}`);
    }
    return keyProvider.newPrivateKeyFromSeed(bytes);
  }

  /**
   * gets public key for key id
   *
   * @param {KmsKeyId} keyId -- key id
   * @returns public key
   */
  async publicKey(keyId: KmsKeyId): Promise<PublicKey> {
    const keyProvider = this.registry[keyId.type];
    if (!keyProvider) {
      throw new Error(`keyProvider not found for: ${keyId.type}`);
    }

    return keyProvider.publicKey(keyId);
  }

  /**
   * sign Uint8Array with giv KmsKeyIden
   *
   * @param {KmsKeyId} keyId - key id
   * @param {Uint8Array} data - prepared data bytes 
   * @returns {*}  {Promise<Uint8Array>}
   */
  async sign(keyId: KmsKeyId, data: Uint8Array): Promise<Uint8Array> {
    const keyProvider = this.registry[keyId.type];
    if (!keyProvider) {
      throw new Error(`keyProvider not found for: ${keyId.type}`);
    }

    return keyProvider.sign(keyId, data);
  }
}
