/* eslint-disable @typescript-eslint/no-var-requires */
import * as jsonld from 'jsonld/lib';
import * as ldcontext from 'jsonld/lib/context';
/**
 * LDParser can parse JSONLD schema according to specification
 *
 * @public
 * @class LDParser
 */
export class LDParser {
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
//# sourceMappingURL=parser.js.map