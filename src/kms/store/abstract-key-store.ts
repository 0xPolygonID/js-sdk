/**
 * KeyStore that allows to import and get keys by alias.
 *
 * @export
 * @abstract
 * @class AbstractPrivateKeyStore
 */
export abstract class AbstractPrivateKeyStore {
  abstract import(args: { alias: string; key: string }): Promise<void>;

  abstract get(args: { alias: string }): Promise<string>;
}
