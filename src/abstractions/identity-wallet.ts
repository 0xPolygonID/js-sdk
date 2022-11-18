import { Signature } from '../identity/bjj/eddsa-babyjub';
import { Id } from '@iden3/js-iden3-core';
import { Claim } from '../claim';
import { IdentityState } from '../identity';
import { KmsKeyId } from '../identity/kms';

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
