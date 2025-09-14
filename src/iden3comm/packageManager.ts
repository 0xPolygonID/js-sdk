import { BasicMessage, IPackageManager, IPacker, PackerParams } from './types';
import { MediaType } from './constants';
import { base64ToBytes, byteDecoder, byteEncoder } from '../utils';

/**
 * Basic package manager for iden3 communication protocol
 *
 * @public
 * @class PackageManager
 * @implements implements IPackageManager interface
 */
export class PackageManager implements IPackageManager {
  packers: Map<MediaType, IPacker>;

  /**
   * Creates an instance of PackageManager.
   */
  constructor() {
    this.packers = new Map<MediaType, IPacker>();
  }

  /** {@inheritDoc IPackageManager.getSupportedProfiles} */
  getSupportedProfiles(): string[] {
    const acceptProfiles: string[] = [];
    const mediaTypes = this.getSupportedMediaTypes();
    for (const mediaType of mediaTypes) {
      const p = this.packers.get(mediaType);
      if (p) {
        acceptProfiles.push(...p.getSupportedProfiles());
      }
    }
    return [...new Set(acceptProfiles)];
  }

  /** {@inheritDoc IPackageManager.isProfileSupported} */
  isProfileSupported(mediaType: MediaType, profile: string): boolean {
    const p = this.packers.get(mediaType);
    if (!p) {
      return false;
    }

    return p.isProfileSupported(profile);
  }

  /** {@inheritDoc IPackageManager.getSupportedMediaTypes} */
  getSupportedMediaTypes(): MediaType[] {
    return [...this.packers.keys()];
  }

  /** {@inheritDoc IPackageManager.registerPackers} */
  registerPackers(packers: Array<IPacker>): void {
    packers.forEach((p) => {
      this.packers.set(p.mediaType(), p);
    });
  }

  /** {@inheritDoc IPackageManager.pack} */
  async pack(mediaType: MediaType, payload: Uint8Array, params: PackerParams): Promise<Uint8Array> {
    const p = this.packers.get(mediaType);
    if (!p) {
      throw new Error(`packer for media type ${mediaType} not found`);
    }

    return await p.pack(payload, params);
  }

  /**
   * Packs a protocol message using the specified media type and packer parameters.
   *
   * @param mediaType - The media type to use for packing the message.
   * @param protocolMessage - The protocol message to pack.
   * @param params - The packer parameters.
   * @returns A promise that resolves to the packed message as a Uint8Array.
   * @throws An error if the packer for the specified media type is not found.
   */
  packMessage(
    mediaType: MediaType,
    protocolMessage: BasicMessage,
    params: PackerParams
  ): Promise<Uint8Array> {
    const p = this.packers.get(mediaType);
    if (!p) {
      throw new Error(`packer for media type ${mediaType} not found`);
    }

    return p.packMessage(protocolMessage, params);
  }

  /** {@inheritDoc IPackageManager.unpack} */
  async unpack(
    envelope: Uint8Array
  ): Promise<{ unpackedMessage: BasicMessage; unpackedMediaType: MediaType }> {
    const decodedStr = byteDecoder.decode(envelope);
    const safeEnvelope = decodedStr.trim();
    const mediaType = this.getMediaType(safeEnvelope);
    return {
      unpackedMessage: await this.unpackWithSafeEnvelope(
        mediaType,
        byteEncoder.encode(safeEnvelope)
      ),
      unpackedMediaType: mediaType
    };
  }

  /** {@inheritDoc IPackageManager.unpackWithType} */
  async unpackWithType(mediaType: MediaType, envelope: Uint8Array): Promise<BasicMessage> {
    const decoder = new TextDecoder('utf-8');
    const decodedStr = decoder.decode(envelope);
    const safeEnvelope = decodedStr.trim();
    return await this.unpackWithSafeEnvelope(mediaType, byteEncoder.encode(safeEnvelope));
  }

  private async unpackWithSafeEnvelope(
    mediaType: MediaType,
    envelope: Uint8Array
  ): Promise<BasicMessage> {
    const p = this.packers.get(mediaType);
    if (!p) {
      throw new Error(`packer for media type ${mediaType} not found`);
    }
    const msg = await p.unpack(envelope);
    return msg;
  }

  /** {@inheritDoc IPackageManager.getMediaType} */
  getMediaType(envelope: string): MediaType {
    const error = new Error('Header is missing typ');
    const supportedMediaTypes = Object.values(MediaType);
    if (envelope[0] === '{') {
      const envelopeStub = JSON.parse(envelope);

      const typ = envelopeStub.typ;
      if (typ && supportedMediaTypes.includes(typ)) {
        return typ as MediaType;
      }

      if (envelopeStub.protected) {
        const typ =
          typeof envelopeStub.protected === 'string'
            ? JSON.parse(byteDecoder.decode(base64ToBytes(envelopeStub.protected, { loose: true })))
                ?.typ
            : envelopeStub.protected.typ;
        if (typ && supportedMediaTypes.includes(typ)) {
          return typ as MediaType;
        }
      }

      throw error;
    }
    const headerBase64 = envelope.split('.')[0];
    const header = JSON.parse(byteDecoder.decode(base64ToBytes(headerBase64, { loose: true })));
    const typ = header.typ as MediaType;
    if (!typ || !supportedMediaTypes.includes(typ)) {
      throw error;
    }
    return typ;
  }
}
