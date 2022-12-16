import { Hex } from '@iden3/js-crypto';
import { BytesHelper, checkBigIntInField, SchemaHash } from '@iden3/js-iden3-core';
import { keccak256 } from '@lumeweb/js-sha3-browser';

const errSlotsOverflowMsg = 'slots overflow';
// SwapEndianness swaps the endianness of the value encoded in buf. If buf is
// Big-Endian, the result will be Little-Endian and vice-versa.
export const swapEndianness = (buf: Uint8Array): Uint8Array => buf.reverse();

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
  return BytesHelper.intToBytes(bigIntField);
}

// DataFillsSlot  checks if newData fills into slot capacity ()
export function dataFillsSlot(slot: Uint8Array, newData: Uint8Array): boolean {
  return checkBigIntInField(BytesHelper.bytesToInt(Uint8Array.from([...slot, ...newData])));
}

// CheckDataInField  checks if data is in Q field
export function checkDataInField(data: Uint8Array): boolean {
  return checkBigIntInField(BytesHelper.bytesToInt(data));
}

// CreateSchemaHash computes schema hash from schemaID
export const createSchemaHash = (schemaId: Uint8Array): SchemaHash => {
  const sHash = Hex.decodeString(keccak256(schemaId));

  return new SchemaHash(sHash.slice(sHash.length - 16, sHash.length));
};

export const fillSlot = (data, fieldName: string): Uint8Array => {
  let slot = Uint8Array.from([]);

  if (!fieldName) {
    return new Uint8Array(32);
  }
  const field = data[fieldName];
  if (!field) {
    throw new Error(`${fieldName} field is not in data`);
  }
  const byteValue = fieldToByteArray(field);
  if (dataFillsSlot(slot, byteValue)) {
    slot = Uint8Array.from([...slot, ...byteValue]);
  } else {
    throw new Error(errSlotsOverflowMsg);
  }
  return slot;
};
