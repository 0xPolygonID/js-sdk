import {
  AnonCryptPacker,
  DIDDocument,
  KmsKeyId,
  InMemoryPrivateKeyStore,
  RsaKeyProvider,
  PROTOCOL_CONSTANTS,
  JoseService,
  IPackageManager,
  PackageManager,
  KMS
} from '../../src';
import { describe, it, expect } from 'vitest';
import { DIDResolutionResult, JsonWebKey, Resolvable } from 'did-resolver';

describe('AnonCrypt packer tests', () => {
  const endUserDid = 'did:iden3:billions:test:2VxnoiNqdMPyHMtUwAEzhnWqXGkEeJpAp4ntTkL8XT';
  const mobileDid = 'did:iden3:polygon:amoy:x6x5sor7zpxUwajVSoHGg8aAhoHNoAW1xFDTPCF49';

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
    const memoryKeyStore = new InMemoryPrivateKeyStore();
    const kmsProvider = new RsaKeyProvider(memoryKeyStore);
    const kmsKeyId = await kmsProvider.newPrivateKeyFromSeed(
      new TextEncoder().encode(`${did}#encryptionKey1`)
    );
    const publicKeyJwk = JSON.parse(await kmsProvider.publicKey(kmsKeyId));

    const kid = kmsKeyId.id.split(':').slice(0, 1).join(':');

    const didDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1'
      ],
      id: did,
      keyAgreement: [kid],
      verificationMethod: [
        {
          id: kid,
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

    const kms = new KMS();
    kms.registerKeyProvider(kmsProvider.keyType, kmsProvider);

    const joseService = new JoseService(kms);

    const packer = new AnonCryptPacker(joseService, resolver, [kmsKeyId]);
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
    const {
      packerManager: endUserPackageManager,
      didDocument: endUserDidDocument,
      kid: endUserKid
    } = await initKeyStore(endUserDid);

    const {
      packerManager: mobilePackageManager,
      didDocument: mobileDidDocument,
      kid: mobileKid
    } = await initKeyStore(mobileDid, {
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
      from: mobileDid,
      to: endUserDid
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
      from: endUserDid,
      to: mobileDid,
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
});
