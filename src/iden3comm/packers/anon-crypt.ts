import { Resolvable } from 'did-resolver';
import { JoseService } from '../../kms/services/jose.service';
import { byteDecoder, byteEncoder } from '../../utils';
import {
  AcceptJweKEKAlgorithms,
  MediaType,
  ProtocolVersion,
  VerificationMethodType
} from '../constants';
import { BasicMessage, DIDDocument, IPacker, PackerParams } from '../types';
import { decryptsJWE, getRecipientsJWKs, parseAcceptProfile } from '../utils';
import { KMS } from '../../kms';
import { DID } from '@iden3/js-iden3-core';

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
    const plaintext = await decryptsJWE(envelope, this._joseService, {
      resolvePrivateKeyByKid: this.options?.resolvePrivateKeyByKid,
      kms: this._kms
    });

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

  private async packInternal(message: BasicMessage, params: JWEPackerParams): Promise<Uint8Array> {
    const { enc, recipients } = params;

    if (!enc) {
      throw new Error('Missing encryption algorithm');
    }

    if (!recipients.length) {
      throw new Error('Missing recipients');
    }

    if (!message.to) {
      throw new Error('Missing recipient DID');
    }

    const recipientsJwks = await getRecipientsJWKs(recipients, this._documentResolver);

    const msg = byteEncoder.encode(JSON.stringify(message));

    const jwe = await this._joseService.encrypt(msg, {
      enc,
      typ: MediaType.EncryptedMessage,
      recipients: recipientsJwks
    });

    return byteEncoder.encode(JSON.stringify(jwe));
  }
}
