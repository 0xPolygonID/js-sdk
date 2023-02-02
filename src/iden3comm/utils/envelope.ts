import { BasicMessage, EnvelopeStub, HeaderStub } from '../types';
import { basicMessageFactory, envelopeStubFactory, headerStubFactory } from './message';
import { ErrNotEnvelopeStub, ErrNotHeaderStub, ErrNotProtocolMessage } from '../errors';
import { Token } from '@iden3/js-jwz';
import { byteDecoder, byteEncoder } from './index';

const objectIs = (
  obj: { [key in string]: any }, //eslint-disable-line @typescript-eslint/no-explicit-any
  targetObj: { [key in string]: any } //eslint-disable-line @typescript-eslint/no-explicit-any
): boolean => {
  Object.keys(targetObj).forEach((prop) => {
    if (!obj[prop]) {
      return false;
    }
    if (typeof targetObj[prop as keyof typeof targetObj] !== typeof obj[prop as keyof typeof obj]) {
      return false;
    }
  });
  return true;
};

//eslint-disable-next-line @typescript-eslint/no-explicit-any
const isProtocolMessage = (message: { [key in string]: any }): boolean => {
  const basicMessage = basicMessageFactory();
  Object.keys(basicMessage).forEach((prop) => {
    if (!message[prop]) {
      return false;
    }
    if (prop !== 'body') {
      const res =
        typeof basicMessage[prop as keyof typeof basicMessage] ===
        typeof (message[prop as keyof typeof message] as any); //eslint-disable-line @typescript-eslint/no-explicit-any
      if (!res) {
        return false;
      }
    }
  });

  return true;
};

/**
 *
 *
 * @param {Uint8Array} e
 * @returns {*}  {Promise<BasicMessage>}
 */
export const envelopeToProtocolMessage = async (e: Uint8Array): Promise<BasicMessage> => {
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
export const bytesToProtocolMessage = (bytes: Uint8Array): BasicMessage => {
  const str = byteDecoder.decode(bytes);
  const message = JSON.parse(str);
  if (!isProtocolMessage(message)) {
    throw new Error(ErrNotProtocolMessage);
  }
  return message as BasicMessage;
};

/**
 * helper function to convert serialized JSON bytes to envelop stub
 * so we can work with protected field of jwt token
 *
 *
 * @param {Uint8Array} envelope
 * @returns {EnvelopeStub}
 */
export const bytesToEnvelopeStub = (envelope: Uint8Array): EnvelopeStub => {
  const tmpObj = envelopeStubFactory();
  const str = byteDecoder.decode(envelope);
  const message = JSON.parse(str);
  if (!objectIs(message, tmpObj)) {
    throw new Error(ErrNotEnvelopeStub);
  }
  return message as EnvelopeStub;
};

/**
 * helper function to convert serialized JSON bytes to header stub
 * so we can work with know the media type of the message
 *
 * @param {Uint8Array} envelope
 * @returns {HeaderStub}
 */
export const bytesToHeaderStub = (envelope: Uint8Array): HeaderStub => {
  const tmpObj = headerStubFactory();
  const str = byteDecoder.decode(envelope);
  const message = JSON.parse(str);
  if (!objectIs(message, tmpObj)) {
    throw new Error(ErrNotHeaderStub);
  }
  return message as HeaderStub;
};
