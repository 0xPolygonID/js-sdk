import { OnChainResolver } from '../../src/credentials/status/on-chain-revocation';
import { InMemoryDataSource } from './../../src/storage/memory/data-source';
import { CredentialStorage } from './../../src/storage/shared/credential-storage';
import { Identity, IdentityStorage, IdentityWallet, Profile, byteEncoder } from '../../src';
import { BjjProvider, KMS, KmsKeyType } from '../../src/kms';
import { InMemoryPrivateKeyStore } from '../../src/kms/store';
import { IDataStorage } from '../../src/storage/interfaces';
import { InMemoryMerkleTreeStorage } from '../../src/storage/memory';
import { CredentialRequest, CredentialWallet } from '../../src/credentials';
import { defaultEthConnectionConfig, EthStateStorage } from '../../src/storage/blockchain/state';
import { CredentialStatusType, RevocationStatus, W3CCredential } from '../../src/verifiable';
import { Proof } from '@iden3/js-merkletree';
import { Blockchain, DidMethod, NetworkId } from '@iden3/js-iden3-core';
import chai from 'chai';
import { CredentialStatusResolverRegistry } from '../../src/credentials';
import { VerifiableConstants } from '../../src/verifiable';
import spies from 'chai-spies';
chai.use(spies);
const expect = chai.expect;

describe('parse credential status with type Iden3OnchainSparseMerkleTreeProof2023:', () => {
  const testCases = [
    {
      name: 'extract information from credentialStatus.id',
      input: {
        id: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6/credentialStatus?revocationNonce=1234&contractAddress=80001:0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: 0
      },
      output: {
        contractAddress: '0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2',
        chainId: 80001,
        revocationNonce: 1234,
        stateHex: ''
      }
    },
    {
      name: 'revocation nonce is 0 on id',
      input: {
        id: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6/credentialStatus?revocationNonce=0&contractAddress=80001:0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: undefined
      },
      output: {
        contractAddress: '0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2',
        chainId: 80001,
        revocationNonce: 0,
        stateHex: ''
      }
    },
    {
      name: 'revocation nonce is 0 on credentialStatus',
      input: {
        id: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6/credentialStatus?contractAddress=80001:0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: 0
      },
      output: {
        contractAddress: '0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2',
        chainId: 80001,
        revocationNonce: 0,
        stateHex: ''
      }
    },
    {
      name: 'Parse stateHex from credentialStatus.id',
      input: {
        id: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6/credentialStatus?contractAddress=80001:0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2&state=a1abdb9f44c7b649eb4d21b59ef34bd38e054aa3e500987575a14fc92c49f42c',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: 100
      },
      output: {
        contractAddress: '0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2',
        chainId: 80001,
        revocationNonce: 100,
        stateHex: 'a1abdb9f44c7b649eb4d21b59ef34bd38e054aa3e500987575a14fc92c49f42c'
      }
    },
    {
      name: 'invalid id format',
      input: {
        id: 'did:polygonid:eth:2tCntr26bxYnTERr7uTX3mDU182tTTKGmye8T4uwtM',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: 4321
      },
      error: 'invalid credentialStatus id'
    },
    {
      name: 'invalid contract address format',
      input: {
        id: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6/credentialStatus?revocationNonce=1234&contractAddress=0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: 4321
      },
      error: 'invalid contract address encoding. should be chainId:contractAddress'
    },
    {
      name: 'revocationNonce is empty',
      input: {
        id: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6/credentialStatus?contractAddress=80001:0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: undefined
      },
      error: 'revocationNonce not found in credentialStatus id field'
    },
    {
      name: 'contractAddress is required parameter',
      input: {
        id: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6/credentialStatus',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: 1234
      },
      error: 'contractAddress not found in credentialStatus.id field'
    }
  ];

  for (const testCase of testCases) {
    it(testCase.name, () => {
      const status = new OnChainResolver([]);

      if (testCase.error) {
        expect(() => status.extractCredentialStatusInfo(testCase.input)).to.throw(testCase.error);
        return;
      }
      const expectedOutput = status.extractCredentialStatusInfo(testCase.input);
      expect(expectedOutput).to.deep.equal(testCase.output);
    });
  }
});

describe('onchain', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;
  let dataStorage: IDataStorage;
  const infuraUrl = process.env.RPC_URL as string;

  beforeEach(async () => {
    const memoryKeyStore = new InMemoryPrivateKeyStore();
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, memoryKeyStore);
    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);

    defaultEthConnectionConfig.url = infuraUrl;
    defaultEthConnectionConfig.chainId = 80001;
    const conf = defaultEthConnectionConfig;
    conf.contractAddress = '0xf6781AD281d9892Df285cf86dF4F6eBec2042d71';
    const ethStorage = new EthStateStorage(conf);

    dataStorage = {
      credential: new CredentialStorage(new InMemoryDataSource<W3CCredential>()),
      identity: new IdentityStorage(
        new InMemoryDataSource<Identity>(),
        new InMemoryDataSource<Profile>()
      ),
      mt: new InMemoryMerkleTreeStorage(40),
      states: ethStorage
    };

    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
      new OnChainResolver([defaultEthConnectionConfig])
    );
    credWallet = new CredentialWallet(dataStorage, resolvers);
    credWallet.getRevocationStatusFromCredential = async () => {
      const r: RevocationStatus = {
        mtp: {
          existence: false,
          nodeAux: undefined,
          siblings: []
        } as unknown as Proof,
        issuer: {}
      };
      return r;
    };
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);
  });

  it('issuer has genesis state', async () => {
    const seedPhrase: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseeduser');

    const seedPhraseIssuer: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedseed');

    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhraseIssuer,
      revocationOpts: {
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        id: 'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth/credentialStatus?contractAddress=80001:0x068F826Da7e5119891a792817C5bE8bB9816b9D3',
        nonce: 0
      }
    });

    await credWallet.save(issuerAuthCredential);

    const { did: userDID } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        id: 'did:iden3:polygon:mumbai:wuw5tydZ7AAd3efwEqPprnqjiNHR24jqruSPKmV1V/credentialStatus?contractAddress=80001:0x068F826Da7e5119891a792817C5bE8bB9816b9D3',
        nonce: 0
      }
    });

    const claimReq: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/kyc-nonmerklized.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.string(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 2793526400,
      revocationOpts: {
        nonce: 1000,
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: 'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth/credentialStatus?contractAddress=80001:0x068F826Da7e5119891a792817C5bE8bB9816b9D3&state=ed17a07e8b78ab979507829fa4d37e663ca5906714d506dec8a174d949c5eb09'
      }
    };

    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    await credWallet.save(issuerCred);

    const cs = {
      id: claimReq.revocationOpts.id,
      type: claimReq.revocationOpts.type,
      revocationNonce: claimReq.revocationOpts.nonce
    };
    const onchainResolver = new OnChainResolver([defaultEthConnectionConfig]);

    // state contract returns identity state not found error
    // sc returns non inclusion proof for issuer genesis state
    chai.spy.on(onchainResolver, '_getStateStorageForIssuer', () => {
      return {
        getLatestStateById: () => {
          console.log('mocked getLatestStateById genesis case');
          throw new Error(VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST);
        }
      };
    });
    chai.spy.on(onchainResolver, '_getOnChainRevocationStorageForIssuer', () => {
      return {
        getRevocationStatusByIdAndState: () => {
          console.log('mocked getRevocationStatusByIdAndState genesis case');
          return {
            mtp: {
              existence: false
            },
            issuer: {
              state: 'ed17a07e8b78ab979507829fa4d37e663ca5906714d506dec8a174d949c5eb09',
              claimsTreeRoot: '6091193ec58a6c020183c2d889a92c32410f31812595f228d67a2bf37e04a729',
              revocationTreeRoot:
                '0000000000000000000000000000000000000000000000000000000000000000',
              rootOfRoots: '0000000000000000000000000000000000000000000000000000000000000000'
            }
          };
        }
      };
    });

    const onchainStatus = await onchainResolver.resolve(cs, {
      issuerDID: issuerDID
    });

    const latestTree = await idWallet.getDIDTreeModel(issuerDID);
    expect(onchainStatus.issuer.state).to.equal(latestTree.state.hex());
    expect(onchainStatus.issuer.claimsTreeRoot).to.equal(
      (await latestTree.claimsTree.root()).hex()
    );
    expect(onchainStatus.issuer.revocationTreeRoot).to.equal(
      (await latestTree.revocationTree.root()).hex()
    );
    expect(onchainStatus.issuer.rootOfRoots).to.equal((await latestTree.rootsTree.root()).hex());
    expect(onchainStatus.mtp.existence).to.equal(false);
  });

  it('state contract returns latest state', async () => {
    const seedPhrase: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseeduser');

    const seedPhraseIssuer: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedseed');

    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhraseIssuer,
      revocationOpts: {
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        id: 'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth/credentialStatus?contractAddress=80001:0x068F826Da7e5119891a792817C5bE8bB9816b9D3',
        nonce: 0
      }
    });

    await credWallet.save(issuerAuthCredential);

    const { did: userDID } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        id: 'did:iden3:polygon:mumbai:wuw5tydZ7AAd3efwEqPprnqjiNHR24jqruSPKmV1V/credentialStatus?contractAddress=80001:0x068F826Da7e5119891a792817C5bE8bB9816b9D3',
        nonce: 0
      }
    });

    const claimReq: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/kyc-nonmerklized.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.string(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 2793526400,
      revocationOpts: {
        nonce: 1000,
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: 'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth/credentialStatus?contractAddress=80001:0x068F826Da7e5119891a792817C5bE8bB9816b9D3'
      }
    };

    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);
    await credWallet.save(issuerCred);
    await idWallet.addCredentialsToMerkleTree([issuerCred], issuerDID);

    const cs = {
      id: claimReq.revocationOpts.id,
      type: claimReq.revocationOpts.type,
      revocationNonce: claimReq.revocationOpts.nonce
    };
    const onchainResolver = new OnChainResolver([defaultEthConnectionConfig]);

    // state contract returns latest state
    // sc generates inclusion proof for issuer latest state
    chai.spy.on(onchainResolver, '_getStateStorageForIssuer', () => {
      return {
        getLatestStateById: () => {
          console.log('mocked getLatestStateById latest state case');
          return {
            state: BigInt('0xf600ba49073ff1c396ed674263f04cb246647039d55d43a49ce310a857fa8923')
          };
        }
      };
    });
    chai.spy.on(onchainResolver, '_getOnChainRevocationStorageForIssuer', () => {
      return {
        getRevocationStatusByIdAndState: () => {
          console.log('mocked getRevocationStatusByIdAndState latest state case');
          return {
            mtp: {
              existence: false
            },
            issuer: {
              state: 'f600ba49073ff1c396ed674263f04cb246647039d55d43a49ce310a857fa8923',
              claimsTreeRoot: '9a50b13ef0d27bc5ec194717fc01e3574b8d1b61e94d78641c00960039d35805',
              revocationTreeRoot:
                '0000000000000000000000000000000000000000000000000000000000000000',
              rootOfRoots: '9b8fb367151795494ce222daebd769f6f4eb2f4d9c8de6e5bb2548b76022c812'
            }
          };
        }
      };
    });

    const onchainStatus = await onchainResolver.resolve(cs, {
      issuerDID: issuerDID
    });

    const latestTree = await idWallet.getDIDTreeModel(issuerDID);
    expect(onchainStatus.issuer.state).to.equal(latestTree.state.hex());
    expect(onchainStatus.issuer.claimsTreeRoot).to.equal(
      (await latestTree.claimsTree.root()).hex()
    );
    expect(onchainStatus.issuer.revocationTreeRoot).to.equal(
      (await latestTree.revocationTree.root()).hex()
    );
    expect(onchainStatus.issuer.rootOfRoots).to.equal((await latestTree.rootsTree.root()).hex());
    expect(onchainStatus.mtp.existence).to.equal(false);
  });
});
