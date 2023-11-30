import { Hex } from '@iden3/js-crypto';
import { BytesHelper, checkBigIntInField, SchemaHash } from '@iden3/js-iden3-core';
import { Merklizer } from '@iden3/js-jsonld-merklization';
import { keccak256 } from 'js-sha3';

/**
 * SwapEndianness swaps the endianness of the value encoded in buf. If buf is
 * Big-Endian, the result will be Little-Endian and vice-versa.
 *
 * @param {Uint8Array} buf - bytes to swap
 * @returns Uint8Array - swapped bytes
 */
export const swapEndianness = (buf: Uint8Array): Uint8Array => buf.reverse();

/**
 * FieldToByteArray convert fields to byte representation based on type
 *
 * @param {unknown} field - field to convert
 * @returns Uint8Array
 */
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

/**
 * checks if data fills into slot capacity ()
 *
 * @param {Uint8Array} slot - current slot data
 * @param {Uint8Array} newData - new slot data
 * @returns boolean
 */
export function dataFillsSlot(slot: Uint8Array, newData: Uint8Array): boolean {
  return checkBigIntInField(BytesHelper.bytesToInt(Uint8Array.from([...slot, ...newData])));
}

/**
 * check if byte data is in Q field
 *
 * @param {Uint8Array} data - bytes payload
 * @returns boolean
 */
export function checkDataInField(data: Uint8Array): boolean {
  return checkBigIntInField(BytesHelper.bytesToInt(data));
}

/**
 * Calculates schema hash
 *
 * @param {Uint8Array} schemaId
 * @returns {*}  {SchemaHash}
 */
export const createSchemaHash = (schemaId: Uint8Array): SchemaHash => {
  const sHash = Hex.decodeString(keccak256(schemaId));

  return new SchemaHash(sHash.slice(sHash.length - 16, sHash.length));
};

export const credentialSubjectKey = 'credentialSubject';

/**
 * checks if data can fill the slot
 *
 * @param {*} data - object that contains field
 * @param {string} fieldName - field name
 * @returns Uint8Array - filled slot
 */
export const fillSlot = async (
  slotData: Uint8Array,
  mz: Merklizer,
  path: string
): Promise<void> => {
  if (!path) {
    return;
  }

  path = credentialSubjectKey + '.' + path;

  try {
    const p = await mz.resolveDocPath(path, mz.options);
    const entry = await mz.entry(p);
    const intVal = await entry.getValueMtEntry();

    const bytesVal = BytesHelper.intToBytes(intVal);
    slotData.set(bytesVal, 0);
  } catch (err: unknown) {
    if ((err as Error).toString().includes('entry not found')) {
      throw new Error(`field not found in credential ${path}`);
    }

    throw err;
  }
};
