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
 * @public
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
 * @public
 * @interface CredentialStatusResolver
 */
export interface CredentialStatusResolver {
  
  /**
   * resolve is a method to resolve a credential status from the the spefic source.
   *
   * @public
   * @param {CredentialStatus} credentialStatus -  credential status to resolve
   * @param {CredentialStatusResolveOptions} credentialStatusResolveOptions -  options for resolver
   * @returns `{Promise<RevocationStatus>}`
   */
  resolve(
    credentialStatus: CredentialStatus,
    opts?: CredentialStatusResolveOptions
  ): Promise<RevocationStatus>;
}

/**
 * CredentialStatusResolverRegistry is a registry of CredentialStatusResolver
 *
 * @public
 * @interface CredentialStatusResolverRegistry
 */
export class CredentialStatusResolverRegistry {
  private resolvers: Map<CredentialStatusType, CredentialStatusResolver> = new Map();

  /**
   * register is a method to add a credential status resolver for specific credential status type
   *
   * @public
   * @param {CredentialStatusType} type -  one of the credential status types
   * @param {CredentialStatusResolver} resolver -  resolver
   */
  register(type: CredentialStatusType, resolver: CredentialStatusResolver) {
    this.resolvers.set(type, resolver);
  }

  /**
   * resolve is a method to resolve a credential status from the the spefic source.
   *
   * @public
   * @param {CredentialStatus} credentialStatus -  credential status to resolve
   * @param {CredentialStatusResolveOptions} credentialStatusResolveOptions -  options for resolver
   * @returns `{Promise<RevocationStatus>}`
   */
  get(type: CredentialStatusType): CredentialStatusResolver | undefined {
    return this.resolvers.get(type);
  }
}
