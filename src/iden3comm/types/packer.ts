import { Id } from '@iden3/js-iden3-core';
import { BasicMessage, Bytes } from './index';
import { CircuitID } from '../mock/jsCircuits';

export type MediaType = string;

export type PackerParams = {
  [key in string]: any; //eslint-disable-line @typescript-eslint/no-explicit-any
};

export type ZKPPackerParams = {
  senderID: Id;
};

export type AuthDataPrepareFunc = (
  hash: Bytes,
  id: Id,
  circuitID: CircuitID,
) => Bytes;
export type StateVerificationFunc = (
  id: CircuitID,
  pubSignals: Array<string>,
) => Promise<boolean>;

export interface IPacker {
  pack(payload: Bytes, param: PackerParams): Promise<Bytes>;

  unpack(envelope: Bytes): Promise<BasicMessage>;

  mediaType(): MediaType;
}
