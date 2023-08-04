import { EncryptOptions } from './encryption-options';
import { IEncryptionService } from './interfaces/encryption-service';
/**
 * Browser Encryption Service
 * @public
 * @class EncryptedDataSource - class
 * @template Type
 */
export declare class BrowserEncryptionService<Type> implements IEncryptionService<Type> {
    private readonly _password;
    private readonly _algorithm;
    private readonly _stringEncoding;
    private readonly _crypto;
    constructor(opts: EncryptOptions);
    /**
     * Encrypts a data object that can be any serializable value using
     * a provided password.
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
    /**
     * Generates a random string for use as a salt in CryptoKey generation.
     *
     * @param byteCount - The number of bytes to generate.
     * @returns A randomly generated string.
     */
    private generateSalt;
    /**
     * Generate a CryptoKey from a password and random salt.
     *
     * @param password - The password to use to generate key.
     * @param salt - The salt string to use in key derivation.
     * @param exportable - Should the derived key be exportable.
     * @returns A CryptoKey for encryption and decryption and salt.
     */
    private keyFromPassword;
}
