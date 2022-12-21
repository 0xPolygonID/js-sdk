import { DID } from '@iden3/js-iden3-core';
import { DataPrepareHandlerFunc, VerificationHandlerFunc } from '../packers';
import { BasicMessage, Bytes } from './index';
import { CircuitID, MediaType } from '../types/index';
import { ProvingMethodAlg } from '@iden3/js-jwz';

export type PackerParams = {
  [key in string]: any; //eslint-disable-line @typescript-eslint/no-explicit-any
};

export type ZKPPackerParams = {
  senderID: DID;
  provingMethodAlg: ProvingMethodAlg;
};

export type AuthDataPrepareFunc = (hash: Bytes, id: DID, circuitID: CircuitID) => Bytes;
export type StateVerificationFunc = (id: CircuitID, pubSignals: Array<string>) => Promise<boolean>;

export interface IPacker {
  pack(payload: Bytes, param: PackerParams): Promise<Bytes>;

  unpack(envelope: Bytes): Promise<BasicMessage>;

  mediaType(): MediaType;
}

export type VerificationParams = {
  key: Bytes;
  verificationFn: VerificationHandlerFunc;
};

export type ProvingParams = {
  dataPreparer: DataPrepareHandlerFunc;
  provingKey: Bytes;
  wasm: Bytes;
};
