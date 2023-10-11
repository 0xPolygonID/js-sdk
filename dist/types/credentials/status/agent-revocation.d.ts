import { CredentialStatus, RevocationStatus } from '../../verifiable';
import { CredentialStatusResolver, CredentialStatusResolveOptions } from './resolver';
/**
 * AgentResolver is a class that allows to interact with the issuer's agent to get revocation status.
 *
 * @public
 * @class AgentResolver
 */
export declare class AgentResolver implements CredentialStatusResolver {
    /**
     * resolve is a method to resolve a credential status from an agent.
     *
     * @public
     * @param {CredentialStatus} credentialStatus -  credential status to resolve
     * @param {CredentialStatusResolveOptions} credentialStatusResolveOptions -  options for resolver
     * @returns `{Promise<RevocationStatus>}`
     */
    resolve(credentialStatus: CredentialStatus, credentialStatusResolveOptions?: CredentialStatusResolveOptions): Promise<RevocationStatus>;
}
