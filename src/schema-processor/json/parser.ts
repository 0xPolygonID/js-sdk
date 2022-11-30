import { Iden3Credential, MerklizedRootPosition, SubjectPosition } from '../verifiable';
import { Claim as CoreClaim, ClaimOptions, DID, SchemaHash } from '@iden3/js-iden3-core';
import { ParsedSlots } from '../processor';
import { fillSlot } from '../utils';

export interface SerializationSchema {
  indexDataSlotA: string;
  indexDataSlotB: string;
  valueDataSlotA: string;
  valueDataSlotB: string;
}

export interface SchemaMetadata {
  uris: { [key: string]: any };
  serialization?: SerializationSchema;
}

export interface Schema {
  $metadata?: SchemaMetadata;
  $schema: string;
  type: string;
}

// Parser can parse claim data according to specification
export class Parser {
  parseClaim(
    credential: Iden3Credential,
    credentialType: string,
    jsonSchemaBytes: Uint8Array
  ): CoreClaim {
    const subjectId = credential.credentialSubject['id'];

    const slots = this.parseSlots(credential, jsonSchemaBytes);

    const claim = CoreClaim.newClaim(
      new SchemaHash(new TextEncoder().encode(credentialType)),
      ClaimOptions.withIndexDataBytes(slots.indexA, slots.indexB),
      ClaimOptions.withValueDataBytes(slots.valueA, slots.valueB),
      ClaimOptions.withRevocationNonce(credential.revNonce),
      ClaimOptions.withVersion(credential.version)
    );
    if (credential.expirationDate) {
      claim.setExpirationDate(new Date(credential.expirationDate));
    }
    if (subjectId) {
      const did = DID.parse(subjectId);

      switch (credential.subjectPosition) {
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

    switch (credential.merklizedRootPosition) {
      case MerklizedRootPosition.Index:
        claim.setIndexMerklizedRoot(credential.merklize().root().bigInt());
        break;
      case MerklizedRootPosition.Value:
        claim.setValueMerklizedRoot(credential.merklize().root().bigInt());
        break;
      case MerklizedRootPosition.None:
        break;
      default:
        throw new Error('unknown merklized root position');
    }

    return claim;
  }

  // ParseSlots converts payload to claim slots using provided schema
  parseSlots(credential: Iden3Credential, schemaBytes: Uint8Array): ParsedSlots {
    const schema: Schema = JSON.parse(new TextDecoder().decode(schemaBytes));

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
  assignSlots(data: { [key: string]: unknown }, schema: SerializationSchema): ParsedSlots {
    const result: ParsedSlots = {
      indexA: new Uint8Array(32),
      indexB: new Uint8Array(32),
      valueA: new Uint8Array(32),
      valueB: new Uint8Array(32)
    };

    result.indexA = fillSlot(data, schema.indexDataSlotA);
    result.indexB = fillSlot(data, schema.indexDataSlotB);
    result.valueA = fillSlot(data, schema.valueDataSlotB);
    result.valueB = fillSlot(data, schema.valueDataSlotB);

    return result;
  }

  // GetFieldSlotIndex return index of slot from 0 to 7 (each claim has by default 8 slots)

  getFieldSlotIndex(field: string, schemaBytes: Uint8Array): number {
    const schema: Schema = JSON.parse(new TextDecoder().decode(schemaBytes));
    if (schema?.$metadata?.serialization) {
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
}
