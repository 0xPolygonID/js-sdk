import { Hex } from '@iden3/js-crypto';
import { BytesHelper, checkBigIntInField, SchemaHash } from '@iden3/js-iden3-core';
import { keccak256 } from '@lumeweb/js-sha3-browser';
const errSlotsOverflowMsg = 'slots overflow';
/**
 * SwapEndianness swaps the endianness of the value encoded in buf. If buf is
 * Big-Endian, the result will be Little-Endian and vice-versa.
 *
 * @param {Uint8Array} buf - bytes to swap
 * @returns Uint8Array - swapped bytes
 */
export const swapEndianness = (buf) => buf.reverse();
/**
 * FieldToByteArray convert fields to byte representation based on type
 *
 * @param {unknown} field - field to convert
 * @returns Uint8Array
 */
export function fieldToByteArray(field) {
    let bigIntField;
    if (typeof field === 'string') {
        bigIntField = BigInt(field);
    }
    else if (typeof field === 'number') {
        bigIntField = BigInt(Math.trunc(field));
    }
    else {
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
export function dataFillsSlot(slot, newData) {
    return checkBigIntInField(BytesHelper.bytesToInt(Uint8Array.from([...slot, ...newData])));
}
/**
 * check if byte data is in Q field
 *
 * @param {Uint8Array} data - bytes payload
 * @returns boolean
 */
export function checkDataInField(data) {
    return checkBigIntInField(BytesHelper.bytesToInt(data));
}
/**
 * Calculates schema hash
 *
 * @param {Uint8Array} schemaId
 * @returns {*}  {SchemaHash}
 */
export const createSchemaHash = (schemaId) => {
    const sHash = Hex.decodeString(keccak256(schemaId));
    return new SchemaHash(sHash.slice(sHash.length - 16, sHash.length));
};
/**
 * checks if data can fill the slot
 *
 * @param {*} data - object that contains field
 * @param {string} fieldName - field name
 * @returns Uint8Array - filled slot
 */
export const fillSlot = (data, fieldName) => {
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
    }
    else {
        throw new Error(errSlotsOverflowMsg);
    }
    return slot;
};
//# sourceMappingURL=utils.js.map