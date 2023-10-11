"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifiablePresentationFromCred = exports.createVerifiablePresentation = exports.buildQueryPath = exports.stringByPath = void 0;
const constants_1 = require("./constants");
const js_jsonld_merklization_1 = require("@iden3/js-jsonld-merklization");
const stringByPath = (obj, path) => {
    const parts = path.split('.');
    let value = obj;
    for (let index = 0; index < parts.length; index++) {
        const key = parts[index];
        if (!key) {
            throw new Error('path is empty');
        }
        value = value[key];
        if (value === undefined) {
            throw new Error('path not found');
        }
    }
    return value.toString();
};
exports.stringByPath = stringByPath;
const buildQueryPath = async (contextURL, contextType, field, opts) => {
    let resp;
    try {
        resp = await (await fetch(contextURL)).json();
    }
    catch (error) {
        throw new Error(`context not found: ${error.message}`);
    }
    const path = await js_jsonld_merklization_1.Path.getContextPathKey(JSON.stringify(resp), contextType, field, opts);
    path.prepend([constants_1.VerifiableConstants.CREDENTIAL_SUBJECT_PATH]);
    return path;
};
exports.buildQueryPath = buildQueryPath;
const createVerifiablePresentation = (context, tp, path, value) => {
    const baseContext = [constants_1.VerifiableConstants.JSONLD_SCHEMA.W3C_CREDENTIAL_2018];
    const ldContext = baseContext[0] === context ? baseContext : [...baseContext, context];
    const vc = constants_1.VerifiableConstants.CREDENTIAL_TYPE.W3C_VERIFIABLE_CREDENTIAL;
    const vcTypes = [vc];
    if (tp !== vc) {
        vcTypes.push(tp);
    }
    const [first, ...rest] = path.split('.');
    const obj = rest.reduceRight((acc, key) => ({ [key]: acc }), value);
    return {
        '@context': baseContext,
        '@type': constants_1.VerifiableConstants.CREDENTIAL_TYPE.W3C_VERIFIABLE_PRESENTATION,
        verifiableCredential: {
            '@context': ldContext,
            '@type': vcTypes,
            credentialSubject: {
                '@type': tp,
                [first]: obj
            }
        }
    };
};
exports.createVerifiablePresentation = createVerifiablePresentation;
const verifiablePresentationFromCred = async (w3cCred, requestObj, field, opts) => {
    const mz = await w3cCred.merklize(opts);
    const request = requestObj;
    const contextType = (0, exports.stringByPath)(request, 'type');
    const hasher = mz.hasher;
    const contextURL = (0, exports.stringByPath)(request, 'context');
    const path = await (0, exports.buildQueryPath)(contextURL, contextType, field, opts);
    const dataType = await mz.jsonLDType(path);
    const rawValue = mz.rawValue(path);
    const { value } = await mz.proof(path);
    const vp = (0, exports.createVerifiablePresentation)(contextURL, contextType, field, rawValue);
    if (!value) {
        throw new Error(`can't merklize verifiable presentation`);
    }
    return { vp, mzValue: value, dataType, hasher };
};
exports.verifiablePresentationFromCred = verifiablePresentationFromCred;
//# sourceMappingURL=presentation.js.map