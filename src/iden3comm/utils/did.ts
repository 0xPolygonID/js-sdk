import axios from 'axios';
import { UNIVERSAL_RESOLVER_URL } from '../constants';
import elliptic from 'elliptic';
import {
  DIDDocument,
  DIDResolutionOptions,
  DIDResolutionResult,
  VerificationMethod
} from 'did-resolver';

import { bases } from 'multiformats/basics';
import { KmsKeyType } from '../../kms';
import { base58ToBytes, base64ToBytes, bytesToHex, hexToBytes } from '../../utils';

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

export const extractPublicKeyBytes = (
  vm: VerificationMethod
): { publicKeyBytes: Uint8Array; kmsKeyType?: KmsKeyType } => {
  if (vm.publicKeyBase58) {
    return { publicKeyBytes: base58ToBytes(vm.publicKeyBase58) };
  } else if (vm.publicKeyBase64) {
    return { publicKeyBytes: base64ToBytes(vm.publicKeyBase64) };
  } else if (vm.publicKeyHex) {
    return { publicKeyBytes: hexToBytes(vm.publicKeyHex) };
  } else if (
    vm.publicKeyJwk &&
    vm.publicKeyJwk.crv === 'secp256k1' &&
    vm.publicKeyJwk.x &&
    vm.publicKeyJwk.y
  ) {
    return {
      publicKeyBytes: hexToBytes(
        secp256k1
          .keyFromPublic({
            x: bytesToHex(base64ToBytes(vm.publicKeyJwk.x)),
            y: bytesToHex(base64ToBytes(vm.publicKeyJwk.y))
          })
          .getPublic('hex')
      ),
      kmsKeyType: KmsKeyType.Secp256k1
    };
  } else if (
    vm.publicKeyJwk &&
    vm.publicKeyJwk.crv === 'P-256' &&
    vm.publicKeyJwk.x &&
    vm.publicKeyJwk.y
  ) {
    return {
      publicKeyBytes: hexToBytes(
        secp256r1
          .keyFromPublic({
            x: bytesToHex(base64ToBytes(vm.publicKeyJwk.x)),
            y: bytesToHex(base64ToBytes(vm.publicKeyJwk.y))
          })
          .getPublic('hex')
      ),
      kmsKeyType: KmsKeyType.Secp256r1
    };
  } else if (
    vm.publicKeyJwk &&
    vm.publicKeyJwk.kty === 'OKP' &&
    vm.publicKeyJwk.crv === 'Ed25519' &&
    vm.publicKeyJwk.x
  ) {
    return { publicKeyBytes: base64ToBytes(vm.publicKeyJwk.x), kmsKeyType: KmsKeyType.Ed25519 };
  } else if (vm.publicKeyMultibase) {
    const { base16, base58btc, base64, base64url } = bases;
    const baseDecoder = base16.decoder.or(
      base58btc.decoder.or(base64.decoder.or(base64url.decoder))
    );
    return { publicKeyBytes: baseDecoder.decode(vm.publicKeyMultibase) };
  }
  return { publicKeyBytes: null };
};
