import { SchemaHash } from '@iden3/js-iden3-core';
/**
 * SwapEndianness swaps the endianness of the value encoded in buf. If buf is
 * Big-Endian, the result will be Little-Endian and vice-versa.
 *
 * @param {Uint8Array} buf - bytes to swap
 * @returns Uint8Array - swapped bytes
 */
export declare const swapEndianness: (buf: Uint8Array) => Uint8Array;
/**
 * FieldToByteArray convert fields to byte representation based on type
 *
 * @param {unknown} field - field to convert
 * @returns Uint8Array
 */
export declare function fieldToByteArray(field: unknown): Uint8Array;
/**
 * checks if data fills into slot capacity ()
 *
 * @param {Uint8Array} slot - current slot data
 * @param {Uint8Array} newData - new slot data
 * @returns boolean
 */
export declare function dataFillsSlot(slot: Uint8Array, newData: Uint8Array): boolean;
/**
 * check if byte data is in Q field
 *
 * @param {Uint8Array} data - bytes payload
 * @returns boolean
 */
export declare function checkDataInField(data: Uint8Array): boolean;
/**
 * Calculates schema hash
 *
 * @param {Uint8Array} schemaId
 * @returns {*}  {SchemaHash}
 */
export declare const createSchemaHash: (schemaId: Uint8Array) => SchemaHash;
/**
 * checks if data can fill the slot
 *
 * @param {*} data - object that contains field
 * @param {string} fieldName - field name
 * @returns Uint8Array - filled slot
 */
export declare const fillSlot: (data: {
    [key: string]: unknown;
}, fieldName: string) => Uint8Array;
