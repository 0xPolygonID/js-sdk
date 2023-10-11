import { DID } from '@iden3/js-iden3-core';
/**
 * Checks if state is genesis state
 *
 * @param {string} did - did
 * @param {bigint|string} state  - hash on bigInt or hex string format
 * @returns boolean
 */
export declare function isGenesisState(did: DID, state: bigint | string): boolean;
