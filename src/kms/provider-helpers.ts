import { KmsKeyType } from './kms';

export function keyPath(keyType: KmsKeyType, keyID: string): string {
  const basePath = '';
  return basePath + String(keyType) + ':' + keyID;
}
