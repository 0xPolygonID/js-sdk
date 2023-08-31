/* eslint-disable @typescript-eslint/no-floating-promises */
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import listOfLDContexts from './data/list-of-ld-contexts.json';
import listWithSingleLDContext from './data/list-with-single-ld-context.json';
import singleLDContextV2 from './data/single-ld-context-2.json';
import singleLDContext from './data/single-ld-context.json';
import { LDParser } from '../../src';
chai.use(chaiAsPromised);
const { expect } = chai;
describe('get types from jsonld schema', () => {
  it('with list of ld contexts', async () => {
    const context: string = JSON.stringify(listOfLDContexts);
    const prefixes = await LDParser.getPrefixes(context, false);

    const e: Map<string, string> = new Map([
      [
        'KYCAgeCredential',
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld#KYCAgeCredential'
      ],
      [
        'KYCCountryOfResidenceCredential',
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld#KYCCountryOfResidenceCredential'
      ],
      [
        'KYCEmployee',
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld#KYCEmployee'
      ]
    ]);

    expect(prefixes).deep.eq(e);
  });
  it('with list with single ld contexts', async () => {
    const context: string = JSON.stringify(listWithSingleLDContext);
    const prefixes = await LDParser.getPrefixes(context, false);

    const e: Map<string, string> = new Map([
      [
        'KYCAgeCredential',
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld#KYCAgeCredential'
      ]
    ]);

    expect(prefixes).deep.eq(e);
  });
  it('single ld contexts v2', async () => {
    const context: string = JSON.stringify(singleLDContextV2);
    const prefixes = await LDParser.getPrefixes(context, false);

    const e: Map<string, string> = new Map([
      ['VerifiableCredential', 'https://www.w3.org/2018/credentials#VerifiableCredential'],
      ['VerifiablePresentation', 'https://www.w3.org/2018/credentials#VerifiablePresentation'],
      ['EcdsaSecp256k1Signature2019', 'https://w3id.org/security#EcdsaSecp256k1Signature2019'],
      ['EcdsaSecp256r1Signature2019', 'https://w3id.org/security#EcdsaSecp256r1Signature2019'],
      ['Ed25519Signature2018', 'https://w3id.org/security#Ed25519Signature2018'],
      ['RsaSignature2018', 'https://w3id.org/security#RsaSignature2018'],
      ['proof', 'https://w3id.org/security#proof']
    ]);

    expect(prefixes).deep.eq(e);
  });
  it('single ld contexts', async () => {
    const data: string = JSON.stringify(singleLDContext);
    const prefixes = await LDParser.getPrefixes(data, false);

    const e: Map<string, string> = new Map([
      [
        'KYCAgeCredential',
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld#KYCAgeCredential'
      ]
    ]);

    expect(prefixes).deep.eq(e);
  });
});

describe('extract types with issued field', () => {
  it('should be VerifiableCredential', async () => {
    const data: string = JSON.stringify(singleLDContextV2);
    const prefixes = await LDParser.getPrefixes(data, false, ['issued']);

    const e: Map<string, string> = new Map([
      ['VerifiableCredential', 'https://www.w3.org/2018/credentials#VerifiableCredential']
    ]);

    expect(prefixes).deep.eq(e);
  });
});

describe('extract types with documentType field', () => {
  it('list of contexts', async () => {
    const data: string = JSON.stringify(listOfLDContexts);
    const prefixes = await LDParser.getPrefixes(data, false, ['documentType']);

    const e: Map<string, string> = new Map([
      [
        'KYCAgeCredential',
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld#KYCAgeCredential'
      ],
      [
        'KYCCountryOfResidenceCredential',
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld#KYCCountryOfResidenceCredential'
      ],
      [
        'KYCEmployee',
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld#KYCEmployee'
      ]
    ]);

    expect(prefixes).deep.eq(e);
  });
  it('single context', async () => {
    const data: string = JSON.stringify(singleLDContext);
    const prefixes = await LDParser.getPrefixes(data, false, ['documentType']);

    const e: Map<string, string> = new Map([
      [
        'KYCAgeCredential',
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld#KYCAgeCredential'
      ]
    ]);

    expect(prefixes).deep.eq(e);
  });
});

describe('extract types with salary field', () => {
  it('list of contexts', async () => {
    const data: string = JSON.stringify(listOfLDContexts);
    const prefixes = await LDParser.getPrefixes(data, false, ['salary']);

    const e: Map<string, string> = new Map([
      [
        'KYCEmployee',
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld#KYCEmployee'
      ]
    ]);

    expect(prefixes).deep.eq(e);
  });
  it('single context', async () => {
    const data: string = JSON.stringify(singleLDContext);
    const prefixes = await LDParser.getPrefixes(data, false, ['salary']);

    const e: Map<string, string> = new Map([]);

    expect(prefixes).deep.eq(e);
  });
});

describe('extract types with [ZKPexperiance, hireDate, position, salary, documentType] field', () => {
  it('list of contexts', async () => {
    const data: string = JSON.stringify(listOfLDContexts);
    const prefixes = await LDParser.getPrefixes(data, false, [
      'ZKPexperiance',
      'hireDate',
      'position',
      'salary',
      'documentType'
    ]);

    const e: Map<string, string> = new Map([
      [
        'KYCEmployee',
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld#KYCEmployee'
      ]
    ]);

    expect(prefixes).deep.eq(e);
  });
});
