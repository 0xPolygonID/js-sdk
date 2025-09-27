import { ethers } from 'ethers';
import { KmsKeyType, TypedData } from './store';

/**
 * builds key path
 *
 * @param {KmsKeyType} keyType - key type
 * @param {string} keyID - key id
 * @returns string path
 */
export function keyPath(keyType: KmsKeyType, keyID: string): string {
  const basePath = '';
  return basePath + String(keyType) + ':' + keyID;
}

export async function signTypedData(signer: ethers.Signer, typedData: TypedData) {
  return signer.signTypedData(typedData.domain, typedData.types, typedData.message);
}
