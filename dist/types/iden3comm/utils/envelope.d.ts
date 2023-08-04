import { BasicMessage, EnvelopeStub, HeaderStub } from '../types';
/**
 *
 * @param {Uint8Array} e
 * @returns Promise<BasicMessage>
 */
export declare const envelopeToProtocolMessage: (e: Uint8Array) => Promise<BasicMessage>;
/**
 * helper function to convert serialized JSON bytes to protocol message
 *
 * @param {Uint8Array} bytes
 * @returns  {BasicMessage}
 */
export declare const bytesToProtocolMessage: (bytes: Uint8Array) => BasicMessage;
/**
 * helper function to convert serialized JSON bytes to envelop stub
 * so we can work with protected field of jwt token
 *
 *
 * @param {Uint8Array} envelope
 * @returns {EnvelopeStub}
 */
export declare const bytesToEnvelopeStub: (envelope: Uint8Array) => EnvelopeStub;
/**
 * helper function to convert serialized JSON bytes to header stub
 * so we can work with know the media type of the message
 *
 * @param {Uint8Array} envelope
 * @returns {HeaderStub}
 */
export declare const bytesToHeaderStub: (envelope: Uint8Array) => HeaderStub;
