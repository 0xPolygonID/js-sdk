import { KmsKeyType } from './store';

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
