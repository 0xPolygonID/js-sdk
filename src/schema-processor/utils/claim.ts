import { BytesHelper, checkBigIntInField } from '@iden3/js-iden3-core';
import { ParsedSlots } from '../processor';

const errSlotsOverflowMsg = 'slots overflow';
// SwapEndianness swaps the endianness of the value encoded in buf. If buf is
// Big-Endian, the result will be Little-Endian and vice-versa.
export const swapEndianness = (buf: Uint8Array): Uint8Array => buf.reverse();
// FillClaimSlots fullfil index and value fields to iden3 slots
export function fillClaimSlots(
  content: Uint8Array,
  indexFields: string[],
  valueFields: string[]
): ParsedSlots {
  const data: Map<string, unknown> = JSON.parse(new TextDecoder().decode(content));
  let slotAFilled = false;
  const result: ParsedSlots = {
    indexA: new Uint8Array(32),
    indexB: new Uint8Array(32),
    valueA: new Uint8Array(32),
    valueB: new Uint8Array(32)
  };

  for (const field of indexFields) {
    // key is a property of data map to process
    const byteValue = fieldToByteArray(data.get(field));

    if (!slotAFilled) {
      if (dataFillsSlot(result.indexA, byteValue)) {
        result.indexA = Uint8Array.from([...result.indexA, ...byteValue]);
        continue;
      } else {
        slotAFilled = true;
      }
    }

    if (dataFillsSlot(result.indexB, byteValue)) {
      result.indexB = Uint8Array.from([...result.indexB, ...byteValue]);
    } else {
      throw new Error(errSlotsOverflowMsg);
    }
  }

  slotAFilled = false;
  for (const field of valueFields) {
    // key is a property of data map to process
    const byteValue = fieldToByteArray(data.get(field));
    if (!slotAFilled) {
      if (dataFillsSlot(result.valueA, byteValue)) {
        result.valueA = Uint8Array.from([...result.valueA, ...byteValue]);
        continue;
      } else {
        slotAFilled = true;
      }
    }

    if (dataFillsSlot(result.valueB, byteValue)) {
      result.valueB = Uint8Array.from([...result.valueA, ...byteValue]);
    } else {
      throw new Error(errSlotsOverflowMsg);
    }
  }

  return result;
}

// FieldToByteArray convert fields to byte representation based on type
export function fieldToByteArray(field: unknown): Uint8Array {
  let bigIntField: bigint;

  if (typeof field === 'string') {
    bigIntField = BigInt(field);
  } else if (typeof field === 'number') {
    bigIntField = BigInt(Math.trunc(field));
  } else {
    throw new Error('field type is not supported');
  }
  return swapEndianness(BytesHelper.intToBytes(bigIntField));
}

// DataFillsSlot  checks if newData fills into slot capacity ()
export function dataFillsSlot(slot: Uint8Array, newData: Uint8Array): boolean {
  // TODO: check if SwapEndianness this is correct
  // slot = append(slot, newData...)
  // a := new(big.Int).SetBytes(SwapEndianness(slot))
  return checkBigIntInField(BytesHelper.bytesToInt(Uint8Array.from([...slot, ...newData])));
}

// CheckDataInField  checks if data is in Q field
export function checkDataInField(data: Uint8Array): boolean {
  return checkBigIntInField(BytesHelper.bytesToInt(data));
}
