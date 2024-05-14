import { expect } from 'chai';
import { parseQueryMetadata } from '../../src';

describe('parseQueryMetadata', () => {
  const ldContext =
    '{"@context":[{"@version":1.1,"@protected":true,"id":"@id","type":"@type","KYCAgeCredential":{"@id":"https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld#KYCAgeCredential","@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","kyc-vocab":"https://github.com/iden3/claim-schema-vocab/blob/main/credentials/kyc.md#","xsd":"http://www.w3.org/2001/XMLSchema#","birthday":{"@id":"kyc-vocab:birthday","@type":"xsd:integer"},"documentType":{"@id":"kyc-vocab:documentType","@type":"xsd:integer"}}},"KYCCountryOfResidenceCredential":{"@id":"https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld#KYCCountryOfResidenceCredential","@context":{"@version":1.1,"@protected":true,"id":"@id","type":"@type","kyc-vocab":"https://github.com/iden3/claim-schema-vocab/blob/main/credentials/kyc.md#","xsd":"http://www.w3.org/2001/XMLSchema#","countryCode":{"@id":"kyc-vocab:countryCode","@type":"xsd:integer"},"documentType":{"@id":"kyc-vocab:documentType","@type":"xsd:integer"}}}}]}';
  const ipfsNodeURL = process.env.IPFS_URL as string;
  it('parseQueryMetadata with NOOP/SD operators and "" as operatorValue should return 0 arr values', async () => {
    const { values } = await parseQueryMetadata(
      {
        fieldName: '',
        operator: 0,
        operatorValue: ''
      },
      ldContext,
      'KYCAgeCredential',
      {
        ipfsNodeURL
      }
    );

    expect(values.length).to.be.eq(0);

    const { values: valuesFromSd } = await parseQueryMetadata(
      {
        fieldName: 'documentType',
        operator: 16,
        operatorValue: ''
      },
      ldContext,
      'KYCAgeCredential',
      {
        ipfsNodeURL
      }
    );

    expect(valuesFromSd.length).to.be.eq(0);
  });

  it('parseQueryMetadata with NOOP/SD operators and not empty operatorValue should throw', async () => {
    await expect(
      parseQueryMetadata(
        {
          fieldName: '',
          operator: 0,
          operatorValue: '123'
        },
        ldContext,
        'KYCAgeCredential',
        {
          ipfsNodeURL
        }
      )
    ).to.be.rejectedWith('operator value should be undefined for 0 operator');

    await expect(
      parseQueryMetadata(
        {
          fieldName: 'documentType',
          operator: 16,
          operatorValue: '123'
        },
        ldContext,
        'KYCAgeCredential',
        {
          ipfsNodeURL
        }
      )
    ).to.be.rejectedWith('operator value should be undefined for 16 operator');
  });
});
