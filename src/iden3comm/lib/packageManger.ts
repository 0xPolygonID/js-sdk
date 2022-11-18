import {
  BasicMessage,
  Bytes,
  IPackageManger,
  IPacker,
  MediaType,
  PackerParams,
} from '../types';
import { bytes2EnvelopeStub, bytes2HeaderStub } from './utils/envelope';
import { bytes2String, string2Bytes } from './utils';
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

  async pack(
    mediaType: MediaType,
    payload: Bytes,
    params: PackerParams,
  ): Promise<Bytes> {
    const p = this.packers.get(mediaType);
    return await p.pack(payload, params);
  }

  async unpack(
    envelope: Bytes,
  ): Promise<BasicMessage & { mediaType: MediaType }> {
    const decodedStr = bytes2String(envelope);
    const safeEnvelope = decodedStr.trim();
    const mediaType = this.getMediaType(string2Bytes(safeEnvelope));
    return {
      ...(await this.unpackWithSafeEnvelope(
        mediaType,
        string2Bytes(safeEnvelope),
      )),
      mediaType,
    };
  }

  async unpackWithType(
    mediaType: MediaType,
    envelope: Bytes,
  ): Promise<BasicMessage> {
    const decoder = new TextDecoder('utf-8');
    const decodedStr = decoder.decode(envelope);
    const safeEnvelope = decodedStr.trim();
    return await this.unpackWithSafeEnvelope(
      mediaType,
      string2Bytes(safeEnvelope),
    );
  }

  async unpackWithSafeEnvelope(
    mediaType: MediaType,
    envelope: Bytes,
  ): Promise<BasicMessage> {
    const p = this.packers.get(mediaType);
    const msg = p.unpack(envelope);
    return msg;
  }

  getMediaType(envelope: Bytes): MediaType {
    const envelopeStr = bytes2String(envelope);
    let base64HeaderBytes: Bytes;

    // full seriliazed
    if (envelopeStr.split('')[0] === '{') {
      const envelopeStub = bytes2EnvelopeStub(envelope);
      base64HeaderBytes = base64.parse(envelopeStub.protected, { loose: true });
    } else {
      const header = envelopeStr.split('.')[0];
      base64HeaderBytes = base64.parse(header, { loose: true });
    }

    const header = bytes2HeaderStub(base64HeaderBytes);
    return header.typ;
  }
}
