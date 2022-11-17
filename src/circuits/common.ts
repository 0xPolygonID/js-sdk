import { newHashFromHex, Hash, ZERO_HASH } from '@iden3/js-merkletree';
import { TreeState } from './models';

export const defaultMTLevels = 32; // max MT levels, default value for identity circuits
export const defaultValueArraySize = 64; // max value array size, default value for identity circuits

export const ErrorEmptyAuthClaimProof = 'empty auth claim mtp proof';
export const ErrorEmptyAuthClaimNonRevProof = 'empty auth claim non-revocation mtp proof';
export const ErrorEmptyChallengeSignature = 'empty challenge signature';
export const ErrorEmptyClaimSignature = 'empty claim signature';
export const ErrorEmptyClaimProof = 'empty claim mtp proof';
export const ErrorEmptyClaimNonRevProof = 'empty claim non-revocation mtp proof';
export const ErrorUserStateInRelayClaimProof =
  'empty user state in relay claim non-revocation mtp proof';
export const ErrorEmptyIssuerAuthClaimProof = 'empty issuer auth claim mtp proof';
export const ErrorEmptyIssuerAuthClaimNonRevProof =
  'empty issuer auth claim non-revocation mtp proof';

// BaseConfig base circuit's config, provides default configuration for default circuits
export class BaseConfig {
  mtLevel: number; // Max levels of MT
  valueArraySize: number; // Size if( value array in identity circuit)s

  // getMTLevel max circuit MT levels
  getMTLevel(): number {
    return this.mtLevel ? this.mtLevel : defaultMTLevels;
  }

  // GetValueArrSize return size of circuits value array size
  getValueArrSize(): number {
    return this.valueArraySize ? this.valueArraySize : defaultValueArraySize;
  }
}

// StrMTHex string to merkle tree hash
export const strMTHex = (s: string | undefined): Hash => (!s ? ZERO_HASH : newHashFromHex(s));

export const StateInRelayCredentialHash = 'e22dd9c0f7aef15788c130d4d86c7156';

// BuildtreeState returns circuits.treeState structure
export const buildTreeState = (
  state: string | undefined,
  claimsTreeRoot: string | undefined,
  revocationTreeRoot: string | undefined,
  rootOfRoots: string | undefined
): TreeState => ({
  state: strMTHex(state),
  claimsRoot: strMTHex(claimsTreeRoot),
  revocationRoot: strMTHex(revocationTreeRoot),
  rootOfRoots: strMTHex(rootOfRoots)
});

export const prepareSiblingsStr = (siblings: Hash[], levels: number): string[] => {
  // Add the rest of empty levels to the siblings
  for (let i = siblings.length; i < levels; i++) {
    siblings.push(ZERO_HASH);
  }
  return siblings.map((s) => s.BigInt().toString());
};

// PrepareCircuitArrayValues padding values to size. Validate array size and throw an exception if array is bigger
// than size
// if array is bigger circuit cannot compile because number of inputs does not match
export const prepareCircuitArrayValues = (arr: bigint[], size: number): bigint[] => {
  if (arr.length > size) {
    throw new Error(`array size ${arr.length} is bigger max expected size ${size}`);
  }

  // Add the empty values
  for (let i = arr.length; i < size; i++) {
    arr.push(BigInt(0));
  }

  return arr;
};

export const bigIntArrayToStringArray = (arr: bigint[]): string[] => {
  return arr.map((a) => a.toString());
};

// PrepareSiblings prepare siblings for zk zk
export const prepareSiblings = (siblings: Hash[], levels: number): bigint[] => {
  // siblings := mtproof.AllSiblings()
  // Add the rest of empty levels to the siblings
  for (let i = siblings.length; i < levels; i++) {
    siblings.push(ZERO_HASH);
  }

  return siblings.map((s) => s.BigInt());
};
