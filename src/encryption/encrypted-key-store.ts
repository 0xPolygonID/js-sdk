import { AbstractPrivateKeyStore } from '../kms';
import { EncryptOptions } from './encryption-options';
import { EncryptionService } from './encryption-service';

/**
 * Encrypted Key Store
 * @public
 * @class EncryptedKeyStore - class
 * @template Type
 */
export class EncryptedKeyStore<Type extends AbstractPrivateKeyStore>
  implements AbstractPrivateKeyStore
{
  private _keyStore: Type;
  private _encryptionService: EncryptionService<string>;
  constructor(keyStoreType: { new (): Type }, options: EncryptOptions) {
    this._keyStore = new keyStoreType();
    this._encryptionService = new EncryptionService<string>(options);
  }

  async importKey(args: { alias: string; key: string }): Promise<void> {
    const encryptedKey = await this._encryptionService.encrypt(args.key);
    this._keyStore.importKey({ alias: args.alias, key: encryptedKey });
  }

  async get(args: { alias: string }): Promise<string> {
    const encryptedKey = await this._keyStore.get(args);
    return this._encryptionService.decrypt(encryptedKey);
  }
}
