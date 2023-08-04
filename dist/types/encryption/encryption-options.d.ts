/// <reference types="node" />
/** Encryption options */
export type EncryptOptions = {
    password: string;
    algorithm?: SymmetricKeyAlgorithms;
    stringEncoding?: BufferEncoding;
};
/**
 * Symmetric Key Algorithms
 *
 * @enum {string}
 */
export declare enum SymmetricKeyAlgorithms {
    AESCTR = "AES-CTR",
    AESCBC = "AES-CBC",
    AESGCM = "AES-GCM"
}
