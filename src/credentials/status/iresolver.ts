import { CredentialStatusType, CredentialStatus, RevocationStatus } from '../../verifiable';
import { IssuerResolver } from './sparse-merkle-tree';

export interface CredentialStatusResolver {
  resolve(credentialStatus: CredentialStatus, opts?: object): Promise<RevocationStatus>;
}

export class CredentialStatusResolverRegistry {
  private resolvers: Map<CredentialStatusType, CredentialStatusResolver> = new Map();

  constructor() {
    this.resolvers.set(CredentialStatusType.SparseMerkleTreeProof, new IssuerResolver());
  }

  register(type: CredentialStatusType, resolver: CredentialStatusResolver) {
    this.resolvers.set(type, resolver);
  }

  get(type: CredentialStatusType): CredentialStatusResolver {
    return this.resolvers.get(type);
  }
}
