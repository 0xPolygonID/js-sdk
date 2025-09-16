/* eslint-disable @cspell/spellchecker */
import {
  AnonCryptPacker,
  DIDDocument,
  KmsKeyId,
  InMemoryPrivateKeyStore,
  RsaOAEPKeyProvider,
  PROTOCOL_CONSTANTS,
  JoseService,
  IPackageManager,
  PackageManager,
  KMS,
  keyPath,
  RecipientInfo
} from '../../src';
import { describe, it, expect } from 'vitest';
import { DIDResolutionResult, JsonWebKey, Resolvable } from 'did-resolver';
import { DID } from '@iden3/js-iden3-core';

const toPubKey = (pkJwk: JsonWebKey) => {
  return {
    kty: pkJwk.kty,
    n: pkJwk.n,
    e: pkJwk.e,
    alg: pkJwk.alg,
    ext: true
  };
};

describe('AnonCrypt packer tests', () => {
  const endUserData = {
    did: DID.parse('did:iden3:billions:test:2VxnoiNqdMPyHMtUwAEzhnWqXGkEeJpAp4ntTkL8XT'),

    pkJwk: {
      key_ops: ['decrypt', 'unwrapKey'],
      ext: true,
      kty: 'RSA',
      n: 'oJ_RM4-dKCwAm_iXCDBzSABwOr5eOCrTVzlLikx0dK1BoO8ilHr9Yx7F3F5Q5exZ6g_lz_5YKSQ31ZNWjAjLOZnRvLkXGA2p_lfFNGGDsW7Xw2OvVy-kX7Y-O1Yn6rGW-ZMCslcc4hdHQbrBa3MdwLFDfAMcHDfZYWOVhU3brGIr0cmXRfZ6U-1hPT-3K_rwCknbiir8GivoLXinIad95JNwyIUytfBc-New_PrcUYoDQH6GI6bu8m2_ya3QuGIR-Lgn5HGcXtd9Lw9qnMc31EcJMKyG1KxMAVUFcoyADDskRCDfd-PWr50Upx_F9V3PE9e7ZOrXRn_hQF0XYG-MGQ',
      e: 'AQAB',
      d: 'CLsjNaKp8-Hvbwr8V7Q9gfWPJCxOpg4y4ngBco0tG94Clh9FkY1dambE8dF5I4RdT1cpomyUiXj35X6-qro8JL-HGnNzrUmp2sLV2_7seAe6x_rKUEqNTGwVNie83_mjB6IteHj6f5ItHAYtJxxw6rVgAhTPsXt6MBxoB2DX7ubpmLPzqyTjE_teVjyrj9i9JZ-W1kRMbLWuALviZbrrtEHdEBKaRvtaeWcf5MHuGHw2RCTHhoHzty8NHasdwSsu0t1dL-88ulxDgK9EdYOHZ17dkmNrrUCq0wpa1_InbV_JC9BoN6Fw7_22M67Suq2v9JUg_K4kid45Vumvn_Mq4Q',
      p: '2kgLhksExewH6ukrXwIMRdKNGRZwWDfprtxjiXW6qg_Qtlo-NX1NUZCilbKAqhYpPdEq2UFElhcF7e1cDkZkhYUQKcOnn_80vWPfoVD8LykDaaNA_E7p1sc78hfm3pKq6AJ26X_qRvV2x0nyFT6S5WykvlRIWRxvr66Y25y192E',
      q: 'vGE8VBMc4L7IExssUN5bSPidzH8FB9yJw--i8cYGLns-Exqy3XO78GCgvB4yKjmz_M5aMZM9FFqJmbPYI2u3STQNvuv8Fss7YqMYWVLWIi2lzx_5e2_coNB7zfn7yyu9R900Nl9WUlWz2Qtu9yXX-RfT_aBr7wg0z3oIP5BAJ7k',
      dp: 'j-vOxXXzKLiuo8GnmhYUl3jzFWaJHnGHP4cKjhi0wep5l7I6sDP05eGygXdXhE3mVV7znJl_KmL1wuGsv7DEGJEajh72B_VSBcmzKn7mOAYXvPAqKfGyFq34pXADBh-4Vg9B7kUr6CtybIYh-sXuPxz6JpAVv8OTFEfPe4WBKSE',
      dq: 'V3Zd6DsngUGS6ywGm1Vh1LN5sGSZFVlTrWEpqk9it1oJLB2NRjxh2e1DM5RhfjFkW9ADGFlgVn7ivDY_99IfOyGr8CTo2jxpyhYnS_Gl8iB3h380-hapvRCPKscSHPal3yPZBhWlonygD_m6_4zWhZSGnI9LDaQlwN7LzZdP8iE',
      qi: 'rOj_Zb2hTI1Q-K93QDYEvcyaiE266_MbEhqYWOWOik5J2XAmIcb7ns1rNVfJyLXEeu584SZcs0LCwxTZB-nKKcyTbTqKZP9QanjXGZn6jZprt0J5s4PmZPonAFuM8DgpPUJQwKUTlxVPdSm_TtgxC7hbRrhzjGFduROXu_iltZU',
      alg: 'RSA-OAEP-256'
    }
  };
  const mobileDid = {
    did: DID.parse('did:iden3:polygon:amoy:x6x5sor7zpxUwajVSoHGg8aAhoHNoAW1xFDTPCF49'),

    pkJwk: {
      key_ops: ['decrypt', 'unwrapKey'],
      ext: true,
      kty: 'RSA',
      n: 'tIL5_bVycsTktTjfTRiPYV1cdJdgngGgN_g5ZJm1fpmmXwmZj6uC1wWrkmteiJ9rJF25BhVxQO_D0OjCYmVBDRpchScoP7sBWuAO7nC2u84-csiizynyILpWmeebxRnnsuQENYjXIwVEtZ8-2fD0I3zknJgr8ifxYbHNArJCJuWB_BQRFcWJA0hHpKGwAKZvPuRHCj_17uaEu4aVItgLwuwpiGHPeTlkk7hE4sTQLuHmewjL7jvVziqwLDX2GuI6eL2YTZDZxMiKOFIc1QxD294f5BlF-MZ6CsAO0fdz3Z-NLxrwYWUZUMR8CK-Oq-x-UCC73RzqudhVpuAiaJ4jzw',
      e: 'AQAB',
      d: 'NSGgJ5cyuqlNkDHPOEgUW9o5DnBIFfnwiMjdS8kabMsY9zxCINGgz11x5MUJrDkQNkIH5cyF61EnV-RK4t9eyFaMCP0_kZKfkXoFqxUuFBVeuDZqBYQZKpzuRJqxdNBtLHCE9KT0ffBdCwB2ZXvQwGlQeO8pcDtlhxXoe_SwF_ZSnD_39qbhtG9lQiI6boAeKPvm2MQqeRzdVgXfmY3C1UOlwcO75dJsGgowi9OSDFxZ-ug7pRhLWirmg_9K1KTwkfwFsM-URw8mqkoiJ4lti1KDwCV8NoPxVdCl-72rutx2_MPif2k6E86R350cFPkQpQmMLqh-l6q1sqYXGQL2sQ',
      p: '7daUHtIQTljDzAMvSAfMA64AK_kseliTUvP-KnLlX4W0z_gQ3oxHYVAqA26q7seLz3V0gA3nvka5wqD1dKkoNemLPCU-k1AgVddUSeTIQ19WdYGUwV4J4I8flM1eC68hFzSIdHV9ACls7-a5dH5KaxO8c2sOu9EevrKmhqLLg6s',
      q: 'wku9Tyd0rHY29QO9WpyVxe1_AjAQYy2LgtquKjJ9v8K3pDwhg7yUxVWuIAlfh20ky-P5Vd12dUv04ww_9rw72Kw54DGzU2ZbvXNSVB_BWLq-g5_XI6VFnNSYwWlU6I82G9Myzx1AmM7lBZZqahiLGDl4MzWA6KZMiTawjDRRPG0',
      dp: 'tk9RYv6quSOZknyudYxkej2arBpoWbAj3eZh4bAI2tvm6bPBWpY08Qc97Tubk0UqinACSVZfWZ9lLSesfyxbQlgu_n-eI9W7s5FHbw0L5XjjEVeu6zpmX9fV4X46pMItn1gJcRvOIZ2ff5Vge0eDS-jo_6AEvzthUdQnifSoA9k',
      dq: 'XoRLtlrCRjdHqs9D6PVtYpiTBXRuNGDukhxhR0PCqmtFvI5H23b8hDaW-xy0LQQqN0lSfLO8MXleyqil4RhWoKO_j9F9o9-SV0nnTecYvlox3YP_O2blw1IkcUoVNQCd2NFX0SswxmU3Qg2W_L-twn4KfBbV-9cSOlmxbrLwpc0',
      qi: 'lzUCZy_66upZse3TgEK1BWyKkpfqTW8vVHIhoGzp5goVZXKZCChtjhFXtX0etdnbo89rUS0fYq4iMloB5IUQ2Ptt-i-DqjpjYZLhdVA937lc5IzEcl7OmUpEHlfCeKmDKhdowJtl4iYhC981isMxH_pctQ_ViU-ZAkpkiLFMvkc',
      alg: 'RSA-OAEP-256'
    }
  };

  const initKeyStore = async (
    { did, pkJwk }: { did: DID; pkJwk: JsonWebKey },
    didDocResolver?: Resolvable
  ): Promise<{
    packerManager: IPackageManager;
    kmsKeyId: KmsKeyId;
    didDocument: DIDDocument;
    publicKeyJwk: JsonWebKey;
    kid: string;
  }> => {
    const memoryKeyStore = new InMemoryPrivateKeyStore();

    memoryKeyStore.get = () => Promise.resolve(JSON.stringify(pkJwk));
    const kmsProvider = new RsaOAEPKeyProvider(memoryKeyStore);
    const kmsKeyId = {
      type: kmsProvider.keyType,
      id: keyPath(kmsProvider.keyType, did.string())
    };

    const kid = `${kmsKeyId.id.split(':').slice(1).join(':')}#key1`;

    const publicKeyJwk = toPubKey(pkJwk);

    const didDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1'
      ],
      id: did.string(),
      keyAgreement: [kid],
      verificationMethod: [
        {
          id: kid,
          type: 'JsonWebKey2020',
          controller: did.string(),
          publicKeyJwk
        }
      ]
    };

    const resolver =
      didDocResolver ||
      ({
        resolve: async () => ({
          didDocument
        })
      } as unknown as Resolvable);

    const kms = new KMS();
    kms.registerKeyProvider(kmsProvider.keyType, kmsProvider);

    const joseService = new JoseService();

    const packer = new AnonCryptPacker(joseService, kms, resolver, [kmsKeyId]);
    const packerManager = new PackageManager();
    packerManager.registerPackers([packer]);

    return {
      packerManager,
      kmsKeyId,
      didDocument: didDocument as unknown as DIDDocument,
      publicKeyJwk,
      kid
    };
  };

  it('pack / unpack: kid', async () => {
    const { packerManager: endUserPackageManager, didDocument: endUserDidDocument } =
      await initKeyStore(endUserData);

    const { packerManager: mobilePackageManager, didDocument: mobileDidDocument } =
      await initKeyStore(mobileDid, {
        resolve: async () =>
          ({
            didDocument: endUserDidDocument
          } as DIDResolutionResult)
      });

    // 1. mobile encrypts the message with user's public key. Public key is

    const messageToEncrypt = {
      id: crypto.randomUUID(),
      thid: crypto.randomUUID(),
      typ: PROTOCOL_CONSTANTS.MediaType.EncryptedMessage,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.VERIFICATION_REQUEST_MESSAGE_TYPE,
      from: mobileDid.did.string(),
      to: endUserData.did.string()
    };

    // 2. mobile side encrypts the message with end user's public key

    const encryptedMsgToEndUser = await mobilePackageManager.packMessage(
      PROTOCOL_CONSTANTS.MediaType.EncryptedMessage,
      messageToEncrypt,
      {
        alg: PROTOCOL_CONSTANTS.AcceptJweAlgorithms.RSA_OAEP_256,
        enc: PROTOCOL_CONSTANTS.JweEncryption.A256GCM,
        recipients: [{ did: endUserData.did, keyType: 'JsonWebKey2020' }] as RecipientInfo[],
        typ: PROTOCOL_CONSTANTS.MediaType.EncryptedMessage
      }
    );

    // 3. mobile sends message to end user. End user decrypts the message with his private key.
    const { unpackedMessage, unpackedMediaType } = await endUserPackageManager.unpack(
      encryptedMsgToEndUser
    );

    expect(unpackedMessage).toEqual(messageToEncrypt);
    expect(unpackedMediaType).toEqual(PROTOCOL_CONSTANTS.MediaType.EncryptedMessage);

    // 4. end user handled message and produce response
    const responseMsg = {
      id: crypto.randomUUID(),
      thid: crypto.randomUUID(),
      typ: PROTOCOL_CONSTANTS.MediaType.EncryptedMessage,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.VERIFICATION_RESPONSE_MESSAGE_TYPE,
      from: endUserData.did.string(),
      to: mobileDid.did.string(),
      body: {
        did_doc: mobileDidDocument
      }
    };

    const packedMessage = await endUserPackageManager.packMessage(unpackedMediaType, responseMsg, {
      alg: PROTOCOL_CONSTANTS.AcceptJweAlgorithms.RSA_OAEP_256,
      enc: PROTOCOL_CONSTANTS.JweEncryption.A256GCM,
      typ: PROTOCOL_CONSTANTS.MediaType.EncryptedMessage,
      recipients: [{ did: mobileDid.did, didDocument: mobileDidDocument }] as RecipientInfo[]
    });

    // 5. mobile decrypts the message with his private key
    const { unpackedMessage: unpackedResponseMsg, unpackedMediaType: unpackedResponseMediaType } =
      await mobilePackageManager.unpack(packedMessage);

    expect(unpackedResponseMsg).toEqual(responseMsg);
    expect(unpackedResponseMediaType).toEqual(PROTOCOL_CONSTANTS.MediaType.EncryptedMessage);
  });
});
