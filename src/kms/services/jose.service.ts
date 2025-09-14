import { generalDecrypt, GeneralDecryptResult, GeneralEncrypt, GeneralJWE } from 'jose';

export type JoseParams = {
  alg: string;
  enc: string;
  typ: string;
  recipients: {
    kid: string;
    recipientJWK: JsonWebKey;
  }[];
};

export class JoseService {
  async encrypt(msg: Uint8Array, options: JoseParams): Promise<GeneralJWE> {
    const { enc, typ, alg, recipients } = options;
    // const { recipientJWK, ...rest } = options;
    // const protectedHeader = {
    //   ...rest
    // };

    // const jwe = new CompactEncrypt(msg)
    //   .setProtectedHeader(protectedHeader)
    //   .encrypt(recipientJWK as JWK);

    const generalJwe = new GeneralEncrypt(msg)
      // .setAdditionalAuthenticatedData(t.context.additionalAuthenticatedData)
      .setProtectedHeader({ enc, typ })
      .setSharedUnprotectedHeader({ alg });

    recipients.forEach((recipient) => {
      generalJwe.addRecipient(recipient.recipientJWK);
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
