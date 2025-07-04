import { BytesHelper, SchemaHash } from '@iden3/js-iden3-core';
import { Merklizer, Options, Path } from '@iden3/js-jsonld-merklization';
import { byteDecoder, hexToBytes } from '../utils';
import jsonld from 'jsonld';
import { keccak256 } from 'ethers';

const credentialSubjectKey = 'credentialSubject';
const contextFullKey = '@context';
const serializationFullKey = 'iden3_serialization';
const fieldPrefix = 'iden3:v1:';
const credentialSubjectFullKey = 'https://www.w3.org/2018/credentials#credentialSubject';
const verifiableCredentialFullKey = 'https://www.w3.org/2018/credentials#VerifiableCredential';
const typeFullKey = '@type';

type ParsedCtx = { mappings: Map<string, Record<string, unknown>> };

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
export const getFieldSlotIndex = async (
  field: string,
  typeName: string,
  schemaBytes: Uint8Array
): Promise<number> => {
  let ctxDoc = JSON.parse(byteDecoder.decode(schemaBytes));
  ctxDoc = ctxDoc[contextFullKey];
  if (ctxDoc === undefined) {
    throw new Error('document has no @context');
  }

  const ldCtx = await jsonld.processContext(
    await jsonld.processContext(null, null, {}),
    ctxDoc,
    {}
  );

  const serAttr = await getSerializationAttrFromParsedContext(
    ldCtx as unknown as ParsedCtx,
    typeName
  );

  if (!serAttr) {
    throw new Error('serialization attribute is not set');
  }

  const sPaths = parseSerializationAttr(serAttr);

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
};

/**
 * checks if data can fill the slot
 *
 * @param {Uint8Array} slotData - slot data
 * @param {Merklizer} mz - merklizer
 * @param {string} path - path
 * @returns {void}
 */
export const fillCoreClaimSlot = async (
  slotData: Uint8Array,
  mz: Merklizer,
  path: string
): Promise<void> => {
  if (!path) {
    return;
  }

  path = credentialSubjectKey + '.' + path;

  try {
    const p = await mz.resolveDocPath(path, mz.options);
    const entry = await mz.entry(p);
    const intVal = await entry.getValueMtEntry();

    const bytesVal = BytesHelper.intToBytes(intVal);
    slotData.set(bytesVal, 0);
  } catch (err: unknown) {
    if ((err as Error).toString().includes('entry not found')) {
      throw new Error(`field not found in credential ${path}`);
    }

    throw err;
  }
};

// Get `iden3_serialization` attr definition from context document either using
// type name like DeliverAddressMultiTestForked or by type id like
// urn:uuid:ac2ede19-b3b9-454d-b1a9-a7b3d5763100.
export const getSerializationAttrFromContext = async (
  context: object,
  opts: Options,
  tp: string
): Promise<string> => {
  const ldCtx = await jsonld.processContext(
    await jsonld.processContext(null, null, {}),
    context,
    opts
  );

  return getSerializationAttrFromParsedContext(ldCtx as unknown as ParsedCtx, tp);
};

export const getSerializationAttrFromParsedContext = async (
  ldCtx: ParsedCtx,
  tp: string
): Promise<string> => {
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

  const serStr = (termCtx as Record<string, string>)[serializationFullKey] ?? '';
  return serStr;
};

export const parseSerializationAttr = (serAttr: string): CoreClaimSlotsPaths => {
  if (!serAttr.startsWith(fieldPrefix)) {
    throw new Error('serialization attribute does not have correct prefix');
  }
  const parts = serAttr.slice(fieldPrefix.length).split('&');
  if (parts.length > 4) {
    throw new Error('serialization attribute has too many parts');
  }

  const paths = {} as CoreClaimSlotsPaths;
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
};

export const findCredentialType = (mz: Merklizer): string => {
  const opts = mz.options;

  try {
    // try to look into credentialSubject.@type to get type of credentials
    const path1 = new Path([credentialSubjectFullKey, typeFullKey], opts.hasher);
    const e = mz.rawValue(path1);
    return e as string;
  } catch (err) {
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
};

/**
 * parseCoreClaimSlots converts payload to claim slots using provided schema
 *
 * @param { { mappings: Map<string, Record<string, unknown>> } } ldCtx - ldCtx
 * @param {Merklizer} mz - Merklizer
 * @param {string} credentialType - credential type
 * @returns `Promise<{ slots: ParsedSlots; nonMerklized: boolean }>`
 */
export const parseCoreClaimSlots = async (
  ldCtx: { mappings: Map<string, Record<string, unknown>> },
  mz: Merklizer,
  credentialType: string
): Promise<{ slots: CoreClaimParsedSlots; nonMerklized: boolean }> => {
  // parseSlots converts payload to claim slots using provided schema

  const slots = {
    indexA: new Uint8Array(32),
    indexB: new Uint8Array(32),
    valueA: new Uint8Array(32),
    valueB: new Uint8Array(32)
  };

  const serAttr = await getSerializationAttrFromParsedContext(ldCtx, credentialType);

  if (!serAttr) {
    return { slots, nonMerklized: false };
  }

  const sPaths = parseSerializationAttr(serAttr);
  const isSPathEmpty = !Object.values(sPaths).some(Boolean);
  if (isSPathEmpty) {
    return { slots, nonMerklized: true };
  }

  await fillCoreClaimSlot(slots.indexA, mz, sPaths.indexAPath);

  await fillCoreClaimSlot(slots.indexB, mz, sPaths.indexBPath);

  await fillCoreClaimSlot(slots.valueA, mz, sPaths.valueAPath);

  await fillCoreClaimSlot(slots.valueB, mz, sPaths.valueBPath);

  return { slots, nonMerklized: true };
};

/**
 * Calculates core schema hash
 *
 * @param {Uint8Array} schemaId
 * @returns {*}  {SchemaHash}
 */
export const calculateCoreSchemaHash = (schemaId: Uint8Array): SchemaHash => {
  const sHash = hexToBytes(keccak256(schemaId));
  return new SchemaHash(sHash.slice(sHash.length - 16, sHash.length));
};
