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
import { ethers, Signer } from 'ethers';
import { defaultEthConnectionConfig, EthStateStorage } from '../../src/storage/blockchain/state';
import { RootInfo, StateProof } from '../../src/storage/entities/state';
import path from 'path';
import { W3CCredential } from '../../src/verifiable';
import { ZeroKnowledgeProofRequest } from '../../src/iden3comm';
import { CircuitData } from '../../src/storage/entities/circuitData';
import { Blockchain, DidMethod, NetworkId } from '@iden3/js-iden3-core';
import { expect } from 'chai';

describe.skip('mtp proofs', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;
  let proofService: ProofService;

  let ethStorage: EthStateStorage;

  const rhsUrl = process.env.RHS_URL as string;
  const infuraUrl = process.env.RPC_URL as string;
  const walletKey = process.env.WALLET_KEY as string;

  const mockStateStorage: IStateStorage = {
    getLatestStateById: async () => {
      return {
        id: 25191641634853875207018381290409317860151551336133597267061715643603096065n,
        state: 15316103435703269893947162180693935798669021972402205481551466808302934202991n,
        replacedByState: 0n,
        createdAtTimestamp: 1672245326n,
        replacedAtTimestamp: 0n,
        createdAtBlock: 30258020n,
        replacedAtBlock: 0n
      };
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

    // todo: change this loader
    const loader = new FSKeyLoader(path.join(__dirname, './testdata'));

    await circuitStorage.saveCircuitData(CircuitId.AtomicQueryMTPV2, {
      circuitId: CircuitId.AtomicQueryMTPV2,
      wasm: await loader.load(`${CircuitId.AtomicQueryMTPV2.toString()}/circuit.wasm`),
      provingKey: await loader.load(`${CircuitId.AtomicQueryMTPV2.toString()}/circuit_final.zkey`),
      verificationKey: await loader.load(
        `${CircuitId.AtomicQueryMTPV2.toString()}/verification_key.json`
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

    /*
    To use ethereum storage 

    const conf = defaultEthConnectionConfig;
    conf.url = infuraUrl; 
    conf.contractAddress = '0x134B1BE34911E39A8397ec6289782989729807a4';
    ethStorage = new EthStateStorage(conf);
    dataStorage.states = ethStorage;

    */
    credWallet = new CredentialWallet(dataStorage);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    proofService = new ProofService(idWallet, credWallet, circuitStorage, mockStateStorage);
  });

  it('mtpv2-non-merklized', async () => {
    const seedPhraseIssuer: Uint8Array = new TextEncoder().encode(
      'seedseedseedseedseedseedseedseed'
    );
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseeduser');

    const { did: userDID } = await idWallet.createIdentity('http://mytestwallet.com/', {
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhrase,
      rhsUrl
    });

    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity(
      'http://mytestwallet.com/',
      {
        method: DidMethod.Iden3,
        blockchain: Blockchain.Polygon,
        networkId: NetworkId.Mumbai,
        seed: seedPhraseIssuer,
        rhsUrl
      }
    );
    await credWallet.save(issuerAuthCredential);

    const claimReq: CredentialRequest = {
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

    const issuerCred = await idWallet.issueCredential(
      issuerDID,
      claimReq,
      'http://mytestwallet.com/',
      {
        withRHS: rhsUrl
      }
    );

    await credWallet.save(issuerCred);

    const res = await idWallet.addCredentialsToMerkleTree([issuerCred], issuerDID);

    // publish to rhs

    await idWallet.publishStateToRHS(issuerDID, rhsUrl);

    // you must store stat info (e.g. state and it's roots)

    const ethSigner = new ethers.Wallet(
      walletKey,
      (dataStorage.states as EthStateStorage).provider
    );
    const txId = await proofService.transitState(
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

    const proofReq: ZeroKnowledgeProofRequest = {
      id: 1,
      circuitId: CircuitId.AtomicQueryMTPV2,
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
    expect(creds.length).to.equal(1);

    const { proof } = await proofService.generateProof(proofReq, userDID, credsForMyUserDID[0]);
    console.log(proof);
  });

  it('mtpv2-merklized', async () => {
    const seedPhraseIssuer: Uint8Array = new TextEncoder().encode(
      'seedseedseedseedseedseedseedsnew'
    );
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseeduser');

    const { did: userDID, credential } = await idWallet.createIdentity('http://mytestwallet.com/', {
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhrase,
      rhsUrl
    });

    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity(
      'http://mytestwallet.com/',
      {
        method: DidMethod.Iden3,
        blockchain: Blockchain.Polygon,
        networkId: NetworkId.Mumbai,
        seed: seedPhraseIssuer,
        rhsUrl
      }
    );
    await credWallet.save(issuerAuthCredential);

    const claimReq: CredentialRequest = {
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

    const issuerCred = await idWallet.issueCredential(
      issuerDID,
      claimReq,
      'http://mytestwallet.com/',
      {
        withRHS: rhsUrl
      }
    );

    await credWallet.save(issuerCred);

    const res = await idWallet.addCredentialsToMerkleTree([issuerCred], issuerDID);

    // publish to rhs

    await idWallet.publishStateToRHS(issuerDID, rhsUrl);

    // you must store stat info (e.g. state and it's roots)

    const ethSigner = new ethers.Wallet(
      walletKey,
      (dataStorage.states as EthStateStorage).provider
    );

    const txId = await proofService.transitState(
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

    const proofReq: ZeroKnowledgeProofRequest = {
      id: 1,
      circuitId: CircuitId.AtomicQueryMTPV2,
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
    expect(creds.length).to.equal(1);

    const { proof } = await proofService.generateProof(proofReq, userDID, credsForMyUserDID[0]);
    console.log(proof);
  });
});
