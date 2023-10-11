"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserDataSource = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const errors_1 = require("../errors");
/**
 * Storage in the browser, uses local storage
 *
 * @public
 * @class BrowserDataSource
 * @template Type
 */
class BrowserDataSource {
    /**
     * Creates an instance of BrowserDataSource.
     * @param {string} _localStorageKey - key string to put storage name in the local storage
     */
    constructor(_localStorageKey) {
        this._localStorageKey = _localStorageKey;
        const data = localStorage.getItem(this._localStorageKey);
        if (!data) {
            localStorage.setItem(_localStorageKey, JSON.stringify([]));
        }
    }
    /**
     *
     * saves value to the local storage
     * @param {string} key - key value
     * @param {Type} value - value to store
     * @param {string} [keyName='id'] -  key name
     */
    async save(key, value, keyName = 'id') {
        if (localStorage) {
            const data = localStorage.getItem(this._localStorageKey);
            let items = [];
            if (data) {
                items = JSON.parse(data);
            }
            const itemIndex = items.findIndex((i) => i[keyName] === key);
            if (itemIndex === -1) {
                items.push(value);
            }
            else {
                items[itemIndex] = value;
            }
            localStorage.setItem(this._localStorageKey, JSON.stringify(items));
        }
    }
    /**
     * gets value from the local storage by given key
     * @param {string} key - key value
     * @param {string}  [keyName='id'] -  key name
     */
    async get(key, keyName = 'id') {
        const data = localStorage.getItem(this._localStorageKey);
        let parsedData = [];
        if (data) {
            parsedData = JSON.parse(data);
        }
        return parsedData.find((t) => t[keyName] === key);
    }
    /**
     * loads all from the local storage
     */
    async load() {
        const data = localStorage.getItem(this._localStorageKey);
        return data && JSON.parse(data);
    }
    /**
     * deletes item from the local storage
     * @param {string} key - key value
     * @param {string}  [keyName='id'] -  key name
     */
    async delete(key, keyName = 'id') {
        const dataStr = localStorage.getItem(this._localStorageKey);
        let data = [];
        if (dataStr) {
            data = JSON.parse(dataStr);
        }
        const items = data.filter((i) => i[keyName] !== key);
        if (data.length === items.length) {
            throw new Error(`${errors_1.StorageErrors.ItemNotFound} to delete: ${key}`);
        }
        localStorage.setItem(this._localStorageKey, JSON.stringify(items));
    }
}
exports.BrowserDataSource = BrowserDataSource;
//# sourceMappingURL=data-source.js.map