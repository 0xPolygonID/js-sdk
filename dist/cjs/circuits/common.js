"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProperties = exports.existenceToInt = exports.getNodeAuxValue = exports.bigIntArrayToStringArray = exports.prepareCircuitArrayValues = exports.prepareSiblingsStr = exports.buildTreeState = exports.strMTHex = exports.BaseConfig = exports.ErrorEmptyIssuerAuthClaimNonRevProof = exports.ErrorEmptyIssuerAuthClaimProof = exports.ErrorUserStateInRelayClaimProof = exports.ErrorEmptyClaimNonRevProof = exports.ErrorEmptyClaimProof = exports.ErrorEmptyClaimSignature = exports.ErrorEmptyChallengeSignature = exports.ErrorEmptyAuthClaimNonRevProof = exports.ErrorEmptyAuthClaimProof = exports.defaultMTLevelsClaimsMerklization = exports.defaultMTLevelsOnChain = exports.defaultValueArraySize = exports.defaultMTLevels = void 0;
const js_crypto_1 = require("@iden3/js-crypto");
const js_merkletree_1 = require("@iden3/js-merkletree");
exports.defaultMTLevels = 40; // max MT levels, default value for identity circuits
exports.defaultValueArraySize = 64; // max value array size, default value for identity circuits
exports.defaultMTLevelsOnChain = 64; // max MT levels on chain, default value for identity circuits
exports.defaultMTLevelsClaimsMerklization = 32; // max MT levels of JSON-LD merklization on claim
exports.ErrorEmptyAuthClaimProof = 'empty auth claim mtp proof';
exports.ErrorEmptyAuthClaimNonRevProof = 'empty auth claim non-revocation mtp proof';
exports.ErrorEmptyChallengeSignature = 'empty challenge signature';
exports.ErrorEmptyClaimSignature = 'empty claim signature';
exports.ErrorEmptyClaimProof = 'empty claim mtp proof';
exports.ErrorEmptyClaimNonRevProof = 'empty claim non-revocation mtp proof';
exports.ErrorUserStateInRelayClaimProof = 'empty user state in relay claim non-revocation mtp proof';
exports.ErrorEmptyIssuerAuthClaimProof = 'empty issuer auth claim mtp proof';
exports.ErrorEmptyIssuerAuthClaimNonRevProof = 'empty issuer auth claim non-revocation mtp proof';
/**
 * base config for circuit inputs
 *
 * @public
 * @class BaseConfig
 */
class BaseConfig {
    /**
     *  getMTLevel max circuit MT levels
     *
     * @returns number
     */
    getMTLevel() {
        return this.mtLevel ? this.mtLevel : exports.defaultMTLevels;
    }
    /**
     *  getMTLevel max circuit MT levels
     *
     * @returns number
     */
    getMTLevelsClaimMerklization() {
        return this.mtLevelClaimsMerklization
            ? this.mtLevelClaimsMerklization
            : exports.defaultMTLevelsClaimsMerklization;
    }
    /**
     * GetValueArrSize return size of circuits value array size
     *
     * @returns number
     */
    getValueArrSize() {
        return this.valueArraySize ? this.valueArraySize : exports.defaultValueArraySize;
    }
    /**
     * getMTLevelOnChain return level on chain for given circuit
     *
     * @returns number
     */
    getMTLevelOnChain() {
        return this.mtLevelOnChain ? this.mtLevelOnChain : exports.defaultMTLevelsOnChain;
    }
}
exports.BaseConfig = BaseConfig;
/**
 * converts hex to Hash
 *
 * @param {(string | undefined)} s - string hex
 * @returns Hash
 */
const strMTHex = (s) => {
    if (!s) {
        return js_merkletree_1.ZERO_HASH;
    }
    const h = new js_merkletree_1.Hash();
    h.value = (0, js_merkletree_1.swapEndianness)(js_crypto_1.Hex.decodeString(s));
    return h;
};
exports.strMTHex = strMTHex;
/**
 * converts hexes of tree roots to Hashes
 *
 * @param {(string | undefined)} state - state of tree hex
 * @param {(string | undefined)} claimsTreeRoot - claims tree root hex
 * @param {(string | undefined)} revocationTreeRoot - revocation tree root hex
 * @param {(string | undefined)} rootOfRoots - root of roots tree root hex
 * @returns TreeState
 */
const buildTreeState = (state, claimsTreeRoot, revocationTreeRoot, rootOfRoots) => ({
    state: (0, exports.strMTHex)(state),
    claimsRoot: (0, exports.strMTHex)(claimsTreeRoot),
    revocationRoot: (0, exports.strMTHex)(revocationTreeRoot),
    rootOfRoots: (0, exports.strMTHex)(rootOfRoots)
});
exports.buildTreeState = buildTreeState;
/**
 * siblings as string array
 *
 * @param {Proof} proof - proof with siblings
 * @param {number} levels - levels number
 * @returns string[]
 */
const prepareSiblingsStr = (proof, levels) => {
    const siblings = proof.allSiblings ? proof.allSiblings() : proof.siblings;
    // Add the rest of empty levels to the siblings
    for (let i = siblings.length; i < levels; i++) {
        siblings.push(js_merkletree_1.ZERO_HASH);
    }
    return siblings.map((s) => (typeof s === 'string' ? s : s.bigInt().toString()));
};
exports.prepareSiblingsStr = prepareSiblingsStr;
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
const prepareCircuitArrayValues = (arr, size) => {
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
exports.prepareCircuitArrayValues = prepareCircuitArrayValues;
/**
 * converts each big integer in array to string
 *
 * @param {bigint[]} arr -  array of big numbers
 * @returns string[]
 */
const bigIntArrayToStringArray = (arr) => {
    return arr.map((a) => a.toString());
};
exports.bigIntArrayToStringArray = bigIntArrayToStringArray;
const getNodeAuxValue = (p) => {
    // proof of inclusion
    if (p?.existence) {
        return {
            key: js_merkletree_1.ZERO_HASH,
            value: js_merkletree_1.ZERO_HASH,
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
        key: js_merkletree_1.ZERO_HASH,
        value: js_merkletree_1.ZERO_HASH,
        noAux: '1'
    };
};
exports.getNodeAuxValue = getNodeAuxValue;
/**
 * converts boolean existence param to integer
 * if true - 1, else - 0
 *
 * @param {boolean} b - existence
 * @returns number
 */
const existenceToInt = (b) => (b ? 0 : 1);
exports.existenceToInt = existenceToInt;
/**
 * return object properties
 *
 * @param {object} obj
 * @returns object
 */
function getProperties(obj) {
    const result = {};
    for (const property in obj) {
        // eslint-disable-next-line no-prototype-builtins
        if (obj.hasOwnProperty(property) && !property.startsWith('_')) {
            result[property] = obj[property];
        }
    }
    return result;
}
exports.getProperties = getProperties;
//# sourceMappingURL=common.js.map