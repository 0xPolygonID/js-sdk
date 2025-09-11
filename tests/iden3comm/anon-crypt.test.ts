import {
  AnonCryptPacker,
  DIDDocument,
  KmsKeyId,
  InMemoryPrivateKeyStore,
  RsaOAEPKeyProvider,
  PROTOCOL_CONSTANTS,
  JoseService,
  IPackageManager,
  FSCircuitStorage,
  CircuitId,
  CredentialStatusResolverRegistry,
  CredentialStatusType,
  RHSResolver,
  CredentialWallet,
  IdentityWallet,
  ProofService,
  AuthorizationResponseMessage,
  BasicMessage
} from '../../src';
import { describe, it, expect } from 'vitest';
import { DIDResolutionResult, JsonWebKey, Resolvable } from 'did-resolver';
import path from 'path';
import {
  IPFS_URL,
  MOCK_STATE_STORAGE,
  SEED_USER,
  createIdentity,
  getInMemoryDataStorage,
  getPackageMgr,
  registerKeyProvidersInMemoryKMS
} from '../helpers';
import { schemaLoaderForTests } from '../mocks/schema';
import { ProvingMethodAlg } from '@iden3/js-jwz';
import { DID } from '@iden3/js-iden3-core';
import { AuthorizationRequest } from 'ethers';

const senderMockedPrivateRsaKeyJwk: JsonWebKey = {
  key_ops: ['decrypt', 'unwrapKey'],
  ext: true,
  alg: 'RSA-OAEP-256',
  kty: 'RSA',
  n: 'zsuP2qoCHdm8UOLNYhQwcRuriCTRdB780u4POpqYV9LIu3mCcK2rpaglTjBPpjvUu5ZAO3IKY-z91Hj4C0JLMA4SYT2udb1arJ3fr2ZZLcpRR-3hzQCYnX_8zZp63LiTv-uhoDKh9pCfZLB7O7eQKbVQcujeVnCXW2dNNDuEf1zrNQh0T3ZirOhYixfIYEqVb9Jrqx605WiXPb4Ur_e2jpfjUkSGKOj-P-zADWNH4wxuL21Wz3sMKHoHycMeCIfteqqrbP0Q67RXb8Q4AxtVsIOMFSYrUgoEVUZ67gCQ0FkgkFS4v8R__wStQp7uSd3_aedQBM3NtjOBG-PHob30hQ',
  e: 'AQAB',
  d: 'BOPb6j4QcD_Em_4NAMd88MPIfd7vBAmyjVNbUVW0CgmePQ6txrfYogF0pmFulL3_9RKjwLQc6kmBpBtbNDr0V7XRefKxNDAO25udHUL0k2hgHS0TJJuhwEG1SvBe_Oaxeb2a9BSWb2PynPkuZNZdpprWxOzcSxt8_MiX0wcgRjmzpW0JwjYAx_qn43xqm6apygTLKTMEigx4ZrC2zlHbFt3kcaz-Q93iI8y8jZzRKkUzeMoQV1KEUY793qTS02psckRbi7Q6w-LnV7Y5gY1hhXgfXRz8QTfJcJ2mELCmkhlvIe8KwcpTjP9L51MvzcaZtycU6PS9GNzyRvKjsf5boQ',
  p: '5jP0x2LQO7GadcQ03VssOulxgA-PpYGBdWBL5cO6jhIhGEMqu3sa-L2VAq3f9BJtlnGdy6FUIV6eb8qcTwqR0r7BIOTmcE0FDFwTasc9WyfKNf4Pt1N55zvEP76iEd6zWodbkan4Q67xpVZ6Ul6P4n56oVO82INNjorba-Uo8mE',
  q: '5fgVwEr4K1yxZGJ7_Y0bJG_mPRZ4bmdUNLYSKx4ueLCAUqAv-lvY1xo2UEAGW7Au405itF9HEHBbdgc2wROkcRiIUVM5XP9f12KOh88mm5332KHe2Q5KS7Le_uB0y2J4WZHYCtMMUD9AGjJqYTN3fnZsIpsnf0d0-iQwBWdrPKU',
  dp: 'sBMHY8YZvb7PhMopITJON1U84hWE6rOOoIeiJcC6nVYSiCs_sRys-ZqQMfdqN5YsyghnCEyCO-_SQXF4cyCDfu02bQGHnFfcx6JZm69_J4zcpsWHodIwiIP3TEZ0UjTDfDfR-y1FXgeefrcRYpU_ep8BDwoshHKRzLg6smEaG6E',
  dq: 'dgSgHQQcYhx6yRqlqRSeRk_K57S9b2NF2ptJrakajkN-R2j_1ksGeDVyhDKnUKyVE4AptYlj7fLLbUH8fo-3B3dglePQ_4HrTJy-qsHLfXdPN3Sy6c-knz6XpFPKfIn3W3g2WC_BFPmwywDuiR2hiFv72LKpTW99f9XMcymE5iU',
  qi: 'syGTySO_FuJ4KfqeVTbN2oU5OjFYJ72bNcUduVjQqjGFL0FdfZfY7M3LS6S6oyqQ9J1kvce28_JETxKvLPRGprXHrmfGkEqbIftH_LEYEFK3_YHRKYQDqgPn9YCxD4dE2nZuoCpEJ5sc6b_dGOs-zzyMhqtqp8g-IErGTW6Tno4'
};

const recipientMockedPrivateRsaKeyJwk: JsonWebKey = {
  key_ops: ['decrypt', 'unwrapKey'],
  ext: true,
  alg: 'RSA-OAEP-256',
  kty: 'RSA',
  n: 'zOKtDeYPtUI_5CP0p01WUpU6D0RYSGaPfe2U_WBSFMSwcp-yVjj-SeCa9n652UD5H7q3yJ3qGmVOGuDkhNZkCm0mR2wEsidW2lvOa0McTbrVkCDstNYzpIUFYBpGjW2W40DCJi79IXFtwHCxlkm1YFuzv_OPWdhlmSiBn9x1BifEXMCdWcSe9pMGD37BgQ6TMBaP-0r25I2-1KXH6Nastk9ukCA-rW2MjAE9oTycbRckKkr3FXmH-jXP9vSj85AySSxrNDKv6XhYXauXQx8GgHrkA59uv7fe1J1_FyQljBx5K0_0vZ31qFLAhUPBhSKECNLLItG-p-EPP-YwfH-aOw',
  e: 'AQAB',
  d: 'RH_YqdfsEobWw5i92B2EKdIYejg4Z-RaPxjqghfs-WKVN41q22bspZiBVr4htqABanlLrrgVJ8QM6_GalUr0YYQCk0hq_YEniZO-HKBwWxCHDEvlt8QRugR7OpkuU2R7WPkyr_9vw_mfXwKObRexm0itfRSaLciqlx0y0VasjWSu5oVBItwYPtiRdtGT8ijNP-so5EzEOfHet9VRflsjpuCMQsKVGdjkv8lRwEKps72DVMHj177V_WS1_Q-sGWfHJ8UijWZFHMRaVPTfZfiNIQDmhqHyE8rJxchEslmdCcdSPUxWQFzTD5DcySwUK3y6nWU-GC9yQIbDsHOrYL2r-Q',
  p: '8asp2K_l0JMKYEPAR9mcxVzRSmk4GHqvfENUZpzdiTWKtRr4fJRPoroNrKHYoP262NWmoAA6ByizEh4RLmWcqeW0KXRj7rNlrKENziIYoPsa9KEOraw8tngZouRASN1uUlzowQfi0KZLa9c1OxSpKlZfZFl8-W9z0UDNk5rnnmc',
  q: '2QkY9oEsblagI8mg-g9rjGlyeloT-_n8EaPcAKRUP15GqwxR5xVd0NsfTbpq0UmVt-1DOwLxjZj9IoQauIwqRpR3rjm6d0nZDsZ5levmbdJSogh9p6TWtDgtsxCwQDvlZzv3KUeonv38q9Pj0UcvbUcCgjD1Z0vJS4ML_xnHmQ0',
  dp: 'P_xZsA2ig37rGGHX3y422-qfX1xMhe611-jbx-9wmIuclib188Yw75zjUfnoKXgEqLSo0WQ9-PdFsl5Tnj05JaKz-OXgL6tAGFzsEs_kRXs2v96EzGb2DDnwT7ivbJt0QkpnNfSokSX2gi8Q4Puvbo4_44nuFPz1ZUoLJDG3cbE',
  dq: 'ueY_-ozkSNJsMps3BlmE7m03wDM94NvcHCP1gps_ClQvRb20vbGgfQ_jfUmKyx8zXaqdpoM78eQ0Fod-98ofP_tVk-cgn6KiiDRa2p6H7lNzshSBxMG9ofposnM99JcZRNapOzOE7EJzVZ6WCaDmr7xeGrPiz4qrrcFe2i_ztlU',
  qi: '5EPnR-ZCz3RxD1u7u7cP0YFjZWC8CACdNz4hax2jzxcsth2ratG0viUB3FwhHQX-HszHnSCy1yTqavYhEIAaMyFcKC5fO4NTJP4qPMjeiMYcyyLQJNe4frLQ2gEA3cmMYF96A5ILM23zxIlo8as4WgFZj0ZYHMzDEj91yX3iKDU'
};

describe('AnonCrypt packer tests', () => {
  const aliceDid = 'did:iden3:billions:test:2VxnoiNqdMPyHMtUwAEzhnWqXGkEeJpAp4ntTkL8XT';
  const bobDid = 'did:iden3:polygon:amoy:x7Z95VkUuyo6mqraJw2VGwCfqTzdqhM1RVjRHzcpK';
  const zkRoomDid = 'did:iden3:privado:main:2SZu1G6YDUtk9AAY6TZic24CcCYcZvtdyp1cQv9cig';

  const initKeyStore = async (
    did: string,
    didDocResolver?: Resolvable
  ): Promise<{
    packerManager: IPackageManager;
    kmsKeyId: KmsKeyId;
    didDocument: DIDDocument;
    publicKeyJwk: JsonWebKey;
    kid: string;
  }> => {
    const kms = registerKeyProvidersInMemoryKMS();
    const dataStorage = getInMemoryDataStorage(MOCK_STATE_STORAGE);
    const circuitStorage = new FSCircuitStorage({
      dirname: path.join(__dirname, '../proofs/testdata')
    });

    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );
    const credWallet = new CredentialWallet(dataStorage, resolvers);
    const idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    const { did: userDID } = await createIdentity(idWallet, {
      seed: SEED_USER
    });
    const merklizeOpts = {
      documentLoader: schemaLoaderForTests({
        ipfsNodeURL: IPFS_URL
      })
    };

    const proofService = new ProofService(
      idWallet,
      credWallet,
      circuitStorage,
      MOCK_STATE_STORAGE,
      merklizeOpts
    );

    const packerManager = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthInputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    );

    const memoryKeyStore = new InMemoryPrivateKeyStore();

    // mock get to return mocked key by alias
    memoryKeyStore.get = ({ alias }: { alias: string }): Promise<string> => {
      if (alias === 'sender') return Promise.resolve(JSON.stringify(senderMockedPrivateRsaKeyJwk));
      if (alias === 'recipient')
        return Promise.resolve(JSON.stringify(recipientMockedPrivateRsaKeyJwk));
      return Promise.reject(new Error('key not found'));
    };

    // return mocked key id
    const kmsProvider = new RsaOAEPKeyProvider(memoryKeyStore);
    const kmsKeyId = { id: 'recipient', type: kmsProvider.keyType };
    const publicKeyJwk = JSON.parse(await kmsProvider.publicKey(kmsKeyId));

    const didDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1'
      ],
      id: did,
      keyAgreement: [kmsKeyId.id],
      verificationMethod: [
        {
          id: kmsKeyId.id,
          type: 'JsonWebKey2020',
          controller: did,
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

    kms.registerKeyProvider(kmsProvider.keyType, kmsProvider);

    const joseService = new JoseService(kms);

    const packer = new AnonCryptPacker(joseService, resolver, [kmsKeyId]);
    packerManager.registerPackers([packer]);

    return {
      packerManager,
      kmsKeyId,
      didDocument: didDocument as unknown as DIDDocument,
      publicKeyJwk,
      kid: kmsKeyId.id
    };
  };

  it('pack / unpack: kid', async () => {
    const {
      packerManager: endUserPackageManager,
      didDocument: endUserDidDocument,
      kid: endUserKid
    } = await initKeyStore(aliceDid);

    const {
      packerManager: mobilePackageManager,
      didDocument: mobileDidDocument,
      kid: mobileKid
    } = await initKeyStore(bobDid, {
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
      from: bobDid,
      to: aliceDid
    };

    // 2. mobile side encrypts the message with end user's public key

    const encryptedMsgToEndUser = await mobilePackageManager.packMessage(
      PROTOCOL_CONSTANTS.MediaType.EncryptedMessage,
      messageToEncrypt,
      {
        alg: PROTOCOL_CONSTANTS.AcceptJweAlgorithms.RSA_OAEP_256,
        enc: PROTOCOL_CONSTANTS.JweEncryption.A256GCM,
        kid: endUserKid,
        typ: PROTOCOL_CONSTANTS.MediaType.EncryptedMessage
      }
    );

    console.log('encryptedMsgToEndUser', new TextDecoder().decode(encryptedMsgToEndUser));

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
      from: aliceDid,
      to: bobDid,
      body: {
        did_doc: mobileDidDocument
      }
    };

    const packedMessage = await endUserPackageManager.packMessage(unpackedMediaType, responseMsg, {
      recipientDidDoc: mobileDidDocument,
      alg: PROTOCOL_CONSTANTS.AcceptJweAlgorithms.RSA_OAEP_256,
      enc: PROTOCOL_CONSTANTS.JweEncryption.A256GCM,
      typ: PROTOCOL_CONSTANTS.MediaType.EncryptedMessage,
      kid: mobileKid
    });

    // 5. mobile decrypts the message with his private key
    const { unpackedMessage: unpackedResponseMsg, unpackedMediaType: unpackedResponseMediaType } =
      await mobilePackageManager.unpack(packedMessage);

    expect(unpackedResponseMsg).toEqual(responseMsg);
    expect(unpackedResponseMediaType).toEqual(PROTOCOL_CONSTANTS.MediaType.EncryptedMessage);
  });

  it.only('share profile endpoint (Bob share Profile with Alice)', async () => {
    const { kid: aliceUserKid } = await initKeyStore(aliceDid);

    const { packerManager: bobPackageManager, didDocument: bobDidDocument } = await initKeyStore(
      bobDid
    );

    // 1. Bob encrypts (JWE) auth-response (with profile) with Alice public key.
    const messageToEncrypt: BasicMessage = {
      id: crypto.randomUUID(),
      thid: crypto.randomUUID(),
      typ: PROTOCOL_CONSTANTS.MediaType.EncryptedMessage,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE,
      body: {
        scope: [] // profile data would be here
      },
      from: bobDid,
      to: aliceDid
    };

    const encryptedMsgToAlice = await bobPackageManager.packMessage(
      PROTOCOL_CONSTANTS.MediaType.EncryptedMessage,
      messageToEncrypt,
      {
        alg: PROTOCOL_CONSTANTS.AcceptJweAlgorithms.RSA_OAEP_256,
        enc: PROTOCOL_CONSTANTS.JweEncryption.A256GCM,
        kid: aliceUserKid,
        typ: PROTOCOL_CONSTANTS.MediaType.EncryptedMessage
      }
    );

    const jweTokenString = new TextDecoder().decode(encryptedMsgToAlice);
    console.log('JWE encryptedMsgToEndUser', jweTokenString);
    // 2. Bob pack (JWZ) the message for ZK-Room (authorization + DID DOC share) + JWE Attachment
    const messageToZkRoom: AuthorizationResponseMessage = {
      id: crypto.randomUUID(),
      thid: crypto.randomUUID(),
      typ: PROTOCOL_CONSTANTS.MediaType.ZKPMessage,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE,
      body: {
        did_doc: bobDidDocument,
        scope: []
      },
      from: bobDid,
      to: zkRoomDid,
      attachments: [
        {
          id: '1',
          data: {
            json: {
              token: jweTokenString
            }
          }
        }
      ]
    };
    const jwz = await bobPackageManager.packMessage(
      PROTOCOL_CONSTANTS.MediaType.ZKPMessage,
      messageToZkRoom,
      {
        senderDID: DID.parse(bobDid),
        provingMethodAlg: new ProvingMethodAlg('groth16', 'authV2')
      }
    );

    console.log('JWZ to ZK-Room', new TextDecoder().decode(jwz));
    expect(jwz).toBeDefined();
  });
});
