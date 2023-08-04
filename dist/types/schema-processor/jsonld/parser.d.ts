/**
 * LDParser can parse JSONLD schema according to specification
 *
 * @public
 * @class LDParser
 */
export declare class LDParser {
    /**
     * ExtractTerms returns the terms definitions from the JSON-LD context
     *
     * @param {string} context - JSONLD context
     * @returns Promise<Map<string, string>>
     */
    static extractTerms(context: string | JSON): Promise<Map<string, unknown>>;
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
    static getPrefixes(context: string | JSON, onlyCommonPrefixes: boolean, properties?: Array<string>): Promise<Map<string, string>>;
    private static isKeysInMap;
}
