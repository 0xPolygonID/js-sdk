"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LDParser = void 0;
/* eslint-disable @typescript-eslint/no-var-requires */
const jsonld = __importStar(require("jsonld/lib"));
const ldcontext = __importStar(require("jsonld/lib/context"));
/**
 * LDParser can parse JSONLD schema according to specification
 *
 * @public
 * @class LDParser
 */
class LDParser {
    /**
     * ExtractTerms returns the terms definitions from the JSON-LD context
     *
     * @param {string} context - JSONLD context
     * @returns Promise<Map<string, string>>
     */
    static async extractTerms(context) {
        let data;
        let res;
        try {
            data = typeof context === 'string' ? JSON.parse(context) : context;
            res = await jsonld.processContext(ldcontext.getInitialContext({}), data, {});
        }
        catch (e) {
            throw new Error(`Failed process LD context. Error ${e}`);
        }
        const terms = res.mappings;
        return terms;
    }
    /**
     * GetPrefixesreturns a map of potential RDF prefixes based on the JSON-LD Term Definitions
     * in this context. No guarantees of the prefixes are given, beyond that it will not contain ":".
     *
     * onlyCommonPrefixes: If true, the result will not include "not so useful" prefixes, such as
     * "term1": "http://example.com/term1", e.g. all IRIs will end with "/" or "#".
     * If false, all potential prefixes are returned.
     * @param {string | JSON} context - JSONLD context
     * @param {boolean} onlyCommonPrefixes - only common prefixes
     * @param {Array<string>} properties - available properties in type definition
     * @returns Promise<<Map<string, string>>
     */
    static async getPrefixes(context, onlyCommonPrefixes, properties) {
        const prefixes = new Map();
        const data = await this.extractTerms(context);
        for (const [term, termDefinition] of data) {
            if (term.includes(':')) {
                continue;
            }
            if (!termDefinition) {
                continue;
            }
            const termDefinitionMap = termDefinition;
            const id = termDefinitionMap['@id'];
            if (!id) {
                continue;
            }
            if (term.startsWith('@') || id.startsWith('@')) {
                continue;
            }
            if (!onlyCommonPrefixes || id.endsWith('/') || id.endsWith('#')) {
                prefixes.set(term, id);
            }
            if (properties) {
                const c = termDefinitionMap['@context'];
                if (!c) {
                    prefixes.delete(term);
                    continue;
                }
                if (!this.isKeysInMap(properties, c)) {
                    prefixes.delete(term);
                    continue;
                }
            }
        }
        return prefixes;
    }
    static isKeysInMap(keys, rec) {
        for (const key of keys) {
            if (!rec[key]) {
                return false;
            }
        }
        return true;
    }
}
exports.LDParser = LDParser;
//# sourceMappingURL=parser.js.map