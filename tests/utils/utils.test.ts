import { describe, expect, it } from 'vitest';
import { buildDIDFromEthPubKey, JsonDocumentObject, mergeObjects } from '../../src';
import { Blockchain, buildDIDType, DidMethod, NetworkId } from '@iden3/js-iden3-core';

describe('merge credential subjects to create query', () => {
  it('should merge two valid JsonDocumentObjects correctly', () => {
    const testCases: JsonDocumentObject[] = [
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
        mergeObjects(testCase.subj1 as JsonDocumentObject, testCase.subj2 as JsonDocumentObject)
      ).to.deep.equal(testCase.expectedResult);
    }
  });
});

describe('build did from ethereum public key', () => {
  it('should build did from ethereum public key correctly', async () => {
    const pubKeyHexEth =
      '8318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5';
    const didType = buildDIDType(DidMethod.Iden3, Blockchain.Polygon, NetworkId.Amoy);
    const did = buildDIDFromEthPubKey(didType, pubKeyHexEth);

    expect(did.string()).to.equal(
      'did:iden3:polygon:amoy:x6x5sor7zpycB7z7Q9348dXJxZ9s5b9AgmPeSccZz'
    );
  });
});
