/**
 * KeyStore that allows to import and get keys by alias.
 *
 * @abstract
 * @public
 * @class AbstractPrivateKeyStore
 */
export declare abstract class AbstractPrivateKeyStore {
    /**
     * imports key by alias
     *
     * @abstract
     * @param {{ alias: string; key: string }} args - key alias and hex representation
     * @returns `Promise<void>`
     */
    abstract importKey(args: {
        alias: string;
        key: string;
    }): Promise<void>;
    /**
     * get key by alias
     *
     * @abstract
     * @param {{ alias: string }} args -key alias
     * @returns `Promise<string>`
     */
    abstract get(args: {
        alias: string;
    }): Promise<string>;
}
