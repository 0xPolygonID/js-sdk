/** Encryption options */
export interface EncryptOptions {
  password: string;
  algorithm?: SymmetricKeyAlgorithms;
}

/**
 * Symmetric Key Algorithms
 *
 * @enum {string}
 */
export enum SymmetricKeyAlgorithms {
  AESCTR = 'AES-CTR',
  AESCBC = 'AES-CBC',
  AESGCM = 'AES-GCM'
}
