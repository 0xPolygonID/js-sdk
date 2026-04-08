import { IKeyProvider } from '../kms';
import { AbstractPrivateKeyStore, KmsKeyId, KmsKeyType } from '../store';
/**
 * Provider for Secp256k1
 * @public
 * @class Secp256k1Provider
 * @implements implements IKeyProvider interface
 */
export declare class Sec256k1Provider implements IKeyProvider {
    /**
     * key type that is handled by BJJ Provider
     * @type {KmsKeyType}
     */
    keyType: KmsKeyType;
    private _keyStore;
    /**
     * Creates an instance of BjjProvider.
     * @param {KmsKeyType} keyType - kms key type
     * @param {AbstractPrivateKeyStore} keyStore - key store for kms
     */
    constructor(keyType: KmsKeyType, keyStore: AbstractPrivateKeyStore);
    /**
     * get all keys
     * @returns list of keys
     */
    list(): Promise<{
        alias: string;
        key: string;
    }[]>;
    /**
     * generates a baby jub jub key from a seed phrase
     * @param {Uint8Array} seed - byte array seed
     * @returns kms key identifier
     */
    newPrivateKeyFromSeed(seed: Uint8Array): Promise<KmsKeyId>;
    newPrivateKey(): Promise<KmsKeyId>;
    /**
     * Gets public key by kmsKeyId
     *
     * @param {KmsKeyId} keyId - key identifier
     */
    publicKey(keyId: KmsKeyId): Promise<string>;
    /**
     * Signs the given data using the private key associated with the specified key identifier.
     * @param keyId - The key identifier to use for signing.
     * @param data - The data to sign.
     * @param opts - Signing options, such as the algorithm to use.
     * @returns A Promise that resolves to the signature as a Uint8Array.
     */
    sign(keyId: KmsKeyId, data: Uint8Array, opts?: {
        [key: string]: unknown;
    }): Promise<Uint8Array>;
    /**
     * get private key store
     *
     * @returns private key store
     */
    getPkStore(): Promise<AbstractPrivateKeyStore>;
    /**
     * Verifies a signature for the given message and key identifier.
     * @param message - The message to verify the signature against.
     * @param signatureHex - The signature to verify, as a hexadecimal string.
     * @param keyId - The key identifier to use for verification.
     * @returns A Promise that resolves to a boolean indicating whether the signature is valid.
     */
    verify(message: Uint8Array, signatureHex: string, keyId: KmsKeyId): Promise<boolean>;
    private privateKey;
}
//# sourceMappingURL=secp256k1-provider.d.ts.map