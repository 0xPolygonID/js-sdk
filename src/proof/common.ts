import { buildTreeState, ClaimNonRevStatus } from '../circuits';
import { RevocationStatus } from '../verifiable';

export const toClaimNonRevStatus = (s: RevocationStatus): ClaimNonRevStatus => {
  return {
    proof: s.mtp,
    treeState: buildTreeState(
      s.issuer.state,
      s.issuer.claimsTreeRoot,
      s.issuer.revocationTreeRoot,
      s.issuer.rootOfRoots
    )
  };
};
