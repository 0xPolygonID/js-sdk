import { BjjProvider, KeyTypeBabyJubJub, KMS } from './kms';
import { Id } from '@iden3/js-iden3-core';

export interface IIdentityWallet {
  createIdentity(seed: Uint8Array): Promise<Id>;
  createProfile(nonce: number): Promise<void>;
  generateKey(): Promise<KmsKeyId>;
  getLatestStateById(id: Id): IdentityState;
  generateMtp(credential): Promise<Claim>;
  generateNonRevocationProof(credential): Promise<Claim>;
  getGenesisIdentifier(): Id;
  revokeKey(keyId: KmsKeyId): Promise<void>;
  getIdentityInfo(id: Id): Promise<IdentityState>;
  sign(payload, credential): Promise<Signature>;
}

export class IdentityWallet {
  private kms: KMS;
  constructor() {
    const bjjProvider = new BjjProvider(KeyTypeBabyJubJub);
    const kms = new KMS();
    kms.registerKeyProvider(KeyTypeBabyJubJub, bjjProvider);
    this.kms = kms;
  }

  async createIdentity(): Promise<string> {
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseedseed');
    console.log('await poseidonHash([1])');
    // console.log(await poseidonHash([1]));

    const keyID = await this.kms.createKeyFromSeed(KeyTypeBabyJubJub, seedPhrase);

    const pubKey = await this.kms.publicKey(keyID);

    console.log('pubKey2');
    console.log('pubKey');
    console.log(pubKey);

    return '1111';
  }

  createProfile(): string {
    return '';
  }

  generateMTP(credential: string): string {
    return '';
  }

  generateNonRevocationProof(credential: string): string {
    return '';
  }

  getGenesisIdentifier(): string {
    return '';
  }
}
