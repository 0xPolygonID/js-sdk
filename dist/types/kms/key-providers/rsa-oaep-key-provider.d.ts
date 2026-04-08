import { IKeyProvider } from '../kms';
import { KmsKeyId, KmsKeyType } from '../store/types';
import { AbstractPrivateKeyStore } from '../store/abstract-key-store';
export declare const defaultRSAOaepKmsIdPathGeneratingFunction: (publicKey: JsonWebKey) => string;
export declare class RsaOAEPKeyProvider implements IKeyProvider {
    private readonly _keyStore;
    private readonly _params;
    private readonly _kmsIdPathGeneratingFunction;
    private readonly _capabilities;
    keyType: KmsKeyType;
    constructor(_keyStore: AbstractPrivateKeyStore, _params?: RsaHashedKeyGenParams, _kmsIdPathGeneratingFunction?: (publicKey: JsonWebKey) => string);
    /**
     * get private key store
     *
     * @returns private key store
     */
    getPkStore(): Promise<AbstractPrivateKeyStore>;
    newPrivateKeyFromSeed(seed: Uint8Array): Promise<KmsKeyId>;
    newPrivateKey(): Promise<KmsKeyId>;
    publicKey(keyId: KmsKeyId): Promise<string>;
    publicKeyFromPrivateKey(privateKey: JsonWebKey): Promise<JsonWebKey>;
    list(): Promise<{
        alias: string;
        key: string;
    }[]>;
    sign(keyId: KmsKeyId, data: Uint8Array): Promise<Uint8Array>;
    verify(message: Uint8Array, signatureHex: string, keyId: KmsKeyId): Promise<boolean>;
}
//# sourceMappingURL=rsa-oaep-key-provider.d.ts.map