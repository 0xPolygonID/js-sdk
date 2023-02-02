import { PlainPackerParams } from './../types/packer';
import { byteEncoder } from './../utils/index';
import { BasicMessage, IPacker } from '../types';
import { byteDecoder } from '../utils';
import { MediaType } from '../constants';

/**
 * Plain packer just serializes bytes to JSON and adds media type
 *
 * @export
 * @class PlainPacker
 * @implements {IPacker}
 */
export class PlainPacker implements IPacker {
  // 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  /**
   * Pack returns packed message to transport envelope
   *
   * @param {Uint8Array} payload - json message serialized
   * @param {PlainPackerParams} _params - not used here
   * @returns `Promise<Uint8Array>`
   */
  async pack(payload: Uint8Array, _params: PlainPackerParams): Promise<Uint8Array> {
    const msg = JSON.parse(byteDecoder.decode(payload));
    msg.typ = MediaType.PlainMessage;
    return Promise.resolve(byteEncoder.encode(JSON.stringify(msg)));
  }

  /**
   * Unpack returns unpacked message from transport envelope
   *
   * @param {Uint8Array} envelope - packed envelope (serialized json with media type)
   * @returns `Promise<BasicMessage>`
   */
  async unpack(envelope: Uint8Array): Promise<BasicMessage> {
    return JSON.parse(byteDecoder.decode(envelope));
  }

  /**
   * returns media type for plain message
   *
   * @returns MediaType
   */
  mediaType(): MediaType {
    return MediaType.PlainMessage;
  }
}
