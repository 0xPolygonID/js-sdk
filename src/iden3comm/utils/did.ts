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
    const response = await fetch(`${UNIVERSAL_RESOLVER_URL}/${didUrl}`);
    const data = await response.json();
    return { didDocument: data } as DIDResolutionResult;
  } catch (error) {
    throw new Error(`Can't resolve did document: ${error.message}`);
  }
};

export const resolveAuthVerificationMethods = (
  didResult: DIDResolutionResult
): VerificationMethod[] => {
  const vms: VerificationMethod[] = didResult?.didDocument?.verificationMethod || [];

  didResult.didDocument = { ...(<DIDDocument>didResult.didDocument) };

  return (didResult.didDocument['authentication'] || [])
    .map((verificationMethod) => {
      if (typeof verificationMethod === 'string') {
        return vms.find((i) => i.id == verificationMethod);
      } else {
        return <VerificationMethod>verificationMethod;
      }
    })
    .filter((key) => key !== undefined) as VerificationMethod[];
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
