/**
 * Generic Key/Value Data Source for crud operation
 *
 * @public
 * @interface   IDataSource
 * @template Type - generic type
 */
export interface IDataSource<Type> {
    /**
     * load all object with Type from data source
     *
     * @returns `{Type[]}`
     */
    load(): Promise<Type[]>;
    /**
     * Save value under the key with optional key name
     *
     * @param {string} key - key value
     * @param {Type} value - value to store
     * @param {string} [keyName] - key name
     */
    save(key: string, value: Type, keyName?: string): Promise<void>;
    /**
     * returns data value for key value and optional key name
     *
     * @param {string} key - key value
     * @param {string} [keyName] -  key name
     * @returns ` {(Type | undefined)}`
     */
    get(key: string, keyName?: string): Promise<Type | undefined>;
    /**
     * deletes data value for given key with an optional key name
     *
     * @param {string} key - key value
     * @param {string} [keyName] -  key name
     */
    delete(key: string, keyName?: string): Promise<void>;
}
