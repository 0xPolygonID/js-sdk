import { W3CCredential } from '../../verifiable';
import { Claim as CoreClaim } from '@iden3/js-iden3-core';
import { Merklizer, Options } from '@iden3/js-jsonld-merklization';
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
interface SlotsPaths {
    indexAPath: string;
    indexBPath: string;
    valueAPath: string;
    valueBPath: string;
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
     * @param {CoreClaimOptions} [opts] - options to parse core claim
     * @returns `Promise<CoreClaim>`
     */
    static parseClaim(credential: W3CCredential, opts?: CoreClaimOptions): Promise<CoreClaim>;
    static findCredentialType(mz: Merklizer): string;
    static getSerializationAttr(credential: W3CCredential, opts: Options, tp: string): Promise<string>;
    static getSerializationAttrFromParsedContext(ldCtx: {
        mappings: Map<string, Record<string, unknown>>;
    }, tp: string): Promise<string>;
    static parseSerializationAttr(serAttr: string): SlotsPaths;
    /**
     * ParseSlots converts payload to claim slots using provided schema
     *
     * @param {Merklizer} mz - Merklizer
     * @param {W3CCredential} credential - Verifiable Credential
     * @param {string} credentialType - credential type
     * @returns `ParsedSlots`
     */
    static parseSlots(mz: Merklizer, credential: W3CCredential, credentialType: string): Promise<{
        slots: ParsedSlots;
        nonMerklized: boolean;
    }>;
    /**
     * GetFieldSlotIndex return index of slot from 0 to 7 (each claim has by default 8 slots) for non-merklized claims
     *
     * @param {string} field - field name
     * @param {Uint8Array} schemaBytes -json schema bytes
     * @returns `number`
     */
    static getFieldSlotIndex(field: string, typeName: string, schemaBytes: Uint8Array): Promise<number>;
    /**
     * ExtractCredentialSubjectProperties return credential subject types from JSON schema
     *
     * @param {string | JSON} schema - JSON schema
     * @returns `Promise<Array<string>>`
     */
    static extractCredentialSubjectProperties(schema: string): Promise<Array<string>>;
}
export {};
