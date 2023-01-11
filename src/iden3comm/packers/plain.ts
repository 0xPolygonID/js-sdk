import { PlainPackerParams } from './../types/packer';
import { byteEncoder } from './../utils/index';
import { BasicMessage, IPacker } from '../types';
import { byteDecoder } from '../utils';
import { MediaType } from '../constants';

export class PlainPacker implements IPacker {
  // Pack returns packed message to transport envelope
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async pack(payload: Uint8Array, _params: PlainPackerParams): Promise<Uint8Array> {
    const msg = JSON.parse(byteDecoder.decode(payload));
    msg.typ = MediaType.PlainMessage;
    return Promise.resolve(byteEncoder.encode(JSON.stringify(msg)));
  }

  // Unpack returns unpacked message from transport envelope
  async unpack(envelope: Uint8Array): Promise<BasicMessage> {
    return JSON.parse(byteDecoder.decode(envelope));
  }

  mediaType(): MediaType {
    return MediaType.PlainMessage;
  }
}
