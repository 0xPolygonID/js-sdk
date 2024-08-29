import { CredentialStatus, RevocationStatus, Issuer } from '../../verifiable';
import { CredentialStatusResolver } from './resolver';
import { Proof, ProofJSON } from '@iden3/js-merkletree';

/**
 * IssuerResolver is a class that allows to interact with the issuer's http endpoint to get revocation status.
 *
 * @public
 * @class IssuerResolver
 */

export class IssuerResolver implements CredentialStatusResolver {
  /**
   * resolve is a method to resolve a credential status directly from the issuer.
   *
   * @public
   * @param {CredentialStatus} credentialStatus -  credential status to resolve
   * @param {CredentialStatusResolveOptions} credentialStatusResolveOptions -  options for resolver
   * @returns `{Promise<RevocationStatus>}`
   */
  async resolve(credentialStatus: CredentialStatus): Promise<RevocationStatus> {
    const revStatusResp = await fetch(credentialStatus.id);
    const revStatus = await revStatusResp.json();
    return toRevocationStatus(revStatus);
  }
}

/**
 * RevocationStatusResponse is a response of fetching credential status with type SparseMerkleTreeProof
 *
 * @export
 * @interface RevocationStatusResponse
 */
export interface RevocationStatusResponse {
  issuer: Issuer;
  mtp: ProofJSON;
}

/**
 * toRevocationStatus is a result of fetching credential status with type SparseMerkleTreeProof converts to RevocationStatus
 *
 * @param {RevocationStatusResponse} { issuer, mtp }
 * @returns {RevocationStatus} RevocationStatus
 */
export const toRevocationStatus = ({ issuer, mtp }: RevocationStatusResponse): RevocationStatus => {
  return {
    mtp: Proof.fromJSON(mtp),
    issuer
  };
};
