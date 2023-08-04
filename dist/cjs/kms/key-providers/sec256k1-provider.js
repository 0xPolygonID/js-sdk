"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sec256k1Provider = void 0;
const elliptic_1 = __importDefault(require("elliptic"));
const providerHelpers = __importStar(require("../provider-helpers"));
const did_jwt_1 = require("did-jwt");
const utils_1 = require("../../utils");
/**
 * Provider for Sec256p1 keys256p1
 * @public
 * @class Sec256p1Provider
 * @implements implements IKeyProvider interface
 */
class Sec256k1Provider {
    /**
     * Creates an instance of BjjProvider.
     * @param {KmsKeyType} keyType - kms key type
     * @param {AbstractPrivateKeyStore} keyStore - key store for kms
     */
    constructor(keyType, keyStore) {
        this.keyType = keyType;
        this._keyStore = keyStore;
        this._ec = new elliptic_1.default.ec('secp256k1');
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
        const signatureBase64 = await (0, did_jwt_1.ES256KSigner)((0, utils_1.hexToBytes)(privateKeyHex), opts.alg === 'ES256K-R')(data);
        const signatureHex = (0, utils_1.bytesToHex)((0, utils_1.base64ToBytes)(signatureBase64.toString()));
        if (typeof signatureHex !== 'string') {
            throw new Error('Signature is not a string');
        }
        return utils_1.byteEncoder.encode(signatureBase64.toString());
    }
    async privateKey(keyId) {
        return this._keyStore.get({ alias: keyId.id });
    }
}
exports.Sec256k1Provider = Sec256k1Provider;
//# sourceMappingURL=sec256k1-provider.js.map