import { Bytes } from '../types';

export const bytes2String = (b: Bytes) => {
  const textDecoder = new TextDecoder('utf-8');
  return textDecoder.decode(b);
};

export const string2Bytes = (str: string): Bytes => {
  const textEncoder = new TextEncoder();
  return textEncoder.encode(str);
};
