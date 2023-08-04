/**
 * Key type that can be used in the key management system
 *
 * @enum {number}
 */
export declare enum KmsKeyType {
    BabyJubJub = "BJJ",
    Secp256k1 = "Secp256k1"
}
/**
 * ID of the key that describe contain key type
 *
 * @public
 * @interface   KmsKeyId
 */
export interface KmsKeyId {
    type: KmsKeyType;
    id: string;
}
