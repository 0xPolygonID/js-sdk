"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlainPacker = void 0;
const constants_1 = require("../constants");
const utils_1 = require("../../utils");
/**
 * Plain packer just serializes bytes to JSON and adds media type
 *
 * @public
 * @class PlainPacker
 * @implements implements IPacker interface
 */
class PlainPacker {
    /**
     * Pack returns packed message to transport envelope
     *
     * @param {Uint8Array} payload - json message serialized
     * @param {PlainPackerParams} _params - not used here
     * @returns `Promise<Uint8Array>`
     */
    //
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async pack(payload, _params) {
        const msg = JSON.parse(utils_1.byteDecoder.decode(payload));
        msg.typ = constants_1.MediaType.PlainMessage;
        return Promise.resolve(utils_1.byteEncoder.encode(JSON.stringify(msg)));
    }
    /**
     * Unpack returns unpacked message from transport envelope
     *
     * @param {Uint8Array} envelope - packed envelope (serialized json with media type)
     * @returns `Promise<BasicMessage>`
     */
    async unpack(envelope) {
        return JSON.parse(utils_1.byteDecoder.decode(envelope));
    }
    /**
     * returns media type for plain message
     *
     * @returns MediaType
     */
    mediaType() {
        return constants_1.MediaType.PlainMessage;
    }
}
exports.PlainPacker = PlainPacker;
//# sourceMappingURL=plain.js.map