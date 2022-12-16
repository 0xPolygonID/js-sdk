import { IRevocationService } from './../../src/credentials/revocation';
import { IDataStorage } from './../../src/storage/interfaces/data-storage';
import { CredentialWallet } from '../../src/credentials';
import { ProofQuery, W3CCredential } from '../../src/schema-processor';
import { StorageErrors } from '../../src/storage/errors';
import { SearchError } from '../../src/storage/filters/jsonQuery';
import { InMemoryCredentialStorage } from '../../src/storage/memory';
import { cred1, cred2, cred3 } from './mock';

const credentialFlow = async (storage: IDataStorage) => {
  const credentialWallet = new CredentialWallet(storage, {} as IRevocationService);

  await credentialWallet.saveAll([cred1, cred2]);

  const credentials = await credentialWallet.list();
  expect(credentials.length).toBe(2);

  await credentialWallet.save(cred3);
  const credentialAll = await credentialWallet.list();
  expect(credentialAll.length).toBe(3);

  // present id
  const credById = await credentialWallet.findById(cred2.id);
  expect(credById).toEqual(cred2);

  // not present id
  const emptyCredById = await credentialWallet.findById('otherId');
  expect(emptyCredById).toBeUndefined();

  // findByContextType
  const [credByContextType] = await credentialWallet.findByContextType('context1', 'type1_2');
  expect(credByContextType.id).toEqual(cred1.id);

  const queries: {
    query: ProofQuery;
    expected: W3CCredential[];
  }[] = [
    {
      query: {
        allowedIssuers: ['*'],
        type: 'type1_1'
      },
      expected: [cred1]
    },
    {
      query: {
        allowedIssuers: ['issuer3', 'issuer2']
      },
      expected: [cred3, cred2]
    },
    {
      query: {
        allowedIssuers: ['*'],
        context: 'context3_2',
        type: 'type3_3',
        schema: 'credentialSchemaId'
      },
      expected: [cred3]
    },
    {
      query: {
        allowedIssuers: ['*'],
        context: 'context2_2',
        type: 'type2_3',
        schema: 'credentialSchemaId',
        req: {
          birthday: {
            $gt: 20000100
          }
        }
      },
      expected: [cred2]
    },
    {
      query: {
        allowedIssuers: ['*'],
        req: {
          birthday: {
            $lt: 20000102
          }
        }
      },
      expected: [cred1, cred2]
    },
    {
      query: {
        allowedIssuers: ['*'],
        req: {
          countryCode: {
            $eq: 120
          }
        }
      },
      expected: [cred3]
    },
    {
      query: {
        allowedIssuers: ['*'],
        req: {
          countryCode: {
            $in: [11, 120]
          }
        }
      },
      expected: [cred3]
    },
    {
      query: {
        allowedIssuers: ['*'],
        req: {
          countryCode: {
            $nin: [11, 111]
          }
        }
      },
      expected: [cred3]
    }
  ];

  for (const item of queries) {
    const creds = await credentialWallet.findByQuery(item.query);
    const expectedIds = item.expected.map(({ id }) => id);
    const credsIds = creds.map(({ id }) => id);
    expect(credsIds).toEqual(expect.arrayContaining(expectedIds));
  }

  // operator error
  const query = {
    allowedIssuers: ['*'],
    req: {
      countryCode: {
        $custom: [11, 111]
      }
    }
  };
  await expect(credentialWallet.findByQuery(query)).rejects.toThrow(
    new Error(SearchError.NotDefinedComparator)
  );

  // // invalid query
  const query2 = {
    allowedIssuers: ['*'],
    someProp: ''
  };
  await expect(credentialWallet.findByQuery(query2)).rejects.toThrow(
    new Error(SearchError.NotDefinedQueryKey)
  );

  // remove credential error
  await expect(credentialWallet.remove('unknowId')).rejects.toThrow(
    new Error(StorageErrors.NotFoundCredentialForRemove)
  );

  await credentialWallet.remove('test1');
  const finalList = await credentialWallet.list();
  expect(finalList.length).toBe(2);
};

describe('credential-wallet', () => {
  it('run in memory with 3 credential',  async () => {
    const storage = {
      credential: new InMemoryCredentialStorage()
    } as unknown as IDataStorage;
    await credentialFlow(storage);
  });
});
