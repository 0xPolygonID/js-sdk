import { KmsKeyType } from './store';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { randomBytes } = require('crypto');

export function keyPath(keyType: KmsKeyType, keyID: string): string {
  const basePath = '';
  return basePath + String(keyType) + ':' + keyID;
}

export function getRandomBytes(n: number): Uint8Array {
  let array = new Uint8Array(n);
  const isBrowser = typeof window !== 'undefined';

  if (isBrowser) {
    // Browser
    if (typeof globalThis.crypto !== 'undefined') {
      // Supported
      globalThis.crypto.getRandomValues(array);
    } else {
      // fallback
      for (let i = 0; i < n; i++) {
        array[i] = (Math.random() * 4294967296) >>> 0;
      }
    }
  } else {
    // NodeJS
    array = randomBytes(32);
  }
  return array;
}
