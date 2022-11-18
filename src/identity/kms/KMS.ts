import * as babyjub from '../bjj/eddsa-babyjub';

export enum KmsKeyType {
  BabyJubJub = 'BJJ',
  Ethereum = 'ETH'
}

export interface KmsKeyId {
  type: KmsKeyType;
  id: string;
}

export type KEYType = string;

export interface KeyID {
  Type: KEYType;
  ID: string;
}

export interface IKeyProvider {
  keyType: KEYType;
  publicKey(keyID: KeyID): Promise<babyjub.PublicKey>;
  newPrivateKeyFromSeed(key: Uint8Array): Promise<KeyID>;
}

export const KeyTypeBabyJubJub = 'BJJ';

export class KMS {
  private registry: {
    [keyType: KEYType]: IKeyProvider;
  } = {};

  registerKeyProvider(keyType: KEYType, keyProvider: IKeyProvider) {
    if (this.registry.hasOwnProperty(keyType)) {
      throw new Error('present keyType');
    }
    this.registry[keyType] = keyProvider;
  }

  async createKeyFromSeed(keyType: KEYType, bites: Uint8Array): Promise<KeyID> {
    const keyProvider = this.registry[keyType];
    if (!keyProvider) {
      throw new Error(`keyProvider not found for: ${keyType}`);
    }
    return keyProvider.newPrivateKeyFromSeed(bites);
  }

  async publicKey(keyID: KeyID): Promise<babyjub.PublicKey> {
    const keyProvider = this.registry[keyID.Type];
    if (!keyProvider) {
      throw new Error(`keyProvider not found for: ${keyID.Type}`);
    }

    return keyProvider.publicKey(keyID);
  }
}
