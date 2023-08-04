import { IDataSource } from '../interfaces/data-source';
/**
 * Storage in the browser, uses indexed db storage
 *
 * @public
 * @class IndexedDBDataSource
 * @template Type
 */
export declare class IndexedDBDataSource<Type> implements IDataSource<Type> {
    private _storageKey;
    /**
     * Creates an instance of IndexedDBDataSource.
     *
     * @param {string} _storageKey - key string to put storage name
     */
    private readonly _store;
    constructor(_storageKey: string);
    /**
     * Saves value to the indexed db storage
     *
     * @param {string} key - key value
     * @param {Type} value - value to store
     * @param {string} [keyName='id'] -  key name
     */
    save(key: string, value: Type, keyName?: string): Promise<void>;
    /**
     * Gets value from the indexed db storage by given key
     *
     * @param {string} key - key value
     * @param {string}  [keyName='id'] -  key name
     */
    get(key: string, keyName?: string): Promise<Type | undefined>;
    /**
     * loads all from the indexed db storage
     */
    load(): Promise<Type[]>;
    /**
     * deletes item from the indexed db storage
     * @param {string} key - key value
     * @param {string}  [keyName='id'] -  key name
     */
    delete(key: string, keyName?: string): Promise<void>;
}
