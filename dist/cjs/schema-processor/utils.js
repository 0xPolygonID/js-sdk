"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillSlot = exports.credentialSubjectKey = exports.createSchemaHash = exports.checkDataInField = exports.dataFillsSlot = exports.fieldToByteArray = exports.swapEndianness = void 0;
const js_crypto_1 = require("@iden3/js-crypto");
const js_iden3_core_1 = require("@iden3/js-iden3-core");
const js_sha3_browser_1 = require("@lumeweb/js-sha3-browser");
/**
 * SwapEndianness swaps the endianness of the value encoded in buf. If buf is
 * Big-Endian, the result will be Little-Endian and vice-versa.
 *
 * @param {Uint8Array} buf - bytes to swap
 * @returns Uint8Array - swapped bytes
 */
const swapEndianness = (buf) => buf.reverse();
exports.swapEndianness = swapEndianness;
/**
 * FieldToByteArray convert fields to byte representation based on type
 *
 * @param {unknown} field - field to convert
 * @returns Uint8Array
 */
function fieldToByteArray(field) {
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
    return js_iden3_core_1.BytesHelper.intToBytes(bigIntField);
}
exports.fieldToByteArray = fieldToByteArray;
/**
 * checks if data fills into slot capacity ()
 *
 * @param {Uint8Array} slot - current slot data
 * @param {Uint8Array} newData - new slot data
 * @returns boolean
 */
function dataFillsSlot(slot, newData) {
    return (0, js_iden3_core_1.checkBigIntInField)(js_iden3_core_1.BytesHelper.bytesToInt(Uint8Array.from([...slot, ...newData])));
}
exports.dataFillsSlot = dataFillsSlot;
/**
 * check if byte data is in Q field
 *
 * @param {Uint8Array} data - bytes payload
 * @returns boolean
 */
function checkDataInField(data) {
    return (0, js_iden3_core_1.checkBigIntInField)(js_iden3_core_1.BytesHelper.bytesToInt(data));
}
exports.checkDataInField = checkDataInField;
/**
 * Calculates schema hash
 *
 * @param {Uint8Array} schemaId
 * @returns {*}  {SchemaHash}
 */
const createSchemaHash = (schemaId) => {
    const sHash = js_crypto_1.Hex.decodeString((0, js_sha3_browser_1.keccak256)(schemaId));
    return new js_iden3_core_1.SchemaHash(sHash.slice(sHash.length - 16, sHash.length));
};
exports.createSchemaHash = createSchemaHash;
exports.credentialSubjectKey = 'credentialSubject';
/**
 * checks if data can fill the slot
 *
 * @param {*} data - object that contains field
 * @param {string} fieldName - field name
 * @returns Uint8Array - filled slot
 */
const fillSlot = async (slotData, mz, path) => {
    if (!path) {
        return;
    }
    path = exports.credentialSubjectKey + '.' + path;
    try {
        const p = await mz.resolveDocPath(path, mz.options);
        const entry = await mz.entry(p);
        const intVal = await entry.getValueMtEntry();
        const bytesVal = js_iden3_core_1.BytesHelper.intToBytes(intVal);
        slotData.set(bytesVal, 0);
    }
    catch (err) {
        if (err.toString().includes('entry not found')) {
            throw new Error(`field not found in credential ${path}`);
        }
        throw err;
    }
};
exports.fillSlot = fillSlot;
//# sourceMappingURL=utils.js.map