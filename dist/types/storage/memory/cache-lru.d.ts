export interface ICache<T> {
    get(key: string): Promise<T | undefined>;
    set(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
}
export declare function createInMemoryCache<T>(params: {
    ttl?: number;
    maxSize: number;
}): ICache<T>;
//# sourceMappingURL=cache-lru.d.ts.map