import { SchemaHash } from '@iden3/js-iden3-core';
import { Merklizer, Options } from '@iden3/js-jsonld-merklization';
type ParsedCtx = {
    mappings: Map<string, Record<string, unknown>>;
};
/**
 * CoreClaimCreationOptions is params for core claim creation
 *
 * @public
 * @interface   CoreClaimCreationOptions
 */
export interface CoreClaimCreationOptions {
    revNonce: number;
    version: number;
    subjectPosition: string;
    merklizedRootPosition: string;
    updatable: boolean;
    merklizeOpts?: Options;
}
/**
 * Parsed slots of core.Claim
 *
 * @public
 * @interface   CoreClaimParsedSlots
 */
export interface CoreClaimParsedSlots {
    indexA: Uint8Array;
    indexB: Uint8Array;
    valueA: Uint8Array;
    valueB: Uint8Array;
}
/**
 * Slots paths of core.Claim
 *
 * @public
 * @interface   CoreClaimSlotsPaths
 */
export interface CoreClaimSlotsPaths {
    indexAPath: string;
    indexBPath: string;
    valueAPath: string;
    valueBPath: string;
}
/**
 * GetFieldSlotIndex return index of slot from 0 to 7 (each claim has by default 8 slots) for non-merklized claims
 *
 * @param {string} field - field name
 * @param {Uint8Array} schemaBytes -json schema bytes
 * @returns `number`
 */
export declare const getFieldSlotIndex: (field: string, typeName: string, schemaBytes: Uint8Array) => Promise<number>;
/**
 * checks if data can fill the slot
 *
 * @param {Uint8Array} slotData - slot data
 * @param {Merklizer} mz - merklizer
 * @param {string} path - path
 * @returns {void}
 */
export declare const fillCoreClaimSlot: (slotData: Uint8Array, mz: Merklizer, path: string) => Promise<void>;
export declare const getSerializationAttrFromContext: (context: object, opts: Options, tp: string) => Promise<string>;
export declare const getSerializationAttrFromParsedContext: (ldCtx: ParsedCtx, tp: string) => Promise<string>;
export declare const parseSerializationAttr: (serAttr: string) => CoreClaimSlotsPaths;
export declare const findCredentialType: (mz: Merklizer) => string;
/**
 * parseCoreClaimSlots converts payload to claim slots using provided schema
 *
 * @param { { mappings: Map<string, Record<string, unknown>> } } ldCtx - ldCtx
 * @param {Merklizer} mz - Merklizer
 * @param {string} credentialType - credential type
 * @returns `Promise<{ slots: ParsedSlots; nonMerklized: boolean }>`
 */
export declare const parseCoreClaimSlots: (ldCtx: {
    mappings: Map<string, Record<string, unknown>>;
}, mz: Merklizer, credentialType: string) => Promise<{
    slots: CoreClaimParsedSlots;
    nonMerklized: boolean;
}>;
/**
 * Calculates core schema hash
 *
 * @param {Uint8Array} schemaId
 * @returns {*}  {SchemaHash}
 */
export declare const calculateCoreSchemaHash: (schemaId: Uint8Array) => SchemaHash;
export {};
//# sourceMappingURL=core-utils.d.ts.map