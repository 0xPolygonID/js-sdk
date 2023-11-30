import { Hex } from '@iden3/js-crypto';
import { Hash, ZERO_HASH, Proof, swapEndianness } from '@iden3/js-merkletree';
import { TreeState } from './models';

export const defaultMTLevels = 40; // max MT levels, default value for identity circuits
export const defaultValueArraySize = 64; // max value array size, default value for identity circuits
export const defaultMTLevelsOnChain = 64; // max MT levels on chain, default value for identity circuits
export const defaultMTLevelsClaim = 32; // max MT levels of JSON-LD merklization on claim

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

/**
 * base config for circuit inputs
 *
 * @public
 * @class BaseConfig
 */
export class BaseConfig {
  mtLevel!: number; // Max levels of MT
  valueArraySize!: number; // Size if( value array in identity circuit)s
  mtLevelOnChain!: number;
  mtLevelClaim!: number; // Max level of JSONLD claim

  /**
   *  getMTLevel max circuit MT levels
   *
   * @returns number
   */
  getMTLevel(): number {
    return this.mtLevel ? this.mtLevel : defaultMTLevels;
  }
  /**
   *  GetMTLevelsClaim max jsonld Claim levels
   *
   * @returns number
   */
  getMTLevelsClaim(): number {
    return this.mtLevelClaim ? this.mtLevelClaim : defaultMTLevelsClaim;
  }

  /**
   * GetValueArrSize return size of circuits value array size
   *
   * @returns number
   */
  getValueArrSize(): number {
    return this.valueArraySize ? this.valueArraySize : defaultValueArraySize;
  }

  /**
   * getMTLevelOnChain return level on chain for given circuit
   *
   * @returns number
   */
  getMTLevelOnChain(): number {
    return this.mtLevelOnChain ? this.mtLevelOnChain : defaultMTLevelsOnChain;
  }
}

/**
 * @deprecated The method should not be used and will be removed in the next major version,
 * please use Hash.fromHex instead
 * @param {(string | undefined)} s - string hex
 * @returns Hash
 */
export const strMTHex = (s: string | undefined): Hash => {
  if (!s) {
    return ZERO_HASH;
  }
  const h = new Hash();
  h.value = swapEndianness(Hex.decodeString(s));
  return h;
};

/**
 * converts hexes of tree roots to Hashes
 *
 * @param {(string | undefined)} state - state of tree hex
 * @param {(string | undefined)} claimsTreeRoot - claims tree root hex
 * @param {(string | undefined)} revocationTreeRoot - revocation tree root hex
 * @param {(string | undefined)} rootOfRoots - root of roots tree root hex
 * @returns TreeState
 */
export const buildTreeState = (
  state: string | undefined,
  claimsTreeRoot: string | undefined,
  revocationTreeRoot: string | undefined,
  rootOfRoots: string | undefined
): TreeState => ({
  state: Hash.fromHex(state),
  claimsRoot: Hash.fromHex(claimsTreeRoot),
  revocationRoot: Hash.fromHex(revocationTreeRoot),
  rootOfRoots: Hash.fromHex(rootOfRoots)
});

/**
 * siblings as string array
 *
 * @param {Proof} proof - proof with siblings
 * @param {number} levels - levels number
 * @returns string[]
 */
export const prepareSiblingsStr = (proof: Proof, levels: number): string[] => {
  const siblings = proof.allSiblings();

  // Add the rest of empty levels to the siblings
  for (let i = siblings.length; i < levels; i++) {
    siblings.push(ZERO_HASH);
  }
  return siblings.map((s: Hash) => s.bigInt().toString());
};

/**
 * PrepareCircuitArrayValues padding values to size.
 * Validate array size and throw an exception if array is bigger than size
 * if array is bigger, circuit cannot compile because number of inputs does not match
 *
 *
 * @param {bigint[]} arr - given values
 * @param {number} size - size to pad
 * @returns bigint[]
 */
export const prepareCircuitArrayValues = (arr: bigint[], size: number): bigint[] => {
  if (!arr) {
    arr = [];
  }
  if (arr.length > size) {
    throw new Error(`array size ${arr.length} is bigger max expected size ${size}`);
  }

  // Add the empty values
  for (let i = arr.length; i < size; i++) {
    arr.push(BigInt(0));
  }

  return arr;
};

/**
 * converts each big integer in array to string
 *
 * @param {bigint[]} arr -  array of big numbers
 * @returns string[]
 */
export const bigIntArrayToStringArray = (arr: bigint[]): string[] => {
  return arr.map((a) => a.toString());
};

/**
 * auxiliary node
 *
 * @public
 * @interface   NodeAuxValue
 */
export interface NodeAuxValue {
  key: Hash;
  value: Hash;
  noAux: string;
}

export /**
 * gets auxiliary node from proof
 *
 * @param {(Proof | undefined)} p - mtp
 * @returns NodeAuxValue
 */
const getNodeAuxValue = (p: Proof | undefined): NodeAuxValue => {
  // proof of inclusion
  if (p?.existence) {
    return {
      key: ZERO_HASH,
      value: ZERO_HASH,
      noAux: '0'
    };
  }

  // proof of non-inclusion (NodeAux exists)
  if (p?.nodeAux?.value !== undefined && p?.nodeAux?.key !== undefined) {
    return {
      key: p.nodeAux.key,
      value: p.nodeAux.value,
      noAux: '0'
    };
  }
  // proof of non-inclusion (NodeAux does not exist)
  return {
    key: ZERO_HASH,
    value: ZERO_HASH,
    noAux: '1'
  };
};

/**
 * converts boolean existence param to integer
 * if true - 1, else - 0
 *
 * @param {boolean} b - existence
 * @returns number
 */
export const existenceToInt = (b: boolean): number => (b ? 0 : 1);

/**
 * return object properties
 *
 * @param {object} obj
 * @returns object
 */
export function getProperties(obj: object): object {
  const result: { [key: string]: unknown } = {};

  for (const property in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(property) && !property.startsWith('_')) {
      result[property] = obj[property as keyof typeof obj];
    }
  }
  return result;
}
