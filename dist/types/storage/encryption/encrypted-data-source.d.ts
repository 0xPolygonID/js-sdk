import { IDataSource } from '../interfaces/data-source';
import { EncryptOptions } from '../../encryption/encryption-options';
/**
 * Generic Encrypted Data Source
 *
 * @public
 * @class EncryptedDataSource - class
 * @template Type
 */
export declare class EncryptedDataSource<Type> implements IDataSource<Type> {
    private readonly _dataSource;
    private readonly _encryptionService;
    constructor(dataSource: IDataSource<string>, opts: EncryptOptions);
    /** saves in the memory */
    save(key: string, value: Type, keyName?: string): Promise<void>;
    /**
     * gets value from the local storage by given key
     * @param {string} key - key value
     * @param {string}  [keyName='id'] -  key name
     */
    get(key: string, keyName?: string): Promise<Type | undefined>;
    /**
     * loads all from the local storage
     */
    load(): Promise<Type[]>;
    /**
     * deletes item from the local storage
     * @param {string} key - key value
     * @param {string}  [keyName='id'] -  key name
     */
    delete(key: string, keyName?: string): Promise<void>;
}
