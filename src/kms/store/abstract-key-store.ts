export abstract class AbstractPrivateKeyStore {
  abstract import(args: { alias: string; key: string }): Promise<void>;

  abstract get(args: { alias: string }): Promise<string>;
}
