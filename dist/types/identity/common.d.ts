import { DID, IdPosition, MerklizedRootPosition } from '@iden3/js-iden3-core';
import { SchemaMetadata } from '../schema-processor';
import { SubjectPosition } from '../verifiable';
/**
 * Determines subject position
 *
 * @param {IdPosition} idPosition - index / none / value
 * @returns {SubjectPosition}
 */
export declare const subjectPositionIndex: (idPosition: IdPosition) => SubjectPosition;
/**
 * Returns merklized root position based on schema serialization metadata and expected position
 *
 * @param {SchemaMetadata} [metadata] - schema metadata
 * @param {MerklizedRootPosition} [position] - expected mt root position
 * @returns {MerklizedRootPosition}
 */
export declare const defineMerklizedRootPosition: (metadata?: SchemaMetadata, position?: MerklizedRootPosition) => MerklizedRootPosition;
/**
 * Returns profile DID based on did and profile nonce
 *
 * @param {DID} [did] - did from which profile will be derived
 * @param {number} [profileNonce] - profile nonce
 * @returns {DID}
 */
export declare const generateProfileDID: (did: DID, profileNonce?: number) => DID;
