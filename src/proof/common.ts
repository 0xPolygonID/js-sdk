import { NodeAux, newHashFromBigInt, Hash, Proof, setBitBigEndian } from '@iden3/js-merkletree';
import { buildTreeState, ClaimNonRevStatus, GISTProof } from '../circuits';
import { StateProof } from '../storage/entities/state';
import { RevocationStatus } from '../verifiable';

/**
 * converts verifiable RevocationStatus model to circuits structure
 *
 * @param {RevocationStatus} - credential.status of the verifiable credential
 * @returns {ClaimNonRevStatus}
 */
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

const newProofFromData = (existence: boolean, allSiblings: Hash[], nodeAux: NodeAux): Proof => {
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

/**
 * converts state info from smart contract to gist proof
 *
 * @param {StateProof} smtProof  - state proof from smart contract
 * @returns {GISTProof}
 */
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
