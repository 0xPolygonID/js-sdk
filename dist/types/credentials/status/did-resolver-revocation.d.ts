import { CredentialStatus, RevocationStatus } from '../../verifiable';
import { CredentialStatusResolveOptions, CredentialStatusResolver } from './resolver';
export declare class DidDocumentCredentialStatusResolver implements CredentialStatusResolver {
    private readonly didResolverUrl;
    constructor(didResolverUrl: string);
    resolve(credentialStatus: CredentialStatus, opts?: CredentialStatusResolveOptions | undefined): Promise<RevocationStatus>;
}
//# sourceMappingURL=did-resolver-revocation.d.ts.map