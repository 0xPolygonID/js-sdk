import { KMS, KmsKeyType } from '../../kms';

export interface KeyResolver {
  resolvePrivateKeyByKid: (kid: string) => Promise<CryptoKey>;
}

export class DefaultKMSKeyResolver implements KeyResolver {
  constructor(private readonly kms: KMS) {}

  resolvePrivateKeyByKid = async (kid: string): Promise<CryptoKey> => {
    const [, alias] = kid.split('#');

    if (!alias) {
      throw new Error('Missing key identifier');
    }
    const [keyType] = alias.split(':');

    if (!keyType) {
      throw new Error('Missing key type in alias for default key resolver');
    }

    const pkStore = await this.kms.getKeyProvider(keyType as KmsKeyType)?.getPkStore();
    if (!pkStore) {
      throw new Error(`Key provider not found for ${keyType}`);
    }

    try {
      return JSON.parse(await pkStore.get({ alias })) as CryptoKey;
    } catch (error) {
      throw new Error(`Key not found for ${alias}`);
    }
  };
}
