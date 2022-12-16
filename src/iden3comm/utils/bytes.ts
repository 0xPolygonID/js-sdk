export const bytesToString = (b: Uint8Array) => {
  const textDecoder = new TextDecoder('utf-8');
  return textDecoder.decode(b);
};

export const stringToBytes = (str: string): Uint8Array => {
  const textEncoder = new TextEncoder();
  return textEncoder.encode(str);
};
