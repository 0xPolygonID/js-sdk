import { IdentityWallet } from '../../src';
import { BjjProvider, KMS, KmsKeyType } from '../../src/kms';
import { InMemoryPrivateKeyStore } from '../../src/kms/store';
import { IDataStorage, IStateStorage } from '../../src/storage/interfaces';
import {
  InMemoryCredentialStorage,
  InMemoryIdentityStorage,
  InMemoryMerkleTreeStorage
} from '../../src/storage/memory';
import { ClaimRequest, CredentialWallet } from '../../src/credentials';
import { StateInfo } from '../../src/storage/entities/state';
import { FullProof, IProofService, ProofService, ZKPRequest } from '../../src/proof';
import { InMemoryCircuitStorage } from '../../src/storage/memory/circuits';
import { CircuitId } from '../../src/circuits';
import { FSKeyLoader } from '../../src/loaders';
import { defaultEthConnectionConfig, EthStateStorage } from '../../src/storage/blockchain/state';
import { ethers, Signer } from 'ethers';

describe.only('proofs', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;
  let proofService: ProofService;

  const mockStateStorage = {
    getLatestStateById: jest.fn(async (issuerId: bigint) => {
      return { id: BigInt(0), state: BigInt(0) } as StateInfo;
    }),
    publishState: jest.fn(async (proof: FullProof, signer: Signer) => {
      return '0xc837f95c984892dbcc3ac41812ecb145fedc26d7003202c50e1b87e226a9b33c';
    })
  } as IStateStorage;
  beforeEach(async () => {
    const memoryKeyStore = new InMemoryPrivateKeyStore();
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, memoryKeyStore);
    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);

    dataStorage = {
      credential: new InMemoryCredentialStorage(),
      identity: new InMemoryIdentityStorage(),
      mt: new InMemoryMerkleTreeStorage(40),
      states: mockStateStorage
    };

    const circuitStorage = new InMemoryCircuitStorage();

    // todo: change this loader
    const loader = new FSKeyLoader(
      '/Users/vladyslavmunin/Projects/js/polygonid-js-sdk/tests/proofs/testdata'
    );
    circuitStorage.saveCircuitData(CircuitId.AtomicQuerySigV2, {
      wasm: await loader.load(`${CircuitId.AtomicQuerySigV2.toString()}/circuit.wasm`),
      provingKey: await loader.load(`${CircuitId.AtomicQuerySigV2.toString()}/circuit_final.zkey`),
      verificationKey: await loader.load(
        `${CircuitId.AtomicQuerySigV2.toString()}/verification_key.json`
      )
    });

    circuitStorage.saveCircuitData(CircuitId.AtomicQueryMTPV2, {
      wasm: await loader.load(`${CircuitId.AtomicQueryMTPV2.toString()}/circuit.wasm`),
      provingKey: await loader.load(`${CircuitId.AtomicQueryMTPV2.toString()}/circuit_final.zkey`),
      verificationKey: await loader.load(
        `${CircuitId.AtomicQueryMTPV2.toString()}/verification_key.json`
      )
    });

    circuitStorage.saveCircuitData(CircuitId.StateTransition, {
      wasm: await loader.load(`${CircuitId.StateTransition.toString()}/circuit.wasm`),
      provingKey: await loader.load(`${CircuitId.StateTransition.toString()}/circuit_final.zkey`),
      verificationKey: await loader.load(
        `${CircuitId.AtomicQueryMTPV2.toString()}/verification_key.json`
      )
    });



    let conf = defaultEthConnectionConfig;
    conf.url = '';
    conf.contractAddress = '';
    const ethStorage = new EthStateStorage(conf);
    ethStorage.publishState = mockStateStorage.publishState;

    dataStorage.states = ethStorage;

    credWallet = new CredentialWallet(dataStorage);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    proofService = new ProofService(idWallet, credWallet, kms, circuitStorage);
  });
  it.skip('sigv2-non-merklized', async () => {
    const seedPhraseIssuer: Uint8Array = new TextEncoder().encode(
      'seedseedseedseedseedseedseedseed'
    );
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseeduser');

    const { did: userDID, credential } = await idWallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhrase
    );
    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhraseIssuer
    );

    const claimReq: ClaimRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v2.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.toString(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 1693526400
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq, 'http://metamask.com/', {
      withPublish: false,
      withRHS: 'http://rhs.node'
    });

    console.log(JSON.stringify(issuerCred));

    await credWallet.save(issuerCred);

    const proofReq: ZKPRequest = {
      id: 1,
      circuitId: CircuitId.AtomicQuerySigV2,
      optional: false,
      query: {
        allowedIssuers: ['*'],
        type: claimReq.type,
        context:
          'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld',
        req: {
          documentType: {
            $eq: 99
          }
        }
      }
    };
    const { proof, credentials } = await proofService.generateProof(proofReq, userDID);
    console.log(proof);
  });
  it.skip('sigv2-merklized', async () => {
    const seedPhraseIssuer: Uint8Array = new TextEncoder().encode(
      'seedseedseedseedseedseedseedseed'
    );
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseeduser');

    const { did: userDID, credential } = await idWallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhrase
    );

    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhraseIssuer
    );
    const claimReq: ClaimRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.toString(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 1693526400
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq, 'http://metamask.com/', {
      withPublish: false,
      withRHS: 'http://rhs.node'
    });

    console.log(JSON.stringify(issuerCred));

    await credWallet.save(issuerCred);

    const proofReq: ZKPRequest = {
      id: 1,
      circuitId: CircuitId.AtomicQuerySigV2,
      optional: false,
      query: {
        allowedIssuers: ['*'],
        type: claimReq.type,
        context:
          'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld',
        req: {
          documentType: {
            $eq: 99
          }
        }
      }
    };
    const { proof, credentials } = await proofService.generateProof(proofReq, userDID);
    console.log(proof);
  });
  it.only('mtpv2-non-merklized', async () => {
    const rhsURL = '';
    let conf = defaultEthConnectionConfig;
    conf.url = '';
    conf.contractAddress = '0xf6781AD281d9892Df285cf86dF4F6eBec2042d71';
    const ethStorage = new EthStateStorage(conf);
    ethStorage.publishState = mockStateStorage.publishState;

    const seedPhraseIssuer: Uint8Array = new TextEncoder().encode(
      'seedseedseedseedseedseedseedseed'
    );
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseeduser');

    const { did: userDID, credential } = await idWallet.createIdentity(
      'http://metamask.com/',
      rhsURL,
      seedPhrase
    );

    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity(
      'http://metamask.com/',
      rhsURL,
      seedPhraseIssuer
    );
    await credWallet.save(issuerAuthCredential);

    const claimReq: ClaimRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v2.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.toString(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 1693526400
    };

    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq, 'http://metamask.com/', {
      withPublish: false,
      withRHS: 'http://ec2-34-247-165-109.eu-west-1.compute.amazonaws.com:9999'
    });

    console.log(JSON.stringify(issuerCred));

    await credWallet.save(issuerCred);

    const res = await idWallet.addCredentialsToMerkleTree([issuerCred], issuerDID);

    // publish to rhs

    await idWallet.publishStateToRHS(issuerDID, rhsURL);
    

    // you must store stat info (e.g. state and it's roots)

    const ethSigner = new ethers.Wallet('', undefined);
    const txId = await proofService.transiteState(
      issuerDID,
      res.oldTreeState,
      true,
      mockStateStorage,
      ethSigner
    );

    console.log(txId);
    const credsWithIden3MTPProof = await idWallet.generateIden3SparseMerkleTreeProof(
      issuerDID,
      res.credentials,
      txId
    );

    credWallet.saveAll(credsWithIden3MTPProof);

    const proofReq: ZKPRequest = {
      id: 1,
      circuitId: CircuitId.AtomicQueryMTPV2,
      optional: false,
      query: {
        allowedIssuers: ['*'],
        type: claimReq.type,
        context:
          'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld',
        req: {
          documentType: {
            $eq: 99
          }
        }
      }
    };

    const { proof, credentials } = await proofService.generateProof(proofReq, userDID);
    console.log(proof);
  });
});
