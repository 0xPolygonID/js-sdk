/**
 * Key type that can be used in the key management system
 *
 * @export
 * @enum {number}
 */
export enum KmsKeyType {
  BabyJubJub = 'BJJ',
  Ethereum = 'ETH',
  Secp256k1 = 'Secp256k1',
  Secp256r1 = 'Secp256r1',
  Ed25519 = 'Ed25519'
}

/**
 * ID of the key that describe contain key type
 *
 * @export
 * @beta
 * @interface   KmsKeyId
 */
export interface KmsKeyId {
  type: KmsKeyType;
  id: string;
}
