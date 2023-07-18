import { CredentialStatusType, CredentialStatus, RevocationStatus } from '../../verifiable';

export interface CredentialStatusResolver {
  resolve(credentialStatus: CredentialStatus, opts?: object): Promise<RevocationStatus>;
}

export class CredentialStatusResolverRegistry {
  private resolvers: Map<CredentialStatusType, CredentialStatusResolver> = new Map();

  register(type: CredentialStatusType, resolver: CredentialStatusResolver) {
    this.resolvers.set(type, resolver);
  }

  get(type: CredentialStatusType): CredentialStatusResolver | undefined {
    return this.resolvers.get(type);
  }
}
