import { JoseService, KMS, KmsKeyType } from '../../kms';
import { GeneralJWE, JWEHeaderParameters, decodeProtectedHeader } from 'jose';
import { byteDecoder } from '../../utils';

/**
 * decryptsJWE decrypts JWE message
 * @param envelope encrypted message
 * @param joseService jose service
 * @param keyOpts key options to resolve private keys
 * @returns decrypted payload
 */
export const decryptsJWE = async (
  envelope: Uint8Array,
  joseService: JoseService,
  keyOpts: {
    resolvePrivateKeyByKid?: (kid: string) => Promise<CryptoKey>;
    kms?: KMS;
  }
) => {
  const jwe: GeneralJWE = decodeGeneralJWE(envelope);

  if (!jwe.recipients?.length) {
    throw new Error('Missing recipients');
  }
  const protectedHeaders = decodeProtectedHeader(jwe);

  const promises = jwe.recipients.map((recipient) =>
    joseService.decrypt(jwe, async () => {
      const kid = recipient.header?.kid || protectedHeaders.kid; // try to use protected kid if there is no kid in recipient header
      if (!kid) {
        throw new Error('Missing kid');
      }

      const kmsKeyType = (recipient.header?.alg || protectedHeaders.alg) as KmsKeyType;
      if (!kmsKeyType) {
        throw new Error('Missing alg');
      }

      const privateKey = await keyOpts.resolvePrivateKeyByKid?.(kid);

      if (privateKey) {
        return privateKey;
      }

      const pkStore = await keyOpts.kms?.getKeyProvider(kmsKeyType)?.getPkStore();
      if (!pkStore) {
        throw new Error(`Key provider not found for ${kmsKeyType}`);
      }

      const [, alias] = kid.split('#');

      if (!alias) {
        throw new Error('Missing key identifier');
      }

      try {
        return JSON.parse(await pkStore.get({ alias })) as CryptoKey;
      } catch (error) {
        throw new Error(`Key not found for ${alias}`);
      }
    })
  );

  const result = await Promise.any(promises);

  return result.plaintext;
};

export const decodeGeneralJWE = (envelope: Uint8Array): GeneralJWE => {
  const decodedJWE = JSON.parse(byteDecoder.decode(envelope));
  let recipients: { encrypted_key: string; header: JWEHeaderParameters }[] = [];
  if (decodedJWE.encrypted_key && typeof decodedJWE.encrypted_key === 'string') {
    if (decodedJWE.recipients) {
      throw Error(
        'both `recipients` and `encrypted_key`/`header` headers are present in JWE token'
      );
    }

    const protectedHeader = decodeProtectedHeader(decodedJWE);

    recipients = [
      {
        encrypted_key: decodedJWE.encrypted_key,
        header: removeDuplicates(protectedHeader, decodedJWE.header || {})
      }
    ];

    delete decodedJWE.encrypted_key;
    delete decodedJWE.header;
    decodedJWE.recipients = recipients;
  }
  return decodedJWE as GeneralJWE;
};

const removeDuplicates = (
  protectedHeader: Record<string, any>,
  recipientHeader: Record<string, any>
) => {
  const cleaned = { ...recipientHeader };
  for (const [key, value] of Object.entries(protectedHeader)) {
    if (cleaned[key] === value) delete cleaned[key];
  }
  return cleaned;
};
