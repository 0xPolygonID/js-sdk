import { MerklizedRootPosition, SubjectPosition } from '../../verifiable';
import { Claim as CoreClaim, ClaimOptions, DID } from '@iden3/js-iden3-core';
import { createSchemaHash, fillSlot } from '../utils';
import { byteDecoder, byteEncoder } from '../../utils';
import { Path } from '@iden3/js-jsonld-merklization';
import * as jsonld from 'jsonld/lib';
import * as ldcontext from 'jsonld/lib/context';
const credentialSubjectFullKey = 'https://www.w3.org/2018/credentials#credentialSubject';
const verifiableCredentialFullKey = 'https://www.w3.org/2018/credentials#VerifiableCredential';
const typeFullKey = '@type';
const contextFullKey = '@context';
const serializationFullKey = 'iden3_serialization';
const fieldPrefix = 'iden3:v1:';
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
     * @param {CoreClaimOptions} [opts] - options to parse core claim
     * @returns `Promise<CoreClaim>`
     */
    static async parseClaim(credential, opts) {
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
        const mz = await credential.merklize(opts.merklizeOpts);
        const credentialType = Parser.findCredentialType(mz);
        const subjectId = credential.credentialSubject['id'];
        const { slots, nonMerklized } = await this.parseSlots(mz, credential, credentialType);
        // if schema is for non merklized credential, root position must be set to none ('')
        // otherwise default position for merklized position is index.
        if (nonMerklized && opts.merklizedRootPosition !== MerklizedRootPosition.None) {
            throw new Error('merklized root position is not supported for non-merklized claims');
        }
        if (!nonMerklized && opts.merklizedRootPosition === MerklizedRootPosition.None) {
            opts.merklizedRootPosition = MerklizedRootPosition.Index;
        }
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
    static findCredentialType(mz) {
        const opts = mz.options;
        try {
            // try to look into credentialSubject.@type to get type of credentials
            const path1 = new Path([credentialSubjectFullKey, typeFullKey], opts.hasher);
            const e = mz.rawValue(path1);
            return e;
        }
        catch (err) {
            // if type of credentials not found in credentialSubject.@type, loop at
            // top level @types if it contains two elements: type we are looking for
            // and "VerifiableCredential" type.
            const path2 = new Path([typeFullKey], opts.hasher);
            const topLevelTypes = mz.rawValue(path2);
            if (!Array.isArray(topLevelTypes)) {
                throw new Error('top level @type expected to be an array');
            }
            if (topLevelTypes.length !== 2) {
                throw new Error('top level @type expected to be of length 2');
            }
            switch (verifiableCredentialFullKey) {
                case topLevelTypes[0]:
                    return topLevelTypes[1];
                case topLevelTypes[1]:
                    return topLevelTypes[0];
                default:
                    throw new Error('@type(s) are expected to contain VerifiableCredential type');
            }
        }
    }
    // Get `iden3_serialization` attr definition from context document either using
    // type name like DeliverAddressMultiTestForked or by type id like
    // urn:uuid:ac2ede19-b3b9-454d-b1a9-a7b3d5763100.
    static async getSerializationAttr(credential, opts, tp) {
        // const ctx = ldcontext.getInitialContext({}), data, {});
        const ldCtx = await jsonld.processContext(ldcontext.getInitialContext({}), credential['@context'], opts);
        return Parser.getSerializationAttrFromParsedContext(ldCtx, tp);
    }
    static async getSerializationAttrFromParsedContext(ldCtx, tp) {
        const termDef = ldCtx.mappings;
        if (!termDef) {
            throw new Error('terms definitions is not of correct type');
        }
        const term = termDef.get(tp) ?? [...termDef.values()].find((value) => value['@id'] === tp);
        if (!term) {
            return '';
        }
        const termCtx = term[contextFullKey];
        if (!termCtx) {
            throw new Error('type @context is not of correct type');
        }
        const serStr = termCtx[serializationFullKey] ?? '';
        return serStr;
    }
    static parseSerializationAttr(serAttr) {
        if (!serAttr.startsWith(fieldPrefix)) {
            throw new Error('serialization attribute does not have correct prefix');
        }
        const parts = serAttr.slice(fieldPrefix.length).split('&');
        if (parts.length > 4) {
            throw new Error('serialization attribute has too many parts');
        }
        const paths = {};
        for (const part of parts) {
            const kv = part.split('=');
            if (kv.length !== 2) {
                throw new Error('serialization attribute part does not have correct format');
            }
            switch (kv[0]) {
                case 'slotIndexA':
                    paths.indexAPath = kv[1];
                    break;
                case 'slotIndexB':
                    paths.indexBPath = kv[1];
                    break;
                case 'slotValueA':
                    paths.valueAPath = kv[1];
                    break;
                case 'slotValueB':
                    paths.valueBPath = kv[1];
                    break;
                default:
                    throw new Error('unknown serialization attribute slot');
            }
        }
        return paths;
    }
    /**
     * ParseSlots converts payload to claim slots using provided schema
     *
     * @param {Merklizer} mz - Merklizer
     * @param {W3CCredential} credential - Verifiable Credential
     * @param {string} credentialType - credential type
     * @returns `ParsedSlots`
     */
    static async parseSlots(mz, credential, credentialType) {
        // parseSlots converts payload to claim slots using provided schema
        const slots = {
            indexA: new Uint8Array(32),
            indexB: new Uint8Array(32),
            valueA: new Uint8Array(32),
            valueB: new Uint8Array(32)
        };
        const jsonLDOpts = mz.options;
        const serAttr = await Parser.getSerializationAttr(credential, jsonLDOpts, credentialType);
        if (!serAttr) {
            return { slots, nonMerklized: false };
        }
        const sPaths = Parser.parseSerializationAttr(serAttr);
        const isSPathEmpty = !Object.values(sPaths).some(Boolean);
        if (isSPathEmpty) {
            return { slots, nonMerklized: true };
        }
        await fillSlot(slots.indexA, mz, sPaths.indexAPath);
        await fillSlot(slots.indexB, mz, sPaths.indexBPath);
        await fillSlot(slots.valueA, mz, sPaths.valueAPath);
        await fillSlot(slots.valueB, mz, sPaths.valueBPath);
        return { slots, nonMerklized: true };
    }
    /**
     * GetFieldSlotIndex return index of slot from 0 to 7 (each claim has by default 8 slots) for non-merklized claims
     *
     * @param {string} field - field name
     * @param {Uint8Array} schemaBytes -json schema bytes
     * @returns `number`
     */
    static async getFieldSlotIndex(field, typeName, schemaBytes) {
        let ctxDoc = JSON.parse(byteDecoder.decode(schemaBytes));
        ctxDoc = ctxDoc[contextFullKey];
        if (ctxDoc === undefined) {
            throw new Error('document has no @context');
        }
        const ldCtx = await jsonld.processContext(ldcontext.getInitialContext({}), ctxDoc, {});
        const serAttr = await Parser.getSerializationAttrFromParsedContext(ldCtx, typeName);
        if (!serAttr) {
            throw new Error('serialization attribute is not set');
        }
        const sPaths = Parser.parseSerializationAttr(serAttr);
        switch (field) {
            case sPaths.indexAPath:
                return 2;
            case sPaths.indexBPath:
                return 3;
            case sPaths.valueAPath:
                return 6;
            case sPaths.valueBPath:
                return 7;
            default:
                throw new Error(`field ${field} not specified in serialization info`);
        }
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
}
//# sourceMappingURL=parser.js.map