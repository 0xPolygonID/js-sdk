import {
  OnChainResolver,
  FSCircuitStorage,
  InMemoryDataSource,
  Identity,
  IdentityStorage,
  IdentityWallet,
  OnChainRevocationStorage,
  Profile,
  CredentialStorage,
  IDataStorage,
  InMemoryMerkleTreeStorage,
  CredentialRequest,
  CredentialWallet,
  defaultEthConnectionConfig,
  EthStateStorage,
  CredentialStatusType,
  W3CCredential,
  CredentialStatusResolverRegistry,
  ProofService,
  IProofService,
  ICircuitStorage,
  byteEncoder,
  CredentialStatusPublisherRegistry,
  Iden3OnchainSmtCredentialStatusPublisher
} from '../../src';

import {
  createIdentity,
  registerBJJIntoInMemoryKMS,
  STATE_CONTRACT,
  RPC_URL,
  WALLET_KEY,
  RHS_CONTRACT_ADDRESS
} from '../helpers';

import chai from 'chai';
import path from 'path';
import spies from 'chai-spies';
import { JsonRpcProvider, Wallet } from 'ethers';
import { getRandomBytes } from '@iden3/js-crypto';
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

describe('onchain revocation checks', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;
  let dataStorage: IDataStorage;

  let proofService: IProofService;
  let circuitStorage: ICircuitStorage;
  let storage: OnChainRevocationStorage;
  let signer: Wallet;
  let onchainResolver: OnChainResolver;

  const createCredRequest = (
    credentialSubjectId: string,
    opts?: Partial<CredentialRequest>
  ): CredentialRequest => {
    return {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/kyc-nonmerklized.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: credentialSubjectId,
        birthday: 19960424,
        documentType: 99
      },
      expiration: 2793526400,
      revocationOpts: {
        nonce: 1000,
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        id: RHS_CONTRACT_ADDRESS
      },
      ...opts
    };
  };

  beforeEach(async () => {
    circuitStorage = new FSCircuitStorage({
      dirname: path.join(__dirname, '../proofs/testdata')
    });

    const ethStorage = new EthStateStorage({
      ...defaultEthConnectionConfig,
      contractAddress: STATE_CONTRACT,
      chainId: 80001,
      url: RPC_URL
    });

    dataStorage = {
      credential: new CredentialStorage(new InMemoryDataSource<W3CCredential>()),
      identity: new IdentityStorage(
        new InMemoryDataSource<Identity>(),
        new InMemoryDataSource<Profile>()
      ),
      mt: new InMemoryMerkleTreeStorage(40),
      states: ethStorage
    };

    onchainResolver = new OnChainResolver([
      {
        ...defaultEthConnectionConfig,
        url: RPC_URL,
        contractAddress: STATE_CONTRACT,
        chainId: 80001
      }
    ]);

    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023, onchainResolver);

    credWallet = new CredentialWallet(dataStorage, resolvers);

    signer = new Wallet(WALLET_KEY, new JsonRpcProvider(RPC_URL));

    storage = new OnChainRevocationStorage(
      { ...defaultEthConnectionConfig, url: RPC_URL },
      RHS_CONTRACT_ADDRESS,
      signer
    );

    const credentialStatusPublisherRegistry = new CredentialStatusPublisherRegistry();
    credentialStatusPublisherRegistry.register(
      CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
      new Iden3OnchainSmtCredentialStatusPublisher(storage)
    );

    idWallet = new IdentityWallet(registerBJJIntoInMemoryKMS(), dataStorage, credWallet, {
      credentialStatusPublisherRegistry
    });
    proofService = new ProofService(idWallet, credWallet, circuitStorage, ethStorage);
  });

  it('issuer has genesis state', async () => {
    const revocationOpts = {
      type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
      id: RHS_CONTRACT_ADDRESS
    };

    const { did: issuerDID, credential: issuerAuthCredential } = await createIdentity(idWallet, {
      seed: getRandomBytes(32),
      revocationOpts
    });

    await credWallet.save(issuerAuthCredential);

    const { did: userDID } = await createIdentity(idWallet, {
      seed: getRandomBytes(32),
      revocationOpts
    });

    const claimReq: CredentialRequest = createCredRequest(userDID.string());

    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    await credWallet.save(issuerCred);

    const cs = {
      id: issuerCred.credentialStatus.id,
      type: claimReq.revocationOpts.type,
      revocationNonce: claimReq.revocationOpts.nonce
    };

    let onchainStatus = await onchainResolver.resolve(cs, {
      issuerDID
    });

    const treeState = await idWallet.getDIDTreeModel(issuerDID);
    const [ctrHex, rtrHex, rorTrHex] = (
      await Promise.all([
        treeState.claimsTree.root(),
        treeState.revocationTree.root(),
        treeState.rootsTree.root()
      ])
    ).map((r) => r.hex());

    expect(onchainStatus.issuer.state).to.equal(treeState.state.hex());
    expect(onchainStatus.issuer.claimsTreeRoot).to.equal(ctrHex);
    expect(onchainStatus.issuer.revocationTreeRoot).to.equal(rtrHex);
    expect(onchainStatus.issuer.rootOfRoots).to.equal(rorTrHex);
    expect(onchainStatus.mtp.existence).to.equal(false);

    const res = await idWallet.addCredentialsToMerkleTree([issuerCred], issuerDID);

    await idWallet.publishRevocationInfoByCredentialStatusType(
      issuerDID,
      CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023
    );

    await proofService.transitState(issuerDID, res.oldTreeState, true, dataStorage.states, signer);

    const [ctrHexL, rtrHexL, rorTrHexL] = [
      res.newTreeState.claimsRoot.hex(),
      res.newTreeState.revocationRoot.hex(),
      res.newTreeState.rootOfRoots.hex()
    ];

    onchainStatus = await onchainResolver.resolve(cs, {
      issuerDID
    });

    expect(onchainStatus.issuer.state).to.equal(res.newTreeState.state.hex());
    expect(onchainStatus.issuer.claimsTreeRoot).to.equal(ctrHexL);
    expect(onchainStatus.issuer.revocationTreeRoot).to.equal(rtrHexL);
    expect(onchainStatus.issuer.rootOfRoots).to.equal(rorTrHexL);
    expect(onchainStatus.mtp.existence).to.equal(false);

    expect(res.newTreeState.state.hex()).not.to.equal(treeState.state.hex());
    expect(ctrHexL).not.to.equal(ctrHex);
    expect(rtrHexL).to.equal(rtrHex);
    expect(rorTrHexL).not.to.equal(rorTrHex);
  });

  it('issueCredential and generate proofs with onchain RHS status with tx callbacks', async () => {
    const id = RHS_CONTRACT_ADDRESS;
    return new Promise((resolve) => {
      (async () => {
        const { did: issuerDID, credential: issuerAuthCredential } = await createIdentity(
          idWallet,
          {
            seed: byteEncoder.encode('soedseedseedseedseedseedseedseed'),
            revocationOpts: {
              id,
              type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
              onChain: {
                txCallback: async () => {
                  const { did: userDID, credential: userAuthCredential } = await createIdentity(
                    idWallet,
                    {
                      seed: byteEncoder.encode('seedseedseedseedseedseedseedseex'),
                      revocationOpts: {
                        id,
                        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
                        onChain: {
                          txCallback: async () => {
                            const claimReq: CredentialRequest = createCredRequest(
                              userDID.string(),
                              {
                                revocationOpts: {
                                  type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
                                  id
                                }
                              }
                            );

                            const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

                            expect(issuerCred.credentialSubject.id).to.equal(userDID.string());

                            await credWallet.save(issuerCred);
                            resolve();
                          }
                        }
                      }
                    }
                  );

                  expect(userAuthCredential.credentialStatus.id).to.contain(RHS_CONTRACT_ADDRESS);
                }
              }
            }
          }
        );
        expect(issuerAuthCredential.credentialStatus.id).to.contain(RHS_CONTRACT_ADDRESS);
      })();
    });
  });
});
