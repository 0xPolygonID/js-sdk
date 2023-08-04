import { IDataSource } from '../interfaces/data-source';
/**
 * Storage in the browser, uses local storage
 *
 * @public
 * @class BrowserDataSource
 * @template Type
 */
export declare class BrowserDataSource<Type> implements IDataSource<Type> {
    private _localStorageKey;
    /**
     * Creates an instance of BrowserDataSource.
     * @param {string} _localStorageKey - key string to put storage name in the local storage
     */
    constructor(_localStorageKey: string);
    /**
     *
     * saves value to the local storage
     * @param {string} key - key value
     * @param {Type} value - value to store
     * @param {string} [keyName='id'] -  key name
     */
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
