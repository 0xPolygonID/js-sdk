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
import { FullProof, ProofService, ZKPRequest } from '../../src/proof';
import { InMemoryCircuitStorage } from '../../src/storage/memory/circuits';
import { CircuitId } from '../../src/circuits';
import { FSKeyLoader } from '../../src/loaders';
import { ethers, Signer } from 'ethers';
import { defaultEthConnectionConfig, EthStateStorage } from '../../src/storage/blockchain/state';

describe.only('mtp proofs', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;
  let proofService: ProofService;

  let ethStorage: EthStateStorage;
  const mockStateStorage = {
    getLatestStateById: jest.fn(async (issuerId: bigint) => {
      return {
        id: 25191641634853875207018381290409317860151551336133597267061715643603096065n,
        state: 15316103435703269893947162180693935798669021972402205481551466808302934202991n,
        replacedByState: 0n,
        createdAtTimestamp: 1672245326n,
        replacedAtTimestamp: 0n,
        createdAtBlock: 30258020n,
        replacedAtBlock: 0n
      };
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
      '/Users/vladyslavmunin/Projects/js/polygonid-js-sdk/tests/proofs/testdata' // TODO: change path here
    );

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
    conf.url = ''; // TODO: add url here
    conf.contractAddress = '0xf6781AD281d9892Df285cf86dF4F6eBec2042d71';
    ethStorage = new EthStateStorage(conf);
    dataStorage.states = ethStorage;
    credWallet = new CredentialWallet(dataStorage);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    proofService = new ProofService(idWallet, credWallet, kms, circuitStorage);
  });

  it.skip('mtpv2-non-merklized', async () => {
    const rhsURL = ''; //TODO:add

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
      expiration: 1693526400,
      revNonce: 1000
    };

    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq, 'http://metamask.com/', {
      withPublish: false,
      withRHS: rhsURL
    });

    await credWallet.save(issuerCred);

    const res = await idWallet.addCredentialsToMerkleTree([issuerCred], issuerDID);

    // publish to rhs

    await idWallet.publishStateToRHS(issuerDID, rhsURL);

    // you must store stat info (e.g. state and it's roots)

    const ethSigner = new ethers.Wallet('', undefined); //TODO:add
    const txId = await proofService.transiteState(
      issuerDID,
      res.oldTreeState,
      true,
      dataStorage.states,
      ethSigner
    );

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

  it.only('mtpv2-merklized', async () => {
    const rhsURL = 'http://ec2-34-247-165-109.eu-west-1.compute.amazonaws.com:9999'; //TODO:add

    const seedPhraseIssuer: Uint8Array = new TextEncoder().encode(
      'seedseedseedseedseedseedseedsnew'
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
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.toString(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 1693526400,
      revNonce: 1000
    };

    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq, 'http://metamask.com/', {
      withPublish: false,
      withRHS: rhsURL
    });

    await credWallet.save(issuerCred);

    const res = await idWallet.addCredentialsToMerkleTree([issuerCred], issuerDID);

    // publish to rhs

    await idWallet.publishStateToRHS(issuerDID, rhsURL);

    // you must store stat info (e.g. state and it's roots)

    const ethSigner = new ethers.Wallet(
      '08562dec34e81fbc26f719048efb075f217bf911521d4e674cf7b7ad51f989eb',
      ethStorage.provider
    ); //TODO:add
    const txId = await proofService.transiteState(
      issuerDID,
      res.oldTreeState,
      true,
      dataStorage.states,
      ethSigner
    );

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
