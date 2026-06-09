import { describe, expect, it } from 'vitest';
import {
  createVerifiablePresentation,
  parseJsonDocumentObject,
  parseZKPQuery,
  QueryMetadata,
  W3CCredential
} from '../../src';
import { Operators, QueryOperators } from '../../src/circuits';
import { ZeroKnowledgeProofQuery } from '../../src/iden3comm';

describe('createVerifiablePresentation selective disclosure', () => {
  it('discloses sibling fields of the same nested object without dropping any', () => {
    const credential = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      credentialSubject: {
        id: 'did:example:subject',
        type: 'BasicPerson',
        addresses: {
          primaryAddress: {
            addressLine1: 'line-1',
            addressLine2: 'line-2'
          }
        }
      },
      credentialStatus: {
        id: 'https://example.com/status',
        type: 'Iden3ReverseSparseMerkleTreeProof'
      }
    } as unknown as W3CCredential;

    const queries = [
      {
        fieldName: 'credentialSubject.addresses.primaryAddress.addressLine1',
        operator: Operators.SD
      },
      {
        fieldName: 'credentialSubject.addresses.primaryAddress.addressLine2',
        operator: Operators.SD
      }
    ] as unknown as QueryMetadata[];

    const vp = createVerifiablePresentation('', 'BasicPerson', credential, queries);

    const credentialSubject = vp.verifiableCredential.credentialSubject as unknown as {
      addresses: { primaryAddress: { addressLine1: string; addressLine2: string } };
    };
    const disclosed = credentialSubject.addresses.primaryAddress;

    expect(disclosed.addressLine1).to.eq('line-1');
    expect(disclosed.addressLine2).to.eq('line-2');
  });
});

describe('parseJsonDocumentObject', () => {
  it('accepts the $noop operator (operator value 0)', () => {
    const queries = parseJsonDocumentObject({ documentType: { $noop: '' } });
    expect(queries).to.deep.equal([
      { operator: QueryOperators.$noop, fieldName: 'documentType', operatorValue: '' }
    ]);
  });
});

describe('parseZKPQuery', () => {
  it('returns a noop query when credentialSubject has no disclosure fields', () => {
    const query = {
      allowedIssuers: ['*'],
      context: '',
      type: '',
      // full disclosure of a subject whose only fields are id/type yields {} after flattening
      credentialSubject: {}
    } as unknown as ZeroKnowledgeProofQuery;

    const queries = parseZKPQuery(query);
    expect(queries).to.deep.equal([{ operator: QueryOperators.$noop, fieldName: '' }]);
  });
});
