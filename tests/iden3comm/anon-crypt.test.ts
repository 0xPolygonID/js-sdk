/* eslint-disable @cspell/spellchecker, no-console */
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
  RecipientInfo,
  JWEPackerParams,
  byteDecoder,
  IKeyProvider,
  P384Provider,
  bytesToBase64url,
  defaultRSAOaepKmsIdPathGeneratingFunction,
  keyPath,
  toPublicKeyJwk,
  byteEncoder,
  DefaultKMSKeyResolver,
  KmsKeyType
} from '../../src';
import { describe, it, expect, vi } from 'vitest';
import { DIDResolutionResult, JsonWebKey, Resolvable } from 'did-resolver';
import { BytesHelper, DID } from '@iden3/js-iden3-core';
import { FlattenedJWE, GeneralJWE } from 'jose';

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

  const anotherDid = {
    did: DID.parse('did:iden3:polygon:amoy:A6x5sor7zpxUwajVSoHGg8aAhoHNoAW1xFDTPCF49'),
    pkJwk: {
      key_ops: ['decrypt', 'unwrapKey'],
      ext: true,
      kty: 'RSA',
      n: 'qXiO4kdzR5-1iVfQftDVcJi5VcjixNJOAhZEDPot4GMJFuKAe_Oq-7mVd7hHot6T_8IstXfTSijsWq8S1CQg8Ov9Aqv92UQUX-R0QbwzplkbrzfEUEWZAR46T9BqWJ1WvCMqBL54zD9ppB_suE4qBvXsosMxPEkzAEmmGpNPi5GlNLWxtDMiR-u5rs7Tje8V1k-uE8cXORsrBNUQ--Iq71Vpbp5YJtDveDMk5nDuZFkscXI2VHc2sloStZ9DsfMS47jItkbDm5GyFlIdvFSrABVM5gyrDM7SOUzG5ZeiCcKm50wgYIm8QizIHZqHVmexFtcFl8VFHcDVtfIkbXYx5w',
      e: 'AQAB',
      d: 'GsSLkQsnFr-PrXdc28MBi4zb7URTKTJsluDMc95KQ8BwzZgOIkXtEmCQTr4hNoUAjGuvoyQfj_2hw3sWtsJUH6mup27iJCCgNTtA76cZ42L8v_LHg8RSc_5ByJyLR57mdcX6G5C4RM6ZUY6nVb8m3T2X2GeLTdHkB94aKeVtsYYYbIOOGDtfDTD_Z-dZ3gdVH2psc2fZstmdg_okaPCzzVD49aWevnB8Y9BzUhwNV6oD_xyJwxGjT1NOXcZV6HMzBBjJ44eCBegus0rjezXrFNB0nPuJRkwt5bfrZmzVfQbYUyIwWrF6vQpjYr6mqQtsdm_U_hykQdx482FMk-WJfQ',
      p: '0dt_krUkUEVD2QkYwhxiM0xwPUiK3hiL5aSkYo5Z3NPpzi7FbrY-a3rSxmTcMXC4rqx1LzoKmKeaDPjnjpUiWqys1588bGc8EPxMVtfiYO60q-aB4PSFGKNEFP4z_12LMsyPao-bctx1DUki07Rdi3oOd8td13wLtfYyLzV7sHU',
      q: 'zrvGtN6mLXzcg7MI4nVKxqYHEACI7EJYrmehVSK09nkuGCYgGhiP-PiR_O39wh1zN73HTatvcIz91QQC4mMvFJoGF-J3J4zqMkiv7gnkJ5mRj3c125iRPclhJDNhgr-yOHEu2upFg31CGZhCfvOi9TScQCU4l20vqDEoobXnjWs',
      dp: 'jr6BHid8leUna1-WqaJo4X_i8KyBWOTVc9Tzw94UHfM_G_IQdWgdOTqIWE6OwEpuNNI1u3P9dSy7yosb5o5mmcrOnrQ_g3UNFHio7IFYCJsV5b-bJIruZX3Yd3cZo1_bqSgffVpFYHG4ZNsUh3AuGQti__Ui1coYpSLbq-TzR2k',
      dq: 'FZum30zOTb7ZRaK28QSVdkHwRwnnRdqBbmlCgaWJCKIN4VRK0q9yjPFeQPOXLGzrmA3sAQBEO51hApzSuFrpltuqe2CeV7Hw4KScTuMVx9XTUw2AwZ0mwTCFSMVeEc57kE60OQl3jpDPEeHKQX6xr7N6CXJagelVq9zHhG-A7lU',
      qi: 'CvIzm858pE_4gW_yr7mUfl6Qo7jacUzim2sFM1kObBg_sNDLW-P8L2zGjmDJxUCHeYG6Gdj-219MN1-qQQnBhpg5LLENkFoseumv_2A8i0uP_j2MMlNFed7P0yGwwfZwcjAmieN2ULfbxJ1Vs7XYg6bzPoM7Sb0JyZRAQfcBtLk',
      alg: 'RSA-OAEP-256'
    }
  };

  const initKeyStore = async (
    {
      did,
      pkJwk,
      alg
    }: { did: DID; pkJwk?: JsonWebKey; alg: PROTOCOL_CONSTANTS.AcceptJweKEKAlgorithms },
    didDocResolver?: Resolvable,
    resolvePrivateKeyByKidFactory?: (
      keyProvider: IKeyProvider
    ) => (kid: string) => Promise<CryptoKey>
  ): Promise<{
    packerManager: IPackageManager;
    kmsKeyId: KmsKeyId;
    didDocument: DIDDocument;
    publicKeyJwk: JsonWebKey;
    kid: string;
  }> => {
    const store = new InMemoryPrivateKeyStore();
    const kmsProvider =
      alg === PROTOCOL_CONSTANTS.AcceptJweKEKAlgorithms.RSA_OAEP_256
        ? new RsaOAEPKeyProvider(store)
        : new P384Provider(store);

    let publicKeyJwk: JsonWebKey;
    let kmsKeyId: KmsKeyId;

    if (pkJwk) {
      publicKeyJwk = toPublicKeyJwk(JSON.stringify(pkJwk), kmsProvider.keyType);
      const keyId = defaultRSAOaepKmsIdPathGeneratingFunction(publicKeyJwk);
      kmsKeyId = {
        type: kmsProvider.keyType,
        id: keyPath(kmsProvider.keyType, keyId)
      };
      store.get = () => Promise.resolve(JSON.stringify(pkJwk));
    } else {
      kmsKeyId = await kmsProvider.newPrivateKey();

      const pubKey = await kmsProvider.publicKey(kmsKeyId);

      publicKeyJwk = toPublicKeyJwk(pubKey, kmsKeyId.type);
    }

    const alias = kmsKeyId.id;

    const kid = `${did.string()}#${alias}`;

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

    const defaultKMSKeyResolver = new DefaultKMSKeyResolver(kms);
    const joseService = new JoseService(
      resolvePrivateKeyByKidFactory?.(kmsProvider) || defaultKMSKeyResolver.resolvePrivateKeyByKid
    );

    const packer = new AnonCryptPacker(joseService, resolver);
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

  const flow = async (
    alg: PROTOCOL_CONSTANTS.AcceptJweKEKAlgorithms,
    enc: PROTOCOL_CONSTANTS.CEKEncryption,
    withMockKeys = false,
    resolvePrivateKeyByKidFactory?: (
      keyProvider: IKeyProvider
    ) => (kid: string) => Promise<CryptoKey>
  ) => {
    const { packerManager: endUserPackageManager, didDocument: endUserDidDocument } =
      await initKeyStore(
        { did: endUserData.did, alg, pkJwk: withMockKeys ? endUserData.pkJwk : undefined },
        undefined,
        resolvePrivateKeyByKidFactory
      );

    const { packerManager: mobilePackageManager, didDocument: mobileDidDocument } =
      await initKeyStore(
        { did: mobileDid.did, alg, pkJwk: withMockKeys ? mobileDid.pkJwk : undefined },

        {
          resolve: async () =>
            ({
              didDocument: endUserDidDocument
            } as DIDResolutionResult)
        },
        resolvePrivateKeyByKidFactory
      );

    const { didDocument: anotherDidDocument } = await initKeyStore({
      did: anotherDid.did,
      alg,
      pkJwk: withMockKeys ? anotherDid.pkJwk : undefined
    });

    // 1. mobile encrypts the message with user's public key. Public key is

    const messageToEncrypt = {
      id: crypto.randomUUID(),
      thid: crypto.randomUUID(),
      typ: PROTOCOL_CONSTANTS.MediaType.EncryptedMessage,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE,
      from: mobileDid.did.string(),
      to: endUserData.did.string()
    };

    // 2. mobile side encrypts the message with end user's public key

    const encryptedMsgToEndUser = await mobilePackageManager.packMessage(
      PROTOCOL_CONSTANTS.MediaType.EncryptedMessage,
      messageToEncrypt,
      {
        alg,
        enc,
        recipients: [
          { did: endUserData.did, alg },
          { did: anotherDid.did, didDocument: anotherDidDocument, alg }
        ] as RecipientInfo[]
      } as JWEPackerParams
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
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE,
      from: endUserData.did.string(),
      to: mobileDid.did.string(),
      body: {
        did_doc: mobileDidDocument
      }
    };

    const packedMessage = await endUserPackageManager.packMessage(unpackedMediaType, responseMsg, {
      enc,
      recipients: [
        {
          did: mobileDid.did,
          didDocument: mobileDidDocument,
          keyType: 'JsonWebKey2020',
          alg
        }
      ] as RecipientInfo[]
    } as JWEPackerParams);

    // 5. mobile decrypts the message with his private key
    const { unpackedMessage: unpackedResponseMsg, unpackedMediaType: unpackedResponseMediaType } =
      await mobilePackageManager.unpack(packedMessage);

    expect(unpackedResponseMsg).toEqual(responseMsg);
    expect(unpackedResponseMediaType).toEqual(PROTOCOL_CONSTANTS.MediaType.EncryptedMessage);
  };

  it('pack / unpack: kid', async () => {
    for (const enc of [
      PROTOCOL_CONSTANTS.CEKEncryption.A256GCM,
      PROTOCOL_CONSTANTS.CEKEncryption.A256CBC_HS512
    ]) {
      // await flow(PROTOCOL_CONSTANTS.AcceptJweKEKAlgorithms.RSA_OAEP_256, enc, true);

      await flow(
        PROTOCOL_CONSTANTS.AcceptJweKEKAlgorithms.ECDH_ES_A256KW,
        enc,
        false,
        (keyProvider) => async (kid) => {
          const pkStore = await keyProvider.getPkStore();
          const alias = kid.split('#').pop()!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
          const pkHex = await pkStore.get({ alias });

          const pubKey = await keyProvider.publicKey({
            type: keyProvider.keyType,
            id: alias
          });

          const pubkJwk = toPublicKeyJwk(pubKey, keyProvider.keyType);

          return {
            ...pubkJwk,
            d: bytesToBase64url(BytesHelper.intToNBytes(BigInt('0x' + pkHex), 48).reverse())
          } as unknown as CryptoKey;
        }
      );
    }
  });

  it('Golang integration test multiple recipient', async () => {
    const golangGWE: GeneralJWE = {
      ciphertext:
        'Y4JTGPfMcb_qroeLzSLAHl1A18sjI0sQhNOyEh0NPY99meVAQlYvTIs9-bKJ8vnZPpGJe7nWkuMi8I-FSKeOdxPruHGWHiRLVUxVHhtqRmxJ9_18fgMzbldUn9np49j03ooTiYn2pAFEvwpFyQh9SC35CB8Mqr4gTqUfk6LTVde7hyM5k6STNf5NmYtr5LOoT_OYawblk2SyO0654U6DH7x-rYIgZvY3LJYYVSvi4GmJ5vOzm-KPcnDrdzd1MO8E0eFObqlNTInhXWOAypNGEypj_cMS8ofg7F1B7HvIvV8NZS3ZKuDthf9c5siQPe5PgsZjv7UfuojEJAltgwBG8lHW_dPF7-Sg1qO5zdnxpqI3ZHdhOWZYfs2a7rxHvkfXfd-Xlf5AgxcZVYujMJRFVF_2PzGm7rgC5SKgFmzLHkQzH0xGqTdYJ9RI8ybWecHSS-lY-IUAe7Q4uZiSmV-utkpW3DnYuHbFQvFm14yMegk',
      iv: 'vMUyUg-JL5Yg4ELKiMgC3g',
      protected:
        'eyJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwidHlwIjoiYXBwbGljYXRpb24vaWRlbjNjb21tLWVuY3J5cHRlZC1qc29uIn0',
      recipients: [
        {
          header: {
            alg: 'RSA-OAEP-256',
            kid: 'did:iden3:billions:test:2VxnoiNqdMPyHMtUwAEzhnWqXGkEeJpAp4ntTkL8XT#key1'
          },
          encrypted_key:
            'MxL85rOkjNPFPJKL57QhQV7ZT9BbW07DPoYi_VjeyWWBRjrUNZjKHoauPu_DAf038Sw0vIATzsZGot32znvdUTIyF-hI4YiI_qqb8Bh9tPYBaB4wilIrOaWgRUrhfw8cJpH4iRJTieOfPZPPtfhziOLPAv3M6PQERnl6e9Rnq3Woss5F64NXjJo-6oReqS5OY6MsEYEgTpXfLF2ibbZB-siGnaY-tpvBgZSTagnDJgbO-uexEqdJCI-Q2IjIE5-9NPilGhp9NE3pednpzDdEREplcoti7yH3l3Ecc9rd6YU9ptaXEBv4RYrMwJ_f8IrA_-k6zbgpORclMvsSIG92-Q'
        },
        {
          header: {
            alg: 'RSA-OAEP-256',
            kid: 'did:iden3:polygon:amoy:A6x5sor7zpxUwajVSoHGg8aAhoHNoAW1xFDTPCF49#key1'
          },
          encrypted_key:
            'DW69p8e2ZSHbmRKRWoZSctF-Eq0Q22pguIFbjqzMoJ7F95h8NYlpswg9JzOL8cb_ns6gi-YuKT2X_R2Y4RcNAjshZvJVtXbVRxm238fN3BQM2LSP0UoaAsXURtpUJjeXmjBQEeo61K9Mn9oxWZHk65dXpuo-cuWDpfXT3WEV_e878kWI5Qp99L2xRQ4Z-XVMi4XREWawHEk8P2F05K-0ppoQCD5zxpAoLIrAKeMYdCT3i6_VC73qhrKgzYf38YLxASzsXF-aQfAMLraZErMyAEUuaAEtS2i5C_jfpvknLtn-iba8p9bUVQhmAA9pGX1mbX6JovU2cz1ZK1OFMjvC7A'
        }
      ],
      tag: '7Z6lWhskArqKPNkjoVEudv3dxwAjqYsksLudkhLjM3I'
    };

    const expectedMessage = `{"id":"8589c266-f5f4-4a80-8fc8-c1ad4de3e3b4","thid":"43246acb-b772-414e-9c90-f36b37261000","typ":"application/iden3comm-encrypted-json","type":"https://iden3-communication.io/passport/0.1/verification-request","from":"did:iden3:polygon:amoy:x6x5sor7zpxUwajVSoHGg8aAhoHNoAW1xFDTPCF49","to":"did:iden3:billions:test:2VxnoiNqdMPyHMtUwAEzhnWqXGkEeJpAp4ntTkL8XT"}`;

    const joseService = new JoseService(() => {
      return Promise.resolve(endUserData.pkJwk as unknown as CryptoKey);
    });
    const jwe = await joseService.decrypt(golangGWE);

    const message = byteDecoder.decode(jwe.plaintext);

    expect(message).toEqual(expectedMessage);
  });

  it('Golang integration test single recipient ( disjoint headers persist)', async () => {
    const golangGWE: FlattenedJWE = {
      ciphertext:
        'PI7rfG2aIGND0VovpKy3Z61AxnpEsSktSS3Io3OSk8J_5CWtGlTVoZQskDZvpN8HD9Ry2yLaKm6I5tXi1lhHNq14hIcmPmcJGT-uW_QWVE7sNCawM6OQyoEW_r6OrMfYGwrwbrtG0O8ARAJIV1oDq27Kzx39NsbZOk9ALixXmwPkc33sEyKNE6LZdIhH38xScpAyZgd93xG-zQDLwpBiyGUCaMp4v959eLPU6N3TYLKdXdEAe2oKVMPI6F5oy5pRYt4HVyZIk9tY8hufaylVVRHQfQYq4w4ntXgKpVgD8xYZCfujVhVi7MfzxxGOfOVPpPOrKOfaWlkjqzR4c7JlHMcCg-xfrlb1CtqLDQ6yit45aEpTu_0Chnt9sgdLaFdsTAdoO-_6RzMIcihoX5r6hz5SeWHpOg00kpqFPbx1fGs4sUWDDQ58o0wgosgxBeEfvGcY9f8LDAg4zAsPCFelfOPqnzzM8g',
      encrypted_key:
        'lMs9iyQ9YfIJ_vW8lFPo7OLFbMLAAED1hfUyxb5bZkSSo6tYPsijAfrG8BvGHSp6eVz8Px1YLyy1fQApBOWieHT775MTgxZFJfGaydv7BCTw3SBzhFBesJX3JNPKT9lB4p5FUhwHknDw1ZQ-o9gk41-Kv-hvpedJQE6YwIr85CuoRRciSdg84JVR9SvxVISkgdr4pH2N6UBaqEBPs0NLVbbT9FMAWnv8pPQzsfjOZSiNxIS1Dk9MB6n45aFiZ9PW86CXcMEDSR64Mvni1x9hzptEo0DibqhifTT6f9Gk52wAGnAFAci3f1g_nqnOMWiYijPiQ0saoQzf6kd_MBkhqQ',
      header: {
        alg: 'RSA-OAEP-256',
        kid: 'did:iden3:billions:test:2VxnoiNqdMPyHMtUwAEzhnWqXGkEeJpAp4ntTkL8XT#key1'
      },
      iv: 'iE0vd5IUMuimFzUK',
      protected:
        'eyJhbGciOiJSU0EtT0FFUC0yNTYiLCJlbmMiOiJBMjU2R0NNIiwia2lkIjoiZGlkOmlkZW4zOmJpbGxpb25zOnRlc3Q6MlZ4bm9pTnFkTVB5SE10VXdBRXpobldxWEdrRWVKcEFwNG50VGtMOFhUI2tleTEiLCJ0eXAiOiJhcHBsaWNhdGlvbi9pZGVuM2NvbW0tZW5jcnlwdGVkLWpzb24ifQ',
      tag: 'G3i_v-TS67ch_9__GHQJBQ'
    };

    const joseService = new JoseService(() => {
      return Promise.resolve({
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
      } as unknown as CryptoKey);
    });

    const packer = new AnonCryptPacker(joseService, {
      resolve: async () => ({
        undefined
      })
    } as unknown as Resolvable);
    const message = await packer.unpack(byteEncoder.encode(JSON.stringify(golangGWE)));
    console.log('message', JSON.stringify(message));
    const expectedMessage = {
      id: '8589c266-f5f4-4a80-8fc8-c1ad4de3e3b4',
      thid: '43246acb-b772-414e-9c90-f36b37261000',
      typ: 'application/iden3comm-encrypted-json',
      type: 'https://iden3-communication.io/passport/0.1/verification-request',
      from: 'did:iden3:polygon:amoy:x6x5sor7zpxUwajVSoHGg8aAhoHNoAW1xFDTPCF49',
      to: 'did:iden3:billions:test:2VxnoiNqdMPyHMtUwAEzhnWqXGkEeJpAp4ntTkL8XT'
    };
    expect(message).to.be.deep.equal(expectedMessage);
  });

  it('Golang integration test single recipient ( only protected headers)', async () => {
    const golangGWE: FlattenedJWE = {
      ciphertext:
        'G94AlOo9R0Bz1L8ypk_Ls4KyjbxjsU2FK3X-HZifdkC9mcVP3wZ4zc2Lgca4jlLzHG4bG5LSS9spVhiZhZ0FFq6Lyo8PtEVAxvW8QmquvgHJ5kJqYK1Wuiry-_hzIdwJqBwc3SCIkTi15KON-LaBFW20dRS4QN8BFVQw6inbxb7gA3ULqLxU-iy6A2oHRiHTQ5A-8PrPvURtf6kxaP1JZ6ozmMSLfpZY7WezvFCgnokYa4eeIoDYYBduSxMnGdYbSZqq_wN-WujTxc1hVdyOYiz-YaZs6UiemzGl8_5F5i5B4Mx0Pf28kzTUzs3ivZtawtWPI8mxNdIuPRg4ivrz2EooIBba9eAEgMj_JdYFI9RQtf0LlCBlcIzdnsC_BwSZgpM5alqOUgRH7SECMB00oon73qlw0ZxLbqxSScXcStwHaJEcrrKw5ZzsM5IB7etqP4Wz9q95e8V3y79ms7l4m48HqbcXjQ',
      encrypted_key:
        'aF0cMjVh4k2je1Y5neP-JD_Z4gSXkbfcVwq-S4f_4-5vCqY7kJAtQZYeyaLSVweU2inm5hvwYgf9dnn7q4wX_P1tPLAS5jYYSJd5-ev89av2vlGIPQApAshcKGrTM01Zg9Ewl19bCoTXsfU632AC4V3_Qj5-nkl3m7M-_7rVbvj8yeLtJaYDHdDnF7OORZrYnu-vYENArnhHuE4S9MsnByF2TSO_eZ0_aL8DljTvtvjo9G6J8tV5IbuRz6nOokVuRHoPlyq22ONACW7nHh1sGVd7gTeztsT2z9JAi5szdMe23rgbpTu3FbnG7yxAunQ5MnCLJ5OljGK1BDLpdPOrpw',
      iv: 'ZrFLdKgYqa1LrWIC',
      protected:
        'eyJhbGciOiJSU0EtT0FFUC0yNTYiLCJlbmMiOiJBMjU2R0NNIiwia2lkIjoiZGlkOmlkZW4zOmJpbGxpb25zOnRlc3Q6MlZ4bm9pTnFkTVB5SE10VXdBRXpobldxWEdrRWVKcEFwNG50VGtMOFhUI2tleTEiLCJ0eXAiOiJhcHBsaWNhdGlvbi9pZGVuM2NvbW0tZW5jcnlwdGVkLWpzb24ifQ',
      tag: 'rbUb5eW4Hgng-AMd-OPxeQ'
    };

    const joseService = new JoseService(() => {
      return Promise.resolve({
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
      } as unknown as CryptoKey);
    });

    const packer = new AnonCryptPacker(joseService, {
      resolve: async () => ({
        undefined
      })
    } as unknown as Resolvable);
    const message = await packer.unpack(byteEncoder.encode(JSON.stringify(golangGWE)));
    console.log('message', JSON.stringify(message));
    const expectedMessage = {
      id: '8589c266-f5f4-4a80-8fc8-c1ad4de3e3b4',
      thid: '43246acb-b772-414e-9c90-f36b37261000',
      typ: 'application/iden3comm-encrypted-json',
      type: 'https://iden3-communication.io/passport/0.1/verification-request',
      from: 'did:iden3:polygon:amoy:x6x5sor7zpxUwajVSoHGg8aAhoHNoAW1xFDTPCF49',
      to: 'did:iden3:billions:test:2VxnoiNqdMPyHMtUwAEzhnWqXGkEeJpAp4ntTkL8XT'
    };
    expect(message).to.be.deep.equal(expectedMessage);
  });

  it('Check default kms is working', async () => {
    const golangGWE: GeneralJWE = {
      ciphertext:
        'Y4JTGPfMcb_qroeLzSLAHl1A18sjI0sQhNOyEh0NPY99meVAQlYvTIs9-bKJ8vnZPpGJe7nWkuMi8I-FSKeOdxPruHGWHiRLVUxVHhtqRmxJ9_18fgMzbldUn9np49j03ooTiYn2pAFEvwpFyQh9SC35CB8Mqr4gTqUfk6LTVde7hyM5k6STNf5NmYtr5LOoT_OYawblk2SyO0654U6DH7x-rYIgZvY3LJYYVSvi4GmJ5vOzm-KPcnDrdzd1MO8E0eFObqlNTInhXWOAypNGEypj_cMS8ofg7F1B7HvIvV8NZS3ZKuDthf9c5siQPe5PgsZjv7UfuojEJAltgwBG8lHW_dPF7-Sg1qO5zdnxpqI3ZHdhOWZYfs2a7rxHvkfXfd-Xlf5AgxcZVYujMJRFVF_2PzGm7rgC5SKgFmzLHkQzH0xGqTdYJ9RI8ybWecHSS-lY-IUAe7Q4uZiSmV-utkpW3DnYuHbFQvFm14yMegk',
      iv: 'vMUyUg-JL5Yg4ELKiMgC3g',
      protected:
        'eyJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwidHlwIjoiYXBwbGljYXRpb24vaWRlbjNjb21tLWVuY3J5cHRlZC1qc29uIn0',
      recipients: [
        {
          header: {
            alg: 'RSA-OAEP-256',
            kid: 'did:iden3:billions:test:2VxnoiNqdMPyHMtUwAEzhnWqXGkEeJpAp4ntTkL8XT#RSA-OAEP-256:0x506f983a3fffac7f9bd934cdde71f2979887633ef445745cccf391555778e5b7'
          },
          encrypted_key:
            'MxL85rOkjNPFPJKL57QhQV7ZT9BbW07DPoYi_VjeyWWBRjrUNZjKHoauPu_DAf038Sw0vIATzsZGot32znvdUTIyF-hI4YiI_qqb8Bh9tPYBaB4wilIrOaWgRUrhfw8cJpH4iRJTieOfPZPPtfhziOLPAv3M6PQERnl6e9Rnq3Woss5F64NXjJo-6oReqS5OY6MsEYEgTpXfLF2ibbZB-siGnaY-tpvBgZSTagnDJgbO-uexEqdJCI-Q2IjIE5-9NPilGhp9NE3pednpzDdEREplcoti7yH3l3Ecc9rd6YU9ptaXEBv4RYrMwJ_f8IrA_-k6zbgpORclMvsSIG92-Q'
        },
        {
          header: {
            alg: 'RSA-OAEP-256',
            kid: 'did:iden3:polygon:amoy:A6x5sor7zpxUwajVSoHGg8aAhoHNoAW1xFDTPCF49#key1'
          },
          encrypted_key:
            'DW69p8e2ZSHbmRKRWoZSctF-Eq0Q22pguIFbjqzMoJ7F95h8NYlpswg9JzOL8cb_ns6gi-YuKT2X_R2Y4RcNAjshZvJVtXbVRxm238fN3BQM2LSP0UoaAsXURtpUJjeXmjBQEeo61K9Mn9oxWZHk65dXpuo-cuWDpfXT3WEV_e878kWI5Qp99L2xRQ4Z-XVMi4XREWawHEk8P2F05K-0ppoQCD5zxpAoLIrAKeMYdCT3i6_VC73qhrKgzYf38YLxASzsXF-aQfAMLraZErMyAEUuaAEtS2i5C_jfpvknLtn-iba8p9bUVQhmAA9pGX1mbX6JovU2cz1ZK1OFMjvC7A'
        }
      ],
      tag: '7Z6lWhskArqKPNkjoVEudv3dxwAjqYsksLudkhLjM3I'
    };

    const privateKey = {
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
    };
    const publicKey = toPublicKeyJwk(JSON.stringify(privateKey), KmsKeyType.RsaOaep256);

    const kmsId = {
      type: KmsKeyType.RsaOaep256,
      id: keyPath(KmsKeyType.RsaOaep256, defaultRSAOaepKmsIdPathGeneratingFunction(publicKey))
    };

    const store = new InMemoryPrivateKeyStore();
    store.importKey({ key: JSON.stringify(privateKey), alias: kmsId.id });

    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.RsaOaep256, new RsaOAEPKeyProvider(store));

    const defaultKMSKeyResolver = new DefaultKMSKeyResolver(kms);
    const joseService = new JoseService(defaultKMSKeyResolver.resolvePrivateKeyByKid);

    const packer = new AnonCryptPacker(joseService, {
      resolve: async () => ({
        undefined
      })
    } as unknown as Resolvable);
    const message = await packer.unpack(byteEncoder.encode(JSON.stringify(golangGWE)));
    const expectedMessage = {
      id: '8589c266-f5f4-4a80-8fc8-c1ad4de3e3b4',
      thid: '43246acb-b772-414e-9c90-f36b37261000',
      typ: 'application/iden3comm-encrypted-json',
      type: 'https://iden3-communication.io/passport/0.1/verification-request',
      from: 'did:iden3:polygon:amoy:x6x5sor7zpxUwajVSoHGg8aAhoHNoAW1xFDTPCF49',
      to: 'did:iden3:billions:test:2VxnoiNqdMPyHMtUwAEzhnWqXGkEeJpAp4ntTkL8XT'
    };
    expect(message).to.be.deep.equal(expectedMessage);
  });
});
