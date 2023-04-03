import * as jsonld from 'jsonld/lib';
import * as ldcontext from 'jsonld/lib/context';

/**
 * LDParser can parse JSONLD schema according to specification
 *
 * @export
 * @beta
 * @class LDParser
 */
export class LDParser {
  /**
   * ExtractTerms returns the terms definitions from the JSON-LD context
   *
   * @param {string} context - JSONLD context
   * @returns Promise<Map<string, string>>
   */
  public static async extractTerms(context: string | JSON): Promise<Map<string, unknown>> {
    let data;
    let res;
    try {
      data = typeof context === 'string' ? JSON.parse(context) : context;
      res = await jsonld.processContext(ldcontext.getInitialContext({}), data, {});
    } catch (e) {
      throw new Error(`Failed process LD context. Error ${e}`);
    }

    const terms = res.mappings as Map<string, unknown>;
    return terms;
  }

  /**
   * GetPrefixesreturns a map of potential RDF prefixes based on the JSON-LD Term Definitions
   * in this context. No guarantees of the prefixes are given, beyond that it will not contain ":".
   *
   * onlyCommonPrefixes: If true, the result will not include "not so useful" prefixes, such as
   * "term1": "http://example.com/term1", e.g. all IRIs will end with "/" or "#".
   * If false, all potential prefixes are returned.
   * @param {string} context - JSONLD context
   * @returns <Map<string, string>
   */
  public static getPrefixes(
    data: Map<string, unknown>,
    onlyCommonPrefixes: boolean
  ): Map<string, string> {
    const prefixes: Map<string, string> = new Map();

    for (const [term, termDefinition] of data) {
      if (term.includes(':')) {
        continue;
      }
      if (!termDefinition) {
        continue;
      }
      const termDefinitionMap = termDefinition as Record<string, unknown>;
      const id = termDefinitionMap['@id'] as string;
      if (!id) {
        continue;
      }
      if (term.startsWith('@') || id.startsWith('@')) {
        continue;
      }
      if (!onlyCommonPrefixes || id.endsWith('/') || id.endsWith('#')) {
        prefixes.set(term, id);
      }
    }

    return prefixes;
  }

  /**
   * GetPrefixesByTypes returns a map of potential RDF prefixes based on the JSON-LD Term Definitions.
   *
   * @param {string | JSON} context - JSONLD context
   * @param {Array<string>} types - Array of available types
   * @returns Promise<Map<string, string>>
   */
  public static async getPrefixesByTypes(
    context: string | JSON,
    types: Array<string>
  ): Promise<Map<string, string>> {
    const res: Map<string, string> = new Map();

    const terms = await this.extractTerms(context);
    const allPrefixes = this.getPrefixes(terms, false);

    for (const key of allPrefixes.keys()) {
      const typeDefinition = terms.get(key);
      const c = typeDefinition['@context'];
      if (!c) {
        continue;
      }
      const t = await this.extractTerms(c);
      const p = this.getPrefixes(t, false);
      if (this.isKeysInMap(types, p)) {
        res.set(key, allPrefixes.get(key));
      }
    }

    return res;
  }

  private static isKeysInMap(keys: string[], map: Map<string, string>): boolean {
    for (const key of keys) {
      if (!map.has(key)) {
        return false;
      }
    }
    return true;
  }
}
