import { Hex, PrivateKey, PublicKey, Signature } from '@iden3/js-crypto';
import { BytesHelper, checkBigIntInField } from '@iden3/js-iden3-core';
import { swapEndianness } from '@iden3/js-merkletree';
import { KmsKeyType, KmsKeyId, IKeyProvider } from './kms';
import { AbstractPrivateKeyStore } from './store';

import * as providerHelpers from './provider-helpers';

export class BjjProvider implements IKeyProvider {
  keyType: KmsKeyType;
  private keyStore: AbstractPrivateKeyStore;
  constructor(keyType: KmsKeyType, keyStore: AbstractPrivateKeyStore) {
    this.keyType = keyType;
    this.keyStore = keyStore;
  }
  async newPrivateKeyFromSeed(key: Uint8Array): Promise<KmsKeyId> {
    // bjj private key from seed buffer
    const newKey: Uint8Array = new Uint8Array(32);
    newKey.set(Uint8Array.from(key), 0);
    newKey.fill(key.length, 32, 0);
    const privateKey: PrivateKey = new PrivateKey(key);

    const publicKey = privateKey.public();

    const kmsId = {
      type: this.keyType,
      id: providerHelpers.keyPath(this.keyType, publicKey.hex())
    };
    await this.keyStore.import({ alias: kmsId.id, key: privateKey.hex() });

    return kmsId;
  }

  private async privateKey(keyId: KmsKeyId) : Promise<PrivateKey> {
    const privateKeyHex = await this.keyStore.get({ alias: keyId.id });

    return new PrivateKey(Hex.decodeString(privateKeyHex));

  }
  async publicKey(keyId: KmsKeyId): Promise<PublicKey> {

    const privateKey: PrivateKey = await this.privateKey(keyId)
    return privateKey.public();
  }

  static decodeBJJPubKey() {}

  async sign(keyId: KmsKeyId, data: Uint8Array): Promise<Uint8Array> {
    if (data.length != 32) {
      throw new Error('data to sign is too large');
    }

    const i = BytesHelper.bytesToInt(swapEndianness(data));
    if (!checkBigIntInField(i)) {
      throw new Error('data to sign is too large');
    }
    const privateKey =  await this.privateKey(keyId)

    const signature =  privateKey.signPoseidon(i)
    
    return signature.compress()
  }
}
