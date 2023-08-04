import { Hex } from '@iden3/js-crypto';
import { Hash, ZERO_HASH, swapEndianness } from '@iden3/js-merkletree';
export const defaultMTLevels = 40; // max MT levels, default value for identity circuits
export const defaultValueArraySize = 64; // max value array size, default value for identity circuits
export const defaultMTLevelsOnChain = 64; // max MT levels on chain, default value for identity circuits
export const defaultMTLevelsClaimsMerklization = 32; // max MT levels of JSON-LD merklization on claim
export const ErrorEmptyAuthClaimProof = 'empty auth claim mtp proof';
export const ErrorEmptyAuthClaimNonRevProof = 'empty auth claim non-revocation mtp proof';
export const ErrorEmptyChallengeSignature = 'empty challenge signature';
export const ErrorEmptyClaimSignature = 'empty claim signature';
export const ErrorEmptyClaimProof = 'empty claim mtp proof';
export const ErrorEmptyClaimNonRevProof = 'empty claim non-revocation mtp proof';
export const ErrorUserStateInRelayClaimProof = 'empty user state in relay claim non-revocation mtp proof';
export const ErrorEmptyIssuerAuthClaimProof = 'empty issuer auth claim mtp proof';
export const ErrorEmptyIssuerAuthClaimNonRevProof = 'empty issuer auth claim non-revocation mtp proof';
/**
 * base config for circuit inputs
 *
 * @public
 * @class BaseConfig
 */
export class BaseConfig {
    /**
     *  getMTLevel max circuit MT levels
     *
     * @returns number
     */
    getMTLevel() {
        return this.mtLevel ? this.mtLevel : defaultMTLevels;
    }
    /**
     *  getMTLevel max circuit MT levels
     *
     * @returns number
     */
    getMTLevelsClaimMerklization() {
        return this.mtLevelClaimsMerklization
            ? this.mtLevelClaimsMerklization
            : defaultMTLevelsClaimsMerklization;
    }
    /**
     * GetValueArrSize return size of circuits value array size
     *
     * @returns number
     */
    getValueArrSize() {
        return this.valueArraySize ? this.valueArraySize : defaultValueArraySize;
    }
    /**
     * getMTLevelOnChain return level on chain for given circuit
     *
     * @returns number
     */
    getMTLevelOnChain() {
        return this.mtLevelOnChain ? this.mtLevelOnChain : defaultMTLevelsOnChain;
    }
}
/**
 * converts hex to Hash
 *
 * @param {(string | undefined)} s - string hex
 * @returns Hash
 */
export const strMTHex = (s) => {
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
export const buildTreeState = (state, claimsTreeRoot, revocationTreeRoot, rootOfRoots) => ({
    state: strMTHex(state),
    claimsRoot: strMTHex(claimsTreeRoot),
    revocationRoot: strMTHex(revocationTreeRoot),
    rootOfRoots: strMTHex(rootOfRoots)
});
/**
 * siblings as string array
 *
 * @param {Proof} proof - proof with siblings
 * @param {number} levels - levels number
 * @returns string[]
 */
export const prepareSiblingsStr = (proof, levels) => {
    const siblings = proof.allSiblings ? proof.allSiblings() : proof.siblings;
    // Add the rest of empty levels to the siblings
    for (let i = siblings.length; i < levels; i++) {
        siblings.push(ZERO_HASH);
    }
    return siblings.map((s) => (typeof s === 'string' ? s : s.bigInt().toString()));
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
export const prepareCircuitArrayValues = (arr, size) => {
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
export const bigIntArrayToStringArray = (arr) => {
    return arr.map((a) => a.toString());
};
export /**
 * gets auxiliary node from proof
 *
 * @param {(Proof | undefined)} p - mtp
 * @returns NodeAuxValue
 */ const getNodeAuxValue = (p) => {
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
export const existenceToInt = (b) => (b ? 0 : 1);
/**
 * return object properties
 *
 * @param {object} obj
 * @returns object
 */
export function getProperties(obj) {
    const result = {};
    for (const property in obj) {
        // eslint-disable-next-line no-prototype-builtins
        if (obj.hasOwnProperty(property) && !property.startsWith('_')) {
            result[property] = obj[property];
        }
    }
    return result;
}
//# sourceMappingURL=common.js.map