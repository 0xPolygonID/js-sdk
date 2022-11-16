import { Id } from '@iden3/js-iden3-core';
import { Claim } from '../claim';
import { CredentialStatus, RevocationStatus } from '../schema-processor';
export interface ICredentialWallet {
  getAuthClaim(id: Id): Claim;
  getStatus(credStatus: CredentialStatus): RevocationStatus;
  findCredentialWithLatestVersion(id: Id, hash: string): Claim;
  checkRevocationStatus(claim: Claim): RevocationStatus;
}
