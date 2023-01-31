/**
 * Key type that can be used in the key management system
 *
 * @export
 * @enum {number}
 */
export enum KmsKeyType {
  BabyJubJub = 'BJJ',
  Ethereum = 'ETH'
}

/**
 * ID of the key that describe contain key type
 *
 * @export
 * @interface KmsKeyId
 */
export interface KmsKeyId {
  type: KmsKeyType;
  id: string;
}
