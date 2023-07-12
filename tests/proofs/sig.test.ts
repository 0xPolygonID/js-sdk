/* eslint-disable no-console */
import {
  CircuitStorage,
  CredentialStorage,
  Identity,
  IdentityStorage,
  IdentityWallet,
  Profile
} from '../../src';
import { BjjProvider, KMS, KmsKeyType } from '../../src/kms';
import { InMemoryPrivateKeyStore } from '../../src/kms/store';
import { IDataStorage, IStateStorage } from '../../src/storage/interfaces';
import { InMemoryDataSource, InMemoryMerkleTreeStorage } from '../../src/storage/memory';
import { CredentialRequest, CredentialWallet } from '../../src/credentials';
import { ProofService } from '../../src/proof';
import { CircuitId } from '../../src/circuits';
import { FSKeyLoader } from '../../src/loaders';
import { CredentialStatusType, VerifiableConstants, W3CCredential } from '../../src/verifiable';
import { RootInfo, StateProof } from '../../src/storage/entities/state';
import path from 'path';
import { byteEncoder } from '../../src';
import { ZeroKnowledgeProofRequest } from '../../src/iden3comm';
import { CircuitData } from '../../src/storage/entities/circuitData';
import { Blockchain, DidMethod, NetworkId } from '@iden3/js-iden3-core';
import { expect } from 'chai';
import { checkVerifiablePresentation } from './common';
import { CredentialStatusResolverRegistry } from '../../src/credentials';
import { RHSResolver } from '../../src/credentials';

describe('sig proofs', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;
  let proofService: ProofService;
  const rhsUrl = process.env.RHS_URL as string;
  const seedPhraseIssuer: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedseed');
  const seedPhrase: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseeduser');

  const mockStateStorage: IStateStorage = {
    getLatestStateById: async () => {
      throw new Error(VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST);
    },
    publishState: async () => {
      return '0xc837f95c984892dbcc3ac41812ecb145fedc26d7003202c50e1b87e226a9b33c';
    },
    getGISTProof: (): Promise<StateProof> => {
      return Promise.resolve({
        root: 0n,
        existence: false,
        siblings: [],
        index: 0n,
        value: 0n,
        auxExistence: false,
        auxIndex: 0n,
        auxValue: 0n
      });
    },
    getGISTRootInfo: (): Promise<RootInfo> => {
      return Promise.resolve({
        root: 0n,
        replacedByRoot: 0n,
        createdAtTimestamp: 0n,
        replacedAtTimestamp: 0n,
        createdAtBlock: 0n,
        replacedAtBlock: 0n
      });
    }
  };

  beforeEach(async () => {
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
      states: mockStateStorage
    };

    const circuitStorage = new CircuitStorage(new InMemoryDataSource<CircuitData>());

    const loader = new FSKeyLoader(path.join(__dirname, './testdata'));

    await circuitStorage.saveCircuitData(CircuitId.AuthV2, {
      circuitId: CircuitId.AuthV2,
      wasm: await loader.load(`${CircuitId.AuthV2.toString()}/circuit.wasm`),
      provingKey: await loader.load(`${CircuitId.AuthV2.toString()}/circuit_final.zkey`),
      verificationKey: await loader.load(`${CircuitId.AuthV2.toString()}/verification_key.json`)
    });

    await circuitStorage.saveCircuitData(CircuitId.AtomicQuerySigV2, {
      circuitId: CircuitId.AtomicQuerySigV2,
      wasm: await loader.load(`${CircuitId.AtomicQuerySigV2.toString()}/circuit.wasm`),
      provingKey: await loader.load(`${CircuitId.AtomicQuerySigV2.toString()}/circuit_final.zkey`),
      verificationKey: await loader.load(
        `${CircuitId.AtomicQuerySigV2.toString()}/verification_key.json`
      )
    });

    await circuitStorage.saveCircuitData(CircuitId.StateTransition, {
      circuitId: CircuitId.StateTransition,
      wasm: await loader.load(`${CircuitId.StateTransition.toString()}/circuit.wasm`),
      provingKey: await loader.load(`${CircuitId.StateTransition.toString()}/circuit_final.zkey`),
      verificationKey: await loader.load(
        `${CircuitId.AtomicQueryMTPV2.toString()}/verification_key.json`
      )
    });

    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );
    credWallet = new CredentialWallet(dataStorage, resolvers);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    proofService = new ProofService(idWallet, credWallet, circuitStorage, mockStateStorage, {
      ipfsGatewayURL: 'https://ipfs.io'
    });
  });

  it('sigv2-non-merklized', async () => {
    const { did: userDID, credential: cred } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });
    const { did: issuerDID } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhraseIssuer,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });

    const claimReq: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v2.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.string(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 1693526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    await credWallet.save(issuerCred);

    const proofReq: ZeroKnowledgeProofRequest = {
      id: 1,
      circuitId: CircuitId.AtomicQuerySigV2,
      optional: false,
      query: {
        allowedIssuers: ['*'],
        type: claimReq.type,
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

    const { proof, vp } = await proofService.generateProof(proofReq, userDID, credsForMyUserDID[0]);
    console.log(proof);

    expect(vp).to.be.undefined;

    await checkVerifiablePresentation(
      claimReq.type,
      userDID,
      credsForMyUserDID[0],
      proofService,
      CircuitId.AtomicQuerySigV2
    );
  });

  it('sigv2-merklized', async () => {
    const { did: userDID } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });

    const { did: issuerDID } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhraseIssuer,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });
    const claimReq: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.string(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 1693526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    await credWallet.save(issuerCred);

    const proofReq: ZeroKnowledgeProofRequest = {
      id: 1,
      circuitId: CircuitId.AtomicQuerySigV2,
      optional: false,
      query: {
        allowedIssuers: ['*'],
        type: claimReq.type,
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

    const { proof, vp } = await proofService.generateProof(proofReq, userDID, credsForMyUserDID[0]);
    console.log(proof);

    expect(vp).to.be.undefined;

    await checkVerifiablePresentation(
      claimReq.type,
      userDID,
      credsForMyUserDID[0],
      proofService,
      CircuitId.AtomicQuerySigV2
    );
  });

  it('sigv2-merklized-query-array', async () => {
    const { did: userDID } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });

    const { did: issuerDID } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhraseIssuer,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });
    const claimReq: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.string(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 1693526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    await credWallet.save(issuerCred);

    const proofReq: ZeroKnowledgeProofRequest = {
      id: 1,
      circuitId: CircuitId.AtomicQuerySigV2,
      optional: false,
      query: {
        allowedIssuers: ['*'],
        type: claimReq.type,
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

    const { proof, vp } = await proofService.generateProof(proofReq, userDID, credsForMyUserDID[0]);
    console.log(proof);

    expect(vp).to.be.undefined;

    await checkVerifiablePresentation(
      claimReq.type,
      userDID,
      credsForMyUserDID[0],
      proofService,
      CircuitId.AtomicQuerySigV2
    );
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

    const { did: userDID } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });

    const { did: issuerDID } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhraseIssuer,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });
    const claimReq: CredentialRequest = {
      credentialSchema: 'ipfs://Qmb1Q5jLETkUkhswCVX52ntTCNQnRm3NyyGf1NZG98u5cv',
      type: 'TestString',
      credentialSubject: {
        id: userDID.string(),
        stringTest: 'test'
      },
      expiration: 1693526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq, {
      ipfsGatewayURL: 'https://ipfs.io'
    });

    await credWallet.save(issuerCred);

    const creds = await credWallet.findByQuery(req.body.scope[0].query);
    expect(creds.length).to.not.equal(0);

    const credsForMyUserDID = await credWallet.filterByCredentialSubject(creds, userDID);
    expect(credsForMyUserDID.length).to.equal(1);

    const { proof, vp } = await proofService.generateProof(
      req.body.scope[0],
      userDID,
      credsForMyUserDID[0]
    );
    console.log(proof);

    expect(vp).to.be.undefined;
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

    const { did: issuerDID } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhraseIssuer,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });

    const { did: userDID } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });

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
      expiration: 1693526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    };
    const issuedCred = await idWallet.issueCredential(issuerDID, claimReq, {
      ipfsGatewayURL: 'https://ipfs.io'
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
      expiration: 1693526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    };

    const deliveryCred = await idWallet.issueCredential(issuerDID, deliveryClaimReq, {
      ipfsGatewayURL: 'https://ipfs.io'
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
    const { proof, vp } = await proofService.generateProof(vpReq, userDID, credsForMyUserDID[0]);
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
      userDID,
      credsFromWallet[0]
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
});
