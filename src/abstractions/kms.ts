import { Signature } from '../identity/bjj/eddsa-babyjub';
import { KmsKeyId } from '../identity/kms';

export interface IKmsService {
  getBJJDigest(challenge: number): Uint8Array;
  sign(keyId: KmsKeyId, challengeDigest: Uint8Array): Uint8Array;
  decodeBJJSignature(sigBytes: Uint8Array): Signature;
}
