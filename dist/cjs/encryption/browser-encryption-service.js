"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserEncryptionService = void 0;
const encryption_options_1 = require("./encryption-options");
/**
 * Browser Encryption Service
 * @public
 * @class EncryptedDataSource - class
 * @template Type
 */
class BrowserEncryptionService {
    constructor(opts) {
        this._password = opts.password;
        this._algorithm = opts.algorithm ?? encryption_options_1.SymmetricKeyAlgorithms.AESGCM;
        this._stringEncoding = opts.stringEncoding ?? 'utf-8';
        this._crypto = window.crypto;
    }
    /**
     * Encrypts a data object that can be any serializable value using
     * a provided password.
     *
     * @param dataObj - The data to encrypt.
     * @returns The encrypted vault.
     */
    async encrypt(dataObj) {
        const [cryptoKey, salt] = await this.keyFromPassword(this._password);
        const data = JSON.stringify(dataObj);
        const dataBuffer = Buffer.from(data, this._stringEncoding);
        const vector = this._crypto.getRandomValues(new Uint8Array(16));
        const buf = await this._crypto.subtle.encrypt({
            name: this._algorithm,
            iv: vector
        }, cryptoKey, dataBuffer);
        const buffer = new Uint8Array(buf);
        const vectorStr = Buffer.from(vector).toString('base64');
        const vaultStr = Buffer.from(buffer).toString('base64');
        return JSON.stringify({
            data: vaultStr,
            iv: vectorStr,
            salt
        });
    }
    /**
     * Give cypher text, decrypts the text and returns
     * the resulting value.
     *
     * @param text - The cypher text to decrypt.
     * @returns The decrypted data.
     */
    async decrypt(text) {
        const payload = JSON.parse(text);
        const { salt } = payload;
        const [cryptoKey] = await this.keyFromPassword(salt);
        const encryptedData = Buffer.from(payload.data, 'base64');
        const vector = Buffer.from(payload.iv, 'base64');
        let decryptedObj;
        try {
            const result = await crypto.subtle.decrypt({ name: this._algorithm, iv: vector }, cryptoKey, encryptedData);
            const decryptedData = new Uint8Array(result);
            const decryptedStr = Buffer.from(decryptedData).toString(this._stringEncoding);
            decryptedObj = JSON.parse(decryptedStr);
        }
        catch (e) {
            throw new Error('Incorrect password');
        }
        return decryptedObj;
    }
    /**
     * Generates a random string for use as a salt in CryptoKey generation.
     *
     * @param byteCount - The number of bytes to generate.
     * @returns A randomly generated string.
     */
    generateSalt(byteCount = 32) {
        const view = new Uint8Array(byteCount);
        this._crypto.getRandomValues(view);
        const b64encoded = btoa(String.fromCharCode.apply(null, view));
        return b64encoded;
    }
    /**
     * Generate a CryptoKey from a password and random salt.
     *
     * @param password - The password to use to generate key.
     * @param salt - The salt string to use in key derivation.
     * @param exportable - Should the derived key be exportable.
     * @returns A CryptoKey for encryption and decryption and salt.
     */
    async keyFromPassword(salt = this.generateSalt(), exportable = false) {
        const passBuffer = Buffer.from(this._password, 'base64');
        const saltBuffer = Buffer.from(salt, 'base64');
        const key = await this._crypto.subtle.importKey('raw', passBuffer, { name: 'PBKDF2' }, false, [
            'deriveBits',
            'deriveKey'
        ]);
        const derivedKey = await this._crypto.subtle.deriveKey({
            name: 'PBKDF2',
            salt: saltBuffer,
            iterations: 10000,
            hash: 'SHA-256'
        }, key, { name: this._algorithm, length: 256 }, exportable, ['encrypt', 'decrypt']);
        return [derivedKey, salt];
    }
}
exports.BrowserEncryptionService = BrowserEncryptionService;
//# sourceMappingURL=browser-encryption-service.js.map