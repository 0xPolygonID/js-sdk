/* eslint-disable no-console */
import {
  CredentialStorage,
  Identity,
  IdentityStorage,
  IdentityWallet,
  Profile,
  byteEncoder,
  BjjProvider,
  KMS,
  KmsKeyType,
  InMemoryPrivateKeyStore,
  MerkleTreeType,
  IDataStorage,
  InMemoryDataSource,
  InMemoryMerkleTreeStorage,
  CredentialRequest,
  ICredentialWallet,
  CredentialWallet,
  CredentialStatusResolverRegistry,
  RHSResolver,
  CredentialStatusType,
  W3CCredential,
  OnChainRevocationStorage,
  defaultEthConnectionConfig,
  OnChainResolver,
  IProofService,
  FSCircuitStorage,
  ProofService,
  ICircuitStorage,
  ZeroKnowledgeProofRequest,
  CircuitId
} from '../../src';
import { expect } from 'chai';
import { Wallet } from 'ethers';
import { MOCK_STATE_STORAGE, SEED_USER, createIdentity } from '../helpers';
import path from 'path';

describe('identity', () => {
  const rhsURL = process.env.RHS_URL as string;
  let credWallet: ICredentialWallet;
  let idWallet: IdentityWallet;
  let dataStorage: IDataStorage;

  const rpcUrl = process.env.RPC_URL as string;
  const walletKey = process.env.WALLET_KEY as string;
  const rhsContract = process.env.RHS_CONTRACT_ADDRESS as string;
  const stateContract = process.env.CONTRACT_ADDRESS as string;
  let proofService: IProofService;
  let circuitStorage: ICircuitStorage;

  const createClaimReq = (
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
      expiration: 12345678888,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsURL
      },
      ...opts
    };
  };

  beforeEach(async () => {
    circuitStorage = new FSCircuitStorage({
      dirname: path.join(__dirname, '../proofs/testdata')
    });
    const memoryKeyStore = new InMemoryPrivateKeyStore();
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, memoryKeyStore);
    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);

    dataStorage = {
      credential: new CredentialStorage(new InMemoryDataSource<W3CCredential>()),
      identity: new IdentityStorage(
        new InMemoryDataSource<Identity>(),
        new InMemoryDataSource<Profile>()
      ),
      mt: new InMemoryMerkleTreeStorage(40),
      states: MOCK_STATE_STORAGE
    };

    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );
    resolvers.register(
      CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
      new OnChainResolver([
        {
          ...defaultEthConnectionConfig,
          url: rpcUrl,
          contractAddress: stateContract,
          chainId: 80001
        }
      ])
    );

    credWallet = new CredentialWallet(dataStorage, resolvers);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);
    proofService = new ProofService(idWallet, credWallet, circuitStorage, MOCK_STATE_STORAGE);
  });
  it('createIdentity', async () => {
    const { did, credential } = await createIdentity(idWallet);

    expect(did.string()).to.equal(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );
    const dbCred = await dataStorage.credential.findCredentialById(credential.id);
    expect(credential).to.deep.equal(dbCred);

    const claimsTree = await dataStorage.mt.getMerkleTreeByIdentifierAndType(
      did.string(),
      MerkleTreeType.Claims
    );

    expect((await claimsTree.root()).bigInt()).not.to.equal(0);
  });

  it('createProfile', async () => {
    const { did } = await createIdentity(idWallet);

    expect(did.string()).to.equal(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );

    const profileDID = await idWallet.createProfile(did, 10, 'http://polygonissuer.com/');
    expect(profileDID.string()).to.equal(
      'did:iden3:polygon:mumbai:x2Ld4XmxEo6oGCSr3MsqBa5PmJie6WJ6pFbetzYuq'
    );

    const dbProfile = await dataStorage.identity.getProfileByVerifier('http://polygonissuer.com/');
    expect(dbProfile).not.to.be.undefined;
    if (dbProfile) {
      expect(dbProfile.id).to.equal(profileDID.string());
      expect(dbProfile.genesisIdentifier).to.equal(did.string());
      expect(dbProfile.nonce).to.equal(10);
    }
  });

  it('sign', async () => {
    const { did, credential } = await createIdentity(idWallet);
    expect(did.string()).to.equal(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );

    const enc = byteEncoder; // always utf-8

    const message = enc.encode('payload');
    const sig = await idWallet.sign(message, credential);

    expect(sig.hex()).to.equal(
      '5fdb4fc15898ee2eeed2ed13c5369a4f28870e51ac1aae8ad1f2108d2d39f38969881d7553344c658e63344e4ddc151fabfed5bf8fcf8663c183248b714d8b03'
    );
  });

  it('generateMtp', async () => {
    const { did, credential } = await createIdentity(idWallet);
    expect(did.string()).to.equal(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );

    const proof = await idWallet.generateCredentialMtp(did, credential);

    expect(proof.proof.existence).to.equal(true);
  });

  it('generateNonRevProof', async () => {
    const { did, credential } = await createIdentity(idWallet);
    expect(did.string()).to.equal(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );

    const proof = await idWallet.generateNonRevocationMtp(did, credential);

    expect(proof.proof.existence).to.equal(false);
  });

  it('generateNonRevProof', async () => {
    const { did, credential } = await createIdentity(idWallet);
    expect(did.string()).to.equal(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );

    const proof = await idWallet.generateNonRevocationMtp(did, credential);

    expect(proof.proof.existence).to.equal(false);
  });

  it('issueCredential', async () => {
    const { did: issuerDID, credential: issuerAuthCredential } = await createIdentity(idWallet);

    expect(issuerDID.string()).to.equal(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );

    expect(issuerAuthCredential).not.to.be.undefined;

    const { did: userDID, credential: userAuthCredential } = await createIdentity(idWallet, {
      seed: SEED_USER
    });

    expect(userAuthCredential).not.to.be.undefined;

    const claimReq: CredentialRequest = createClaimReq(userDID.string());
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    expect(issuerCred.credentialSubject.id).to.equal(userDID.string());
  });

  it('build non-inclusion proof from issuer data', async () => {
    const { did: issuerDID } = await createIdentity(idWallet);

    const { did: userDID } = await createIdentity(idWallet, {
      seed: SEED_USER
    });

    const claimReq: CredentialRequest = createClaimReq(userDID.string());
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);
    issuerCred.credentialStatus.id = rhsURL;

    await credWallet.getRevocationStatusFromCredential(issuerCred);
  });

  it('issueCredential and generate proofs with onchain RHS status with tx callbacks', async () => {
    const signer = new Wallet(walletKey);
    const id = rhsContract;

    const storage = new OnChainRevocationStorage(
      { ...defaultEthConnectionConfig, url: rpcUrl },
      rhsContract,
      signer
    );
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
                storage,
                txCallback: async (tx) => {
                  console.log(tx.hash);
                  const { did: userDID, credential: userAuthCredential } = await createIdentity(
                    idWallet,
                    {
                      seed: byteEncoder.encode('seedseedseedseedseedseedseedseex'),
                      revocationOpts: {
                        id,
                        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
                        onChain: {
                          storage,
                          txCallback: async (txReceipt) => {
                            console.log(txReceipt.hash);

                            const claimReq: CredentialRequest = createClaimReq(userDID.string(), {
                              revocationOpts: {
                                type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
                                id
                              }
                            });

                            const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

                            expect(issuerCred.credentialSubject.id).to.equal(userDID.string());

                            await credWallet.save(issuerCred);

                            const proofReq: ZeroKnowledgeProofRequest = {
                              id: 1,
                              circuitId: CircuitId.AtomicQuerySigV2,
                              optional: false,
                              query: {
                                allowedIssuers: ['*'],
                                type: claimReq.type,
                                context:
                                  'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-nonmerklized.jsonld',
                                credentialSubject: {
                                  documentType: {
                                    $eq: 99
                                  }
                                }
                              }
                            };

                            const { proof } = await proofService.generateProof(proofReq, userDID);

                            expect(proof).not.to.be.undefined;
                            resolve();
                          }
                        }
                      }
                    }
                  );

                  expect(userAuthCredential.credentialStatus.id).to.contain(rhsContract);
                }
              }
            }
          }
        );
        expect(issuerAuthCredential.credentialStatus.id).to.contain(rhsContract);
      })();
    });
  });
});
