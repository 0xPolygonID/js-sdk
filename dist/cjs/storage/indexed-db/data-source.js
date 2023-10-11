"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexedDBDataSource = void 0;
const idb_keyval_1 = require("idb-keyval");
/**
 * Storage in the browser, uses indexed db storage
 *
 * @public
 * @class IndexedDBDataSource
 * @template Type
 */
class IndexedDBDataSource {
    constructor(_storageKey) {
        this._storageKey = _storageKey;
        this._store = (0, idb_keyval_1.createStore)(`${_storageKey}-db`, _storageKey);
    }
    /**
     * Saves value to the indexed db storage
     *
     * @param {string} key - key value
     * @param {Type} value - value to store
     * @param {string} [keyName='id'] -  key name
     */
    async save(key, value, keyName = 'id') {
        return (0, idb_keyval_1.set)(key, value, this._store);
    }
    /**
     * Gets value from the indexed db storage by given key
     *
     * @param {string} key - key value
     * @param {string}  [keyName='id'] -  key name
     */
    async get(key, keyName = 'id') {
        return (0, idb_keyval_1.get)(key, this._store);
    }
    /**
     * loads all from the indexed db storage
     */
    async load() {
        return (0, idb_keyval_1.values)(this._store);
    }
    /**
     * deletes item from the indexed db storage
     * @param {string} key - key value
     * @param {string}  [keyName='id'] -  key name
     */
    async delete(key, keyName = 'id') {
        return (0, idb_keyval_1.del)(key, this._store);
    }
}
exports.IndexedDBDataSource = IndexedDBDataSource;
//# sourceMappingURL=data-source.js.map