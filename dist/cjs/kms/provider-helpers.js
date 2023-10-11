"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomBytes = exports.keyPath = void 0;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { randomBytes } = require('crypto');
/**
 * builds key path
 *
 * @param {KmsKeyType} keyType - key type
 * @param {string} keyID - key id
 * @returns string path
 */
function keyPath(keyType, keyID) {
    const basePath = '';
    return basePath + String(keyType) + ':' + keyID;
}
exports.keyPath = keyPath;
/**
 * generates Uint8Array with random bytes of size n
 *
 * @param {number} n - size of array
 * @returns Uint8Array
 */
function getRandomBytes(n) {
    let array = new Uint8Array(n);
    const isBrowser = typeof window !== 'undefined';
    if (isBrowser) {
        // Browser
        if (typeof globalThis.crypto !== 'undefined') {
            // Supported
            globalThis.crypto.getRandomValues(array);
        }
        else {
            // fallback
            for (let i = 0; i < n; i++) {
                array[i] = (Math.random() * 4294967296) >>> 0;
            }
        }
    }
    else {
        // NodeJS
        array = randomBytes(32);
    }
    return array;
}
exports.getRandomBytes = getRandomBytes;
//# sourceMappingURL=provider-helpers.js.map