import { PlainPackerParams } from './../types/packer';
import { BasicMessage, IPacker } from '../types';
import { MediaType } from '../constants';
import { byteDecoder, byteEncoder } from '../../utils';

/**
 * Plain packer just serializes bytes to JSON and adds media type
 *
 * @public
 * @class PlainPacker
 * @implements implements IPacker interface
 */
export class PlainPacker implements IPacker {
  /**
   * Pack returns packed message to transport envelope
   *
   * @param {Uint8Array} payload - json message serialized
   * @param {PlainPackerParams} _params - not used here
   * @returns `Promise<Uint8Array>`
   */
  //
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
