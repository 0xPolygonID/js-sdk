import axios from 'axios';
import { UNIVERSAL_RESOLVER_URL } from '../constants';
import elliptic from 'elliptic';
import {
  DIDDocument,
  DIDResolutionOptions,
  DIDResolutionResult,
  VerificationMethod
} from 'did-resolver';

import * as u8a from 'uint8arrays';
import { bases } from 'multiformats/basics';

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

export function stringToBytes(s: string): Uint8Array {
  return u8a.fromString(s);
}

export const resolveDIDDocument = async (
  didUrl: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options?: DIDResolutionOptions
): Promise<DIDResolutionResult> => {
  try {
    const response = await axios.get<DIDDocument>(`${UNIVERSAL_RESOLVER_URL}/${didUrl}`);
    return { didDocument: response.data } as DIDResolutionResult;
  } catch (error) {
    throw new Error(`Can't resolve did document: ${error.message}`);
  }
};

export const getDIDComponentById = (
  didDocument: DIDDocument,
  did: string,
  section: string
): VerificationMethod => {
  const doc = didDocument;
  const mainSections = ['verificationMethod', 'publicKey', 'service']
    .map((key) => doc[key])
    .flat()
    .filter(Boolean);

  const subsection = section ? [...(doc[section] || [])] : mainSections;

  let result = subsection.find((item) => {
    return typeof item === 'string'
      ? item === did || `${did}${item}` === did
      : item.id === did || `${did}${item.id}` === did;
  });

  if (typeof result === 'string') {
    result = mainSections.find((item) => item.id === did || `${did}${item.id}` === did);
  }

  if (!result) {
    throw new Error('Could not find DID component');
  }

  if (result.id.startsWith('#')) {
    // fix did documents that use only the fragment part as key ID
    result.id = `${did}${result.id}`;
  }

  return result;
};

const secp256k1 = new elliptic.ec('secp256k1');
const secp256r1 = new elliptic.ec('p256');

export const extractPublicKeyBytes = (vm: VerificationMethod): Uint8Array => {
  if (vm.publicKeyBase58) {
    return base58ToBytes(vm.publicKeyBase58);
  } else if (vm.publicKeyBase64) {
    return base64ToBytes(vm.publicKeyBase64);
  } else if (vm.publicKeyHex) {
    return hexToBytes(vm.publicKeyHex);
  } else if (
    vm.publicKeyJwk &&
    vm.publicKeyJwk.crv === 'secp256k1' &&
    vm.publicKeyJwk.x &&
    vm.publicKeyJwk.y
  ) {
    const x = bytesToHex(base64ToBytes(vm.publicKeyJwk.x));
    const y = bytesToHex(base64ToBytes(vm.publicKeyJwk.y));
    console.log('x', x);
    console.log('y', y);
    return hexToBytes(
      secp256k1
        .keyFromPublic({
          x: bytesToHex(base64ToBytes(vm.publicKeyJwk.x)),
          y: bytesToHex(base64ToBytes(vm.publicKeyJwk.y))
        })
        .getPublic('hex')
    );
  } else if (
    vm.publicKeyJwk &&
    vm.publicKeyJwk.crv === 'P-256' &&
    vm.publicKeyJwk.x &&
    vm.publicKeyJwk.y
  ) {
    return hexToBytes(
      secp256r1
        .keyFromPublic({
          x: bytesToHex(base64ToBytes(vm.publicKeyJwk.x)),
          y: bytesToHex(base64ToBytes(vm.publicKeyJwk.y))
        })
        .getPublic('hex')
    );
  } else if (
    vm.publicKeyJwk &&
    vm.publicKeyJwk.kty === 'OKP' &&
    vm.publicKeyJwk.crv === 'Ed25519' &&
    vm.publicKeyJwk.x
  ) {
    return base64ToBytes(vm.publicKeyJwk.x);
  } else if (vm.publicKeyMultibase) {
    const { base16, base58btc, base64, base64url } = bases;
    const baseDecoder = base16.decoder.or(
      base58btc.decoder.or(base64.decoder.or(base64url.decoder))
    );
    return baseDecoder.decode(vm.publicKeyMultibase);
  }
  return new Uint8Array();
};
