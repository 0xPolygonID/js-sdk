/* eslint-disable no-console */
import {
  FSCircuitStorage,
  CircuitId,
  CredentialStatusType,
  CredentialStatusResolverRegistry,
  RHSResolver,
  JSONObject,
  ZeroKnowledgeProofRequest,
  IdentityWallet,
  ProofService,
  CredentialRequest,
  CredentialWallet,
  ICircuitStorage,
  IDataStorage
} from '../../src';
import path from 'path';
import { DID } from '@iden3/js-iden3-core';
import { expect } from 'chai';
import {
  MOCK_STATE_STORAGE,
  IPFS_URL,
  RHS_URL,
  SEED_ISSUER,
  SEED_USER,
  createIdentity,
  getInMemoryDataStorage,
  registerBJJIntoInMemoryKMS
} from '../helpers';

describe('sig proofs', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;
  let proofService: ProofService;

  let userDID: DID;
  let issuerDID: DID;
  let circuitStorage: ICircuitStorage;
  let kycAgeCredReq: CredentialRequest;

  beforeEach(async () => {
    circuitStorage = new FSCircuitStorage({
      dirname: path.join(__dirname, './testdata')
    });
    const kms = registerBJJIntoInMemoryKMS();
    dataStorage = getInMemoryDataStorage(MOCK_STATE_STORAGE);

    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );
    credWallet = new CredentialWallet(dataStorage, resolvers);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    proofService = new ProofService(idWallet, credWallet, circuitStorage, MOCK_STATE_STORAGE, {
      ipfsNodeURL: IPFS_URL
    });

    const { did: user } = await createIdentity(idWallet, { seed: SEED_USER });
    const { did: issuer } = await createIdentity(idWallet, { seed: SEED_ISSUER });
    userDID = user;
    issuerDID = issuer;
    kycAgeCredReq = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.string(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: RHS_URL
      }
    };
  });

  it('sigv2-non-merklized', async () => {
    await sigNonMerklizedTest(CircuitId.AtomicQuerySigV2);
  });

  const sigNonMerklizedTest = async (circuitId: CircuitId) => {
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
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: RHS_URL
      }
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    await credWallet.save(issuerCred);

    const proofReq: ZeroKnowledgeProofRequest = {
      id: 1,
      circuitId: circuitId,
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

    const creds = await credWallet.findByQuery(proofReq.query);
    expect(creds.length).to.not.equal(0);

    const credsForMyUserDID = await credWallet.filterByCredentialSubject(creds, userDID);
    expect(credsForMyUserDID.length).to.equal(1);

    const { proof, vp } = await proofService.generateProof(proofReq, userDID);

    expect(proof).not.to.be.undefined;
    expect(vp).to.be.undefined;
  };

  it('sigv3-non-merklized', async () => {
    await sigNonMerklizedTest(CircuitId.AtomicQueryV3);
  });

  it('sigv2-merklized', async () => {
    await sigMerklizedTest(CircuitId.AtomicQuerySigV2);
  });

  it('sigv3-merklized', async () => {
    await sigMerklizedTest(CircuitId.AtomicQueryV3);
  });

  const sigMerklizedTest = async (circuitId: CircuitId) => {
    const issuerCred = await idWallet.issueCredential(issuerDID, kycAgeCredReq);

    await credWallet.save(issuerCred);

    const proofReq: ZeroKnowledgeProofRequest = {
      id: 1,
      circuitId: circuitId,
      optional: false,
      query: {
        allowedIssuers: ['*'],
        type: kycAgeCredReq.type,
        context:
          'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld',
        credentialSubject: {
          documentType: {
            $eq: 99
          }
        }
      }
    };

    const creds = await credWallet.findByQuery(proofReq.query);
    expect(creds.length).to.not.equal(0);

    const credsForMyUserDID = await credWallet.filterByCredentialSubject(creds, userDID);
    expect(credsForMyUserDID.length).to.equal(1);

    const { proof, vp } = await proofService.generateProof(proofReq, userDID, {
      credential: credsForMyUserDID[0],
      skipRevocation: false
    });

    expect(vp).to.be.undefined;
    expect(proof).not.to.be.undefined;
  };

  it('sigv2-merklized-query-array', async () => {
    const issuerCred = await idWallet.issueCredential(issuerDID, kycAgeCredReq);

    await credWallet.save(issuerCred);

    const proofReq: ZeroKnowledgeProofRequest = {
      id: 1,
      circuitId: CircuitId.AtomicQuerySigV2,
      optional: false,
      query: {
        allowedIssuers: ['*'],
        type: kycAgeCredReq.type,
        context:
          'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld',
        credentialSubject: {
          documentType: {
            $in: [99]
          }
        }
      }
    };

    const creds = await credWallet.findByQuery(proofReq.query);
    expect(creds.length).to.not.equal(0);

    const credsForMyUserDID = await credWallet.filterByCredentialSubject(creds, userDID);
    expect(credsForMyUserDID.length).to.equal(1);

    const { proof, vp } = await proofService.generateProof(proofReq, userDID, {
      credential: credsForMyUserDID[0],
      skipRevocation: true
    });
    expect(proof).not.to.be.undefined;
    expect(vp).to.be.undefined;
  });

  it('sigv2-ipfs-string-eq', async () => {
    const req = {
      id: '0d8e91e5-5686-49b5-85e3-2b35538c6a03',
      typ: 'application/iden3comm-plain-json',
      type: 'https://iden3-communication.io/authorization/1.0/request',
      thid: '0d8e91e5-5686-49b5-85e3-2b35538c6a03',
      body: {
        callbackUrl: 'https://verifier-v2.polygonid.me/api/callback?sessionId=25269',
        reason: 'test flow',
        scope: [
          {
            id: 1,
            circuitId: 'credentialAtomicQuerySigV2',
            query: {
              allowedIssuers: ['*'],
              context: 'ipfs://QmZ1zsLspwnjifxsncqDkB7EHb2pnaRnBPc5kqQcVxW5rV',
              credentialSubject: {
                stringTest: {
                  $eq: 'test'
                }
              },
              type: 'TestString'
            }
          }
        ]
      },
      from: 'did:polygonid:polygon:mumbai:2qLPqvayNQz9TA2r5VPxUugoF18teGU583zJ859wfy'
    };

    const claimReq: CredentialRequest = {
      credentialSchema: 'ipfs://Qmb1Q5jLETkUkhswCVX52ntTCNQnRm3NyyGf1NZG98u5cv',
      type: 'TestString',
      credentialSubject: {
        id: userDID.string(),
        stringTest: 'test'
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: RHS_URL
      }
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq, {
      ipfsNodeURL: IPFS_URL
    });

    await credWallet.save(issuerCred);

    const creds = await credWallet.findByQuery(req.body.scope[0].query);
    expect(creds.length).to.not.equal(0);

    const { proof, vp, circuitId, pub_signals } = await proofService.generateProof(
      req.body.scope[0],
      userDID
    );
    expect(proof).not.to.be.undefined;
    expect(vp).to.be.undefined;

    const isValid = await proofService.verifyProof(
      {
        proof,
        pub_signals
      },
      circuitId as CircuitId
    );

    expect(isValid).to.be.true;

    const pi_a = ['99', ...proof.pi_a.slice(1)];
    const isNotValid = await proofService.verifyProof(
      {
        proof: {
          ...proof,
          pi_a
        },
        pub_signals
      },
      circuitId as CircuitId
    );

    expect(isNotValid).to.be.false;
  });

  it('sigv2 vp-credential', async () => {
    const query = {
      allowedIssuers: ['*'],
      context: 'ipfs://QmQXQ5gBNfJuc9QXy5pGbaVfLxzFjCDAvPs4Fa43BaU1U4',
      credentialSubject: {
        'postalProviderInformation.name': {}
      },
      type: 'DeliveryAddress'
    };

    const claimReq: CredentialRequest = {
      credentialSchema: 'ipfs://QmbLQKw9Mzc9fVHowatJbvZjWNSUZchxYQX5Wtt8Ff9rGx',
      type: 'DeliveryAddress',
      credentialSubject: {
        id: userDID.string(),
        price: 10,
        deliveryTime: '2023-07-11T16:05:51.140Z',
        postalProviderInformation: {
          name: 'ukr posta',
          officeNo: 1
        },
        homeAddress: {
          line2: 'line 2',
          line1: 'line 1'
        },
        isPostalProvider: true
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: RHS_URL
      }
    };
    const issuedCred = await idWallet.issueCredential(issuerDID, claimReq, {
      ipfsNodeURL: IPFS_URL
    });

    await credWallet.save(issuedCred);

    const creds = await credWallet.findByQuery(query);
    expect(creds.length).to.not.equal(0);

    const deliveryClaimReq: CredentialRequest = {
      credentialSchema: 'ipfs://QmQKgn6QUHzHXBqPCUbpCnHSyVRLaCVoDqA8fg27DzS79D',
      type: 'DeliverAddressMultiTest',
      credentialSubject: {
        country: 'Ukraine',
        deliveryTime: '2023-08-12T11:47:50+00:00',
        homeAddress: {
          expectedFrom: '2023-08-12T11:47:50+00:00',
          line1: 'Kyiv, Zdanovskoi Y. 35',
          line2: 'apt.1'
        },
        id: userDID.string(),
        isPostalProvider: false,
        operatorId: 103,
        postalProviderInformation: {
          insured: false,
          name: 'mist',
          officeNo: 124,
          weight: 1.2
        },
        price: 15.2,
        type: 'DeliverAddressMultiTest'
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: RHS_URL
      }
    };

    const deliveryCred = await idWallet.issueCredential(issuerDID, deliveryClaimReq, {
      ipfsNodeURL: IPFS_URL
    });

    await credWallet.save(deliveryCred);

    const deliveryCredQuery = {
      allowedIssuers: ['*'],
      context: 'ipfs://QmZreEq1z5tMAuNBNTXjfpYMQbQ8KL7YkkVBt5nG1bUqJT',
      credentialSubject: {
        'postalProviderInformation.insured': {
          $eq: false
        }
      },
      type: 'DeliverAddressMultiTest'
    };

    const credsFromWallet = await credWallet.findByQuery(deliveryCredQuery);

    expect(credsFromWallet.length).to.equal(1);

    const credsForMyUserDID = await credWallet.filterByCredentialSubject(creds, userDID);
    expect(credsForMyUserDID.length).to.equal(1);
    const vpReq = {
      id: 1,
      circuitId: 'credentialAtomicQuerySigV2',
      query
    };
    const { proof, vp } = await proofService.generateProof(vpReq, userDID);
    expect(proof).not.to.be.undefined;

    expect(vp).to.deep.equal({
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      '@type': 'VerifiablePresentation',
      verifiableCredential: {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'ipfs://QmQXQ5gBNfJuc9QXy5pGbaVfLxzFjCDAvPs4Fa43BaU1U4'
        ],
        '@type': ['VerifiableCredential', 'DeliveryAddress'],
        credentialSubject: {
          '@type': 'DeliveryAddress',
          postalProviderInformation: { name: 'ukr posta' }
        }
      }
    });
    const deliveryVPReq = {
      id: 1,
      circuitId: 'credentialAtomicQuerySigV2',
      query: {
        ...deliveryCredQuery,
        credentialSubject: { 'postalProviderInformation.insured': {} }
      }
    };
    const { proof: deliveryProof, vp: deliveryVP } = await proofService.generateProof(
      deliveryVPReq,
      userDID
    );
    expect(deliveryProof).not.to.be.undefined;

    expect(deliveryVP).to.deep.equal({
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      '@type': 'VerifiablePresentation',
      verifiableCredential: {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'ipfs://QmZreEq1z5tMAuNBNTXjfpYMQbQ8KL7YkkVBt5nG1bUqJT'
        ],
        '@type': ['VerifiableCredential', 'DeliverAddressMultiTest'],
        credentialSubject: {
          '@type': 'DeliverAddressMultiTest',
          postalProviderInformation: { insured: false }
        }
      }
    });
  });

  describe('edge cases', () => {
    const zeroDocTypeCredReqFn = (id: string): CredentialRequest => ({
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/kyc-nonmerklized.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id,
        birthday: 19960424,
        documentType: 0
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: RHS_URL
      }
    });

    const proofReqFn = (
      circuitId: CircuitId,
      did: string,
      credentialSubject: JSONObject
    ): ZeroKnowledgeProofRequest => ({
      id: 1,
      circuitId,
      optional: false,
      query: {
        allowedIssuers: ['*'],
        type: zeroDocTypeCredReqFn(did).type,
        context:
          'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-nonmerklized.jsonld',
        credentialSubject
      }
    });

    it('should $nin operator work properly for 0 value in credential for V3 compared to V2 circuit', async () => {
      const issuerCred = await idWallet.issueCredential(
        issuerDID,
        zeroDocTypeCredReqFn(userDID.string())
      );
      const subj = {
        documentType: {
          $nin: [1, 2, 3]
        }
      };
      await expect(
        proofService.generateProof(
          proofReqFn(CircuitId.AtomicQuerySigV2, userDID.string(), subj),
          userDID,
          {
            credential: issuerCred,
            skipRevocation: true
          }
        )
      ).to.be.rejected;

      const zkProof = await proofService.generateProof(
        proofReqFn(CircuitId.AtomicQueryV3, userDID.string(), subj),
        userDID,
        {
          credential: issuerCred,
          skipRevocation: true
        }
      );

      const valid = await proofService.verifyProof(zkProof, CircuitId.AtomicQueryV3);

      expect(valid).to.be.true;
    });

    it('should $in operator work properly for 0 value in credential for V3 compared to V2 circuit', async () => {
      const credential = await idWallet.issueCredential(
        issuerDID,
        zeroDocTypeCredReqFn(userDID.string())
      );
      const subj = {
        documentType: {
          $in: [1, 2, 3]
        }
      };

      // will fail because of $nin operator
      await expect(
        proofService.generateProof(
          proofReqFn(CircuitId.AtomicQuerySigV2, userDID.string(), subj),
          userDID,
          {
            credential,
            skipRevocation: true
          }
        )
      ).not.to.be.rejected;

      await expect(
        proofService.generateProof(
          proofReqFn(CircuitId.AtomicQueryV3, userDID.string(), subj),
          userDID,
          {
            credential,
            skipRevocation: true
          }
        )
      ).to.be.rejected;
    });
  });
});
