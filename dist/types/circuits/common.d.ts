import { Hash, Proof } from '@iden3/js-merkletree';
import { TreeState } from './models';
export declare const defaultMTLevels = 40;
export declare const defaultValueArraySize = 64;
export declare const defaultMTLevelsOnChain = 64;
export declare const defaultMTLevelsClaimsMerklization = 32;
export declare const ErrorEmptyAuthClaimProof = "empty auth claim mtp proof";
export declare const ErrorEmptyAuthClaimNonRevProof = "empty auth claim non-revocation mtp proof";
export declare const ErrorEmptyChallengeSignature = "empty challenge signature";
export declare const ErrorEmptyClaimSignature = "empty claim signature";
export declare const ErrorEmptyClaimProof = "empty claim mtp proof";
export declare const ErrorEmptyClaimNonRevProof = "empty claim non-revocation mtp proof";
export declare const ErrorUserStateInRelayClaimProof = "empty user state in relay claim non-revocation mtp proof";
export declare const ErrorEmptyIssuerAuthClaimProof = "empty issuer auth claim mtp proof";
export declare const ErrorEmptyIssuerAuthClaimNonRevProof = "empty issuer auth claim non-revocation mtp proof";
/**
 * base config for circuit inputs
 *
 * @public
 * @class BaseConfig
 */
export declare class BaseConfig {
    mtLevel: number;
    valueArraySize: number;
    mtLevelOnChain: number;
    mtLevelClaimsMerklization: number;
    /**
     *  getMTLevel max circuit MT levels
     *
     * @returns number
     */
    getMTLevel(): number;
    /**
     *  getMTLevel max circuit MT levels
     *
     * @returns number
     */
    getMTLevelsClaimMerklization(): number;
    /**
     * GetValueArrSize return size of circuits value array size
     *
     * @returns number
     */
    getValueArrSize(): number;
    /**
     * getMTLevelOnChain return level on chain for given circuit
     *
     * @returns number
     */
    getMTLevelOnChain(): number;
}
/**
 * converts hex to Hash
 *
 * @param {(string | undefined)} s - string hex
 * @returns Hash
 */
export declare const strMTHex: (s: string | undefined) => Hash;
/**
 * converts hexes of tree roots to Hashes
 *
 * @param {(string | undefined)} state - state of tree hex
 * @param {(string | undefined)} claimsTreeRoot - claims tree root hex
 * @param {(string | undefined)} revocationTreeRoot - revocation tree root hex
 * @param {(string | undefined)} rootOfRoots - root of roots tree root hex
 * @returns TreeState
 */
export declare const buildTreeState: (state: string | undefined, claimsTreeRoot: string | undefined, revocationTreeRoot: string | undefined, rootOfRoots: string | undefined) => TreeState;
/**
 * siblings as string array
 *
 * @param {Proof} proof - proof with siblings
 * @param {number} levels - levels number
 * @returns string[]
 */
export declare const prepareSiblingsStr: (proof: Proof, levels: number) => string[];
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
export declare const prepareCircuitArrayValues: (arr: bigint[], size: number) => bigint[];
/**
 * converts each big integer in array to string
 *
 * @param {bigint[]} arr -  array of big numbers
 * @returns string[]
 */
export declare const bigIntArrayToStringArray: (arr: bigint[]) => string[];
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
export declare const getNodeAuxValue: (p: Proof | undefined) => NodeAuxValue;
/**
 * converts boolean existence param to integer
 * if true - 1, else - 0
 *
 * @param {boolean} b - existence
 * @returns number
 */
export declare const existenceToInt: (b: boolean) => number;
/**
 * return object properties
 *
 * @param {object} obj
 * @returns object
 */
export declare function getProperties(obj: object): object;
