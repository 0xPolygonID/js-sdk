import * as ethers5 from 'ethers5'; // Lit Protocol requires ethers v5
import { LIT_ABILITY, LIT_NETWORK, LIT_RPC } from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import * as providerHelpers from '../provider-helpers';
import { EthWalletProvider } from '@lit-protocol/lit-auth-client';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';

import { litActionCode } from './lit-action';
import { secp256k1 } from '@noble/curves/secp256k1';
import { sha256 } from '@iden3/js-crypto';
import { IKeyProvider } from '../kms';
import { AbstractPrivateKeyStore, KmsKeyId, KmsKeyType, TypedData } from '../store';
import { bytesToHex, hexToBytes } from '../../utils';

export type LitNetworkValue = (typeof LIT_NETWORK)[keyof typeof LIT_NETWORK];

/**
 * Provider for LitProtocol PKP keys
 * @public
 * @class LitProtocolProvider
 */
export class LitProtocolProvider implements IKeyProvider {
  private readonly client: LitNodeClient;
  private _keyStore: AbstractPrivateKeyStore;

  /**
   * Creates an instance of LitProtocolProvider.
   * @param {KeyType} keyType - kms key type
   * @param {LitNetworkValue} network - chain to use of LitProtocol
   * @param {AbstractPrivateKeyStore} keyStore - key store for kms
   */
  constructor(
    public readonly keyType: KmsKeyType,
    public readonly network: LitNetworkValue,
    keyStore: AbstractPrivateKeyStore
  ) {
    if (keyType !== KmsKeyType.LitProtocolPKP) {
      throw new Error('Key type must be LitProtocolPKP');
    }

    this.keyType = keyType;
    this._keyStore = keyStore;
    this.client = new LitNodeClient({
      litNetwork: network,
      debug: false
    });
  }

  /**
   * get all keys
   * @returns list of keys
   */
  async list(): Promise<
    {
      alias: string;
      key: string;
    }[]
  > {
    const allKeysFromKeyStore = await this._keyStore.list();
    return allKeysFromKeyStore.filter((key) => key.alias.startsWith(this.keyType));
  }

  async newPrivateKey(): Promise<KmsKeyId> {
    throw new Error('Not implemented for Lit Protocol, use newPrivateKeyFromSeed instead');
  }

  /**
   * generates a baby jub jub key from a seed phrase
   * @param {Uint8Array} seed - byte array seed
   * @returns kms key identifier
   */
  async newPrivateKeyFromSeed(seed: Uint8Array): Promise<KmsKeyId> {
    if (!seed) {
      throw new Error(`No seed found for ${this.keyType}`);
    }

    if (seed.length !== 32 && seed.length !== 65) {
      throw new Error('Seed should be 32 bytes for private key or 65 bytes for public key');
    }

    if (seed.length === 32) {
      // private key
      const signer = new ethers5.Wallet(
        bytesToHex(seed),
        new ethers5.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
      );
      return this.newPKP(signer);
    } else {
      // public key
      return this.importKey(bytesToHex(seed));
    }
  }

  /**
   * generates a PKP key
   * @returns {Promise<KmsKeyId>} agentKms key identifier
   */
  private async newPKP(signer: ethers5.Signer): Promise<KmsKeyId> {
    await this.client.connect();
    const litContracts = new LitContracts({
      signer: signer,
      network: this.network,
      debug: false
    });

    await litContracts.connect();
    let pkp: { tokenId: any; publicKey: string; ethAddress: string } | null = null;
    try {
      pkp = (await litContracts.pkpNftContractUtils.write.mint()).pkp;
    } catch (error: any) {
      await this.client.disconnect();
      throw error;
    }
    await this.client.disconnect();

    const publicKey = pkp.publicKey;
    const ethAddress = pkp.ethAddress;

    const kmsId = {
      type: this.keyType,
      id: providerHelpers.keyPath(this.keyType, ethAddress)
    };

    await this._keyStore.importKey({
      alias: kmsId.id,
      key: publicKey
    });

    return kmsId;
  }

  /**
   * Imports a public key into the key store and returns a structured KMS key identifier.
   * @param {string} publicKey - The public key to import and must be hex-encoded (with or without `0x` prefix).
   */
  private async importKey(publicKey: string): Promise<KmsKeyId> {
    const normalizedKey = publicKey.startsWith('0x') ? publicKey : `0x${publicKey}`;
    const ethAddress = ethers5.utils.computeAddress(normalizedKey);

    const kmsId: KmsKeyId = {
      type: this.keyType,
      id: providerHelpers.keyPath(this.keyType, ethAddress)
    };

    await this._keyStore.importKey({
      alias: kmsId.id,
      key: normalizedKey.replace(/^0x/, '')
    });

    return kmsId;
  }

  /**
   * Gets ethAddress by kmsKeyId
   * @param {KmsKeyId} keyId - key identifier
   * @returns {Promise<string>} Public key as a hex string
   */
  async getEthAddress(keyId: KmsKeyId): Promise<string> {
    const parts = keyId.id.split(':');
    if (parts.length !== 2) {
      throw new Error(`Invalid keyId format: ${keyId.id}`);
    }
    return parts[1];
  }

  /**
   * signs prepared payload of size,
   * with a key id
   * @param {KmsKeyId} keyId  - key identifier
   * @param {Uint8Array} data - data to sign
   * @param {ethers.Wallet} signer The wallet whose signature is required to generate valid SessionSigs, which are needed to authorize the use of a Programmable Key Pair (PKP) on the Lit Network.
   * @param opts - Signing options, such as the algorithm to use.
   * @returns {Promise<Uint8Array>} signature
   */
  async sign(
    keyId: KmsKeyId,
    data: Uint8Array,
    opts: {
      [key: string]: unknown;
    } = { alg: 'ES256K' }
  ): Promise<Uint8Array> {
    if (!opts.seed) {
      throw new Error(`No seed found for ${this.keyType}`);
    }

    if (typeof opts.seed !== 'object' || !(opts.seed instanceof Uint8Array)) {
      throw new Error('Seed must be a Uint8Array');
    }

    if ((opts.seed as Uint8Array).length !== 32) {
      throw new Error('Seed should be 32 bytes for private key to be able to sign');
    }

    const signer = new ethers5.Wallet(bytesToHex(opts.seed));

    await this.client.connect();

    try {
      const publicKey = await this.publicKey(keyId);
      const authMethod = await EthWalletProvider.authenticate({
        signer: signer,
        litNodeClient: this.client
      });

      const sessionSigs = await this.client.getPkpSessionSigs({
        pkpPublicKey: publicKey,
        chain: 'ethereum',
        authMethods: [authMethod],
        resourceAbilityRequests: [
          {
            resource: new LitActionResource('*'),
            ability: LIT_ABILITY.LitActionExecution
          },
          {
            resource: new LitPKPResource('*'),
            ability: LIT_ABILITY.PKPSigning
          }
        ]
      });

      const sigName = 'sigName';
      const result = await this.client.executeJs({
        sessionSigs,
        code: litActionCode,
        jsParams: { publicKey, message: data, sigName }
      });
      await this.client.disconnect();

      const signatureFromResponse = result.signatures[sigName];
      if (!signatureFromResponse) {
        throw new Error(`Missing signature for "${sigName}"`);
      }

      const { r, s, recid } = signatureFromResponse;
      const recidHex = opts.alg === 'ES256K-R' ? recid.toString(16).padStart(2, '0') : '';
      const compactSig = r + s + recidHex;

      return hexToBytes(compactSig);
    } catch (error) {
      await this.client.disconnect();
      throw error;
    }
  }

  /**
   * get private key store
   *
   * @returns private key store
   */
  async getPkStore(): Promise<AbstractPrivateKeyStore> {
    return this._keyStore;
  }

  /**
   * Signs EIP712 the given data using the private key associated with the specified key identifier.
   * @param keyId - The key identifier to use for signing.
   * @param typedData - The TypedData to sign.
   * @param opts - Signing options, such as the algorithm to use.
   * @returns A Promise that resolves to the signature as a Uint8Array.
   */
  async signTypedData(keyId: KmsKeyId, typedData: TypedData): Promise<Uint8Array> {
    // TODO: implement EIP712 signing with Lit Protocol
    throw new Error('Lit Protocol not supported yet for EIP712 signature. Should be implemented');
  }

  /**
   * Retrieves the public key for a given keyId from the key store.
   * @param {KmsKeyId} keyId - The identifier of the key to retrieve.
   * @returns {Promise<string>} The public key associated with the keyId.
   */
  async publicKey(keyId: KmsKeyId): Promise<string> {
    return this._keyStore.get({ alias: keyId.id });
  }

  /**
   *
   * @param {Uint8Array} message signed message
   * @param {string} signatureHex signature in hex format
   * @param {KmsKeyId} keyId the identifier of the KMS key that was used to sign the message
   */
  async verify(message: Uint8Array, signatureHex: string, keyId: KmsKeyId): Promise<boolean> {
    const publicKeyHex = await this.publicKey(keyId);
    const cleanSignatureHex = signatureHex.startsWith('0x') ? signatureHex.slice(2) : signatureHex;
    return secp256k1.verify(
      hexToBytes(cleanSignatureHex),
      sha256(message),
      hexToBytes(publicKeyHex)
    );
  }
}
