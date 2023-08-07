/**
 * Interface to work with encryption
 *
 * @public
 * @interface   IEncryptionService
 */
export interface IEncryptionService {
  /**
   * Encrypts a data object that can be any serializable value
   *
   * @param dataObj - The data to encrypt.
   * @returns The encrypted vault.
   */
  encrypt<Type>(dataObj: Type): Promise<string>;

  /**
   * Give cypher text, decrypts the text and returns
   * the resulting value.
   *
   * @param text - The cypher text to decrypt.
   * @returns The decrypted data.
   */
  decrypt<Type>(text: string): Promise<Type>;
}
