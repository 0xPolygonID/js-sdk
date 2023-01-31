import { Hex, PrivateKey, PublicKey } from '@iden3/js-crypto';
import { BytesHelper, checkBigIntInField } from '@iden3/js-iden3-core';
import { IKeyProvider } from './kms';
import { AbstractPrivateKeyStore, KmsKeyId, KmsKeyType } from './store';

import * as providerHelpers from './provider-helpers';

/**
 * Provider for Baby Jub Jub keys
 *
 * @export
 * @class BjjProvider
 * @implements {IKeyProvider}
 */
export class BjjProvider implements IKeyProvider {
  keyType: KmsKeyType;
  private keyStore: AbstractPrivateKeyStore;
  /**
   * Creates an instance of BjjProvider.
   * @param {KmsKeyType} keyType - kms key type 
   * @param {AbstractPrivateKeyStore} keyStore - key store for kms
   */
  constructor(keyType: KmsKeyType, keyStore: AbstractPrivateKeyStore) {
    this.keyType = keyType;
    this.keyStore = keyStore;
  }
  /**
   * generates a baby jub jub key from a seed phrase
   * 
   * @param {Uint8Array} seed - byte array seed 
   * @returns kms key identifier
   */
  async newPrivateKeyFromSeed(seed: Uint8Array): Promise<KmsKeyId> {
    const newKey: Uint8Array = new Uint8Array(32);
    newKey.set(Uint8Array.from(seed), 0);
    newKey.fill(seed.length, 32, 0);
    const privateKey: PrivateKey = new PrivateKey(seed);

    const publicKey = privateKey.public();

    const kmsId = {
      type: this.keyType,
      id: providerHelpers.keyPath(this.keyType, publicKey.hex())
    };
    await this.keyStore.import({ alias: kmsId.id, key: privateKey.hex() });

    return kmsId;
  }


  /**
   * Gets public key by kmsKeyId
   *
   * @param {KmsKeyId} keyId
   */
  async publicKey(keyId: KmsKeyId): Promise<PublicKey> {
    const privateKey: PrivateKey = await this.privateKey(keyId);
    return privateKey.public();
  }

  /**
   * signs prepared payload of size - 32 bytes, 
   * with a key id
   *
   * @param {KmsKeyId} keyId
   * @param {Uint8Array} data
   * @returns Uint8Array signature
   */
  async sign(keyId: KmsKeyId, data: Uint8Array): Promise<Uint8Array> {
    if (data.length != 32) {
      throw new Error('data to sign is too large');
    }

    const i = BytesHelper.bytesToInt(data);
    if (!checkBigIntInField(i)) {
      throw new Error('data to sign is too large');
    }
    const privateKey = await this.privateKey(keyId);

    const signature = privateKey.signPoseidon(i);

    return signature.compress();
  }

  private async privateKey(keyId: KmsKeyId): Promise<PrivateKey> {
    const privateKeyHex = await this.keyStore.get({ alias: keyId.id });

    return new PrivateKey(Hex.decodeString(privateKeyHex));
  }
}
