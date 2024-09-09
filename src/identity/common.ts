import { DID, Id, IdPosition, MerklizedRootPosition } from '@iden3/js-iden3-core';
import { SchemaMetadata } from '../schema-processor';
import { SubjectPosition } from '../verifiable';

/**
 * Determines subject position
 *
 * @param {IdPosition} idPosition - index / none / value
 * @returns {SubjectPosition}
 */
export const subjectPositionIndex = (idPosition: IdPosition): SubjectPosition => {
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
export const defineMerklizedRootPosition = (
  metadata?: SchemaMetadata,
  position?: MerklizedRootPosition
): MerklizedRootPosition => {
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
 * @param {number | string} [profileNonce] - profile nonce
 * @returns {DID}
 */
export const generateProfileDID = (did: DID, profileNonce?: number | string): DID => {
  const id = DID.idFromDID(did);

  profileNonce = profileNonce ?? 0;

  if (!isBigInt(profileNonce)) {
    throw new Error('profile must be number or decimal string');
  }
  const profile = Id.profileId(id, BigInt(profileNonce));
  return DID.parseFromId(profile);
};

const isBigInt = (x: number | string): boolean => {
  try {
    return BigInt(x).toString() === x.toString();
  } catch  {
    return false; // conversion to BigInt failed, surely it is not a BigInt
  }
};
