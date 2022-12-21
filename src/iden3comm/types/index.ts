export * from './protocol/auth';
export * from './protocol/credentials';
export * from './protocol/devices';
export * from './protocol/messages';
export * from './protocol/proof';
export * from './protocol/revocation';

export * from './packer';
export * from './packageManger';

export type ProtocolMessage = string;
export type MediaType = string;

type JSONValue = string | number | boolean | object | Array<object>;

export type JSONObject = {
  [x: string]: JSONValue;
};

export type Bytes = Uint8Array;

export type CircuitID = string;
