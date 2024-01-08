/* eslint-disable no-console */
import {
  CredentialStorage,
  FSCircuitStorage,
  Identity,
  IdentityStorage,
  IdentityWallet,
  Profile,
  byteEncoder
} from '../../src';
import { BjjProvider, KMS, KmsKeyType } from '../../src/kms';
import { InMemoryPrivateKeyStore } from '../../src/kms/store';
import { IDataStorage, IStateStorage } from '../../src/storage/interfaces';
import { InMemoryDataSource, InMemoryMerkleTreeStorage } from '../../src/storage/memory';
import {
  CredentialRequest,
  CredentialStatusResolverRegistry,
  CredentialWallet,
  RHSResolver
} from '../../src/credentials';
import { ProofService } from '../../src/proof';
import { CircuitId } from '../../src/circuits';
import { ethers } from 'ethers';
import { EthStateStorage } from '../../src/storage/blockchain/state';
import { RootInfo, StateProof } from '../../src/storage/entities/state';
import path from 'path';
import { CredentialStatusType, W3CCredential } from '../../src/verifiable';
import { ZeroKnowledgeProofRequest } from '../../src/iden3comm';
import { Blockchain, DidMethod, NetworkId } from '@iden3/js-iden3-core';
import { expect } from 'chai';

describe('mtp onchain proofs', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;
  let proofService: ProofService;

  const rhsUrl = process.env.RHS_URL as string;

  const walletKey = process.env.WALLET_KEY as string;

  const mockStateStorage: IStateStorage = {
    getLatestStateById: async () => {
      return {
        id: 25191641634853875207018381290409317860151551336133597267061715643603096065n,
        state: 5224437024673068498206105743424598123651101873588696368477339341771571761791n,
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

    const circuitStorage = new FSCircuitStorage({
      dirname: path.join(__dirname, './testdata')
    });

    // const conf =defaultEthConnectionConfig ;
    // conf.url = rpcUrl ;
    // conf.contractAddress = '0x134B1BE34911E39A8397ec6289782989729807a4';
    // const ethStorage = new EthStateStorage(conf);
    // dataStorage.states = ethStorage;

    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );
    credWallet = new CredentialWallet(dataStorage, resolvers);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    proofService = new ProofService(idWallet, credWallet, circuitStorage, mockStateStorage);
  });

  it('mtpv2onchain-merklized', async () => {
    await onChainMerklizedTest(CircuitId.AtomicQueryMTPV2OnChain);
  });

  it('mtpv3onchain-merklized', async () => {
    await onChainMerklizedTest(CircuitId.AtomicQueryV3OnChain);
  });

  const onChainMerklizedTest = async (circuitId: CircuitId) => {
    const seedPhraseIssuer: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedsnew');
    const seedPhrase: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseeduser');

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

    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhraseIssuer,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });
    await credWallet.save(issuerAuthCredential);

    const claimReq: CredentialRequest = {
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
        nonce: 1000,
        id: rhsUrl
      }
    };

    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

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

    await credWallet.saveAll(credsWithIden3MTPProof);

    const proofReq: ZeroKnowledgeProofRequest = {
      id: 1,
      circuitId: circuitId,
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

    const { proof, pub_signals, vp } = await proofService.generateProof(proofReq, userDID, {
      challenge: BigInt(2),
      skipRevocation: false
    });
    expect(vp).to.be.undefined;

    const isValid = await proofService.verifyProof({ proof, pub_signals }, circuitId);
    expect(isValid).to.be.true;
  };
});
