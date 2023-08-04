import { BrowserEncryptionService } from '../../encryption';
/**
 * Generic Encrypted Data Source
 *
 * @public
 * @class EncryptedDataSource - class
 * @template Type
 */
export class EncryptedDataSource {
    constructor(dataSource, opts) {
        this._dataSource = dataSource;
        this._encryptionService = new BrowserEncryptionService(opts);
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
//# sourceMappingURL=encrypted-data-source.js.map