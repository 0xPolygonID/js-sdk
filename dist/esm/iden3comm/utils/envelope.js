import { basicMessageFactory, envelopeStubFactory, headerStubFactory } from './message';
import { ErrNotEnvelopeStub, ErrNotHeaderStub, ErrNotProtocolMessage } from '../errors';
import { Token } from '@iden3/js-jwz';
import { byteDecoder, byteEncoder } from '../../utils';
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
    const basicMessage = basicMessageFactory();
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
export const envelopeToProtocolMessage = async (e) => {
    const t = await Token.parse(byteDecoder.decode(e));
    const pBytes = byteEncoder.encode(t.getPayload());
    return bytesToProtocolMessage(pBytes);
};
/**
 * helper function to convert serialized JSON bytes to protocol message
 *
 * @param {Uint8Array} bytes
 * @returns  {BasicMessage}
 */
export const bytesToProtocolMessage = (bytes) => {
    const str = byteDecoder.decode(bytes);
    const message = JSON.parse(str);
    if (!isProtocolMessage(message)) {
        throw new Error(ErrNotProtocolMessage);
    }
    return message;
};
/**
 * helper function to convert serialized JSON bytes to envelop stub
 * so we can work with protected field of jwt token
 *
 *
 * @param {Uint8Array} envelope
 * @returns {EnvelopeStub}
 */
export const bytesToEnvelopeStub = (envelope) => {
    const tmpObj = envelopeStubFactory();
    const str = byteDecoder.decode(envelope);
    const message = JSON.parse(str);
    if (!objectIs(message, tmpObj)) {
        throw new Error(ErrNotEnvelopeStub);
    }
    return message;
};
/**
 * helper function to convert serialized JSON bytes to header stub
 * so we can work with know the media type of the message
 *
 * @param {Uint8Array} envelope
 * @returns {HeaderStub}
 */
export const bytesToHeaderStub = (envelope) => {
    const tmpObj = headerStubFactory();
    const str = byteDecoder.decode(envelope);
    const message = JSON.parse(str);
    if (!objectIs(message, tmpObj)) {
        throw new Error(ErrNotHeaderStub);
    }
    return message;
};
//# sourceMappingURL=envelope.js.map