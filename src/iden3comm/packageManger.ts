import { BasicMessage, IPackageManger, IPacker, MediaType, PackerParams } from './types';
import { bytesToEnvelopeStub, bytesToHeaderStub } from './utils/envelope';
import { bytesToString, stringToBytes } from './utils';
import { base64 } from 'rfc4648';

export class PackageManger implements IPackageManger {
  packers: Map<MediaType, IPacker>;

  constructor() {
    this.packers = new Map<MediaType, IPacker>();
  }

  registerPackers(packers: Array<IPacker>): void {
    packers.forEach((p) => {
      this.packers.set(p.mediaType(), p);
    });
  }

  async pack(mediaType: MediaType, payload: Uint8Array, params: PackerParams): Promise<Uint8Array> {
    const p = this.packers.get(mediaType);
    return await p!.pack(payload, params);
  }

  async unpack(envelope: Uint8Array): Promise<BasicMessage & { mediaType: MediaType }> {
    const decodedStr = bytesToString(envelope);
    const safeEnvelope = decodedStr.trim();
    const mediaType = this.getMediaType(stringToBytes(safeEnvelope));
    return {
      ...(await this.unpackWithSafeEnvelope(mediaType, stringToBytes(safeEnvelope))),
      mediaType
    };
  }

  async unpackWithType(mediaType: MediaType, envelope: Uint8Array): Promise<BasicMessage> {
    const decoder = new TextDecoder('utf-8');
    const decodedStr = decoder.decode(envelope);
    const safeEnvelope = decodedStr.trim();
    return await this.unpackWithSafeEnvelope(mediaType, stringToBytes(safeEnvelope));
  }

  async unpackWithSafeEnvelope(mediaType: MediaType, envelope: Uint8Array): Promise<BasicMessage> {
    const p = this.packers.get(mediaType);
    const msg = await p!.unpack(envelope);
    return msg;
  }

  getMediaType(envelope: Uint8Array): MediaType {
    const envelopeStr = bytesToString(envelope);
    let base64HeaderBytes: Uint8Array;

    // full seriliazed
    if (envelopeStr.split('')[0] === '{') {
      const envelopeStub = bytesToEnvelopeStub(envelope);
      base64HeaderBytes = base64.parse(envelopeStub.protected, { loose: true });
    } else {
      const header = envelopeStr.split('.')[0];
      base64HeaderBytes = base64.parse(header, { loose: true });
    }

    const header = bytesToHeaderStub(base64HeaderBytes);
    return header.typ;
  }
}
