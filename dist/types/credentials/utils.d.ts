import { DID } from '@iden3/js-iden3-core';
import { W3CCredential } from '../verifiable';
import { KmsKeyId } from '../kms';
/**
 * Retrieves the user DID from a given credential.
 * If the credential does not have a credentialSubject.id property, the issuer DID is returned.
 * If the credentialSubject.id is not a string, an error is thrown.
 * @param issuerDID The DID of the issuer.
 * @param credential The credential object.
 * @returns The user DID parsed from the credential.
 * @throws Error if the credentialSubject.id is not a string.
 */
export declare const getUserDIDFromCredential: (issuerDID: DID, credential: W3CCredential) => DID;
export declare const getKMSIdByAuthCredential: (credential: W3CCredential) => KmsKeyId;
//# sourceMappingURL=utils.d.ts.map