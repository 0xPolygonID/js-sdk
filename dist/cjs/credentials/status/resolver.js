"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialStatusResolverRegistry = void 0;
/**
 * CredentialStatusResolverRegistry is a registry of CredentialStatusResolver
 *
 * @public
 * @interface CredentialStatusResolverRegistry
 */
class CredentialStatusResolverRegistry {
    constructor() {
        this.resolvers = new Map();
    }
    /**
     * register is a method to add a credential status resolver for specific credential status type
     *
     * @public
     * @param {CredentialStatusType} type -  one of the credential status types
     * @param {CredentialStatusResolver} resolver -  resolver
     */
    register(type, resolver) {
        this.resolvers.set(type, resolver);
    }
    /**
     * resolve is a method to resolve a credential status from the the specific source.
     *
     * @public
     * @param {CredentialStatus} credentialStatus -  credential status to resolve
     * @param {CredentialStatusResolveOptions} credentialStatusResolveOptions -  options for resolver
     * @returns `{Promise<RevocationStatus>}`
     */
    get(type) {
        return this.resolvers.get(type);
    }
}
exports.CredentialStatusResolverRegistry = CredentialStatusResolverRegistry;
//# sourceMappingURL=resolver.js.map