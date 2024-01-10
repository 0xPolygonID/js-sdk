import { poseidon } from '@iden3/js-crypto';
import { Hash } from '@iden3/js-merkletree';
import { Issuer } from './credential';

export const validateTreeState = (treeState: Issuer) => {
  const ctrHash = treeState.claimsTreeRoot ? Hash.fromHex(treeState.claimsTreeRoot) : new Hash();
  const rtrHash = treeState.revocationTreeRoot
    ? Hash.fromHex(treeState.revocationTreeRoot)
    : new Hash();
  const rorHash = treeState.rootOfRoots ? Hash.fromHex(treeState.rootOfRoots) : new Hash();
  const wantState = poseidon.hash([ctrHash.bigInt(), rtrHash.bigInt(), rorHash.bigInt()]);

  const stateHash = treeState.state ? Hash.fromHex(treeState.state) : new Hash();
  return wantState === stateHash.bigInt();
};
