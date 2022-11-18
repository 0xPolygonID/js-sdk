import { IPacker, MediaType, PackerParams } from 'types/packer';
import { Bytes } from 'types/index';
import { protocol } from '@iden3/js-iden3-auth';

export type BasicMessage = protocol.Message & {
  from: string;
  to: string;
};

export interface IPackageManger {
  packers: Map<MediaType, IPacker>;

  registerPackers(packers: Array<IPacker>): void;

  pack(
    mediaType: MediaType,
    payload: Bytes,
    params: PackerParams,
  ): Promise<Bytes>;

  unpack(envelope: Bytes): Promise<BasicMessage & { mediaType: MediaType }>;

  unpackWithType(mediaType: MediaType, envelope: Bytes): Promise<BasicMessage>;

  getMediaType(envelope: Bytes): MediaType;
}

export type EnvelopeStub = {
  protected: string;
};

export type HeaderStub = {
  typ: MediaType;
};
