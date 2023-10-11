/**
 * Key management system class contains different key providers.
 * allows to register custom provider, create key, get public key and sign
 *
 * @public
 * @class KMS - class
 */
export class KMS {
    constructor() {
        this._registry = new Map();
    }
    /**
     * register key provider in the KMS
     *
     * @param {KmsKeyType} keyType - kms key type
     * @param {IKeyProvider} keyProvider - key provider implementation
     */
    registerKeyProvider(keyType, keyProvider) {
        if (this._registry.get(keyType)) {
            throw new Error('present keyType');
        }
        this._registry.set(keyType, keyProvider);
    }
    /**
     * generates a new key and returns it kms key id
     *
     * @param {KmsKeyType} keyType
     * @param {Uint8Array} bytes
     * @returns kms key id
     */
    async createKeyFromSeed(keyType, bytes) {
        const keyProvider = this._registry.get(keyType);
        if (!keyProvider) {
            throw new Error(`keyProvider not found for: ${keyType}`);
        }
        return keyProvider.newPrivateKeyFromSeed(bytes);
    }
    /**
     * gets public key for key id
     *
     * @param {KmsKeyId} keyId -- key id
     * @returns public key
     */
    async publicKey(keyId) {
        const keyProvider = this._registry.get(keyId.type);
        if (!keyProvider) {
            throw new Error(`keyProvider not found for: ${keyId.type}`);
        }
        return keyProvider.publicKey(keyId);
    }
    /**
     * sign Uint8Array with giv KmsKeyIden
     *
     * @param {KmsKeyId} keyId - key id
     * @param {Uint8Array} data - prepared data bytes
     * @returns `Promise<Uint8Array>` - return signature
     */
    async sign(keyId, data, opts) {
        const keyProvider = this._registry.get(keyId.type);
        if (!keyProvider) {
            throw new Error(`keyProvider not found for: ${keyId.type}`);
        }
        return keyProvider.sign(keyId, data, opts);
    }
}
//# sourceMappingURL=kms.js.map