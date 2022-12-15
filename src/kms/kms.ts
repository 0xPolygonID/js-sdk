import { Signature, PublicKey } from '@iden3/js-crypto';

export interface IKmsService {
  getBJJDigest(challenge: number): Uint8Array;
  sign(keyId: KmsKeyId, data: Uint8Array): Uint8Array;
  decodeBJJSignature(sigBytes: Uint8Array): Signature;
}

export enum KmsKeyType {
  BabyJubJub = 'BJJ',
  Ethereum = 'ETH'
}

export interface KmsKeyId {
  type: KmsKeyType;
  id: string;
}

export interface IKeyProvider {
  keyType: KmsKeyType;
  publicKey(keyID: KmsKeyId): Promise<PublicKey>;
  sign(keyId: KmsKeyId, data: Uint8Array): Promise<Uint8Array>;
  newPrivateKeyFromSeed(key: Uint8Array): Promise<KmsKeyId>;
}

export const KeyTypeBabyJubJub = 'BJJ';

export class KMS {
  private registry: {
    [keyType in KmsKeyType]: IKeyProvider;
  } = {
    BJJ: null,
    ETH: null
  };

  registerKeyProvider(keyType: KmsKeyType, keyProvider: IKeyProvider) {
    if (this.registry[keyType]) {
      throw new Error('present keyType');
    }
    this.registry[keyType] = keyProvider;
  }

  async createKeyFromSeed(keyType: KmsKeyType, bytes: Uint8Array): Promise<KmsKeyId> {
    const keyProvider = this.registry[keyType];
    if (!keyProvider) {
      throw new Error(`keyProvider not found for: ${keyType}`);
    }
    return keyProvider.newPrivateKeyFromSeed(bytes);
  }

  async publicKey(keyId: KmsKeyId): Promise<PublicKey> {
    const keyProvider = this.registry[keyId.type];
    if (!keyProvider) {
      throw new Error(`keyProvider not found for: ${keyId.type}`);
    }

    return keyProvider.publicKey(keyId);
  }

  async sign(keyId: KmsKeyId, data: Uint8Array): Promise<Uint8Array> {
    const keyProvider = this.registry[keyId.type];
    if (!keyProvider) {
      throw new Error(`keyProvider not found for: ${keyId.type}`);
    }

    return keyProvider.sign(keyId, data);
  }
}
