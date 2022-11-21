// or ESM/TypeScript import
import Ajv from 'ajv';

export class JsonSchemaValidator {
  private _ajv: Ajv.Ajv;
  constructor() {
    this._ajv = new Ajv({ logger: false });
  }
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
