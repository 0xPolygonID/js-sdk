import { IKeyProvider } from './kms';
import { AbstractPrivateKeyStore, KmsKeyId, KmsKeyType } from './store';
import Elliptic from 'elliptic';
import { sha256 } from 'cross-sha256';
import * as providerHelpers from './provider-helpers';
import { PublicKey } from '@iden3/js-crypto';

/**
 * Provider for Sec256p1 keys256p1
 * @beta
 * @export
 * @beta
 * @class Sec256p1Provider
 * @implements implements IKeyProvider interface
 */
export class Sec256k1Provider implements IKeyProvider {
  /**
   * key type that is handled by BJJ Provider
   * @type {KmsKeyType}
   */
  keyType: KmsKeyType;
  private _keyStore: AbstractPrivateKeyStore;

  private readonly _ec;
  /**
   * Creates an instance of BjjProvider.
   * @param {KmsKeyType} keyType - kms key type
   * @param {AbstractPrivateKeyStore} keyStore - key store for kms
   */
  constructor(keyType: KmsKeyType, keyStore: AbstractPrivateKeyStore) {
    this.keyType = keyType;
    this._keyStore = keyStore;
    this._ec = new Elliptic.ec('secp256k1');
  }
  /**
   * generates a baby jub jub key from a seed phrase
   * @param {Uint8Array} seed - byte array seed
   * @returns kms key identifier
   */
  async newPrivateKeyFromSeed(): Promise<KmsKeyId> {
    const keyPair = this._ec.genKeyPair();
    const kmsId = {
      type: this.keyType,
      id: providerHelpers.keyPath(this.keyType, keyPair.getPublic().encode('hex'))
    };
    await this._keyStore.import({ alias: kmsId.id, key: keyPair.getPrivate().toString('hex') });

    return kmsId;
  }

  /**
   * Gets public key by kmsKeyId
   *
   * @param {KmsKeyId} keyId - key identifier
   */
  async publicKey(keyId: KmsKeyId): Promise<PublicKey> {
    const privateKeyHex = await this.privateKey(keyId);
    return this._ec.keyFromPrivate(privateKeyHex, 'hex').getPublic().encode('hex');
  }

  /**
   * signs prepared payload of size,
   * with a key id
   *
   * @param {KmsKeyId} keyId  - key identifier
   * @param {Uint8Array} data - data to sign (32 bytes)
   * @returns Uint8Array signature
   */
  async sign(keyId: KmsKeyId, data: Uint8Array): Promise<Uint8Array> {
    const msgHash = new sha256().update(data).digest('hex');
    const privateKeyHex = await this.privateKey(keyId);
    const pk = this._ec.keyFromPrivate(privateKeyHex, 'hex');
    const signature = pk.sign(msgHash).toDER();
    return Uint8Array.from(signature);
  }

  private async privateKey(keyId: KmsKeyId): Promise<string> {
    return this._keyStore.get({ alias: keyId.id });
  }
}
