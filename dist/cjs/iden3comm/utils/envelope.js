"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bytesToHeaderStub = exports.bytesToEnvelopeStub = exports.bytesToProtocolMessage = exports.envelopeToProtocolMessage = void 0;
const message_1 = require("./message");
const errors_1 = require("../errors");
const js_jwz_1 = require("@iden3/js-jwz");
const utils_1 = require("../../utils");
const objectIs = (obj, //eslint-disable-line @typescript-eslint/no-explicit-any
targetObj //eslint-disable-line @typescript-eslint/no-explicit-any
) => {
    Object.keys(targetObj).forEach((prop) => {
        if (!obj[prop]) {
            return false;
        }
        if (typeof targetObj[prop] !== typeof obj[prop]) {
            return false;
        }
    });
    return true;
};
//eslint-disable-next-line @typescript-eslint/no-explicit-any
const isProtocolMessage = (message) => {
    const basicMessage = (0, message_1.basicMessageFactory)();
    Object.keys(basicMessage).forEach((prop) => {
        if (!message[prop]) {
            return false;
        }
        if (prop !== 'body') {
            const res = typeof basicMessage[prop] ===
                typeof message[prop]; //eslint-disable-line @typescript-eslint/no-explicit-any
            if (!res) {
                return false;
            }
        }
    });
    return true;
};
/**
 *
 * @param {Uint8Array} e
 * @returns Promise<BasicMessage>
 */
const envelopeToProtocolMessage = async (e) => {
    const t = await js_jwz_1.Token.parse(utils_1.byteDecoder.decode(e));
    const pBytes = utils_1.byteEncoder.encode(t.getPayload());
    return (0, exports.bytesToProtocolMessage)(pBytes);
};
exports.envelopeToProtocolMessage = envelopeToProtocolMessage;
/**
 * helper function to convert serialized JSON bytes to protocol message
 *
 * @param {Uint8Array} bytes
 * @returns  {BasicMessage}
 */
const bytesToProtocolMessage = (bytes) => {
    const str = utils_1.byteDecoder.decode(bytes);
    const message = JSON.parse(str);
    if (!isProtocolMessage(message)) {
        throw new Error(errors_1.ErrNotProtocolMessage);
    }
    return message;
};
exports.bytesToProtocolMessage = bytesToProtocolMessage;
/**
 * helper function to convert serialized JSON bytes to envelop stub
 * so we can work with protected field of jwt token
 *
 *
 * @param {Uint8Array} envelope
 * @returns {EnvelopeStub}
 */
const bytesToEnvelopeStub = (envelope) => {
    const tmpObj = (0, message_1.envelopeStubFactory)();
    const str = utils_1.byteDecoder.decode(envelope);
    const message = JSON.parse(str);
    if (!objectIs(message, tmpObj)) {
        throw new Error(errors_1.ErrNotEnvelopeStub);
    }
    return message;
};
exports.bytesToEnvelopeStub = bytesToEnvelopeStub;
/**
 * helper function to convert serialized JSON bytes to header stub
 * so we can work with know the media type of the message
 *
 * @param {Uint8Array} envelope
 * @returns {HeaderStub}
 */
const bytesToHeaderStub = (envelope) => {
    const tmpObj = (0, message_1.headerStubFactory)();
    const str = utils_1.byteDecoder.decode(envelope);
    const message = JSON.parse(str);
    if (!objectIs(message, tmpObj)) {
        throw new Error(errors_1.ErrNotHeaderStub);
    }
    return message;
};
exports.bytesToHeaderStub = bytesToHeaderStub;
//# sourceMappingURL=envelope.js.map