import { set, get, del, values, createStore } from 'idb-keyval';
/**
 * Storage in the browser, uses indexed db storage
 *
 * @public
 * @class IndexedDBDataSource
 * @template Type
 */
export class IndexedDBDataSource {
    constructor(_storageKey) {
        this._storageKey = _storageKey;
        this._store = createStore(`${_storageKey}-db`, _storageKey);
    }
    /**
     * Saves value to the indexed db storage
     *
     * @param {string} key - key value
     * @param {Type} value - value to store
     * @param {string} [keyName='id'] -  key name
     */
    async save(key, value, keyName = 'id') {
        return set(key, value, this._store);
    }
    /**
     * Gets value from the indexed db storage by given key
     *
     * @param {string} key - key value
     * @param {string}  [keyName='id'] -  key name
     */
    async get(key, keyName = 'id') {
        return get(key, this._store);
    }
    /**
     * loads all from the indexed db storage
     */
    async load() {
        return values(this._store);
    }
    /**
     * deletes item from the indexed db storage
     * @param {string} key - key value
     * @param {string}  [keyName='id'] -  key name
     */
    async delete(key, keyName = 'id') {
        return del(key, this._store);
    }
}
//# sourceMappingURL=data-source.js.map