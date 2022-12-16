import { Claim, IdPosition } from '@iden3/js-iden3-core';
import { Data, ElemBytes, Entry } from '@iden3/js-merkletree';
import { MerklizedRootPosition, SchemaMetadata, SubjectPosition } from '../schema-processor';

export const treeEntryFromCoreClaim = (claim: Claim): Entry => {
  const { index, value } = claim.rawSlots();
  const el: ElemBytes[] = [...index, ...value].map((el) => {
    const elByte = new ElemBytes();
    elByte.value = el.bytes;
    return elByte;
  });
  const data = new Data();
  data.value = el;
  return new Entry(data);
};

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

export const defineMerklizedRootPosition = (
  metadata?: SchemaMetadata,
  position?: MerklizedRootPosition
): MerklizedRootPosition => {
  if (!metadata && !metadata.serialization) {
    return MerklizedRootPosition.None;
  }

  if (position != null && position !== MerklizedRootPosition.None) {
    return position;
  }

  return MerklizedRootPosition.Index;
};
