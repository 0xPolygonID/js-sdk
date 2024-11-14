import { CredentialStatus, RevocationStatus } from '../../verifiable';
import { CredentialStatusResolveOptions, CredentialStatusResolver } from './resolver';

export class DidDocumentCredentialStatusResolver implements CredentialStatusResolver {
  constructor(private readonly didResolverUrl: string) {}
  resolve(
    credentialStatus: CredentialStatus,
    opts?: CredentialStatusResolveOptions | undefined
  ): Promise<RevocationStatus> {
    if (!opts?.issuerDID) {
        throw new Error('IssuerDID is not set in options');
    }

    throw new Error('Method not implemented.');
  }
}
