import { Hex, PrivateKey } from '@iden3/js-crypto';
import { BytesHelper, checkBigIntInField } from '@iden3/js-iden3-core';
import * as providerHelpers from '../provider-helpers';
/**
 * Provider for Baby Jub Jub keys
 * @public
 * @class BjjProvider
 * @implements implements IKeyProvider interface
 */
export class BjjProvider {
    /**
     * Creates an instance of BjjProvider.
     * @param {KmsKeyType} keyType - kms key type
     * @param {AbstractPrivateKeyStore} keyStore - key store for kms
     */
    constructor(keyType, keyStore) {
        this.keyType = keyType;
        this.keyStore = keyStore;
    }
    /**
     * generates a baby jub jub key from a seed phrase
     * @param {Uint8Array} seed - byte array seed
     * @returns kms key identifier
     */
    async newPrivateKeyFromSeed(seed) {
        const newKey = new Uint8Array(32);
        newKey.set(Uint8Array.from(seed), 0);
        newKey.fill(seed.length, 32, 0);
        const privateKey = new PrivateKey(seed);
        const publicKey = privateKey.public();
        const kmsId = {
            type: this.keyType,
            id: providerHelpers.keyPath(this.keyType, publicKey.hex())
        };
        await this.keyStore.importKey({ alias: kmsId.id, key: privateKey.hex() });
        return kmsId;
    }
    /**
     * Gets public key by kmsKeyId
     *
     * @param {KmsKeyId} keyId - key identifier
     */
    async publicKey(keyId) {
        const privateKey = await this.privateKey(keyId);
        return privateKey.public().hex();
    }
    /**
     * signs prepared payload of size,
     * with a key id
     *
     * @param {KmsKeyId} keyId  - key identifier
     * @param {Uint8Array} data - data to sign (32 bytes)
     * @returns Uint8Array signature
     */
    async sign(keyId, data) {
        if (data.length != 32) {
            throw new Error('data to sign is too large');
        }
        const i = BytesHelper.bytesToInt(data);
        if (!checkBigIntInField(i)) {
            throw new Error('data to sign is too large');
        }
        const privateKey = await this.privateKey(keyId);
        const signature = privateKey.signPoseidon(i);
        return signature.compress();
    }
    async privateKey(keyId) {
        const privateKeyHex = await this.keyStore.get({ alias: keyId.id });
        return new PrivateKey(Hex.decodeString(privateKeyHex));
    }
}
//# sourceMappingURL=bjj-provider.js.map