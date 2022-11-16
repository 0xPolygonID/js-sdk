// SerializationField represents fields that rather must be parsed to value or index
export interface SerializationField {
  '@id': string;
  '@type': string;
}

// ClaimBasicContext is representation of default fields for claim schema
export interface ClaimBasicContext {
  '@version': number;
  '@protected': boolean;
  id: string;
  type: string;
}

// SchemaContext is top-level wrapper of json-ld schema
export interface SchemaContext {
  '@context': Map<string, unknown>[];
}

// ClaimContext all parsed fields of ClaimSchema
export interface ClaimContext extends ClaimBasicContext {
  fields: Map<string, SerializationField>;
  vocab: Map<string, string>;
}

export interface ClaimSchema {
  '@id': string;
  '@context': Map<string, unknown>;
}

export function getClaimContext(claimType: string, schema: Uint8Array): ClaimContext {
  const schemaContext: SchemaContext = JSON.parse(new TextDecoder().decode(schema));

  let claimSchemaData: ClaimSchema | null = null;

  for (const map of schemaContext['@context']) {
    // todo: check conversion to string

    const data = map.get(claimType);
    if (!data) {
      continue;
    } else {
      claimSchemaData = data as ClaimSchema;
      break;
    }
  }

  if (!claimSchemaData) {
    throw new Error('no type in provided schema');
  }

  const claimContext: ClaimContext = {
    id: claimSchemaData['@context']['@id'],
    '@protected': claimSchemaData['@context']['@protected'],
    '@version': claimSchemaData['@context']['@version'],
    type: claimSchemaData['@context']['@type'],
    fields: new Map<string, SerializationField>(),
    vocab: new Map<string, string>()
  };

  for (const [k, v] of claimSchemaData['@context']) {
    if (typeof v === 'object') {
      claimContext.fields.set(k, v as SerializationField);
    }
    if (typeof v === 'string') {
      if (['id', '@protected', 'type', '@version'].includes(k)) {
        claimContext.vocab.set(k, v);
      }
    }
  }

  return claimContext;
}
