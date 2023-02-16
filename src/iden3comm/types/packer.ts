import { DID } from '@iden3/js-iden3-core';
import { DataPrepareHandlerFunc, VerificationHandlerFunc } from '../packers';
import { BasicMessage } from './index';
import { ProvingMethodAlg } from '@iden3/js-jwz';
import { CircuitId } from '../../circuits';
import { MediaType } from '../constants';

/**
 *  parameters for any packer
 */
export type PackerParams = {
  [key in string]: any; //eslint-disable-line @typescript-eslint/no-explicit-any
};
/**
 *  parameters for zkp packer
 */
export type ZKPPackerParams = PackerParams & {
  senderDID: DID;
  profileNonce: number;
  provingMethodAlg: ProvingMethodAlg;
};

/**
 *  parameters for plain packer
 */
export type PlainPackerParams = PackerParams;
/**
 *  signature of auth signals function preparer
 */
export type AuthDataPrepareFunc = (
  hash: Uint8Array,
  did: DID,
  profileNonce: number,
  circuitId: CircuitId
) => Promise<Uint8Array>;

/**
 *  signature of state function verifier
 */
export type StateVerificationFunc = (id: string, pubSignals: Array<string>) => Promise<boolean>;

/**
 * Defines method that must be implemented by any packer
 *
 * @export
 * @beta
 * @interface   IPacker
 */
export interface IPacker {
  pack(payload: Uint8Array, param: PackerParams): Promise<Uint8Array>;

  unpack(envelope: Uint8Array): Promise<BasicMessage>;

  mediaType(): MediaType;
}
/**
 * Params for verification of auth circuit public signals
 */
export type VerificationParams = {
  key: Uint8Array;
  verificationFn: VerificationHandlerFunc;
};

/**
 * Params for generation of proof for auth circuit
 */
export type ProvingParams = {
  dataPreparer: DataPrepareHandlerFunc;
  provingKey: Uint8Array;
  wasm: Uint8Array;
};
