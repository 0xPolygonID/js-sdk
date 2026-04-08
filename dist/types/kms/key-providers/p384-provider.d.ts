import { IKeyProvider } from '../kms';
import { AbstractPrivateKeyStore, KmsKeyId, KmsKeyType } from '../store';
/**
 * Provider for P384  keys
 * @public
 * @class P384 Provider
 * @implements IKeyProvider interface
 */
export declare class P384Provider implements IKeyProvider {
    private readonly _keyStore;
    readonly keyType: KmsKeyType;
    /**
     * Creates an instance of P384 Provider.
     * @param {AbstractPrivateKeyStore} keyStore - key store for kms
     */
    constructor(_keyStore: AbstractPrivateKeyStore);
    /**
     * get all keys
     * @returns list of keys
     */
    list(): Promise<{
        alias: string;
        key: string;
    }[]>;
    /**
     * get private key store
     *
     * @returns private key store
     */
    getPkStore(): Promise<AbstractPrivateKeyStore>;
    /**
     * generates a p384  key from a seed phrase
     * @param {Uint8Array} seed - byte array seed
     * @returns {Promise<KmsKeyId>} kms key identifier
     */
    newPrivateKeyFromSeed(seed: Uint8Array): Promise<KmsKeyId>;
    newPrivateKey(): Promise<KmsKeyId>;
    /**
     * Gets public key by kmsKeyId
     * @param {KmsKeyId} keyId - key identifier
     * @returns {Promise<string>} Public key as a hex string
     */
    publicKey(keyId: KmsKeyId): Promise<string>;
    /**
     * signs prepared payload of size,
     * with a key id
     * @param {KmsKeyId} keyId  - key identifier
     * @param {Uint8Array} digest - data to sign (32 bytes)
     * @returns {Promise<Uint8Array>} signature
     */
    sign(keyId: KmsKeyId, digest: Uint8Array): Promise<Uint8Array>;
    /**
     * Verifies a signature for the given message and key identifier.
     * @param digest - The message to verify the signature against.
     * @param signatureHex - The signature to verify, as a hexadecimal string.
     * @param keyId - The key identifier to use for verification.
     * @returns A Promise that resolves to a boolean indicating whether the signature is valid.
     */
    verify(digest: Uint8Array, signatureHex: string, keyId: KmsKeyId): Promise<boolean>;
    /**
     * Retrieves the private key for a given keyId from the key store.
     * @param {KmsKeyId} keyId - The identifier of the key to retrieve.
     * @returns {Promise<string>} The private key associated with the keyId.
     */
    private privateKey;
}
//# sourceMappingURL=p384-provider.d.ts.map