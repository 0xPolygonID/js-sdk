"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheLoader = void 0;
const js_jsonld_merklization_1 = require("@iden3/js-jsonld-merklization");
const verifiable_1 = require("../../verifiable");
/**
 * cacheLoader returns a remote document with additional logic for caching the urls remote documents.
 * If the same url is called more then once, remote document will be not downloaded again but will returned from memory cache.
 * @param {Options } context - JSONLD loader options
 * @returns Promise<DocumentLoader>
 */
const doc = JSON.parse(verifiable_1.VerifiableConstants.JSONLD_SCHEMA.W3C_VC_DOCUMENT_2018);
const cacheLoader = (opts) => {
    const cache = new Map();
    cache.set(verifiable_1.VerifiableConstants.JSONLD_SCHEMA.W3C_CREDENTIAL_2018, {
        document: doc,
        documentUrl: verifiable_1.VerifiableConstants.JSONLD_SCHEMA.W3C_CREDENTIAL_2018
    });
    return async (url) => {
        let remoteDoc = cache.get(url);
        if (remoteDoc) {
            return remoteDoc;
        }
        remoteDoc = await (0, js_jsonld_merklization_1.getDocumentLoader)(opts)(url);
        cache.set(url, remoteDoc);
        return remoteDoc;
    };
};
exports.cacheLoader = cacheLoader;
//# sourceMappingURL=cache.js.map