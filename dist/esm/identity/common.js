import { DID, Id, IdPosition, MerklizedRootPosition } from '@iden3/js-iden3-core';
import { SubjectPosition } from '../verifiable';
/**
 * Determines subject position
 *
 * @param {IdPosition} idPosition - index / none / value
 * @returns {SubjectPosition}
 */
export const subjectPositionIndex = (idPosition) => {
    switch (idPosition) {
        case IdPosition.Index:
            return SubjectPosition.Index;
        case IdPosition.Value:
            return SubjectPosition.Value;
        default:
            return SubjectPosition.None;
    }
};
/**
 * Returns merklized root position based on schema serialization metadata and expected position
 *
 * @param {SchemaMetadata} [metadata] - schema metadata
 * @param {MerklizedRootPosition} [position] - expected mt root position
 * @returns {MerklizedRootPosition}
 */
export const defineMerklizedRootPosition = (metadata, position) => {
    if (!metadata?.serialization) {
        return MerklizedRootPosition.None;
    }
    if (position != null && position !== MerklizedRootPosition.None) {
        return position;
    }
    return MerklizedRootPosition.Index;
};
/**
 * Returns profile DID based on did and profile nonce
 *
 * @param {DID} [did] - did from which profile will be derived
 * @param {number} [profileNonce] - profile nonce
 * @returns {DID}
 */
export const generateProfileDID = (did, profileNonce) => {
    const id = DID.idFromDID(did);
    const profile = Id.profileId(id, BigInt(profileNonce ?? 0));
    return DID.parseFromId(profile);
};
//# sourceMappingURL=common.js.map