import Ajv from 'ajv';
import Ajv2020 from 'ajv/dist/2020';
import Ajv2019 from 'ajv/dist/2019';
/** JSON SCHEMA VALIDATOR REGISTRY */
export declare const JSON_SCHEMA_VALIDATORS_REGISTRY: {
    'http://json-schema.org/draft-07/schema': Ajv;
    'https://json-schema.org/draft/2019-09/schema': Ajv2019;
    'https://json-schema.org/draft/2020-12/schema': Ajv2020;
};
/**
 * JSON Schema Validator
 *
 * @public
 * @class JsonSchemaValidator
 */
export declare class JsonSchemaValidator {
    /**
     * Validate data according to the given schema
     *
     * @param {Uint8Array} dataBytes - payload to validate
     * @param {Uint8Array} schemaBytes - schema to process
     * @returns `Promise<boolean>`
     */
    validate(dataBytes: Uint8Array, schemaBytes: Uint8Array): Promise<boolean>;
}
