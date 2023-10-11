/**
 * creates empty basic message
 *
 * @returns BasicMessage
 */
export const basicMessageFactory = () => {
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
/**
 * create empty envelope stub
 *
 * @returns EnvelopeStub
 */
export const envelopeStubFactory = () => {
    return {
        protected: ''
    };
};
/**
 * create empty header stub
 *
 * @returns {HeaderStub}
 */
export const headerStubFactory = () => {
    return {
        typ: ''
    };
};
//# sourceMappingURL=message.js.map