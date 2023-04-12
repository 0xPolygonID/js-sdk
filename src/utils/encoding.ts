// Copyright 2023 Veramo.io.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import * as u8a from 'uint8arrays';

export const byteEncoder = new TextEncoder();
export const byteDecoder = new TextDecoder();

export function bytesToBase64url(b: Uint8Array): string {
  return u8a.toString(b, 'base64url');
}

export function base64ToBytes(s: string): Uint8Array {
  const inputBase64Url = s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return u8a.fromString(inputBase64Url, 'base64url');
}

export function bytesToBase64(b: Uint8Array): string {
  return u8a.toString(b, 'base64pad');
}

export function base58ToBytes(s: string): Uint8Array {
  return u8a.fromString(s, 'base58btc');
}

export function bytesToBase58(b: Uint8Array): string {
  return u8a.toString(b, 'base58btc');
}

export function hexToBytes(s: string): Uint8Array {
  const input = s.startsWith('0x') ? s.substring(2) : s;
  return u8a.fromString(input.toLowerCase(), 'base16');
}

export function encodeBase64url(s: string): string {
  return bytesToBase64url(u8a.fromString(s));
}

export function decodeBase64url(s: string): string {
  return u8a.toString(base64ToBytes(s));
}

export function bytesToHex(b: Uint8Array): string {
  return u8a.toString(b, 'base16');
}
