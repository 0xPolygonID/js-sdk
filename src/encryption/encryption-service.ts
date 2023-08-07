import { EncryptOptions, SymmetricKeyAlgorithms } from './encryption-options';
import { IEncryptionService } from './interfaces/encryption-service';
import * as nodeCrypto from 'crypto';
import { getRandomBytes } from '../kms/provider-helpers';
import {
  base64ToBytes,
  byteDecoder,
  byteEncoder,
  bytesToBase64url,
  encodeBase64url
} from '../utils';

const crypto = typeof window !== 'undefined' ? globalThis.crypto : nodeCrypto;
/**
 * Encryption Service
 * @public
 * @class EncryptionService - class
 * @template Type
 */
export class EncryptionService implements IEncryptionService {
  private readonly _password: string;
  private readonly _algorithm: string;

  constructor(opts: EncryptOptions) {
    this._password = opts.password;
    this._algorithm = opts.algorithm ?? SymmetricKeyAlgorithms.AESGCM;
  }

  /**
   * Encrypts a data object that can be any serializable value using
   * a provided password.
   *
   * @param dataObj - The data to encrypt.
   * @returns The encrypted vault.
   */
  public async encrypt<Type>(dataObj: Type): Promise<string> {
    const [cryptoKey, salt] = await this.keyFromPassword();
    const data = JSON.stringify(dataObj);
    const dataBuffer = byteEncoder.encode(data);
    const vector = getRandomBytes(16);
    const buf = await crypto.subtle.encrypt(
      {
        name: this._algorithm,
        iv: vector
      },
      cryptoKey,
      dataBuffer
    );
    const buffer = new Uint8Array(buf);
    const vectorStr = bytesToBase64url(vector);
    const vaultStr = bytesToBase64url(buffer);
    return JSON.stringify({
      data: vaultStr,
      iv: vectorStr,
      salt
    });
  }

  /**
   * Give cypher text, decrypts the text and returns
   * the resulting value.
   *
   * @param text - The cypher text to decrypt.
   * @returns The decrypted data.
   */
  async decrypt<Type>(text: string): Promise<Type> {
    const payload = JSON.parse(text);
    const { salt } = payload;
    const [cryptoKey] = await this.keyFromPassword(salt);
    const encryptedData = base64ToBytes(payload.data);
    const vector = base64ToBytes(payload.iv);
    let decryptedObj;
    try {
      const result = await crypto.subtle.decrypt(
        { name: this._algorithm, iv: vector },
        cryptoKey,
        encryptedData
      );
      const decryptedData = new Uint8Array(result);
      const decryptedStr = byteDecoder.decode(decryptedData);
      decryptedObj = JSON.parse(decryptedStr);
    } catch (e) {
      throw new Error('Incorrect password');
    }
    return decryptedObj;
  }

  /**
   * Generates a random string for use as a salt in CryptoKey generation.
   *
   * @param byteCount - The number of bytes to generate.
   * @returns A randomly generated string.
   */
  private generateSalt(byteCount = 32): string {
    const view = getRandomBytes(byteCount);
    const b64encoded = encodeBase64url(
      String.fromCharCode.apply(null, view as unknown as number[])
    );
    return b64encoded;
  }

  /**
   * Generate a CryptoKey from a password and random salt.
   *
   * @param salt - The salt string to use in key derivation.
   * @param exportable - Should the derived key be exportable.
   * @returns A CryptoKey for encryption and decryption and salt.
   */
  private async keyFromPassword(
    salt: string = this.generateSalt(),
    exportable = false
  ): Promise<[CryptoKey, string]> {
    const passBuffer = byteEncoder.encode(this._password);
    const saltBuffer = base64ToBytes(salt);
    const key = await crypto.subtle.importKey('raw', passBuffer, { name: 'PBKDF2' }, false, [
      'deriveBits',
      'deriveKey'
    ]);
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 10000,
        hash: 'SHA-256'
      },
      key,
      { name: this._algorithm, length: 256 },
      exportable,
      ['encrypt', 'decrypt']
    );
    return [derivedKey, salt];
  }
}
