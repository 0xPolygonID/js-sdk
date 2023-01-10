import { MediaType } from '../constants';
import { BasicMessage, EnvelopeStub, HeaderStub } from '../types';

export const basicMessageFactory = (): BasicMessage => {
  return {
    id: '',
    typ: '' as MediaType,
    thid: '',
    type: '',
    body: {
      id: ''
    },
    from: '',
    to: ''
  };
};

export const envelopeStubFactory = (): EnvelopeStub => {
  return {
    protected: ''
  };
};

export const headerStubFactory = (): HeaderStub => {
  return {
    typ: '' as MediaType
  };
};
