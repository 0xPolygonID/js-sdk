"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStoragePrivateKeyStore = void 0;
/**
 * Allows storing keys in the local storage of the browser
 * (NOT ENCRYPTED: DO NOT USE IN THE PRODUCTION)
 *
 * @public
 * @class LocalStoragePrivateKeyStore
 * @implements implements AbstractPrivateKeyStore interface
 */
class LocalStoragePrivateKeyStore {
    /**
     * Gets key from the local storage
     *
     * @param {{ alias: string }} args
     * @returns hex string
     */
    async get(args) {
        const dataStr = localStorage.getItem(LocalStoragePrivateKeyStore.storageKey);
        if (!dataStr) {
            throw new Error('no key under given alias');
        }
        const data = JSON.parse(dataStr);
        const privateKey = data.find((d) => d.id === args.alias);
        if (!privateKey) {
            throw new Error('no key under given alias');
        }
        return privateKey.value;
    }
    /**
     * Import key to the local storage
     *
     * @param {{ alias: string; key: string }} args - alias and private key in the hex
     * @returns void
     */
    async importKey(args) {
        const dataStr = localStorage.getItem(LocalStoragePrivateKeyStore.storageKey);
        let data = [];
        if (dataStr) {
            data = JSON.parse(dataStr);
        }
        const index = data.findIndex((d) => d.id === args.alias);
        if (index > -1) {
            data[index].value = args.key;
        }
        else {
            data.push({ id: args.alias, value: args.key });
        }
        localStorage.setItem(LocalStoragePrivateKeyStore.storageKey, JSON.stringify(data));
    }
}
exports.LocalStoragePrivateKeyStore = LocalStoragePrivateKeyStore;
LocalStoragePrivateKeyStore.storageKey = 'keystore';
//# sourceMappingURL=local-storage-key-store.js.map