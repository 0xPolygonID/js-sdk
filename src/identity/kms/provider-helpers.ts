import { KEYType } from './kms';

export function keyPath(keyType: KEYType, keyID: string): string {
  const basePath = '';
  return basePath + String(keyType) + ':' + keyID;
}
