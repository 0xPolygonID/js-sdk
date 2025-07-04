/* eslint-disable @typescript-eslint/no-floating-promises */
import { DIDDocumentJSONSchema, JsonSchemaValidator, byteEncoder } from '../../src';
import { describe, expect, it, beforeEach } from 'vitest';

import { cred07, cred20, schema07, schema2020 } from './data/json-validator-data';

describe('json validator', () => {
  it('test validator validate', async () => {
    const jsonDIDDocument = `{"service":[{"id":"did:example:123#linked-domain","type":"LinkedDomains","serviceEndpoint":"https://bar.example.com"},{"id":"did:example:123#linked-domain","type":"push-notification","metadata":{"devices":[{"ciphertext":"base64encoded","alg":"rsa"}]},"serviceEndpoint":"https://bar.example.com"}],"id":"did:example:123#linked-domain"}`;
    const v = new JsonSchemaValidator();
    const jsonDIDDocumentBytes = byteEncoder.encode(jsonDIDDocument);
    const dataBytes = byteEncoder.encode(DIDDocumentJSONSchema);
    const result = await v.validate(jsonDIDDocumentBytes, dataBytes);
    expect(result).to.be.true;
  });

  it('test validator validateNoTypeInService', async () => {
    // no type in did document service
    const jsonDIDDocument = `{"service":[{"id":"did:example:123#linked-domain","serviceEndpoint":"https://bar.example.com"},{"id":"did:example:123#linked-domain","type":"push-notification","metadata":{"devices":[{"ciphertext":"base64encoded","alg":"rsa"}]},"serviceEndpoint":"https://bar.example.com"}],"id":"did:example:123#linked-domain"}`;

    const v = new JsonSchemaValidator();
    const jsonDIDDocumentBytes = byteEncoder.encode(jsonDIDDocument);
    const dataBytes = byteEncoder.encode(DIDDocumentJSONSchema);
    await expect(v.validate(jsonDIDDocumentBytes, dataBytes)).rejects.toThrow(
      "must have required property 'type'"
    );
  });

  it('test validator validateNoIDinDocument', async () => {
    // no type in did document service
    const jsonDIDDocument = `{"service":[{"id":"did:example:123#linked-domain","type":"LinkedDomains","serviceEndpoint":"https://bar.example.com"},{"id":"did:example:123#linked-domain","type":"push-notification","metadata":{"devices":[{"ciphertext":"base64encoded","alg":"rsa"}]},"serviceEndpoint":"https://bar.example.com"}]}`;
    const v = new JsonSchemaValidator();
    const jsonDIDDocumentBytes = byteEncoder.encode(jsonDIDDocument);
    const dataBytes = byteEncoder.encode(DIDDocumentJSONSchema);
    await expect(v.validate(jsonDIDDocumentBytes, dataBytes)).rejects.toThrow(
      "must have required property 'id'"
    );
  });
  it('TestValidator_ValidateDraft07', async () => {
    const v = new JsonSchemaValidator();
    const result = await v.validate(byteEncoder.encode(cred07), byteEncoder.encode(schema07));
    expect(result).to.be.true;
  });

  it('TestValidator_ValidateDraft2020', async () => {
    const v = new JsonSchemaValidator();
    const result = await v.validate(byteEncoder.encode(cred20), byteEncoder.encode(schema2020));
    expect(result).to.be.true;
  });

  it('TestValidatorWithInvalidField', async () => {
    const schema = byteEncoder.encode(
      '{"type":"object","required":["documentType","birthday"],"properties":{"documentType":{"type":"integer"},"birthday":{"type":"integer"}}}'
    );

    const data = byteEncoder.encode(`{"documentType": 1}`);
    const validator = new JsonSchemaValidator();
    await expect(validator.validate(data, schema)).rejects.toThrow(
      `must have required property 'birthday'`
    );
  });
});
