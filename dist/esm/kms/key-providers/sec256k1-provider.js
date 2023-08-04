import Elliptic from 'elliptic';
import * as providerHelpers from '../provider-helpers';
import { ES256KSigner } from 'did-jwt';
import { base64ToBytes, byteEncoder, bytesToHex, hexToBytes } from '../../utils';
/**
 * Provider for Sec256p1 keys256p1
 * @public
 * @class Sec256p1Provider
 * @implements implements IKeyProvider interface
 */
export class Sec256k1Provider {
    /**
     * Creates an instance of BjjProvider.
     * @param {KmsKeyType} keyType - kms key type
     * @param {AbstractPrivateKeyStore} keyStore - key store for kms
     */
    constructor(keyType, keyStore) {
        this.keyType = keyType;
        this._keyStore = keyStore;
        this._ec = new Elliptic.ec('secp256k1');
    }
    /**
     * generates a baby jub jub key from a seed phrase
     * @param {Uint8Array} seed - byte array seed
     * @returns kms key identifier
     */
    async newPrivateKeyFromSeed() {
        const keyPair = this._ec.genKeyPair();
        const kmsId = {
            type: this.keyType,
            id: providerHelpers.keyPath(this.keyType, keyPair.getPublic().encode('hex', false))
        };
        await this._keyStore.importKey({ alias: kmsId.id, key: keyPair.getPrivate().toString('hex') });
        return kmsId;
    }
    /**
     * Gets public key by kmsKeyId
     *
     * @param {KmsKeyId} keyId - key identifier
     */
    async publicKey(keyId) {
        const privateKeyHex = await this.privateKey(keyId);
        return this._ec.keyFromPrivate(privateKeyHex, 'hex').getPublic().encode('hex', false);
    }
    /**
     * signs prepared payload of size,
     * with a key id
     *
     * @param {KmsKeyId} keyId  - key identifier
     * @param {Uint8Array} data - data to sign (32 bytes)
     * @returns Uint8Array signature
     */
    async sign(keyId, data, opts = { alg: 'ES256K' }) {
        const privateKeyHex = await this.privateKey(keyId);
        if (!privateKeyHex) {
            throw new Error('Private key not found for keyId: ' + keyId.id);
        }
        const signatureBase64 = await ES256KSigner(hexToBytes(privateKeyHex), opts.alg === 'ES256K-R')(data);
        const signatureHex = bytesToHex(base64ToBytes(signatureBase64.toString()));
        if (typeof signatureHex !== 'string') {
            throw new Error('Signature is not a string');
        }
        return byteEncoder.encode(signatureBase64.toString());
    }
    async privateKey(keyId) {
        return this._keyStore.get({ alias: keyId.id });
    }
}
//# sourceMappingURL=sec256k1-provider.js.map