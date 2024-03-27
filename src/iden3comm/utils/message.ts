import { MediaType } from '../constants';
import { BasicMessage, EnvelopeStub, HeaderStub } from '../types';

/**
 * creates empty basic message
 *
 * @returns BasicMessage
 */
export const basicMessageFactory = (): BasicMessage => {
  return {
    id: '',
    typ: '' as MediaType,
    thid: '',
    type: '',
    from: '',
    to: ''
  };
};

/**
 * create empty envelope stub
 *
 * @returns EnvelopeStub
 */
export const envelopeStubFactory = (): EnvelopeStub => {
  return {
    protected: ''
  };
};

/**
 * create empty header stub
 *
 * @returns {HeaderStub}
 */
export const headerStubFactory = (): HeaderStub => {
  return {
    typ: '' as MediaType
  };
};
