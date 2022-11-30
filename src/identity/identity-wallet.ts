import { KmsKeyType } from './kms/kms';
import { BjjProvider, KMS, KmsKeyId } from './kms';
import { Claim, Id } from '@iden3/js-iden3-core';
import { Signature } from '@iden3/js-crypto';

// IdentityStatus represents type for state Status
export enum IdentityStatus {
  Created = 'created',
  // StatusTransacted is a status for state that was published but result is not known
  Transacted = 'transacted',
  // StatusConfirmed is a status for confirmed transaction
  Confirmed = 'confirmed',
  // StatusFailed is a status for failed transaction
  Failed = 'failed'
}

// IdentityState identity state model
export interface IdentityState {
  stateId: number;
  identifier: string;
  state?: string;
  rootOfRoots?: string;
  claimsTreeRoot?: string;
  revocationTreeRoot?: string;
  blockTimestamp?: number;
  blockNumber?: number;
  txId?: string;
  previousState?: string;
  status?: IdentityStatus;
  modifiedAt?: string;
  createdAt?: string;
}

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
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub);
    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);
    this.kms = kms;
  }

  async createIdentity(): Promise<string> {
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseedseed');
    console.log('poseidon.hash([1])');
    // console.log(poseidon.hash([1]));

    const keyID = await this.kms.createKeyFromSeed(KmsKeyType.BabyJubJub, seedPhrase);

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
