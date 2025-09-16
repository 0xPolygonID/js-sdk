import { Resolvable } from 'did-resolver';
import { JoseService } from '../../kms/services/jose.service';
import { base58ToBytes, base64UrlToBytes, byteDecoder, byteEncoder, hexToBytes } from '../../utils';
import {
  AcceptJweAlgorithms,
  MediaType,
  ProtocolVersion,
  VerificationMethodType
} from '../constants';
import { BasicMessage, DIDDocument, IPacker, VerificationMethod } from '../types';
import { parseAcceptProfile, resolveVerificationMethods } from '../utils';
import { KMS, KmsKeyId } from '../../kms';
import { DID } from '@iden3/js-iden3-core';

export type RecipientInfo = {
  did: DID;
  didDocument?: DIDDocument;
  keyType?: VerificationMethodType;
  alg?: AcceptJweAlgorithms;
};

export type JWEPackerParams = {
  alg: string;
  enc: string;
  recipients: RecipientInfo[];
  typ?: string;
};

export class AnonCryptPacker implements IPacker {
  private readonly _supportedProtocolVersions = [ProtocolVersion.V1];

  private _supportedAlgorithms = [
    AcceptJweAlgorithms.RSA_OAEP_256,
    AcceptJweAlgorithms.ECDH_ES_A256KW
  ];

  constructor(
    private readonly _joseService: JoseService,
    private readonly _kms: KMS,
    private readonly _documentResolver: Resolvable,
    private _kmsKeyIds: KmsKeyId[]
  ) {}

  packMessage(msg: BasicMessage, param: JWEPackerParams): Promise<Uint8Array> {
    return this.packInternal(msg, param);
  }

  getSupportedKeyIds(): KmsKeyId[] {
    return this._kmsKeyIds;
  }

  registerSupportedKeyIds(keyIds: KmsKeyId[]): void {
    this._kmsKeyIds = [...new Set([...this._kmsKeyIds, ...keyIds])];
  }

  getSupportedAlgorithms(): AcceptJweAlgorithms[] {
    return this._supportedAlgorithms;
  }

  registerSupportedAlgorithm(algorithm: AcceptJweAlgorithms): void {
    this._supportedAlgorithms = [...new Set([...this._supportedAlgorithms, algorithm])];
  }

  /**
   * creates JSON Web Signature token
   *
   * @param {Uint8Array} payload - serialized message
   * @param {PackerParams} params - sender id and proving alg are required
   * @returns `Promise<Uint8Array>`
   */
  async pack(payload: Uint8Array, params: JWEPackerParams): Promise<Uint8Array> {
    const message = JSON.parse(byteDecoder.decode(payload));
    return this.packInternal(message, params);
  }

  async unpack(envelope: Uint8Array): Promise<BasicMessage> {
    const jwe = JSON.parse(byteDecoder.decode(envelope));

    const promises = this._kmsKeyIds.map((keyId) =>
      this._joseService.decrypt(jwe, async () => {
        const pkStore = await this._kms.getKeyProvider(keyId.type)?.getPkStore();
        if (!pkStore) {
          throw new Error(`Key provider not found for ${keyId.type}`);
        }
        try {
          return JSON.parse(await pkStore.get({ alias: keyId.id })) as CryptoKey;
        } catch (error) {
          throw new Error(`Key not found for ${keyId.id}`);
        }
      })
    );

    const result = await Promise.any(promises);

    const { plaintext } = result;

    return JSON.parse(byteDecoder.decode(plaintext)) as BasicMessage;
  }

  mediaType(): MediaType {
    return MediaType.EncryptedMessage;
  }

  /** {@inheritDoc IPacker.getSupportedProfiles} */
  getSupportedProfiles(): string[] {
    return this._supportedProtocolVersions.map(
      (v) => `${v};env=${this.mediaType()};alg=${this._supportedAlgorithms.join(',')}`
    );
  }

  /** {@inheritDoc IPacker.isProfileSupported} */
  isProfileSupported(profile: string): boolean {
    const { protocolVersion, env, circuits, alg } = parseAcceptProfile(profile);

    if (!this._supportedProtocolVersions.includes(protocolVersion)) {
      return false;
    }
    if (env !== this.mediaType()) {
      return false;
    }

    if (circuits) {
      throw new Error(`Circuits are not supported for ${env} media type`);
    }

    return Boolean(alg?.some((a) => this._supportedAlgorithms.includes(a as AcceptJweAlgorithms)));
  }

  extractPublicKeyBytes = (vm: VerificationMethod): JsonWebKey | Uint8Array | null => {
    if (vm.publicKeyBase58) {
      return base58ToBytes(vm.publicKeyBase58);
    }
    if (vm.publicKeyBase64) {
      return base64UrlToBytes(vm.publicKeyBase64);
    }
    if (vm.publicKeyHex) {
      return hexToBytes(vm.publicKeyHex);
    }
    if (vm.publicKeyJwk) {
      return vm.publicKeyJwk;
    }

    return null;
  };

  private async getRecipientsJWKs(recipients: RecipientInfo[]): Promise<
    {
      did: string;
      keyType: VerificationMethodType;
      kid: string;
      recipientJWK: JsonWebKey;
    }[]
  > {
    return Promise.all(
      recipients.map(async (recipient) => {
        if (!recipient.did) {
          throw new Error('Missing target key id');
        }
        const recipientDidDoc: DIDDocument | null =
          recipient.didDocument ??
          (await this._documentResolver.resolve(recipient.did.string()))?.didDocument;

        if (!recipientDidDoc) {
          throw new Error('Recipient DID document not found');
        }

        const vms = resolveVerificationMethods(recipientDidDoc);

        if (!vms.length) {
          throw new Error(
            `No verification methods defined in the DID document of ${recipientDidDoc.id}`
          );
        }

        const keyType = recipient.keyType ?? 'JsonWebKey2020';

        // !!! TODO: could be more than one key with the same controller and type, taking the first one for now
        const vm = vms.find(
          (vm) => vm.controller === recipient.did.string() && vm.type === keyType
        );

        if (!vm) {
          throw new Error(
            `No key found with id ${recipient.did.string()} and type ${keyType} in DID document of ${
              recipientDidDoc.id
            }`
          );
        }

        const recipientJWK = this.extractPublicKeyBytes(vm);

        if (!recipientJWK) {
          throw new Error('No public key found');
        }

        if (recipientJWK instanceof Uint8Array) {
          throw new Error('Public key is not a JWK');
        }

        return {
          did: recipient.did.string(),
          keyType,
          kid: vm.id,
          recipientJWK
        };
      })
    );
  }

  private async packInternal(message: BasicMessage, params: JWEPackerParams): Promise<Uint8Array> {
    const { alg, enc, recipients, typ } = params;
    if (!alg) {
      throw new Error('Missing algorithm');
    }

    if (!enc) {
      throw new Error('Missing encryption algorithm');
    }

    // !!! TODO: is this check needed?
    if (!message.to) {
      throw new Error('Missing recipient DID');
    }

    const recipientsJwks = await this.getRecipientsJWKs(recipients);

    const msg = byteEncoder.encode(JSON.stringify(message));

    const jwe = await this._joseService.encrypt(msg, {
      alg,
      enc,
      typ: typ || MediaType.EncryptedMessage,
      recipients: recipientsJwks
    });

    return byteEncoder.encode(JSON.stringify(jwe));
  }
}
