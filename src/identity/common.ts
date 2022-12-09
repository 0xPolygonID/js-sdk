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

  // e.data[0] = ElemBytesCoreToMT(index[0])
  // e.data[1] = ElemBytesCoreToMT(index[1])
  // e.data[2] = ElemBytesCoreToMT(index[2])
  // e.data[3] = ElemBytesCoreToMT(index[3])
  //
  // e.data[4] = ElemBytesCoreToMT(value[0])
  // e.data[5] = ElemBytesCoreToMT(value[1])
  // e.data[6] = ElemBytesCoreToMT(value[2])
  // e.data[7] = ElemBytesCoreToMT(value[3])
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
