/**
 * Interface to work with encryption
 *
 * @public
 * @interface   IEncryptionService
 */
export interface IEncryptionService<Type> {
  /**
   * Encrypts a data object that can be any serializable value
   *
   * @param dataObj - The data to encrypt.
   * @returns The encrypted vault.
   */
  encrypt(dataObj: Type): Promise<string>;

  /**
   * Give cypher text, decrypts the text and returns
   * the resulting value.
   *
   * @param text - The cypher text to decrypt.
   * @returns The decrypted data.
   */
  decrypt(text: string): Promise<Type>;
}
