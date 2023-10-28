import { base58FromBytes, base58ToBytes as b58ToBytes, Hex } from '@iden3/js-crypto';
import { base64url, base64 } from 'rfc4648';

export const byteEncoder = new TextEncoder();
export const byteDecoder = new TextDecoder();

export function bytesToBase64url(b: Uint8Array, opts = { pad: false }): string {
  return base64url.stringify(b, opts);
}

export function base64ToBytes(s: string, opts = { loose: true }): Uint8Array {
  return base64.parse(s, opts);
}

export function bytesToBase64(b: Uint8Array, opts = { pad: false }): string {
  return base64.stringify(b, opts);
}

export function base64UrlToBytes(s: string, opts = { loose: true }): Uint8Array {
  const inputBase64Url = s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return base64url.parse(inputBase64Url, opts);
}

export function base58ToBytes(s: string): Uint8Array {
  return b58ToBytes(s);
}

export function bytesToBase58(b: Uint8Array): string {
  return base58FromBytes(b);
}

export function hexToBytes(s: string): Uint8Array {
  const input = s.startsWith('0x') ? s.substring(2) : s;
  return Hex.decodeString(input.toLowerCase());
}

export function encodeBase64url(s: string, opts = { pad: false }): string {
  return base64url.stringify(byteEncoder.encode(s), opts);
}

export function decodeBase64url(s: string, opts = { loose: true }): string {
  return byteDecoder.decode(base64url.parse(s, opts));
}

export function bytesToHex(b: Uint8Array): string {
  return Hex.encodeString(b);
}
