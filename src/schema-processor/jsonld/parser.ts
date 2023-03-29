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
  public static async extractTerms(context: string): Promise<Map<string, any>> {
    let data;
    let res;
    try {
      data = JSON.parse(context);
      res = await jsonld.processContext(ldcontext.getInitialContext({}), data, {});
    } catch (e) {
      throw new Error(`Failed process LD context. Error ${e}`);
    }

    const terms = res.mappings as Map<string, any>;
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
   * @returns Promise<Map<string, string>>
   */
  public static getPrefixes(
    data: Map<string, any>,
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
}
