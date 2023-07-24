import { BasicMessage, IPackageManager, IPacker, PackerParams } from './types';
import { bytesToHeaderStub } from './utils/envelope';
import { base64 } from 'rfc4648';
import { MediaType } from './constants';
import { byteDecoder, byteEncoder } from '../utils';

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
    let base64HeaderBytes: Uint8Array;

    // full serialized
    if (envelope[0] === '{') {
      const envelopeStub = JSON.parse(envelope);
      return envelopeStub.typ as MediaType;
    } else {
      const header = envelope.split('.')[0];
      base64HeaderBytes = base64.parse(header, { loose: true });
    }

    const header = bytesToHeaderStub(base64HeaderBytes);
    return header.typ;
  }
}
