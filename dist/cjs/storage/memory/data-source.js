"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryDataSource = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const errors_1 = require("../errors");
/**
 * Generic Memory Data Source
 *
 * @public
 * @class InMemoryDataSource - class
 * @template Type
 */
class InMemoryDataSource {
    constructor() {
        this._data = [];
    }
    /** saves in the memory */
    async save(key, value, keyName = 'id') {
        const itemIndex = this._data.findIndex((i) => i[keyName] === key);
        if (itemIndex === -1) {
            this._data.push(value);
        }
        else {
            this._data[itemIndex] = value;
        }
    }
    /** gets value from from the memory */
    async get(key, keyName = 'id') {
        return this._data.find((t) => t[keyName] === key);
    }
    /** loads from value from the memory */
    async load() {
        return this._data;
    }
    /** deletes from value from the memory */
    async delete(key, keyName = 'id') {
        const newData = this._data.filter((i) => i[keyName] !== key);
        if (newData.length === this._data.length) {
            throw new Error(`${errors_1.StorageErrors.ItemNotFound} to delete: ${key}`);
        }
        this._data = newData;
    }
}
exports.InMemoryDataSource = InMemoryDataSource;
//# sourceMappingURL=data-source.js.map