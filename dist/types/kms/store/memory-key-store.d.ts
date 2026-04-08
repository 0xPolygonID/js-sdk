import { AbstractPrivateKeyStore } from './abstract-key-store';
/**
 * Key Store to use in memory
 *
 * @public
 * @class InMemoryPrivateKeyStore
 * @implements implements AbstractPrivateKeyStore interface
 */
export declare class InMemoryPrivateKeyStore implements AbstractPrivateKeyStore {
    private _data;
    constructor();
    list(): Promise<{
        alias: string;
        key: string;
    }[]>;
    get(args: {
        alias: string;
    }): Promise<string>;
    importKey(args: {
        alias: string;
        key: string;
    }): Promise<void>;
}
//# sourceMappingURL=memory-key-store.d.ts.map