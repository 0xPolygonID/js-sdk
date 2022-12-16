import { IPacker, MediaType, PackerParams } from './packer';
import { protocol } from '@iden3/js-iden3-auth';

export type BasicMessage = protocol.Message & {
  from: string;
  to: string;
};

export interface IPackageManger {
  packers: Map<MediaType, IPacker>;

  registerPackers(packers: Array<IPacker>): void;

  pack(mediaType: MediaType, payload: Uint8Array, params: PackerParams): Promise<Uint8Array>;

  unpack(envelope: Uint8Array): Promise<BasicMessage & { mediaType: MediaType }>;

  unpackWithType(mediaType: MediaType, envelope: Uint8Array): Promise<BasicMessage>;

  getMediaType(envelope: Uint8Array): MediaType;
}

export type EnvelopeStub = {
  protected: string;
};

export type HeaderStub = {
  typ: MediaType;
};
