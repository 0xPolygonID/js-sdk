export * from './protocol/auth';
export * from './protocol/credentials';
export * from './protocol/messages';
export * from './protocol/proof';
export * from './protocol/revocation';

export * from './packer';
export * from './packageManager';
/**
 *  Protocol message type
 */
export type ProtocolMessage = string;

type JSONValue = string | number | boolean | object | Array<object>;

export type JSONObject = {
  [x: string]: JSONValue;
};
