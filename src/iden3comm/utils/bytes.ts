/**
 * converts bytes array to ut8 string
 *
 * @param {Uint8Array} b - bytes array
 * @returns {string}
 */
export const bytesToString = (b: Uint8Array): string => {
  const textDecoder = new TextDecoder('utf-8');
  return textDecoder.decode(b);
};

export /**
 * converts ut8 string to bytes array
 *
 * @param {string} str - ut8 string
 * @returns {Uint8Array}
 */
const stringToBytes = (str: string): Uint8Array => {
  const textEncoder = new TextEncoder();
  return textEncoder.encode(str);
};
