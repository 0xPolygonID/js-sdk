import { DID } from '@iden3/js-iden3-core';
import {
  IssuerData,
  RevocationStatus,
  CredentialStatus,
  CredentialStatusType
} from '../../verifiable';

export type CredentialStatusResolveOptions = {
  issuerData?: IssuerData;
  issuerDID?: DID;
  userDID?: DID;
};

export interface CredentialStatusResolver {
  resolve(
    credentialStatus: CredentialStatus,
    opts?: CredentialStatusResolveOptions
  ): Promise<RevocationStatus>;
}

export class CredentialStatusResolverRegistry {
  private resolvers: Map<CredentialStatusType, CredentialStatusResolver> = new Map();

  register(type: CredentialStatusType, resolver: CredentialStatusResolver) {
    this.resolvers.set(type, resolver);
  }

  get(type: CredentialStatusType): CredentialStatusResolver {
    return this.resolvers.get(type);
  }
}
