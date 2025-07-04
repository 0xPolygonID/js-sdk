import { getInitialContext } from '@iden3/js-jsonld-merklization';
import * as jsonld from 'jsonld';

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
  public static async extractTerms(context: string | JSON): Promise<Map<string, unknown>> {
    let data;
    let res;
    try {
      data = typeof context === 'string' ? JSON.parse(context) : context;
      res = await jsonld.processContext(getInitialContext({}), data, {});
    } catch (e) {
      throw new Error(`Failed process LD context. Error ${e}`);
    }

    const terms = res.mappings;
    return terms;
  }

  /**
   * GetPrefixes returns a map of potential RDF prefixes based on the JSON-LD Term Definitions
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
  public static async getPrefixes(
    context: string | JSON,
    onlyCommonPrefixes: boolean,
    properties?: Array<string>
  ): Promise<Map<string, string>> {
    const prefixes: Map<string, string> = new Map();
    const data = await this.extractTerms(context);

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

      if (properties) {
        const c = termDefinitionMap['@context'] as Record<string, undefined>;
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

  private static isKeysInMap(keys: string[], rec: Record<string, undefined>): boolean {
    for (const key of keys) {
      if (!rec[key]) {
        return false;
      }
    }
    return true;
  }
}
