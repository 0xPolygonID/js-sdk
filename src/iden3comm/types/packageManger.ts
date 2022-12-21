import { IPacker, PackerParams } from './packer';
import { MediaType } from './';
import { MessageFetchRequestMessage } from './protocol/messages';

export type BasicMessage = MessageFetchRequestMessage;

export interface IPackageManger {
  packers: Map<MediaType, IPacker>;

  registerPackers(packers: Array<IPacker>): void;

  pack(mediaType: MediaType, payload: Uint8Array, params: PackerParams): Promise<Uint8Array>;

  unpack(
    envelope: Uint8Array
  ): Promise<{ unpackedMessage: BasicMessage; unpackedMediaType: MediaType }>;

  unpackWithType(mediaType: MediaType, envelope: Uint8Array): Promise<BasicMessage>;

  getMediaType(envelope: Uint8Array): MediaType;
}

export type EnvelopeStub = {
  protected: string;
};

export type HeaderStub = {
  typ: MediaType;
};
