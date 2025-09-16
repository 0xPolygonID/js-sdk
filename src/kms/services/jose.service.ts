import { generalDecrypt, GeneralDecryptResult, GeneralEncrypt, GeneralJWE } from 'jose';
import { VerificationMethodType } from '../../iden3comm/constants';

export type JoseParams = {
  alg: string;
  enc: string;
  typ: string;
  recipients: {
    did: string;
    keyType: VerificationMethodType;
    kid: string;
    recipientJWK: JsonWebKey;
  }[];
};

export class JoseService {
  async encrypt(msg: Uint8Array, options: JoseParams): Promise<GeneralJWE> {
    const { enc, typ, alg, recipients } = options;
    const generalJwe = new GeneralEncrypt(msg)
      .setProtectedHeader({ enc, typ })
      .setSharedUnprotectedHeader({ alg });

    recipients.forEach((recipient) => {
      generalJwe.addRecipient(recipient.recipientJWK).setUnprotectedHeader({
        kid: recipient.kid
      });
    });

    const jwe: GeneralJWE = await generalJwe.encrypt();

    return jwe;
  }

  async decrypt(data: GeneralJWE, pkFunc: () => Promise<CryptoKey>): Promise<GeneralDecryptResult> {
    const pk = await pkFunc();
    const result = await generalDecrypt(data, pk);
    return result;
  }
}
