import { W3CCredential } from '../../verifiable';
import { Claim as CoreClaim } from '@iden3/js-iden3-core';
import { Options } from '@iden3/js-jsonld-merklization';
/**
 * Parsed slots of core.Claim
 *
 * @public
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
    uris: {
        [key: string]: string;
    };
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
 * CoreClaimOptions is params for core claim parsing
 *
 * @public
 * @interface   CoreClaimOptions
 */
export interface CoreClaimOptions {
    revNonce: number;
    version: number;
    subjectPosition: string;
    merklizedRootPosition: string;
    updatable: boolean;
    merklizeOpts?: Options;
}
/**
 * Parser can parse claim and schema data according to specification
 *
 * @public
 * @class Parser
 */
export declare class Parser {
    /**
     *  ParseClaim creates core.Claim object from W3CCredential
     *
     * @param {W3CCredential} credential - Verifiable Credential
     * @param {string} credentialType  - credential type that will be used as schema hash e.g. https://url-to-ld-schema.com#AuthBJJCredential
     * @param {Uint8Array} jsonSchemaBytes - json schema bytes
     * @param {CoreClaimOptions} [opts] - options to parse core claim
     * @returns `Promise<CoreClaim>`
     */
    parseClaim(credential: W3CCredential, credentialType: string, jsonSchemaBytes: Uint8Array, opts?: CoreClaimOptions): Promise<CoreClaim>;
    /**
     * ParseSlots converts payload to claim slots using provided schema
     *
     * @param {W3CCredential} credential - Verifiable Credential
     * @param {Uint8Array} schemaBytes - JSON schema bytes
     * @returns `ParsedSlots`
     */
    parseSlots(credential: W3CCredential, schemaBytes: Uint8Array): ParsedSlots;
    private assignSlots;
    /**
     * GetFieldSlotIndex return index of slot from 0 to 7 (each claim has by default 8 slots) for non-merklized claims
     *
     * @param {string} field - field name
     * @param {Uint8Array} schemaBytes -json schema bytes
     * @returns `number`
     */
    getFieldSlotIndex(field: string, schemaBytes: Uint8Array): number;
    /**
     * ExtractMetadata return metadata from JSON schema
     *
     * @param {string | JSON} schema - JSON schema
     * @returns SchemaMetadata
     */
    static extractMetadata(schema: string | JSON): SchemaMetadata;
    /**
     * ExtractCredentialSubjectProperties return credential subject types from JSON schema
     *
     * @param {string | JSON} schema - JSON schema
     * @returns `Promise<Array<string>>`
     */
    static extractCredentialSubjectProperties(schema: string): Promise<Array<string>>;
    /**
     * GetLdPrefixesByJSONSchema return possible credential types for JSON schema
     *
     * @param {string} schema  - JSON schema
     * @returns `Promise<Map<string, string>>`
     */
    static getLdPrefixesByJSONSchema(schema: string): Promise<Map<string, string>>;
}
