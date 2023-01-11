export class BrowserLocalStorage<Type> {
  constructor(private localStorageKey = 'credentials') {}

  save(newState: Type): void {
    if (localStorage) {
      localStorage.setItem(this.localStorageKey, JSON.stringify(newState));
    }
  }

  load(): Type {
    const rawCache = localStorage.getItem(this.localStorageKey) || null;
    // it will throw exeption if rawCache is not valid json.
    return JSON.parse(rawCache ?? '{}') as Type
   
  }
}
