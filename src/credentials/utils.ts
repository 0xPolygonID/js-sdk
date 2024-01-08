import { DID } from '@iden3/js-iden3-core';
import { W3CCredential } from '../verifiable';
import { PublicKey } from '@iden3/js-crypto';
import { KmsKeyId, KmsKeyType, keyPath } from '../kms';

/**
 * Retrieves the user DID from a given credential.
 * If the credential does not have a credentialSubject.id property, the issuer DID is returned.
 * If the credentialSubject.id is not a string, an error is thrown.
 * @param issuerDID The DID of the issuer.
 * @param credential The credential object.
 * @returns The user DID parsed from the credential.
 * @throws Error if the credentialSubject.id is not a string.
 */
export const getUserDIDFromCredential = (issuerDID: DID, credential: W3CCredential) => {
  if (!credential.credentialSubject.id) {
    return issuerDID;
  }

  if (typeof credential.credentialSubject.id !== 'string') {
    throw new Error('credential subject `id` is not a string');
  }
  return DID.parse(credential.credentialSubject.id);
};

export const getKMSIdByAuthCredential = (credential: W3CCredential): KmsKeyId => {
  if (!credential.type.includes('AuthBJJCredential')) {
    throw new Error("can't sign with not AuthBJJCredential credential");
  }
  const x = credential.credentialSubject['x'] as unknown as string;
  const y = credential.credentialSubject['y'] as unknown as string;

  const pb: PublicKey = new PublicKey([BigInt(x), BigInt(y)]);
  const kp = keyPath(KmsKeyType.BabyJubJub, pb.hex());
  return { type: KmsKeyType.BabyJubJub, id: kp };
};
