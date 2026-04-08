import { DIDDocument, JsonWebKey, VerificationMethod } from 'did-resolver';
import { KmsKeyType } from '../../kms';
export declare const resolveVerificationMethods: (didDocument: DIDDocument) => VerificationMethod[];
export declare const extractPublicKeyBytes: (vm: VerificationMethod) => {
    publicKeyBytes: Uint8Array | null;
    kmsKeyType?: KmsKeyType;
};
/**
 * toPublicKeyJwk - converts given key string to JsonWebKey format based on the algorithm
 * @param keyStr - public key in string format
 * @param alg - algorithm to be used for conversion
 * @returns JsonWebKey
 */
export declare const toPublicKeyJwk: (keyStr: string, keyType: KmsKeyType) => JsonWebKey;
//# sourceMappingURL=did.d.ts.map