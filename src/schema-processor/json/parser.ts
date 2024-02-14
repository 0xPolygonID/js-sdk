import {
  W3CCredential,
  getSerializationAttrFromContext,
  parseSerializationAttr,
  getFieldSlotIndex,
  findCredentialType,
  CoreClaimParsingOptions,
  CoreClaimParsedSlots,
  CoreClaimSlotsPaths
} from '../../verifiable';
import { Claim as CoreClaim } from '@iden3/js-iden3-core';
import { Merklizer, Options } from '@iden3/js-jsonld-merklization';

/**
 *
 * @deprecated The interface should not be used. Use CoreClaimParsingOptions from verifiable package instead.
 * CoreClaimOptions is params for core claim parsing
 *
 * @public
 * @interface   CoreClaimOptions
 */
export type CoreClaimOptions = CoreClaimParsingOptions;

/**
 * @deprecated The interface should not be used. Use CoreClaimParsedSlots from verifiable package instead.
 * Parsed slots of core.Claim
 *
 * @public
 * @interface   ParsedSlots
 */
export type ParsedSlots = CoreClaimParsedSlots;

/**
 * @deprecated The interface should not be used. Use CoreClaimSlotsPaths from verifiable package instead.
 */
export type SlotsPaths = CoreClaimSlotsPaths;

/**
 * Serialization of data slots for the fields non-merklized claims
 *
 * @public
 * @interface   SerializationSchema
 */
export interface SerializationSchema {
  indexDataSlotA: string;
  indexDataSlotB: string;
  valueDataSlotA: string;
  valueDataSlotB: string;
}

/**
 * schema metadata in the json credential schema
 *
 * @public
 * @interface   SchemaMetadata
 */
export interface SchemaMetadata {
  uris: { [key: string]: string };
  serialization?: SerializationSchema;
}

/**
 * JSON credential Schema
 *
 * @public
 * @interface   Schema
 */
export interface JSONSchema {
  $metadata: SchemaMetadata;
  $schema: string;
  type: string;
}

/**
 * Parser can parse claim and schema data according to specification
 *
 * @public
 * @class Parser
 */
export class Parser {
  /**
   *  @deprecated The method should not be used. Use credential.toCoreClaim instead.
   *  ParseClaim creates core.Claim object from W3CCredential
   *
   * @param {W3CCredential} credential - Verifiable Credential
   * @param {CoreClaimOptions} [opts] - options to parse core claim
   * @returns `Promise<CoreClaim>`
   */
  static async parseClaim(credential: W3CCredential, opts?: CoreClaimOptions): Promise<CoreClaim> {
    return credential.toCoreClaim(opts);
  }

  /**
   * @deprecated The method should not be used. Use findCredentialType from verifiable.
   */
  static findCredentialType(mz: Merklizer): string {
    return findCredentialType(mz);
  }

  /**
   *  @deprecated The method should not be used. Use credential.getSerializationAttr instead.
   *
   *  Get `iden3_serialization` attr definition from context document either using
   *  type name like DeliverAddressMultiTestForked or by type id like
   *  urn:uuid:ac2ede19-b3b9-454d-b1a9-a7b3d5763100.
   *  */
  static async getSerializationAttr(
    credential: W3CCredential,
    opts: Options,
    tp: string
  ): Promise<string> {
    return credential.getSerializationAttr(opts, tp);
  }

  /**
   * @deprecated The method should not be used. Use getSerializationAttrFromContext from verifiable.
   *
   *  Get `iden3_serialization` attr definition from context document either using
   *  type name like DeliverAddressMultiTestForked or by type id like
   *  urn:uuid:ac2ede19-b3b9-454d-b1a9-a7b3d5763100.
   *
   */
  static async getSerializationAttrFromContext(
    context: object,
    opts: Options,
    tp: string
  ): Promise<string> {
    return getSerializationAttrFromContext(context, opts, tp);
  }

  /**
   * @deprecated The method should not be used. Use parseSerializationAttr from verifiable.
   *
   */
  static parseSerializationAttr(serAttr: string): SlotsPaths {
    return parseSerializationAttr(serAttr);
  }

  /**
   *
   * @deprecated The method should not be used. Use credential.parseSlots instead.
   * ParseSlots converts payload to claim slots using provided schema
   *
   * @param {Merklizer} mz - Merklizer
   * @param {W3CCredential} credential - Verifiable Credential
   * @param {string} credentialType - credential type
   * @returns `ParsedSlots`
   */
  static async parseSlots(
    mz: Merklizer,
    credential: W3CCredential,
    credentialType: string
  ): Promise<{ slots: ParsedSlots; nonMerklized: boolean }> {
    return credential.parseSlots(mz, credentialType);
  }

  /**
   * @deprecated The method should not be used. Use getFieldSlotIndex from verifiable.
   *
   * GetFieldSlotIndex return index of slot from 0 to 7 (each claim has by default 8 slots) for non-merklized claims
   *
   * @param {string} field - field name
   * @param {Uint8Array} schemaBytes -json schema bytes
   * @returns `number`
   */
  static async getFieldSlotIndex(
    field: string,
    typeName: string,
    schemaBytes: Uint8Array
  ): Promise<number> {
    return getFieldSlotIndex(field, typeName, schemaBytes);
  }

  /**
   * ExtractCredentialSubjectProperties return credential subject types from JSON schema
   *
   * @param {string | JSON} schema - JSON schema
   * @returns `Promise<Array<string>>`
   */
  static async extractCredentialSubjectProperties(schema: string): Promise<Array<string>> {
    const parsedSchema = typeof schema === 'string' ? JSON.parse(schema) : schema;
    const props = parsedSchema.properties?.credentialSubject?.properties;
    if (!props) {
      throw new Error('properties.credentialSubject.properties is not set');
    }
    // drop @id field
    delete props['id'];
    return Object.keys(props);
  }

  // /**
  //  * GetLdPrefixesByJSONSchema return possible credential types for JSON schema
  //  *
  //  * @param {string} schema  - JSON schema
  //  * @returns `Promise<Map<string, string>>`
  //  */
  // public static async getLdPrefixesByJSONSchema(schema: string): Promise<Map<string, string>> {
  //   const metadata = Parser.extractMetadata(schema);
  //   const ldURL = metadata.uris['jsonLdContext'];
  //   if (!ldURL) {
  //     throw new Error('jsonLdContext is not set');
  //   }

  //   const props = await Parser.extractCredentialSubjectProperties(schema);

  //   let jsonLdContext;
  //   try {
  //     const response = await fetch(ldURL);
  //     jsonLdContext = await response.json();
  //   } catch (e) {
  //     throw new Error(`failed to fetch jsonLdContext ${e}`);
  //   }

  //   let prefixes;
  //   try {
  //     prefixes = await LDParser.getPrefixes(jsonLdContext, false, props);
  //   } catch (e) {
  //     throw new Error(`failed to extract terms from jsonLdContext ${e}`);
  //   }

  //   return prefixes;
  // }
}
