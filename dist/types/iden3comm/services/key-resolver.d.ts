import { KMS } from '../../kms';
export interface KeyResolver {
    resolvePrivateKeyByKid: (kid: string) => Promise<CryptoKey>;
}
export declare class DefaultKMSKeyResolver implements KeyResolver {
    private readonly kms;
    constructor(kms: KMS);
    resolvePrivateKeyByKid: (kid: string) => Promise<CryptoKey>;
}
//# sourceMappingURL=key-resolver.d.ts.map