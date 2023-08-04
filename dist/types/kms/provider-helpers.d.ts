import { KmsKeyType } from './store';
/**
 * builds key path
 *
 * @param {KmsKeyType} keyType - key type
 * @param {string} keyID - key id
 * @returns string path
 */
export declare function keyPath(keyType: KmsKeyType, keyID: string): string;
/**
 * generates Uint8Array with random bytes of size n
 *
 * @param {number} n - size of array
 * @returns Uint8Array
 */
export declare function getRandomBytes(n: number): Uint8Array;
