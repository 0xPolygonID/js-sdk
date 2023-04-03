import { W3CCredential, MerklizedRootPosition, SubjectPosition } from '../../verifiable';
import { LDParser } from '../jsonld';
import { Claim as CoreClaim, ClaimOptions, DID } from '@iden3/js-iden3-core';
import { createSchemaHash, fillSlot } from '../utils';

/**
 * Parsed slots of core.Claim
 *
 * @export
 * @beta
 * @interface   ParsedSlots
 */
export interface ParsedSlots {
  indexA: Uint8Array;
  indexB: Uint8Array;
  valueA: Uint8Array;
  valueB: Uint8Array;
}

/**
 * Serialization of data slots for the fields non-merklized claims
 *
 * @export
 * @beta
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
 * @export
 * @beta
 * @interface   SchemaMetadata
 */
export interface SchemaMetadata {
  uris: { [key: string]: string };
  serialization?: SerializationSchema;
}

/**
 * JSON credential Schema
 *
 * @export
 * @beta
 * @interface   Schema
 */
export interface JSONSchema {
  $metadata: SchemaMetadata;
  $schema: string;
  type: string;
}

/**
 * CoreClaimOptions is params for core claim parsing
 *
 * @export
 * @beta
 * @interface   CoreClaimOptions
 */
export interface CoreClaimOptions {
  revNonce: number;
  version: number;
  subjectPosition: string;
  merklizedRootPosition: string;
  updatable: boolean;
}

/**
 * Parser can parse claim and schema data according to specification
 *
 * @export
 * @beta
 * @class Parser
 */
export class Parser {
  /**
   *  ParseClaim creates core.Claim object from W3CCredential
   *
   * @param {W3CCredential} credential - Verifiable Credential
   * @param {string} credentialType  - credential type that will be used as schema hash e.g. https://url-to-ld-schema.com#AuthBJJCredential
   * @param {Uint8Array} jsonSchemaBytes - json schema bytes
   * @param {CoreClaimOptions} [opts] - options to parse core claim
   * @returns `Promise<CoreClaim>`
   */
  async parseClaim(
    credential: W3CCredential,
    credentialType: string,
    jsonSchemaBytes: Uint8Array,
    opts?: CoreClaimOptions
  ): Promise<CoreClaim> {
    if (!opts) {
      opts = {
        revNonce: 0,
        version: 0,
        subjectPosition: SubjectPosition.Index,
        merklizedRootPosition: MerklizedRootPosition.None,
        updatable: false
      };
    }

    const subjectId = credential.credentialSubject['id'];

    const slots = this.parseSlots(credential, jsonSchemaBytes);

    const schemaHash = createSchemaHash(new TextEncoder().encode(credentialType));
    const claim = CoreClaim.newClaim(
      schemaHash,
      ClaimOptions.withIndexDataBytes(slots.indexA, slots.indexB),
      ClaimOptions.withValueDataBytes(slots.valueA, slots.valueB),
      ClaimOptions.withRevocationNonce(BigInt(opts.revNonce)),
      ClaimOptions.withVersion(opts.version)
    );

    if (opts.updatable) {
      claim.setFlagUpdatable(opts.updatable);
    }
    if (credential.expirationDate) {
      claim.setExpirationDate(new Date(credential.expirationDate));
    }
    if (subjectId) {
      const did = DID.parse(subjectId.toString());

      switch (opts.subjectPosition) {
        case '':
        case SubjectPosition.Index:
          claim.setIndexId(did.id);
          break;
        case SubjectPosition.Value:
          claim.setValueId(did.id);
          break;
        default:
          throw new Error('unknown subject position');
      }
    }

    switch (opts.merklizedRootPosition) {
      case MerklizedRootPosition.Index: {
        const mk = await credential.merklize();
        claim.setIndexMerklizedRoot((await mk.root()).bigInt());
        break;
      }
      case MerklizedRootPosition.Value: {
        const mk = await credential.merklize();
        claim.setValueMerklizedRoot((await mk.root()).bigInt());
        break;
      }
      case MerklizedRootPosition.None:
        break;
      default:
        throw new Error('unknown merklized root position');
    }

    return claim;
  }

  /**
   * ParseSlots converts payload to claim slots using provided schema
   *
   * @param {W3CCredential} credential - Verifiable Credential
   * @param {Uint8Array} schemaBytes - JSON schema bytes
   * @returns `ParsedSlots`
   */
  parseSlots(credential: W3CCredential, schemaBytes: Uint8Array): ParsedSlots {
    const schema: JSONSchema = JSON.parse(new TextDecoder().decode(schemaBytes));

    if (schema?.$metadata?.serialization) {
      return this.assignSlots(credential.credentialSubject, schema.$metadata.serialization);
    }

    return {
      indexA: new Uint8Array(32),
      indexB: new Uint8Array(32),
      valueA: new Uint8Array(32),
      valueB: new Uint8Array(32)
    };
  }
  // assignSlots assigns index and value fields to specific slot according array order
  private assignSlots(data: { [key: string]: unknown }, schema: SerializationSchema): ParsedSlots {
    const result: ParsedSlots = {
      indexA: new Uint8Array(32),
      indexB: new Uint8Array(32),
      valueA: new Uint8Array(32),
      valueB: new Uint8Array(32)
    };

    result.indexA = fillSlot(data, schema.indexDataSlotA);
    result.indexB = fillSlot(data, schema.indexDataSlotB);
    result.valueA = fillSlot(data, schema.valueDataSlotA);
    result.valueB = fillSlot(data, schema.valueDataSlotB);

    return result;
  }

  /**
   * GetFieldSlotIndex return index of slot from 0 to 7 (each claim has by default 8 slots) for non-merklized claims
   *
   * @param {string} field - field name
   * @param {Uint8Array} schemaBytes -json schema bytes
   * @returns `number`
   */
  getFieldSlotIndex(field: string, schemaBytes: Uint8Array): number {
    const schema: JSONSchema = JSON.parse(new TextDecoder().decode(schemaBytes));
    if (!schema?.$metadata?.serialization) {
      throw new Error('serialization info is not set');
    }

    switch (field) {
      case schema.$metadata?.serialization?.indexDataSlotA:
        return 2;
      case schema.$metadata?.serialization?.indexDataSlotB:
        return 3;
      case schema.$metadata?.serialization?.valueDataSlotA:
        return 6;
      case schema.$metadata?.serialization?.valueDataSlotB:
        return 7;
      default:
        throw new Error(`field ${field} not specified in serialization info`);
    }
  }

  /**
   * ExtractMetadata return metadata from JSON schema
   *
   * @param {string | JSON} schema - JSON schema
   * @returns SchemaMetadata
   */
  public static extractMetadata(schema: string | JSON): SchemaMetadata {
    const parsedSchema = typeof schema === 'string' ? JSON.parse(schema) : schema;
    const md = parsedSchema.$metadata;
    if (!md) {
      throw new Error('$metadata is not set');
    }
    return md;
  }

  /**
   * ExtractCredentialSubjectTypes return credential subject types from JSON schema
   *
   * @param {string | JSON} schema - JSON schema
   * @returns `Promise<Array<string>>`
   */
  public static async extractCredentialSubjectTypes(schema: string): Promise<Array<string>> {
    const parsedSchema = typeof schema === 'string' ? JSON.parse(schema) : schema;
    const props = parsedSchema.properties?.credentialSubject?.properties;
    if (!props) {
      throw new Error('properties.credentialSubject.properties is not set');
    }
    // drop @id field
    delete props['id'];
    return Object.keys(props);
  }

  /**
   * GetLdPrefixesByJSONSchema return possible credential types for JSON schema
   *
   * @param {string} schema  - JSON schema
   * @returns `Promise<Map<string, string>>`
   */
  public static async getLdPrefixesByJSONSchema(schema: string): Promise<Map<string, string>> {
    const metadata = Parser.extractMetadata(schema);
    const ldURL = metadata.uris['jsonLdContext'];
    if (!ldURL) {
      throw new Error('jsonLdContext is not set');
    }

    const types = await Parser.extractCredentialSubjectTypes(schema);

    let jsonLdContext;
    try {
      const response = await fetch(ldURL);
      jsonLdContext = await response.json();
    } catch (e) {
      throw new Error(`failed to fetch jsonLdContext ${e}`);
    }

    let prefixes;
    try {
      prefixes = await LDParser.getPrefixesByTypes(jsonLdContext, types);
    } catch (e) {
      throw new Error(`failed to extract terms from jsonLdContext ${e}`);
    }

    return prefixes;
  }
}
