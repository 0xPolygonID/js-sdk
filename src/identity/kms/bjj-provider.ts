import { KmsKeyType, KmsKeyId } from './kms';
import { IKeyProvider } from './index';
import * as providerHelpers from './provider-helpers';
import { PrivateKey, PublicKey } from '@iden3/js-crypto';

export class BjjProvider implements IKeyProvider {
  keyType: KmsKeyType;
  private privateKey: PrivateKey;
  constructor(keyType: KmsKeyType) {
    this.keyType = keyType;
  }
  async newPrivateKeyFromSeed(key: Uint8Array): Promise<KmsKeyId> {
    // bjj private key from seed buffer
    console.log(key);
    console.log(key.length);
    const newKey: Uint8Array = new Uint8Array(32);
    newKey.set(Uint8Array.from(key), 0);
    newKey.fill(key.length, 32, 0);
    console.log(newKey);
    const privateKey: PrivateKey = new PrivateKey(key);
    this.privateKey = privateKey;
    const publicKey = await privateKey.public();
    return <KmsKeyId>{
      type: this.keyType,
      id: providerHelpers.keyPath(this.keyType, await publicKey.toString())
    };
  }

  async publicKey(keyId: KmsKeyId): Promise<PublicKey> {
    return await this.privateKey.public();
  }

  static decodeBJJPubKey() {}
}
