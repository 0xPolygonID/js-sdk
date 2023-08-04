/**
 * Key Store to use in memory
 *
 * @public
 * @class InMemoryPrivateKeyStore
 * @implements implements AbstractPrivateKeyStore interface
 */
export class InMemoryPrivateKeyStore {
    constructor() {
        this._data = new Map();
    }
    async get(args) {
        const privateKey = this._data.get(args.alias);
        if (!privateKey) {
            throw new Error('no key under given alias');
        }
        return privateKey;
    }
    async importKey(args) {
        this._data.set(args.alias, args.key);
    }
}
//# sourceMappingURL=memory-key-store.js.map