"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptedDataSource = void 0;
const encryption_1 = require("../../encryption");
/**
 * Generic Encrypted Data Source
 *
 * @public
 * @class EncryptedDataSource - class
 * @template Type
 */
class EncryptedDataSource {
    constructor(dataSource, opts) {
        this._dataSource = dataSource;
        this._encryptionService = new encryption_1.BrowserEncryptionService(opts);
    }
    /** saves in the memory */
    async save(key, value, keyName) {
        const encryptedValue = await this._encryptionService.encrypt(value);
        this._dataSource.save(key, encryptedValue, keyName);
    }
    /**
     * gets value from the local storage by given key
     * @param {string} key - key value
     * @param {string}  [keyName='id'] -  key name
     */
    async get(key, keyName) {
        let valueString = await this._dataSource.get(key, keyName);
        if (!valueString) {
            return undefined;
        }
        return await this._encryptionService.decrypt(valueString);
    }
    /**
     * loads all from the local storage
     */
    async load() {
        const data = await this._dataSource.load();
        const decryptedData = [];
        data.forEach(async (item) => {
            decryptedData.push(await this._encryptionService.decrypt(item));
        });
        return decryptedData;
    }
    /**
     * deletes item from the local storage
     * @param {string} key - key value
     * @param {string}  [keyName='id'] -  key name
     */
    async delete(key, keyName) {
        return this._dataSource.delete(key, keyName);
    }
}
exports.EncryptedDataSource = EncryptedDataSource;
//# sourceMappingURL=encrypted-data-source.js.map