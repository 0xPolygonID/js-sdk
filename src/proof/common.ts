import { buildTreeState, ClaimNonRevStatus } from '../circuit';
import { RevocationStatus } from '../schema-processor';

export const toClaimNonRevStatus = (s: RevocationStatus): ClaimNonRevStatus => {
  return {
    proof: s.mtp,
    treeState: buildTreeState(
      s.issuer.state,
      s.issuer.claims_tree_root,
      s.issuer.revocation_tree_root,
      s.issuer.root_of_roots
    )
  };
};
