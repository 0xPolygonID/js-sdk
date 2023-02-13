// or ESM/TypeScript import
import Ajv from 'ajv';

/**
 * JSON Schema Validator
 *
 * @export
 * @beta
 * @class JsonSchemaValidator
 */
export class JsonSchemaValidator {
  private _ajv: Ajv.Ajv;
  /**
   * Creates an instance of JsonSchemaValidator.
   */
  constructor() {
    this._ajv = new Ajv({ logger: false });
  }
  /**
   * Validate data according to the given schema
   *
   * @param {Uint8Array} dataB - payload to validate
   * @param {Uint8Array} schemaB - schema to process
   * @returns Promise<boolean>
   */
  async validate(dataB: Uint8Array, schemaB: Uint8Array): Promise<boolean> {
    const schema = JSON.parse(new TextDecoder().decode(schemaB));
    const data = JSON.parse(new TextDecoder().decode(dataB));
    const validate = this._ajv.compile(schema);
    const valid = await validate(data);
    if (!valid) {
      throw new Error(validate.errors?.map((e) => e.message).join(', '));
    }
    return true;
  }
}
