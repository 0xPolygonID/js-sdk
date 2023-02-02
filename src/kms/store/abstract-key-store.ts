/**
 * KeyStore that allows to import and get keys by alias.
 *
 * @export
 * @abstract
 * @beta
 * @class AbstractPrivateKeyStore
 */
export abstract class AbstractPrivateKeyStore {
  /**
   * imports key by alias
   *
   * @abstract
   * @param {{ alias: string; key: string }} args - key alias and hex representation
   * @returns `Promise<void>`
   */
  abstract import(args: { alias: string; key: string }): Promise<void>;

  /**
   * get key by alias
   *
   * @abstract
   * @param {{ alias: string }} args -key alias
   * @returns `Promise<string>`
   */
  abstract get(args: { alias: string }): Promise<string>;
}
