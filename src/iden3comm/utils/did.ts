import { SUPPORTED_PUBLIC_KEY_TYPES } from '../constants';
import { DIDDocument, VerificationMethod } from 'did-resolver';
import { secp256k1 as sec } from '@noble/curves/secp256k1';

import { KmsKeyType } from '../../kms';
import { base58ToBytes, base64UrlToBytes, bytesToHex, hexToBytes } from '../../utils';

const DIDAuthenticationSection = 'authentication';
export const resolveVerificationMethods = (didDocument: DIDDocument): VerificationMethod[] => {
  const vms: VerificationMethod[] = didDocument.verificationMethod || [];

  // prioritize: first verification methods to be chosen are from `authentication` section.
  const sortedVerificationMethods = (didDocument[DIDAuthenticationSection] || [])
    .map((verificationMethod) => {
      if (typeof verificationMethod === 'string') {
        return vms.find((i) => i.id === verificationMethod);
      }
      return verificationMethod as VerificationMethod;
    })
    .filter((key) => key) as VerificationMethod[];

  // add all other verification methods
  for (let index = 0; index < vms.length; index++) {
    const id = vms[index].id;
    if (sortedVerificationMethods.findIndex((vm) => vm.id === id) === -1) {
      sortedVerificationMethods.push(vms[index]);
    }
  }
  return sortedVerificationMethods;
};

export const extractPublicKeyBytes = (
  vm: VerificationMethod
): { publicKeyBytes: Uint8Array | null; kmsKeyType?: KmsKeyType } => {
  const isSupportedVmType = Object.keys(SUPPORTED_PUBLIC_KEY_TYPES).some((key) =>
    SUPPORTED_PUBLIC_KEY_TYPES[key as keyof typeof SUPPORTED_PUBLIC_KEY_TYPES].includes(vm.type)
  );
  if (vm.publicKeyBase58 && isSupportedVmType) {
    return { publicKeyBytes: base58ToBytes(vm.publicKeyBase58), kmsKeyType: KmsKeyType.Secp256k1 };
  }
  if (vm.publicKeyBase64 && isSupportedVmType) {
    return {
      publicKeyBytes: base64UrlToBytes(vm.publicKeyBase64),
      kmsKeyType: KmsKeyType.Secp256k1
    };
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
    const [xHex, yHex] = [
      base64UrlToBytes(vm.publicKeyJwk.x),
      base64UrlToBytes(vm.publicKeyJwk.y)
    ].map(bytesToHex);
    const x = xHex.includes('0x') ? BigInt(xHex) : BigInt(`0x${xHex}`);
    const y = yHex.includes('0x') ? BigInt(yHex) : BigInt(`0x${yHex}`);
    return {
      publicKeyBytes: sec.ProjectivePoint.fromAffine({
        x,
        y
      }).toRawBytes(false),
      kmsKeyType: KmsKeyType.Secp256k1
    };
  }
  return { publicKeyBytes: null };
};
