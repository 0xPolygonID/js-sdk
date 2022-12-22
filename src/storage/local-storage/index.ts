export class BrowserLocalStorage<Type> {
  constructor(private localStorageKey = 'credentials') {}

  save(newState: Type): void {
    if (localStorage) {
      localStorage.setItem(this.localStorageKey, JSON.stringify(newState));
    }
  }

  load(): Type {
    const rawCache = localStorage.getItem(this.localStorageKey) || '{}';
    let cache: Type;
    try {
      cache = JSON.parse(rawCache);
    } catch (e: unknown) {
      cache = {} as Type;
    }
    return cache;
  }
}
