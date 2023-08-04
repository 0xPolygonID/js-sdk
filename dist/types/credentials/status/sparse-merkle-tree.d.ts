import { CredentialStatus, RevocationStatus, Issuer } from '../../verifiable';
import { CredentialStatusResolver } from './resolver';
/**
 * IssuerResolver is a class that allows to interact with the issuer's http endpoint to get revocation status.
 *
 * @public
 * @class IssuerResolver
 */
export declare class IssuerResolver implements CredentialStatusResolver {
    /**
     * resolve is a method to resolve a credential status directly from the issuer.
     *
     * @public
     * @param {CredentialStatus} credentialStatus -  credential status to resolve
     * @param {CredentialStatusResolveOptions} credentialStatusResolveOptions -  options for resolver
     * @returns `{Promise<RevocationStatus>}`
     */
    resolve(credentialStatus: CredentialStatus): Promise<RevocationStatus>;
}
/**
 * RevocationStatusResponse is a response of fetching credential status with type SparseMerkleTreeProof
 *
 * @export
 * @interface RevocationStatusResponse
 */
export interface RevocationStatusResponse {
    issuer: Issuer;
    mtp: {
        existence: boolean;
        siblings: string[];
        node_aux: {
            key: string;
            value: string;
        };
    };
}
/**
 * toRevocationStatus is a result of fetching credential status with type SparseMerkleTreeProof converts to RevocationStatus
 *
 * @param {RevocationStatusResponse} { issuer, mtp }
 * @returns {RevocationStatus} RevocationStatus
 */
export declare const toRevocationStatus: ({ issuer, mtp }: RevocationStatusResponse) => RevocationStatus;
