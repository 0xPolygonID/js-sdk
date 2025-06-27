import QuickLRU from 'quick-lru';

export interface ICache<T> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export function createInMemoryCache<T>(params: { ttl?: number; maxSize: number }): ICache<T> {
  const cache = new QuickLRU<string, T>({ maxSize: params.maxSize, maxAge: params.ttl });

  return {
    get: async (key: string): Promise<T | undefined> => {
      return cache.get(key);
    },

    set: async (key: string, value: T, ttl?: number) => {
      cache.set(key, value, { maxAge: ttl ?? params.ttl });
    },

    clear: async () => {
      cache.clear();
    },

    delete: async (key: string) => {
      cache.delete(key);
    }
  };
}
