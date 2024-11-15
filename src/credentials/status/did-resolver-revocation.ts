import { CredentialStatus, RevocationStatus } from '../../verifiable';
import { CredentialStatusResolveOptions, CredentialStatusResolver } from './resolver';

export class DidDocumentCredentialStatusResolver implements CredentialStatusResolver {
  constructor(private readonly didResolverUrl: string) {}
  async resolve(
    credentialStatus: CredentialStatus,
    opts?: CredentialStatusResolveOptions | undefined
  ): Promise<RevocationStatus> {
    if (!opts?.issuerDID) {
      throw new Error('IssuerDID is not set in options');
    }

    const didString = opts?.issuerDID.string().replace(/:/g, '%3A');
    const url = `${this.didResolverUrl}/1.0/credential-status/${didString}`;
    const resp = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(credentialStatus)
    });
    const data = await resp.json();
    return data;
  }
}
