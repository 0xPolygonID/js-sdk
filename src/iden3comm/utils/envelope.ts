import { BasicMessage, EnvelopeStub, HeaderStub } from '../types';
import { basicMessageFactory, envelopeStubFactory, headerStubFactory } from './messg';
import { bytesToString, stringToBytes } from './bytes';
import { ErrNotEnvelopeStub, ErrNotHeaderStub, ErrNotProtocolMesg } from '../errors';
import { Token } from '@iden3/js-jwz';

const objectIs = (
  obj: { [key in string]: any }, //eslint-disable-line @typescript-eslint/no-explicit-any
  targetObj: { [key in string]: any } //eslint-disable-line @typescript-eslint/no-explicit-any
) => {
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
const isProtocolMessage = (messg: { [key in string]: any }) => {
  const basicMessg = basicMessageFactory();
  Object.keys(basicMessg).forEach((prop) => {
    if (!messg[prop]) {
      return false;
    }
    if (prop !== 'body') {
      const res =
        typeof basicMessg[prop as keyof typeof basicMessg] ===
        typeof (messg[prop as keyof typeof messg] as any); //eslint-disable-line @typescript-eslint/no-explicit-any
      if (!res) {
        return false;
      }
    }
  });

  return true;
};

export const envelopeToProtocolMessage = async (e: Uint8Array): Promise<BasicMessage> => {
  const t = await Token.parse(bytesToString(e));
  const pBytes = stringToBytes(t.getPayload());
  return bytesToProtocolMessage(pBytes);
};

export const bytesToProtocolMessage = (bytes: Uint8Array) => {
  const str = bytesToString(bytes);
  const messg = JSON.parse(str);
  if (!isProtocolMessage(messg)) {
    throw ErrNotProtocolMesg;
  }
  return messg as BasicMessage;
};

export const bytesToEnvelopeStub = (envelope: Uint8Array): EnvelopeStub => {
  const tmpObj = envelopeStubFactory();
  const str = bytesToString(envelope);
  const messg = JSON.parse(str);
  if (!objectIs(messg, tmpObj)) {
    throw ErrNotEnvelopeStub;
  }
  return messg as EnvelopeStub;
};

export const bytesToHeaderStub = (envelope: Uint8Array): HeaderStub => {
  const tmpObj = headerStubFactory();
  const str = bytesToString(envelope);
  const messg = JSON.parse(str);
  if (!objectIs(messg, tmpObj)) {
    throw ErrNotHeaderStub;
  }
  return messg as HeaderStub;
};
