import { expect } from 'chai';
import { JSONObject, mergeObjects } from '../../src';

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
