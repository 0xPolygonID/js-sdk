import { AbstractPrivateKeyStore } from './abstract-key-store';
/**
 * Allows storing keys in the indexed db storage of the browser
 * (NOT ENCRYPTED: DO NOT USE IN THE PRODUCTION)
 *
 * @public
 * @class IndexedDBPrivateKeyStore
 * @implements implements AbstractPrivateKeyStore interface
 */
export declare class IndexedDBPrivateKeyStore implements AbstractPrivateKeyStore {
    static readonly storageKey = "keystore";
    private readonly _store;
    constructor();
    /**
     * get all keys
     *
     * @abstract
     * @returns `Promise<{ alias: string; key: string }[]>`
     */
    list(): Promise<{
        alias: string;
        key: string;
    }[]>;
    /**
     * Gets key from the indexed db storage
     *
     * @param {{ alias: string }} args
     * @returns hex string
     */
    get(args: {
        alias: string;
    }): Promise<string>;
    /**
     * Import key to the indexed db storage
     *
     * @param {{ alias: string; key: string }} args - alias and private key in the hex
     * @returns void
     */
    importKey(args: {
        alias: string;
        key: string;
    }): Promise<void>;
}
//# sourceMappingURL=indexed-db-key-store.d.ts.map