import { DIDDocument, VerificationMethod } from 'did-resolver';
import { KmsKeyType } from '../../kms';
export declare const resolveVerificationMethods: (didDocument: DIDDocument) => VerificationMethod[];
export declare const extractPublicKeyBytes: (vm: VerificationMethod) => {
    publicKeyBytes: Uint8Array | null;
    kmsKeyType?: KmsKeyType;
};
