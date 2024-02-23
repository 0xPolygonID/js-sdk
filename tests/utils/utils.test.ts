import { expect } from 'chai';
import {
  AbstractPrivateKeyStore,
  InMemoryPrivateKeyStore,
  JSONObject,
  KmsKeyType,
  Sec256k1Provider,
  mergeObjects
} from '../../src';
import { getRandomBytes } from '@iden3/js-crypto';

describe('merge credential subjects to create query', () => {
  it('should merge two valid JSONObjects correctly', () => {
    const testCases: JSONObject[] = [
      {
        subj1: {
          documentType: {
            $eq: 25
          },
          position: {
            $eq: 'boss'
          },
          salary: {
            $gte: 2
          }
        },

        subj2: {
          documentType: {
            $eq: 26
          },
          position: {
            $ne: 'employee'
          },
          salary: {
            $gte: 10
          },
          hireDate: {
            $eq: '2023-12-11'
          }
        },

        expectedResult: {
          documentType: {
            $eq: [25, 26]
          },
          position: {
            $eq: 'boss',
            $ne: 'employee'
          },
          salary: {
            $gte: [2, 10]
          },
          hireDate: {
            $eq: '2023-12-11'
          }
        }
      },

      {
        subj1: {
          documentType: {
            $eq: 25,
            $ne: 26,
            $gt: 27,
            $lt: 28
          },
          position: {
            $eq: 'boss',
            $ne: 'bad boy'
          }
        },

        subj2: {
          documentType: {
            $eq: 27,
            $ne: 30
          },
          position: {
            $eq: 'employee'
          },
          salary: {
            $gte: 10
          },
          hireDate: {
            $eq: '2023-12-11'
          }
        },

        expectedResult: {
          documentType: {
            $eq: [25, 27],
            $ne: [26, 30],
            $gt: 27,
            $lt: 28
          },
          position: {
            $eq: ['boss', 'employee'],
            $ne: 'bad boy'
          },
          salary: {
            $gte: 10
          },
          hireDate: {
            $eq: '2023-12-11'
          }
        }
      },
      {
        subj2: {
          hireDate: {
            $eq: '2023-12-11'
          },
          salary: {
            $gte: 3
          },
          position: {
            $eq: 'boss',
            $ne: 'badJoke'
          }
        },

        subj1: {
          documentType: {
            $eq: 1
          },
          position: {
            $ne: 'employee'
          },
          salary: {
            $gte: 2
          }
        },

        expectedResult: {
          documentType: {
            $eq: 1
          },
          position: {
            $eq: 'boss',
            $ne: ['employee', 'badJoke']
          },
          salary: {
            $gte: [2, 3]
          },
          hireDate: {
            $eq: '2023-12-11'
          }
        }
      }
    ];

    for (const testCase of testCases) {
      expect(
        mergeObjects(testCase.subj1 as JSONObject, testCase.subj2 as JSONObject)
      ).to.deep.equal(testCase.expectedResult);
    }
  });
});

describe('secp256k1 tests', () => {
  it('should sec256k1 signatures be equal for the same data and private key', async () => {
    const keyStore: AbstractPrivateKeyStore = new InMemoryPrivateKeyStore();
    const secp256k1 = new Sec256k1Provider(KmsKeyType.Secp256k1, keyStore);
    const seed = getRandomBytes(32);
    const dataToSign = getRandomBytes(32);
    const [keyId1, keyId2] = await Promise.all([
      secp256k1.newPrivateKeyFromSeed(seed),
      secp256k1.newPrivateKeyFromSeed(seed)
    ]);
    const [signature1, signature2] = await Promise.all([
      secp256k1.sign(keyId1, dataToSign),
      secp256k1.sign(keyId2, dataToSign)
    ]);
    expect(signature1).to.deep.equal(signature2);
  });
});
