import { BasicMessage, IPacker } from '../types';
import { MediaType, ProtocolVersion } from '../constants';
import { byteDecoder, byteEncoder } from '../../utils';
import { parseAcceptProfile } from '../utils';

/**
 * Plain packer just serializes bytes to JSON and adds media type
 *
 * @public
 * @class PlainPacker
 * @implements implements IPacker interface
 */
export class PlainPacker implements IPacker {
  /**
   * Packs a basic message using the specified parameters.
   *
   * @param msg - The basic message to pack.
   * @param param - The packer parameters.
   * @returns A promise that resolves to a Uint8Array representing the packed message.
   * @throws An error if the method is not implemented.
   */
  packMessage(msg: BasicMessage): Promise<Uint8Array> {
    msg.typ = MediaType.PlainMessage;
    return Promise.resolve(byteEncoder.encode(JSON.stringify(msg)));
  }
  /**
   * Pack returns packed message to transport envelope
   *
   * @param {Uint8Array} payload - json message serialized
   * @param {PlainPackerParams} _params - not used here
   * @returns `Promise<Uint8Array>`
   */
  async pack(payload: Uint8Array): Promise<Uint8Array> {
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

  /** {@inheritDoc IPacker.getSupportedProfiles} */
  getSupportedProfiles(): string[] {
    return this.getSupportedProtocolVersions().map((v) => `${v};env=${this.mediaType()}`);
  }

  /** {@inheritDoc IPacker.isProfileSupported} */
  isProfileSupported(profile: string) {
    const { protocolVersion, env, circuits, alg } = parseAcceptProfile(profile);

    if (!this.getSupportedProtocolVersions().includes(protocolVersion)) {
      return false;
    }
    if (env !== this.mediaType()) {
      return false;
    }

    if (circuits) {
      throw new Error(`Circuits are not supported for ${env} media type`);
    }

    if (alg) {
      throw new Error(`Algorithms are not supported for ${env} media type`);
    }

    return true;
  }

  private getSupportedProtocolVersions(): ProtocolVersion[] {
    return [ProtocolVersion.V1];
  }
}
