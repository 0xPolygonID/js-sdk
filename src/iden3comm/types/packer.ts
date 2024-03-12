import { DID } from '@iden3/js-iden3-core';
import { DataPrepareHandlerFunc, VerificationHandlerFunc } from '../packers';
import { ProvingMethodAlg } from '@iden3/js-jwz';
import { CircuitId } from '../../circuits';
import { MediaType } from '../constants';
import { DIDDocument, VerificationMethod } from 'did-resolver';
import { Signer } from 'did-jwt';
/**
 *  Protocol message type
 */
export type ProtocolMessage = string;

/**
 * JSONValue
 */
export type JSONValue = string | number | boolean | object | Array<object>;

/**
 * JSON object
 */
export type JSONObject = {
  [x: string]: JSONValue;
};

export type BasicMessage = {
  id: string;
  typ?: MediaType;
  type: ProtocolMessage;
  thid?: string;
  body?: unknown;
  from?: string;
  to?: string;
};

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
  /** @deprecated */
  profileNonce?: number;
  provingMethodAlg: ProvingMethodAlg;
};

/**
 *  SignerFn Is function to sign data with a verification method
 */
export type SignerFn = (vm: VerificationMethod, data: Uint8Array) => Signer;

/**
 *  JWSPackerParams are parameters for JWS packer
 */
export type JWSPackerParams = PackerParams & {
  alg: string;
  kid?: string;
  didDocument?: DIDDocument;
  signer?: SignerFn;
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
  circuitId: CircuitId
) => Promise<Uint8Array>;

/**
 *  signature of state function verifier
 */
export type StateVerificationFunc = (id: string, pubSignals: Array<string>) => Promise<boolean>;

/**
 * Defines method that must be implemented by any packer
 *
 * @public
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
