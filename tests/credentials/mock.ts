import { W3CCredential } from '../../src/verifiable';

export const createTestCredential = (credData: object) => {
  const cred: W3CCredential = new W3CCredential();
  Object.assign(cred, credData);
  return cred;
};

export const cred1 = createTestCredential({
  id: 'test1',
  '@context': ['context1', 'context2', 'context3'],
  credentialSchema: {
    id: 'credentialSchemaId',
    type: 'credentialSchemaType'
  },
  proof: [],
  type: ['type1_1', 'type1_2', 'type1_3'],
  credentialStatus: {},
  issuer: 'issuer1',
  credentialSubject: {
    birthday: 20000101
  },
  expirationDate: '2023-11-11',
  issuanceDate: '2022-11-11'
});

export const cred2 = createTestCredential({
  id: 'test2',
  '@context': ['context2_1', 'context2_2', 'context2_3'],
  credentialSchema: {
    id: 'credentialSchemaId',
    type: 'credentialSchemaType'
  },
  proof: [],
  type: ['type2_1', 'type2_2', 'type2_3'],
  credentialStatus: {},
  issuer: 'issuer2',
  credentialSubject: {
    birthday: 20000101
  },
  expirationDate: '2023-11-11',
  issuanceDate: '2022-11-11'
});

export const cred3 = createTestCredential({
  id: 'test3',
  '@context': ['context3_1', 'context3_2', 'context3_3'],
  credentialSchema: {
    id: 'credentialSchemaId',
    type: 'credentialSchemaType'
  },
  proof: [],
  type: ['type3_1', 'type3_2', 'type3_3'],
  credentialStatus: {},
  issuer: 'issuer3',
  credentialSubject: {
    countryCode: 120
  },
  expirationDate: '2023-11-11',
  issuanceDate: '2022-11-11'
});

export const cred4 = createTestCredential({
  id: 'test4',
  '@context': ['context4'],
  credentialSchema: {
    id: 'credentialSchemaId',
    type: 'credentialSchemaType'
  },
  proof: [],
  type: ['type4'],
  credentialStatus: {},
  issuer: 'issuer4',
  credentialSubject: {
    countOfFines: 0,
    country: {
      name: 'Spain',
      code: 'ES',
      insured: true,
      hasOwnPackage: 'false'
    }
  },
  expirationDate: '2023-11-11',
  issuanceDate: '2022-11-11'
});

export const cred5 = createTestCredential({
  id: 'test4',
  '@context': ['context4'],
  credentialSchema: {
    id: 'credentialSchemaId',
    type: 'credentialSchemaType'
  },
  proof: [],
  type: ['type4'],
  credentialStatus: {
    id: 'https://rhs-staging.polygonid.me',
    type: 'Iden3ReverseSparseMerkleTreeProof',
    nonce: 10
  },
  issuer: 'issuer4',
  credentialSubject: {
    countOfFines: 0,
    country: {
      name: 'Spain',
      code: 'ES',
      insured: true,
      hasOwnPackage: 'false'
    }
  },
  expirationDate: '2023-11-11',
  issuanceDate: '2022-11-11'
});

export const credWithRefreshService = createTestCredential({
  id: 'test1',
  '@context': ['context1', 'context2', 'context3'],
  credentialSchema: {
    id: 'credentialSchemaId',
    type: 'credentialSchemaType'
  },
  proof: [],
  type: ['type1_1', 'type1_2', 'type1_3'],
  credentialStatus: {},
  issuer: 'issuer1',
  credentialSubject: {
    birthday: 20000101,
    id: 'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
  },
  expirationDate: '2023-11-11',
  issuanceDate: '2022-11-11',
  refreshService: {
    id: 'http://test-refresh/100',
    type: 'Iden3RefreshService2023'
  }
});

export const MockedLegacyCredential = {
  id: 'urn:fa4f7b0f-284d-4a24-9bff-023246582d76',
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://schema.iden3.io/core/jsonld/iden3proofs.jsonld',
    'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-nonmerklized.jsonld'
  ],
  type: ['VerifiableCredential', 'KYCAgeCredential'],
  expirationDate: '2058-07-10T11:33:20.000Z',
  issuanceDate: '2023-10-24T14:45:32.612Z',
  credentialSubject: {
    id: 'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth',
    birthday: 19960424,
    documentType: 99,
    type: 'KYCAgeCredential'
  },
  credentialStatus: {
    id: 'https://rhs-staging.polygonid.me/node?state=0d9d96c621fef1a5d136f300a82630605f5d73d1f5bbc352af45a3d141a7ea17',
    type: 'Iden3ReverseSparseMerkleTreeProof',
    revocationNonce: 1000
  },
  issuer: 'did:iden3:polygon:mumbai:x6uJbiuBA6RHL6NTRwBnoebvaFrNKYYHKoBF1kxZU',
  credentialSchema: {
    id: 'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/kyc-nonmerklized.json',
    type: 'JsonSchema2023'
  },
  proof: [
    {
      type: 'BJJSignature2021',
      issuerData: {
        id: 'did:iden3:polygon:mumbai:x6uJbiuBA6RHL6NTRwBnoebvaFrNKYYHKoBF1kxZU',
        state: {
          rootOfRoots: '0000000000000000000000000000000000000000000000000000000000000000',
          revocationTreeRoot: '0000000000000000000000000000000000000000000000000000000000000000',
          claimsTreeRoot: '663aa221c040fd0e399c437eb17c9b83444870fe45d77797df9a75216ef27528',
          value: '0d9d96c621fef1a5d136f300a82630605f5d73d1f5bbc352af45a3d141a7ea17'
        },
        authCoreClaim:
          'cca3371a6cb1b715004407e325bd993c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000dfa1d8ac52a54a832599e1c8ced20910a3343fa8eb84cd81727726c2474fa9053e388757861d1f9764d76f0a895ad04c1ea49dc618e17a00bf84b7bf759452040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        mtp: {
          existence: true,
          depth: 0,
          siblings: [],
          notEmpties: {
            '0': 0,
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0,
            '6': 0,
            '7': 0,
            '8': 0,
            '9': 0,
            '10': 0,
            '11': 0,
            '12': 0,
            '13': 0,
            '14': 0,
            '15': 0,
            '16': 0,
            '17': 0,
            '18': 0,
            '19': 0,
            '20': 0,
            '21': 0,
            '22': 0,
            '23': 0,
            '24': 0,
            '25': 0,
            '26': 0,
            '27': 0,
            '28': 0,
            '29': 0
          }
        },
        credentialStatus: {
          id: 'https://rhs-staging.polygonid.me/node?state=0d9d96c621fef1a5d136f300a82630605f5d73d1f5bbc352af45a3d141a7ea17',
          type: 'Iden3ReverseSparseMerkleTreeProof',
          revocationNonce: 0
        }
      },
      signature:
        'c7421436c57ed1b38ae95484565a276ffbdc23e50fd6f5e3c3c4d1894390e2096a756e33cf4d9003f4fa73ecf9aed917d39423d384f949590554f9276f48a904',
      coreClaim:
        'cb373906ed88fff9332f71521b712c950a000000000000000000000000000000011278ab979507829fa4d37e663ca5906714d506dec8a174d949c5eb09420e0068923001000000000000000000000000000000000000000000000000000000006300000000000000000000000000000000000000000000000000000000000000e80300000000000080d481a60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    },
    {
      type: 'Iden3SparseMerkleTreeProof',
      issuerData: {
        id: 'did:iden3:polygon:mumbai:x6uJbiuBA6RHL6NTRwBnoebvaFrNKYYHKoBF1kxZU',
        state: {
          claimsTreeRoot: '6f9842f1e295c1ce6f28c2c4645eb8268c7e335390fe3dd2997d6fb391aa9d2c',
          revocationTreeRoot: '0000000000000000000000000000000000000000000000000000000000000000',
          rootOfRoots: '582d640e8191a47a9353c9db54829aab8b45ec8d08e7cc1c1087333d7859a32c',
          value: '01f7013c2df5849c012d24a0cfdb0f43f136140cd9f66e7a26e208fadc308a2e',
          txId: '0xdddd'
        },
        mtp: {
          existence: true,
          depth: 1,
          siblings: [
            {
              bytes: {
                '0': 102,
                '1': 58,
                '2': 162,
                '3': 33,
                '4': 192,
                '5': 64,
                '6': 253,
                '7': 14,
                '8': 57,
                '9': 156,
                '10': 67,
                '11': 126,
                '12': 177,
                '13': 124,
                '14': 155,
                '15': 131,
                '16': 68,
                '17': 72,
                '18': 112,
                '19': 254,
                '20': 69,
                '21': 215,
                '22': 119,
                '23': 151,
                '24': 223,
                '25': 154,
                '26': 117,
                '27': 33,
                '28': 110,
                '29': 242,
                '30': 117,
                '31': 40
              }
            }
          ],
          notEmpties: {
            '0': 0,
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0,
            '6': 0,
            '7': 0,
            '8': 0,
            '9': 0,
            '10': 0,
            '11': 0,
            '12': 0,
            '13': 0,
            '14': 0,
            '15': 0,
            '16': 0,
            '17': 0,
            '18': 0,
            '19': 0,
            '20': 0,
            '21': 0,
            '22': 0,
            '23': 0,
            '24': 0,
            '25': 0,
            '26': 0,
            '27': 0,
            '28': 0,
            '29': 1
          }
        }
      },
      mtp: {
        existence: true,
        depth: 1,
        siblings: [
          {
            bytes: {
              '0': 102,
              '1': 58,
              '2': 162,
              '3': 33,
              '4': 192,
              '5': 64,
              '6': 253,
              '7': 14,
              '8': 57,
              '9': 156,
              '10': 67,
              '11': 126,
              '12': 177,
              '13': 124,
              '14': 155,
              '15': 131,
              '16': 68,
              '17': 72,
              '18': 112,
              '19': 254,
              '20': 69,
              '21': 215,
              '22': 119,
              '23': 151,
              '24': 223,
              '25': 154,
              '26': 117,
              '27': 33,
              '28': 110,
              '29': 242,
              '30': 117,
              '31': 40
            }
          }
        ],
        notEmpties: {
          '0': 0,
          '1': 0,
          '2': 0,
          '3': 0,
          '4': 0,
          '5': 0,
          '6': 0,
          '7': 0,
          '8': 0,
          '9': 0,
          '10': 0,
          '11': 0,
          '12': 0,
          '13': 0,
          '14': 0,
          '15': 0,
          '16': 0,
          '17': 0,
          '18': 0,
          '19': 0,
          '20': 0,
          '21': 0,
          '22': 0,
          '23': 0,
          '24': 0,
          '25': 0,
          '26': 0,
          '27': 0,
          '28': 0,
          '29': 1
        }
      },
      coreClaim:
        'cb373906ed88fff9332f71521b712c950a000000000000000000000000000000011278ab979507829fa4d37e663ca5906714d506dec8a174d949c5eb09420e0068923001000000000000000000000000000000000000000000000000000000006300000000000000000000000000000000000000000000000000000000000000e80300000000000080d481a60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    }
  ]
};
