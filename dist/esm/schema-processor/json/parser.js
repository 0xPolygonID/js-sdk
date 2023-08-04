import { MerklizedRootPosition, SubjectPosition } from '../../verifiable';
import { LDParser } from '../jsonld';
import { Claim as CoreClaim, ClaimOptions, DID } from '@iden3/js-iden3-core';
import { createSchemaHash, fillSlot } from '../utils';
import { byteDecoder, byteEncoder } from '../../utils';
/**
 * Parser can parse claim and schema data according to specification
 *
 * @public
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
    async parseClaim(credential, credentialType, jsonSchemaBytes, opts) {
        if (!opts) {
            opts = {
                revNonce: 0,
                version: 0,
                subjectPosition: SubjectPosition.Index,
                merklizedRootPosition: MerklizedRootPosition.None,
                updatable: false,
                merklizeOpts: {}
            };
        }
        const subjectId = credential.credentialSubject['id'];
        const slots = this.parseSlots(credential, jsonSchemaBytes);
        const schemaHash = createSchemaHash(byteEncoder.encode(credentialType));
        const claim = CoreClaim.newClaim(schemaHash, ClaimOptions.withIndexDataBytes(slots.indexA, slots.indexB), ClaimOptions.withValueDataBytes(slots.valueA, slots.valueB), ClaimOptions.withRevocationNonce(BigInt(opts.revNonce)), ClaimOptions.withVersion(opts.version));
        if (opts.updatable) {
            claim.setFlagUpdatable(opts.updatable);
        }
        if (credential.expirationDate) {
            claim.setExpirationDate(new Date(credential.expirationDate));
        }
        if (subjectId) {
            const did = DID.parse(subjectId.toString());
            const id = DID.idFromDID(did);
            switch (opts.subjectPosition) {
                case '':
                case SubjectPosition.Index:
                    claim.setIndexId(id);
                    break;
                case SubjectPosition.Value:
                    claim.setValueId(id);
                    break;
                default:
                    throw new Error('unknown subject position');
            }
        }
        switch (opts.merklizedRootPosition) {
            case MerklizedRootPosition.Index: {
                const mk = await credential.merklize(opts.merklizeOpts);
                claim.setIndexMerklizedRoot((await mk.root()).bigInt());
                break;
            }
            case MerklizedRootPosition.Value: {
                const mk = await credential.merklize(opts.merklizeOpts);
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
    parseSlots(credential, schemaBytes) {
        const schema = JSON.parse(byteDecoder.decode(schemaBytes));
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
    assignSlots(data, schema) {
        const result = {
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
    getFieldSlotIndex(field, schemaBytes) {
        const schema = JSON.parse(byteDecoder.decode(schemaBytes));
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
    static extractMetadata(schema) {
        const parsedSchema = typeof schema === 'string' ? JSON.parse(schema) : schema;
        const md = parsedSchema.$metadata;
        if (!md) {
            throw new Error('$metadata is not set');
        }
        return md;
    }
    /**
     * ExtractCredentialSubjectProperties return credential subject types from JSON schema
     *
     * @param {string | JSON} schema - JSON schema
     * @returns `Promise<Array<string>>`
     */
    static async extractCredentialSubjectProperties(schema) {
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
    static async getLdPrefixesByJSONSchema(schema) {
        const metadata = Parser.extractMetadata(schema);
        const ldURL = metadata.uris['jsonLdContext'];
        if (!ldURL) {
            throw new Error('jsonLdContext is not set');
        }
        const props = await Parser.extractCredentialSubjectProperties(schema);
        let jsonLdContext;
        try {
            const response = await fetch(ldURL);
            jsonLdContext = await response.json();
        }
        catch (e) {
            throw new Error(`failed to fetch jsonLdContext ${e}`);
        }
        let prefixes;
        try {
            prefixes = await LDParser.getPrefixes(jsonLdContext, false, props);
        }
        catch (e) {
            throw new Error(`failed to extract terms from jsonLdContext ${e}`);
        }
        return prefixes;
    }
}
//# sourceMappingURL=parser.js.map