"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexedDBPrivateKeyStore = void 0;
const idb_keyval_1 = require("idb-keyval");
/**
 * Allows storing keys in the indexed db storage of the browser
 * (NOT ENCRYPTED: DO NOT USE IN THE PRODUCTION)
 *
 * @public
 * @class IndexedDBPrivateKeyStore
 * @implements implements AbstractPrivateKeyStore interface
 */
class IndexedDBPrivateKeyStore {
    constructor() {
        this._store = (0, idb_keyval_1.createStore)(`${IndexedDBPrivateKeyStore.storageKey}-db`, IndexedDBPrivateKeyStore.storageKey);
    }
    /**
     * Gets key from the indexed db storage
     *
     * @param {{ alias: string }} args
     * @returns hex string
     */
    async get(args) {
        const key = await (0, idb_keyval_1.get)(args.alias, this._store);
        if (!key) {
            throw new Error('no key under given alias');
        }
        return key.value;
    }
    /**
     * Import key to the indexed db storage
     *
     * @param {{ alias: string; key: string }} args - alias and private key in the hex
     * @returns void
     */
    async importKey(args) {
        await (0, idb_keyval_1.set)(args.alias, { value: args.key }, this._store);
    }
}
exports.IndexedDBPrivateKeyStore = IndexedDBPrivateKeyStore;
IndexedDBPrivateKeyStore.storageKey = 'keystore';
//# sourceMappingURL=indexed-db-key-store.js.map