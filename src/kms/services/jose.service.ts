import { CompactDecryptResult, CompactEncrypt, JWK, compactDecrypt } from 'jose';
import { KMS } from '../kms';
import { KmsKeyId } from '../store/types';

export type JoseParams = {
  alg: string;
  enc: string;
  skid?: string;
  [key: string]: unknown;
};

export class JoseService {
  constructor(private readonly _kms: KMS) {}

  async encrypt(msg: Uint8Array, options: JoseParams): Promise<string> {
    const { recipientJWK, ...rest } = options;
    const protectedHeader = {
      ...rest
    };

    const jwe = new CompactEncrypt(msg)
      .setProtectedHeader(protectedHeader)
      .encrypt(recipientJWK as JWK);

    return jwe;
  }

  async decrypt(data: string, kmsKeyId: KmsKeyId): Promise<CompactDecryptResult> {
    const store = await this._kms.getKeyProvider(kmsKeyId.type)?.getPkStore();
    if (!store) {
      throw new Error(`key provider not found for: ${kmsKeyId.type}`);
    }
    const pk = await store.get({ alias: kmsKeyId.id });
    return await compactDecrypt(data, JSON.parse(pk));
  }
}
