import { NodeAux, newHashFromBigInt, Hash, Proof, setBitBigEndian } from '@iden3/js-merkletree';
import { buildTreeState, ClaimNonRevStatus, GISTProof } from '../circuits';
import { StateProof } from '../storage/interfaces';
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

// NewProofFromData reconstructs proof from siblings and auxiliary node
export const newProofFromData = (
  existence: boolean,
  allSiblings: Hash[],
  nodeAux: NodeAux
): Proof => {
  const p = new Proof();
  p.existence = existence;
  p.nodeAux = nodeAux;
  p.depth = allSiblings.length;
  const siblings: Hash[] = [];
  for (let lvl = 0; lvl < allSiblings.length; lvl++) {
    const sibling = allSiblings[lvl];
    if (!sibling.bytes.every((b) => b === 0)) {
      setBitBigEndian(p.notEmpties, lvl);
      siblings.push(sibling);
    }
  }
  p.siblings = siblings;
  return p;
};

export const toGISTProof = (smtProof: StateProof): GISTProof => {
  let existence = false;
  let nodeAux: NodeAux;

  if (smtProof.existence) {
    existence = true;
  } else {
    if (smtProof.auxExistence) {
      nodeAux = {
        key: newHashFromBigInt(smtProof.auxIndex),
        value: newHashFromBigInt(smtProof.auxValue)
      };
    }
  }

  const allSiblings: Hash[] = smtProof.siblings.map((s) => newHashFromBigInt(s));

  const proof = newProofFromData(existence, allSiblings, nodeAux);

  const root = newHashFromBigInt(smtProof.root);

  return {
    root,
    proof
  };
};
