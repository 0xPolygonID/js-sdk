import { AbstractPrivateKeyStore } from './abstract-key-store';
/**
 * Allows storing keys in the local storage of the browser
 * (NOT ENCRYPTED: DO NOT USE IN THE PRODUCTION)
 *
 * @public
 * @class LocalStoragePrivateKeyStore
 * @implements implements AbstractPrivateKeyStore interface
 */
export declare class LocalStoragePrivateKeyStore implements AbstractPrivateKeyStore {
    static readonly storageKey = "keystore";
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
     * Gets key from the local storage
     *
     * @param {{ alias: string }} args
     * @returns hex string
     */
    get(args: {
        alias: string;
    }): Promise<string>;
    /**
     * Import key to the local storage
     *
     * @param {{ alias: string; key: string }} args - alias and private key in the hex
     * @returns void
     */
    importKey(args: {
        alias: string;
        key: string;
    }): Promise<void>;
}
//# sourceMappingURL=local-storage-key-store.d.ts.map