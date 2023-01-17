export interface IDataSource<Type> {
  load(): Type[];
  save(key: string, value: Type, keyName?: string): void;
  get(key: string, keyName?: string): Type | undefined;
  delete(key: string, keyName?: string):void;
}
