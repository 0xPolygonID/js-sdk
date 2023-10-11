import { IKeyProvider } from '../kms';
import { AbstractPrivateKeyStore, KmsKeyId, KmsKeyType } from '../store';
/**
 * Provider for Sec256p1 keys256p1
 * @public
 * @class Sec256p1Provider
 * @implements implements IKeyProvider interface
 */
export declare class Sec256k1Provider implements IKeyProvider {
    /**
     * key type that is handled by BJJ Provider
     * @type {KmsKeyType}
     */
    keyType: KmsKeyType;
    private _keyStore;
    private readonly _ec;
    /**
     * Creates an instance of BjjProvider.
     * @param {KmsKeyType} keyType - kms key type
     * @param {AbstractPrivateKeyStore} keyStore - key store for kms
     */
    constructor(keyType: KmsKeyType, keyStore: AbstractPrivateKeyStore);
    /**
     * generates a baby jub jub key from a seed phrase
     * @param {Uint8Array} seed - byte array seed
     * @returns kms key identifier
     */
    newPrivateKeyFromSeed(): Promise<KmsKeyId>;
    /**
     * Gets public key by kmsKeyId
     *
     * @param {KmsKeyId} keyId - key identifier
     */
    publicKey(keyId: KmsKeyId): Promise<string>;
    /**
     * signs prepared payload of size,
     * with a key id
     *
     * @param {KmsKeyId} keyId  - key identifier
     * @param {Uint8Array} data - data to sign (32 bytes)
     * @returns Uint8Array signature
     */
    sign(keyId: KmsKeyId, data: Uint8Array, opts?: {
        [key: string]: unknown;
    }): Promise<Uint8Array>;
    private privateKey;
}
