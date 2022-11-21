import { Bytes } from '../types';

export const bytesToString = (b: Bytes) => {
  const textDecoder = new TextDecoder('utf-8');
  return textDecoder.decode(b);
};

export const stringToBytes = (str: string): Bytes => {
  const textEncoder = new TextEncoder();
  return textEncoder.encode(str);
};
