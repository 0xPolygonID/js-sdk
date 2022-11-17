import { Iden3Credential } from '../verifiable/credential';
import { Claim } from '@iden3/js-iden3-core';
import { ParsedSlots, ParsingStrategy } from '../processor';
import { Parser } from '../parser.base';
import { checkDataInField, fieldToByteArray, fillClaimSlots } from '../utils';
import { ClaimContext, getClaimContext } from './claim';

export enum Serialization {
  IndexType = 'serialization:Index',
  IndexDataSlotAType = 'serialization:IndexDataSlotA',
  IndexDataSlotBType = 'serialization:IndexDataSlotB',
  ValueType = 'serialization:Value',
  ValueDataSlotAType = 'serialization:ValueDataSlotA',
  ValueDataSlotBType = 'serialization:ValueDataSlotB'
}

export class JSonLDParser extends Parser {
  constructor(public readonly claimType: string, public readonly parsingStrategy: ParsingStrategy) {
    super();
  }

  parseClaim(credential: Iden3Credential, schemaBytes: Uint8Array): Claim {
    const credentialSubject = credential.credentialSubject;

    const credentialType = credential.credentialSubject.get('type');
    const subjectId = credential.credentialSubject.get('id');

    credential.credentialSubject.delete('type');
    credential.credentialSubject.delete('id');

    const credentialSubjectBytes: Uint8Array = new TextEncoder().encode(
      JSON.stringify(credentialSubject)
    );

    const slots = this.parseSlots(credentialSubjectBytes, schemaBytes);

    // const claim = core.NewClaim(
    // 	utils.CreateSchemaHash(schemaBytes, credentialType),
    // 	core.WithIndexDataBytes(slots.indexA, slots.IndexB),
    // 	core.WithValueDataBytes(slots.ValueA, slots.ValueB),
    // 	core.WithRevocationNonce(credential.RevNonce),
    // 	core.WithVersion(credential.Version))
    // if err != nil {
    // 	return nil
    // }
    // if credential.Expiration != nil {
    // 	claim.SetExpirationDate(*credential.Expiration)
    // }

    // if subjectID != nil {
    // 	var did *core.DID
    // 	did = core.ParseDID(fmt.Sprintf("%v", subjectID))
    // 	if err != nil {
    // 		return nil
    // 	}

    // 	switch credential.SubjectPosition {
    // 	case "", utils.SubjectPositionIndex:
    // 		claim.SetIndexID(did.ID)
    // 	case utils.SubjectPositionValue:
    // 		claim.SetValueID(did.ID)
    // 	default:
    // 		return nilors.New("unknown subject position")
    // 	}

    // }

    // return claim, nil
  }

  parseSlots(data: Uint8Array, schema: Uint8Array): ParsedSlots {
    const claimContext = getClaimContext(this.claimType, schema);

    switch (this.parsingStrategy) {
      case ParsingStrategy.SlotFullfilmentStrategy:
        return this.fillSlots(data, claimContext);
      case ParsingStrategy.OneFieldPerSlotStrategy:
        return this.assignSlots(data, claimContext);
      default:
        throw new Error('Claim parsing strategy is not specified');
    }
  }

  sortFields(ctx: ClaimContext): { indexFields: string[]; valueFields: string[] } {
    const indexFields: string[] = [];
    const valueFields: string[] = [];
    for (const [k, v] of ctx.fields) {
      switch (v['@type']) {
        case Serialization.IndexType:
        case Serialization.IndexDataSlotAType:
        case Serialization.IndexDataSlotBType:
          indexFields.push(k);
          break;
        case (Serialization.ValueType,
        Serialization.ValueDataSlotAType,
        Serialization.ValueDataSlotBType):
          valueFields.push(k);
          break;
        default:
          throw new Error('Claim parsing strategy is not specified');
      }
    }
    // fields must be presented in circuit in alphabetical order
    indexFields.sort((a, b) => a.localeCompare(b));
    valueFields.sort((a, b) => a.localeCompare(b));

    return { indexFields, valueFields };
  }

  // FillSlots fills slots sequentially
  fillSlots(data: Uint8Array, ctx: ClaimContext): ParsedSlots {
    const { indexFields, valueFields } = this.sortFields(ctx);

    const preparedData = new Map<string, unknown>();
    let extendedData: Map<string, Map<string, unknown>>;
    // Todo: check if this is correct
    try {
      extendedData = JSON.parse(new TextDecoder().decode(data));
      // that means that data is presented in the extended format (each field has a detailed description how it should be processed)
      const positionedIndexes: string[] = [];

      for (const fieldName of indexFields) {
        const position = parseInt(extendedData[fieldName]['position']);
        if (!isNaN(position)) {
          throw new Error('position is not found');
        }
        positionedIndexes[position] = fieldName;
        preparedData[fieldName] = extendedData[fieldName]['data'];
      }
      const positionedValues: string[] = [];

      for (const fieldName of valueFields) {
        const position = parseInt(extendedData[fieldName]['position']);
        if (!isNaN(position)) {
          throw new Error('position is not found');
        }
        positionedValues[position] = fieldName;
        preparedData[fieldName] = extendedData[fieldName]['data'];
      }

      const preparedDataBytes = new TextEncoder().encode(JSON.stringify(preparedData));
      return fillClaimSlots(preparedDataBytes, positionedIndexes, positionedValues);
    } catch (e) {
      return fillClaimSlots(data, indexFields, valueFields);
    }
  }

  // AssignSlots adds content to claim slots according its specification slot
  assignSlots(content: Uint8Array, ctx: ClaimContext): ParsedSlots {
    const result: ParsedSlots = {
      indexA: new Uint8Array(),
      indexB: new Uint8Array(),
      valueA: new Uint8Array(),
      valueB: new Uint8Array()
    };

    const data: Map<string, unknown> = JSON.parse(new TextDecoder().decode(content));

    for (const [k, v] of ctx.fields) {
      const fieldBytes = fieldToByteArray(data[k]);
      if (checkDataInField(fieldBytes)) {
        switch (v['@type']) {
          case Serialization.IndexDataSlotAType:
            if (result.indexA.length === 0) {
              result.indexA = Uint8Array.from([...result.indexA, ...fieldBytes]);
            } else {
              throw new Error(
                `${Serialization.IndexDataSlotAType} slot, can't be used twice in one claim schema`
              );
            }
            break;
          case Serialization.IndexDataSlotBType:
            if (result.indexB.length === 0) {
              result.indexB = Uint8Array.from([...result.indexB, ...fieldBytes]);
            } else {
              throw new Error(
                `${Serialization.IndexDataSlotBType} slot, can't be used twice in one claim schema`
              );
            }
            break;
          case Serialization.ValueDataSlotAType:
            if (result.valueA.length === 0) {
              result.valueA = Uint8Array.from([...result.valueA, ...fieldBytes]);
            } else {
              throw new Error(
                `${Serialization.ValueDataSlotAType} slot, can't be used twice in one claim schema`
              );
            }
            break;
          case Serialization.ValueDataSlotBType:
            if (result.valueB.length === 0) {
              result.valueB = Uint8Array.from([...result.valueB, ...fieldBytes]);
            } else {
              throw new Error(
                `${Serialization.ValueDataSlotAType} slot, can't be used twice in one claim schema`
              );
            }
            break;
          default:
            throw new Error(`field type is not supported :${v['@type']}`);
        }
      } else {
        throw new Error('data from payload is not in Q field');
      }
    }
    return result;
  }
}
