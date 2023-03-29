import { JsonSchemaValidator, LDParser, Parser } from '../../src/schema-processor';
import { DIDDocumentJSONSchema } from '../../src/verifiable';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import listOfLDContexts from './data/list-of-ld-contexts.json'
import listWithSingleLDContext from './data/list-with-single-ld-context.json'
import singleLDContextV2 from './data/single-ld-context-2.json'
import singleLDContext from './data/single-ld-context.json'
import kyc from './data/kyc.json'
chai.use(chaiAsPromised);
const { expect } = chai;

describe('json validator', () => {
  it('test validator validate', async () => {
    const jsonDIDDocument = `{"service":[{"id":"did:example:123#linked-domain","type":"LinkedDomains","serviceEndpoint":"https://bar.example.com"},{"id":"did:example:123#linked-domain","type":"push-notification","metadata":{"devices":[{"ciphertext":"base64encoded","alg":"rsa"}]},"serviceEndpoint":"https://bar.example.com"}],"id":"did:example:123#linked-domain"}`;
    const v = new JsonSchemaValidator();
    const jsonDIDDocumentBytes = new TextEncoder().encode(jsonDIDDocument);
    const dataBytes = new TextEncoder().encode(DIDDocumentJSONSchema);
    const result = await v.validate(jsonDIDDocumentBytes, dataBytes);
    expect(!!result).to.be.true;
  });

  it('test validator validateNoTypeInService', () => {
    // no type in did document service
    const jsonDIDDocument = `{"service":[{"id":"did:example:123#linked-domain","serviceEndpoint":"https://bar.example.com"},{"id":"did:example:123#linked-domain","type":"push-notification","metadata":{"devices":[{"ciphertext":"base64encoded","alg":"rsa"}]},"serviceEndpoint":"https://bar.example.com"}],"id":"did:example:123#linked-domain"}`;

    const v = new JsonSchemaValidator();
    const jsonDIDDocumentBytes = new TextEncoder().encode(jsonDIDDocument);
    const dataBytes = new TextEncoder().encode(DIDDocumentJSONSchema);
    expect(v.validate(jsonDIDDocumentBytes, dataBytes)).to.be.rejectedWith(
      "should have required property 'type'"
    );
  });

  it('test validator validateNoIDinDocument', () => {
    // no type in did document service
    const jsonDIDDocument = `{"service":[{"id":"did:example:123#linked-domain","type":"LinkedDomains","serviceEndpoint":"https://bar.example.com"},{"id":"did:example:123#linked-domain","type":"push-notification","metadata":{"devices":[{"ciphertext":"base64encoded","alg":"rsa"}]},"serviceEndpoint":"https://bar.example.com"}]}`;
    const v = new JsonSchemaValidator();
    const jsonDIDDocumentBytes = new TextEncoder().encode(jsonDIDDocument);
    const dataBytes = new TextEncoder().encode(DIDDocumentJSONSchema);
    expect(v.validate(jsonDIDDocumentBytes, dataBytes)).to.be.rejectedWith(
      "should have required property 'id'"
    );
  });
});

describe('get types from jsonld schema', () => {
  it('with list of ld contexts', async () => {
    const data: string = JSON.stringify(listOfLDContexts);
    const res = await LDParser.extractTerms(data) 
    const types = LDParser.getPrefixes(res, false)

    const e: Map<string, string> = new Map([
      ['KYCAgeCredential', 'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld#KYCAgeCredential'],
      ['KYCCountryOfResidenceCredential', 'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld#KYCCountryOfResidenceCredential'],
      ['KYCEmployee', 'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld#KYCEmployee']
    ]);

    expect(types).deep.eq(e)
  })
  it('with list with single ld contexts', async () => {
    const data: string = JSON.stringify(listWithSingleLDContext);
    const res = await LDParser.extractTerms(data) 
    const types = LDParser.getPrefixes(res, false)

    const e: Map<string, string> = new Map([
      ['KYCAgeCredential', 'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld#KYCAgeCredential'],
    ]);

    expect(types).deep.eq(e)
  })
  it('single ld contexts v2', async () => {
    const data: string = JSON.stringify(singleLDContextV2);
    const res = await LDParser.extractTerms(data) 
    const types = LDParser.getPrefixes(res, false)

    const e: Map<string, string> = new Map([
      ['VerifiableCredential', 'https://www.w3.org/2018/credentials#VerifiableCredential'],
      ['VerifiablePresentation', 'https://www.w3.org/2018/credentials#VerifiablePresentation'],
      ['EcdsaSecp256k1Signature2019', 'https://w3id.org/security#EcdsaSecp256k1Signature2019'],
      ['EcdsaSecp256r1Signature2019', 'https://w3id.org/security#EcdsaSecp256r1Signature2019'],
      ['Ed25519Signature2018', 'https://w3id.org/security#Ed25519Signature2018'],
      ['RsaSignature2018', 'https://w3id.org/security#RsaSignature2018'],
      ['proof', 'https://w3id.org/security#proof'],
    ]);

    expect(types).deep.eq(e)
  })
  it('single ld contexts', async () => {
    const data: string = JSON.stringify(singleLDContext);
    const res = await LDParser.extractTerms(data) 
    const types = LDParser.getPrefixes(res, false)

    const e: Map<string, string> = new Map([
      ['KYCAgeCredential', 'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld#KYCAgeCredential'],
    ]);

    expect(types).deep.eq(e)
  });
});

describe('extract jsonld types by json schema', () => {
  it('with list of ld contexts', async () => {
    const data: string = JSON.stringify(kyc);
    const metadata = Parser.extractMetadata(data);
    const ldURL = metadata.uris['jsonLdContext']
  
    const response = await fetch(ldURL)
    const ldContext = await response.json()
    const ldStr = JSON.stringify(ldContext)
  
    const res = await LDParser.extractTerms(ldStr)
    const types = LDParser.getPrefixes(res, false)
  
    const e: Map<string, string> = new Map([
      ['KYCAgeCredential', 'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld#KYCAgeCredential'],
      ['KYCCountryOfResidenceCredential', 'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld#KYCCountryOfResidenceCredential'],
      ['KYCEmployee', 'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld#KYCEmployee']
    ]);
  
    expect(types).deep.eq(e)
  })
});
