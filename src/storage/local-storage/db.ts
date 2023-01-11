export class BrowserLocalStorage<Type> {
  constructor(private localStorageKey = 'credentials') {}

  save(newState: Type): void {
    if (localStorage) {
      localStorage.setItem(this.localStorageKey, JSON.stringify(newState));
    }
  }

  load(): Type | undefined {
    const data = localStorage.getItem(this.localStorageKey);
    return data && JSON.parse(data);
  }
}
