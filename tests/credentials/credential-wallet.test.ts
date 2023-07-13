import { InMemoryDataSource } from './../../src/storage/memory/data-source';
import { CredentialStorage } from './../../src/storage/shared/credential-storage';
import { IDataStorage } from './../../src/storage/interfaces/data-storage';
import { CredentialWallet } from '../../src/credentials';
import { SearchError } from '../../src/storage/filters/jsonQuery';
import { cred1, cred2, cred3, cred4 } from './mock';
import { ProofQuery, W3CCredential, CredentialStatusType } from '../../src/verifiable';
import { BrowserDataSource } from '../../src/storage/local-storage/data-source';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import { CredentialStatusResolverRegistry } from '../../src/credentials';
import { RHSResolver } from '../../src/credentials';
chai.use(chaiAsPromised);
const { expect } = chai;

class LocalStorageMock {
  store: object;
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = value;
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock() as unknown as Storage;

const credentialFlow = async (storage: IDataStorage) => {
  const resolvers = new CredentialStatusResolverRegistry();
  resolvers.register(
    CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
    new RHSResolver(storage.states)
  );
  const credentialWallet = new CredentialWallet(storage, resolvers);

  await credentialWallet.saveAll([cred1, cred2]);

  const credentials = await credentialWallet.list();
  expect(credentials.length).to.equal(2);

  await credentialWallet.save(cred3);
  await credentialWallet.save(cred4);
  const credentialAll = await credentialWallet.list();
  expect(credentialAll.length).to.equal(4);

  // present id
  const credById = await credentialWallet.findById(cred2.id);
  expect(credById).to.deep.equal(cred2);

  // not present id
  const emptyCredById = await credentialWallet.findById('otherId');
  expect(!!emptyCredById).to.be.false;

  // findByContextType
  const [credByContextType] = await credentialWallet.findByContextType('context1', 'type1_2');
  expect(credByContextType.id).to.deep.equal(cred1.id);

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
        credentialSubject: {
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
        credentialSubject: {
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
        credentialSubject: {
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
        credentialSubject: {
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
        credentialSubject: {
          countryCode: {
            $nin: [11, 111]
          }
        }
      },
      expected: [cred3]
    },
    {
      query: {
        allowedIssuers: ['*'],
        credentialSubject: {
          countOfFines: {
            $nin: [1, 2]
          }
        }
      },
      expected: [cred4]
    },
    {
      query: {
        allowedIssuers: ['*'],
        credentialSubject: {
          countOfFines: {
            $in: [0]
          }
        }
      },
      expected: [cred4]
    },
    {
      query: {
        allowedIssuers: ['*'],
        credentialSubject: {
          countOfFines: {
            $eq: 0
          }
        }
      },
      expected: [cred4]
    },
    {
      query: {
        allowedIssuers: ['*'],
        credentialSubject: {
          countOfFines: {
            $eq: 1
          }
        }
      },
      expected: []
    },
    {
      query: {
        allowedIssuers: ['*'],
        credentialSubject: {
          countOfFines: {}
        }
      },
      expected: [cred4]
    },
    {
      query: {
        allowedIssuers: ['*'],
        credentialSubject: {
          'country.name': { $eq: 'Spain' }
        }
      },
      expected: [cred4]
    },
    {
      query: {
        allowedIssuers: ['*'],
        credentialSubject: {
          'country.insured': { $eq: 'true' }
        }
      },
      expected: [cred4]
    },
    {
      query: {
        allowedIssuers: ['*'],
        credentialSubject: {
          'country.insured': { $eq: 1 }
        }
      },
      expected: [cred4]
    },
    {
      query: {
        allowedIssuers: ['*'],
        credentialSubject: {
          'country.insured': { $eq: true }
        }
      },
      expected: [cred4]
    },
    {
      query: {
        allowedIssuers: ['*'],
        credentialSubject: {
          'country.insured': { $ne: 'false' }
        }
      },
      expected: [cred4]
    },
    {
      query: {
        allowedIssuers: ['*'],
        credentialSubject: {
          'country.insured': { $ne: 0 }
        }
      },
      expected: [cred4]
    },
    {
      query: {
        allowedIssuers: ['*'],
        credentialSubject: {
          'country.insured': { $ne: false }
        }
      },
      expected: [cred4]
    },
    {
      query: {
        allowedIssuers: ['*'],
        credentialSubject: {
          'country.hasOwnPackage': { $eq: 'false' }
        }
      },
      expected: [cred4]
    },
    {
      query: {
        allowedIssuers: ['*'],
        credentialSubject: {
          'country.hasOwnPackage': { $eq: 0 }
        }
      },
      expected: [cred4]
    },
    {
      query: {
        allowedIssuers: ['*'],
        credentialSubject: {
          'country.hasOwnPackage': { $eq: false }
        }
      },
      expected: [cred4]
    }
  ];

  for (const item of queries) {
    const creds = await credentialWallet.findByQuery(item.query);
    const expectedIds = item.expected.map(({ id }) => id);
    const credsIds = creds.map(({ id }) => id);
    expect(credsIds).to.have.members(expectedIds);
  }

  // operator error
  const query = {
    allowedIssuers: ['*'],
    credentialSubject: {
      countryCode: {
        $custom: [11, 111]
      }
    }
  };
  await expect(credentialWallet.findByQuery(query)).to.be.rejectedWith(
    SearchError.NotDefinedComparator
  );

  // invalid query
  const query2 = {
    allowedIssuers: ['*'],
    someProp: ''
  };
  await expect(credentialWallet.findByQuery(query2)).to.be.rejectedWith(
    SearchError.NotDefinedQueryKey
  );

  // remove credential error
  await expect(credentialWallet.remove('unknowId')).to.be.rejectedWith(
    'item not found to delete: unknowId'
  );

  await credentialWallet.remove('test1');
  const finalList = await credentialWallet.list();
  expect(finalList.length).to.equal(3);
};

describe('credential-wallet', () => {
  it('run in memory with 3 credential', async () => {
    const storage = {
      credential: new CredentialStorage(new InMemoryDataSource<W3CCredential>())
    } as unknown as IDataStorage;
    await credentialFlow(storage);
  });
  it('run in local storage with 4 credential', async () => {
    const storage = {
      credential: new CredentialStorage(
        new BrowserDataSource<W3CCredential>(CredentialStorage.storageKey)
      )
    } as unknown as IDataStorage;
    await credentialFlow(storage);
  });
});
