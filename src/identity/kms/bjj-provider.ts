import { KmsKeyType, KmsKeyId, IKeyProvider } from './kms';
import * as providerHelpers from './provider-helpers';
import { PrivateKey, PublicKey } from '@iden3/js-crypto';

export class BjjProvider implements IKeyProvider {
  keyType: KmsKeyType;
  private privateKey: PrivateKey;
  constructor(keyType: KmsKeyType) {
    this.keyType = keyType;
  }
  async newPrivateKeyFromSeed(key: Uint8Array): Promise<KmsKeyId> {
    this.privateKey = new PrivateKey(key);
    const publicKey = this.privateKey.public();
    return <KmsKeyId>{
      type: this.keyType,
      id: providerHelpers.keyPath(this.keyType, publicKey.hex())
    };
  }

  async publicKey(keyId: KmsKeyId): Promise<PublicKey> {
    return this.privateKey.public();
  }

  static decodeBJJPubKey() {}
}
