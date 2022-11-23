import * as babyjub from '../bjj/eddsa-babyjub';
import { Signature } from '../bjj/eddsa-babyjub';

export interface IKmsService {
  getBJJDigest(challenge: number): Uint8Array;
  sign(keyId: KmsKeyId, challengeDigest: Uint8Array): Uint8Array;
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
  publicKey(keyID: KmsKeyId): Promise<babyjub.PublicKey>;
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

  async createKeyFromSeed(keyType: KmsKeyType, bites: Uint8Array): Promise<KmsKeyId> {
    const keyProvider = this.registry[keyType];
    if (!keyProvider) {
      throw new Error(`keyProvider not found for: ${keyType}`);
    }
    return keyProvider.newPrivateKeyFromSeed(bites);
  }

  async publicKey(keyId: KmsKeyId): Promise<babyjub.PublicKey> {
    const keyProvider = this.registry[keyId.type];
    if (!keyProvider) {
      throw new Error(`keyProvider not found for: ${keyId.type}`);
    }

    return keyProvider.publicKey(keyId);
  }
}
