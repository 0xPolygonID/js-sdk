import { DID } from '@iden3/js-iden3-core';
import {
  IssuerData,
  RevocationStatus,
  CredentialStatus,
  CredentialStatusType
} from '../../verifiable';

/**
 * CredentialStatusResolveOptions is a set of options that can be passed to CredentialStatusResolver
 *
 * @beta
 * @export
 * @interface CredentialStatusResolveOptions
 */
export interface CredentialStatusResolveOptions {
  issuerData?: IssuerData;
  issuerDID?: DID;
  userDID?: DID;
}

/**
 * CredentialStatusResolver is an interface that allows to interact with deifferent types of credential status
 * to resolve revocation status
 *
 * @beta
 * @export
 * @interface CredentialStatusResolver
 */
export interface CredentialStatusResolver {
  resolve(
    credentialStatus: CredentialStatus,
    opts?: CredentialStatusResolveOptions
  ): Promise<RevocationStatus>;
}

/**
 * CredentialStatusResolverRegistry is a registry of CredentialStatusResolver
 *
 * @beta
 * @export
 * @interface CredentialStatusResolverRegistry
 */
export class CredentialStatusResolverRegistry {
  private resolvers: Map<CredentialStatusType, CredentialStatusResolver> = new Map();

  register(type: CredentialStatusType, resolver: CredentialStatusResolver) {
    this.resolvers.set(type, resolver);
  }

  get(type: CredentialStatusType): CredentialStatusResolver {
    return this.resolvers.get(type);
  }
}
