import { KmsKeyId, KmsKeyType } from './store';
/**
 * KeyProvider is responsible for signing and creation of the keys
 *
 * @public
 * @interface   IKeyProvider
 */
export interface IKeyProvider {
    /**
     * property to store key type
     *
     * @type {KmsKeyType}
     */
    keyType: KmsKeyType;
    /**
     * gets public key by key id
     *
     * @param {KmsKeyId} keyID - kms key identifier
     * @returns `Promise<PublicKey>`
     */
    publicKey(keyID: KmsKeyId): Promise<string>;
    /**
     * sign data with kms key
     *
     * @param {KmsKeyId} keyId - key identifier
     * @param {Uint8Array} data  - bytes payload
     * @param {{ [key: string]: unknown }} opts  - additional options for signing
     * @returns `Promise<Uint8Array>`
     */
    sign(keyId: KmsKeyId, data: Uint8Array, opts?: {
        [key: string]: unknown;
    }): Promise<Uint8Array>;
    /**
     * creates new key pair from given seed
     *
     * @param {Uint8Array} seed - seed
     * @returns `Promise<KmsKeyId>`
     */
    newPrivateKeyFromSeed(seed: Uint8Array): Promise<KmsKeyId>;
}
/**
 * Key management system class contains different key providers.
 * allows to register custom provider, create key, get public key and sign
 *
 * @public
 * @class KMS - class
 */
export declare class KMS {
    private readonly _registry;
    /**
     * register key provider in the KMS
     *
     * @param {KmsKeyType} keyType - kms key type
     * @param {IKeyProvider} keyProvider - key provider implementation
     */
    registerKeyProvider(keyType: KmsKeyType, keyProvider: IKeyProvider): void;
    /**
     * generates a new key and returns it kms key id
     *
     * @param {KmsKeyType} keyType
     * @param {Uint8Array} bytes
     * @returns kms key id
     */
    createKeyFromSeed(keyType: KmsKeyType, bytes: Uint8Array): Promise<KmsKeyId>;
    /**
     * gets public key for key id
     *
     * @param {KmsKeyId} keyId -- key id
     * @returns public key
     */
    publicKey(keyId: KmsKeyId): Promise<string>;
    /**
     * sign Uint8Array with giv KmsKeyIden
     *
     * @param {KmsKeyId} keyId - key id
     * @param {Uint8Array} data - prepared data bytes
     * @returns `Promise<Uint8Array>` - return signature
     */
    sign(keyId: KmsKeyId, data: Uint8Array, opts?: {
        [key: string]: unknown;
    }): Promise<Uint8Array>;
}
