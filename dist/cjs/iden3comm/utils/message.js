"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.headerStubFactory = exports.envelopeStubFactory = exports.basicMessageFactory = void 0;
/**
 * creates empty basic message
 *
 * @returns BasicMessage
 */
const basicMessageFactory = () => {
    return {
        id: '',
        typ: '',
        thid: '',
        type: '',
        body: {},
        from: '',
        to: ''
    };
};
exports.basicMessageFactory = basicMessageFactory;
/**
 * create empty envelope stub
 *
 * @returns EnvelopeStub
 */
const envelopeStubFactory = () => {
    return {
        protected: ''
    };
};
exports.envelopeStubFactory = envelopeStubFactory;
/**
 * create empty header stub
 *
 * @returns {HeaderStub}
 */
const headerStubFactory = () => {
    return {
        typ: ''
    };
};
exports.headerStubFactory = headerStubFactory;
//# sourceMappingURL=message.js.map