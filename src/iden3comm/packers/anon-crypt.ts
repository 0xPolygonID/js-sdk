import { Resolvable } from 'did-resolver';
import { JoseService } from '../../kms/services/jose.service';
import { base58ToBytes, base64UrlToBytes, byteDecoder, byteEncoder, hexToBytes } from '../../utils';
import {
  AcceptJweKEKAlgorithms,
  MediaType,
  ProtocolVersion,
  VerificationMethodType
} from '../constants';
import { BasicMessage, DIDDocument, IPacker, PackerParams, VerificationMethod } from '../types';
import { parseAcceptProfile, resolveVerificationMethods } from '../utils';
import { KMS, KmsKeyType } from '../../kms';
import { DID } from '@iden3/js-iden3-core';
import { decodeProtectedHeader, GeneralJWE, JWEHeaderParameters } from 'jose';

export type RecipientInfo = {
  did: DID;
  didDocument?: DIDDocument;
  keyType?: VerificationMethodType;
  alg?: AcceptJweKEKAlgorithms;
};

export type JWEPackerParams = PackerParams & {
  enc: string;
  recipients: RecipientInfo[];
};

export class AnonCryptPacker implements IPacker {
  private readonly _supportedProtocolVersions = [ProtocolVersion.V1];

  private _supportedAlgorithms = [
    AcceptJweKEKAlgorithms.RSA_OAEP_256,
    AcceptJweKEKAlgorithms.ECDH_ES_A256KW
  ];

  constructor(
    private readonly _joseService: JoseService,
    private readonly _kms: KMS,
    private readonly _documentResolver: Resolvable,
    private readonly options?: {
      resolvePrivateKeyByKid?: (kid: string) => Promise<CryptoKey>;
    }
  ) {}

  packMessage(msg: BasicMessage, param: JWEPackerParams): Promise<Uint8Array> {
    return this.packInternal(msg, param);
  }

  getSupportedAlgorithms(): AcceptJweKEKAlgorithms[] {
    return this._supportedAlgorithms;
  }

  registerSupportedAlgorithm(algorithm: AcceptJweKEKAlgorithms): void {
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
    const jwe: GeneralJWE = this.decodeGeneralJWE(envelope);

    if (!jwe.protected) {
      throw new Error('Missing protected header');
    }
    if (!jwe.recipients?.length) {
      throw new Error('Missing recipients');
    }
    const protectedHeaders = decodeProtectedHeader(jwe);

    const promises = jwe.recipients.map((recipient) =>
      this._joseService.decrypt(jwe, async () => {
        const kid = recipient.header?.kid || protectedHeaders.kid; // try to use protected kid if there is no kid in recipient header
        if (!kid) {
          throw new Error('Missing kid');
        }

        const kmsKeyType = (recipient.header?.alg || protectedHeaders.alg) as KmsKeyType;
        if (!kmsKeyType) {
          throw new Error('Missing kms key type');
        }

        const privateKey = await this.options?.resolvePrivateKeyByKid?.(kid);

        if (privateKey) {
          return privateKey;
        }

        const pkStore = await this._kms.getKeyProvider(kmsKeyType)?.getPkStore();
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

    return Boolean(
      alg?.some((a) => this._supportedAlgorithms.includes(a as AcceptJweKEKAlgorithms))
    );
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
      alg: string;
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
        const alg = recipient.alg ?? AcceptJweKEKAlgorithms.RSA_OAEP_256;

        // !!! TODO: could be more than one key with the same controller and type, taking the first one for now
        const vm = vms.find(
          (vm) =>
            vm.controller === recipient.did.string() &&
            vm.type === keyType &&
            vm.publicKeyJwk?.alg === alg
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
          alg,
          recipientJWK
        };
      })
    );
  }

  private async packInternal(message: BasicMessage, params: JWEPackerParams): Promise<Uint8Array> {
    const { enc, recipients } = params;

    if (!enc) {
      throw new Error('Missing encryption algorithm');
    }

    if (!recipients.length) {
      throw new Error('Missing recipients');
    }

    // if (!message.to) {
    //   throw new Error('Missing recipient DID');
    // }

    const recipientsJwks = await this.getRecipientsJWKs(recipients);

    const msg = byteEncoder.encode(JSON.stringify(message));

    const jwe = await this._joseService.encrypt(msg, {
      enc,
      typ: MediaType.EncryptedMessage,
      recipients: recipientsJwks
    });

    return byteEncoder.encode(JSON.stringify(jwe));
  }

  private decodeGeneralJWE(envelope: Uint8Array): GeneralJWE {
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
          header: this.removeDuplicates(protectedHeader, decodedJWE.header || {})
        }
      ];

      delete decodedJWE.encrypted_key;
      delete decodedJWE.header;
      decodedJWE.recipients = recipients;
    }
    return decodedJWE as GeneralJWE;
  }

  /**
   * Removes fields from recipient header that duplicate protected header values.
   */
  private removeDuplicates(
    protectedHeader: Record<string, any>,
    recipientHeader: Record<string, any>
  ) {
    const cleaned = { ...recipientHeader };
    for (const [key, value] of Object.entries(protectedHeader)) {
      if (cleaned[key] === value) delete cleaned[key];
    }
    return cleaned;
  }
}
