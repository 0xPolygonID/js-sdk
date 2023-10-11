import { SUPPORTED_PUBLIC_KEY_TYPES } from '../constants';
import elliptic from 'elliptic';
import { KmsKeyType } from '../../kms';
import { base58ToBytes, base64ToBytes, bytesToHex, hexToBytes } from '../../utils';
const DIDAuthenticationSection = 'authentication';
export const resolveVerificationMethods = (didDocument) => {
    const vms = didDocument.verificationMethod || [];
    // prioritize: first verification methods to be chosen are from `authentication` section.
    const sortedVerificationMethods = (didDocument[DIDAuthenticationSection] || [])
        .map((verificationMethod) => {
        if (typeof verificationMethod === 'string') {
            return vms.find((i) => i.id === verificationMethod);
        }
        return verificationMethod;
    })
        .filter((key) => key);
    // add all other verification methods
    for (let index = 0; index < vms.length; index++) {
        const id = vms[index].id;
        if (sortedVerificationMethods.findIndex((vm) => vm.id === id) === -1) {
            sortedVerificationMethods.push(vms[index]);
        }
    }
    return sortedVerificationMethods;
};
const secp256k1 = new elliptic.ec('secp256k1');
export const extractPublicKeyBytes = (vm) => {
    const isSupportedVmType = Object.keys(SUPPORTED_PUBLIC_KEY_TYPES).some((key) => SUPPORTED_PUBLIC_KEY_TYPES[key].includes(vm.type));
    if (vm.publicKeyBase58 && isSupportedVmType) {
        return { publicKeyBytes: base58ToBytes(vm.publicKeyBase58), kmsKeyType: KmsKeyType.Secp256k1 };
    }
    if (vm.publicKeyBase64 && isSupportedVmType) {
        return { publicKeyBytes: base64ToBytes(vm.publicKeyBase64), kmsKeyType: KmsKeyType.Secp256k1 };
    }
    if (vm.publicKeyHex && isSupportedVmType) {
        return { publicKeyBytes: hexToBytes(vm.publicKeyHex), kmsKeyType: KmsKeyType.Secp256k1 };
    }
    if (vm.publicKeyJwk &&
        vm.publicKeyJwk.crv === 'secp256k1' &&
        vm.publicKeyJwk.x &&
        vm.publicKeyJwk.y) {
        return {
            publicKeyBytes: hexToBytes(secp256k1
                .keyFromPublic({
                x: bytesToHex(base64ToBytes(vm.publicKeyJwk.x)),
                y: bytesToHex(base64ToBytes(vm.publicKeyJwk.y))
            })
                .getPublic('hex')),
            kmsKeyType: KmsKeyType.Secp256k1
        };
    }
    return { publicKeyBytes: null };
};
//# sourceMappingURL=did.js.map