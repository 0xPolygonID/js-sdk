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
import axios from 'axios';
import { SUPPORTED_PUBLIC_KEY_TYPES, UNIVERSAL_RESOLVER_URL } from '../constants';
import elliptic from 'elliptic';
import {
  DIDDocument,
  DIDResolutionOptions,
  DIDResolutionResult,
  VerificationMethod
} from 'did-resolver';

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

export const extractPublicKeyBytes = (
  vm: VerificationMethod
): { publicKeyBytes: Uint8Array; kmsKeyType?: KmsKeyType } => {
  const isSupportedVmType = Object.keys(SUPPORTED_PUBLIC_KEY_TYPES).some((key) =>
    SUPPORTED_PUBLIC_KEY_TYPES[key].includes(vm.type)
  );
  if (vm.publicKeyBase58 && isSupportedVmType) {
    return { publicKeyBytes: base58ToBytes(vm.publicKeyBase58), kmsKeyType: KmsKeyType.Secp256k1 };
  }
  if (vm.publicKeyBase64 && isSupportedVmType) {
    return { publicKeyBytes: base64ToBytes(vm.publicKeyBase64), kmsKeyType: KmsKeyType.Secp256k1 };
  }
  if (vm.publicKeyHex && isSupportedVmType) {
    return { publicKeyBytes: hexToBytes(vm.publicKeyHex), kmsKeyType: KmsKeyType.Secp256k1 };
  }
  if (
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
  }
  return { publicKeyBytes: null };
};
