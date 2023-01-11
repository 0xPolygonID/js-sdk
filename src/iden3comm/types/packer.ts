import { DID } from '@iden3/js-iden3-core';
import { DataPrepareHandlerFunc, VerificationHandlerFunc } from '../packers';
import { BasicMessage } from './index';
import { ProvingMethodAlg } from '@iden3/js-jwz';
import { CircuitId } from '../../circuits';
import { MediaType } from '../constants';

export type PackerParams = {
  [key in string]: any; //eslint-disable-line @typescript-eslint/no-explicit-any
};

export type ZKPPackerParams = PackerParams & {
  senderID: DID;
  provingMethodAlg: ProvingMethodAlg;
};

export type PlainPackerParams = PackerParams;

export type AuthDataPrepareFunc = (
  hash: Uint8Array,
  id: DID,
  circuitId: CircuitId
) => Promise<Uint8Array>;

export type StateVerificationFunc = (id: string, pubSignals: Array<string>) => Promise<boolean>;

export interface IPacker {
  pack(payload: Uint8Array, param: PackerParams): Promise<Uint8Array>;

  unpack(envelope: Uint8Array): Promise<BasicMessage>;

  mediaType(): MediaType;
}

export type VerificationParams = {
  key: Uint8Array;
  verificationFn: VerificationHandlerFunc;
};

export type ProvingParams = {
  dataPreparer: DataPrepareHandlerFunc;
  provingKey: Uint8Array;
  wasm: Uint8Array;
};
