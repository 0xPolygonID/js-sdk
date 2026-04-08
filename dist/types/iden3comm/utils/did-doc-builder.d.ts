import { IKeyProvider } from '../../kms';
import { DIDDocument, VerificationMethod } from '../types';
export declare const DEFAULT_DID_CONTEXT = "https://www.w3.org/ns/did/v1";
export declare const JWK2020_CONTEXT_V1 = "https://w3id.org/security/suites/jws-2020/v1";
/**
 * DID Document builder
 */
export declare class DIDDocumentBuilder {
    private readonly _did;
    private _verificationMethods;
    private _keyAgreements;
    private _context;
    constructor(_did: string, context?: string | string[]);
    addVerificationMethod(vm: IVerificationMethodBuilder, context?: string | string[]): Promise<this>;
    build(): DIDDocument;
}
/**
 * Interface for Verification Method builder
 */
export interface IVerificationMethodBuilder {
    build(did: string): Promise<VerificationMethod>;
}
/**
 * Verification Method builder
 */
export declare class Jwk2020VerificationMethodBuilder implements IVerificationMethodBuilder {
    private readonly _keyProvider;
    private _alias?;
    constructor(_keyProvider: IKeyProvider, opts?: {
        alias?: string;
    });
    build(did: string): Promise<VerificationMethod>;
}
//# sourceMappingURL=did-doc-builder.d.ts.map