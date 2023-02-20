import { InMemoryDataSource } from './../../src/storage/memory/data-source';
import { CredentialStorage } from './../../src/storage/shared/credential-storage';
import { CircuitStorage, Identity, IdentityStorage, IdentityWallet, Profile } from '../../src';
import { BjjProvider, KMS, KmsKeyType } from '../../src/kms';
import { InMemoryPrivateKeyStore } from '../../src/kms/store';
import { IDataStorage, IStateStorage } from '../../src/storage/interfaces';
import { InMemoryMerkleTreeStorage } from '../../src/storage/memory';
import { CredentialRequest, CredentialWallet } from '../../src/credentials';
import { FSKeyLoader } from '../../src/loaders';
import { defaultEthConnectionConfig, EthStateStorage } from '../../src/storage/blockchain/state';
import { getStatusFromRHS } from '../../src/credentials/revocation';
import {
  CredentialStatus,
  CredentialStatusType,
  RevocationStatus,
  RHSCredentialStatus,
  VerifiableConstants,
  W3CCredential
} from '../../src/verifiable';
import { Proof } from '@iden3/js-merkletree';
import { RootInfo, StateProof } from '../../src/storage/entities/state';
import { CircuitData } from '../../src/storage/entities/circuitData';
import { Blockchain, DidMethod, NetworkId } from '@iden3/js-iden3-core';
import { expect } from 'chai';
import path from 'path';

describe.skip('rhs', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;
  let dataStorage: IDataStorage;
  const rhsUrl = process.env.RHS_URL as string;
  const infuraUrl = process.env.RPC_URL as string;

  const mockStateStorageForGenesisState: IStateStorage = {
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

  const mockStateStorageForDefinedState: IStateStorage = {
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

    const conf = defaultEthConnectionConfig;
    conf.url = infuraUrl;
    conf.contractAddress = '0xf6781AD281d9892Df285cf86dF4F6eBec2042d71';
    const ethStorage = new EthStateStorage(conf);
    ethStorage.publishState = mockStateStorageForGenesisState.publishState;

    dataStorage = {
      credential: new CredentialStorage(new InMemoryDataSource<W3CCredential>()),
      identity: new IdentityStorage(
        new InMemoryDataSource<Identity>(),
        new InMemoryDataSource<Profile>()
      ),
      mt: new InMemoryMerkleTreeStorage(40),
      states: ethStorage
    };

    const circuitStorage = new CircuitStorage(new InMemoryDataSource<CircuitData>());

    const loader = new FSKeyLoader(path.join(__dirname, '../proofs/testdata'));

    credWallet = new CredentialWallet(dataStorage);
    credWallet.getRevocationStatusFromCredential = async (cred: W3CCredential) => {
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

  it('genesis reject', async () => {
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseeduser');

    const seedPhraseIssuer: Uint8Array = new TextEncoder().encode(
      'seedseedseedseedseedseedseedseed'
    );
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

    const credBasicStatus: CredentialStatus = {
      id: 'issuerurl',
      revocationNonce: 0,
      type: CredentialStatusType.SparseMerkleTreeProof
    };
    const credRHSStatus: RHSCredentialStatus = {
      id: rhsUrl,
      type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      revocationNonce: 0,
      statusIssuer: credBasicStatus
    };

    // await expect(

    return getStatusFromRHS(issuerDID, credRHSStatus, mockStateStorageForGenesisState)
      .then(function (m) {
        throw new Error('was not supposed to succeed');
      })
      .catch(function (m) {
        expect((m as Error).message).to.equal(VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST);
      });
  });
  it('mocked issuer state', async () => {
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseeduser');

    const seedPhraseIssuer: Uint8Array = new TextEncoder().encode(
      'seedseedseedseedseedseedseedseed'
    );
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

    const { did: userDID, credential } = await idWallet.createIdentity('http://mytestwallet.com/', {
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhrase,
      rhsUrl
    });

    const credBasicStatus: CredentialStatus = {
      id: 'issuerurl',
      revocationNonce: 0,
      type: CredentialStatusType.SparseMerkleTreeProof
    };
    const credRHSStatus: RHSCredentialStatus = {
      id: rhsUrl,
      type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      revocationNonce: 0,
      statusIssuer: credBasicStatus
    };

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

    await idWallet.publishStateToRHS(issuerDID, rhsUrl);

    const rhsStatus = await getStatusFromRHS(
      issuerDID,
      credRHSStatus,
      mockStateStorageForDefinedState
    );

    expect(rhsStatus.issuer.state).to.equal(res.newTreeState.state.hex());
    expect(rhsStatus.issuer.claimsTreeRoot).to.equal(res.newTreeState.claimsRoot.hex());
    expect(rhsStatus.issuer.revocationTreeRoot).to.equal(res.newTreeState.revocationRoot.hex());
    expect(rhsStatus.issuer.rootOfRoots).to.equal(res.newTreeState.rootOfRoots.hex());
    expect(rhsStatus.mtp.existence).to.equal(false);
  });
  it('two creds. one revoked', async () => {
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseeduser');

    const seedPhraseIssuer: Uint8Array = new TextEncoder().encode(
      'seedseedseedseedseedseedseedseed'
    );
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

    const { did: userDID, credential } = await idWallet.createIdentity('http://mytestwallet.com/', {
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhrase,
      rhsUrl
    });

    const credBasicStatus: CredentialStatus = {
      id: 'issuerurl',
      revocationNonce: 0,
      type: CredentialStatusType.SparseMerkleTreeProof
    };
    const credRHSStatus: RHSCredentialStatus = {
      id: rhsUrl,
      type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      revocationNonce: 1000,
      statusIssuer: credBasicStatus
    };

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

    // this state is published

    // let's add  one more credential

    const claimReq2: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v2.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.toString(),
        birthday: 19960523,
        documentType: 1
      },
      expiration: 1693526400,
      revNonce: 1001
    };

    const issuerCred2 = await idWallet.issueCredential(
      issuerDID,
      claimReq2,
      'http://mytestwallet.com/',
      {
        withRHS: rhsUrl
      }
    );

    await credWallet.save(issuerCred2);

    const res2 = await idWallet.addCredentialsToMerkleTree([issuerCred2], issuerDID);

    const nonce: number = await idWallet.revokeCredential(issuerDID, issuerCred2);

    const latestTree = await idWallet.getDIDTreeModel(issuerDID);

    await idWallet.publishStateToRHS(issuerDID, rhsUrl, [nonce]);

    // state is published to blockchain (2)

    const rhsStatus = await getStatusFromRHS(issuerDID, credRHSStatus, dataStorage.states);

    expect(rhsStatus.issuer.state).to.equal(latestTree.state.hex());
    expect(rhsStatus.issuer.claimsTreeRoot).to.equal(latestTree.claimsTree.root.hex());
    expect(rhsStatus.issuer.revocationTreeRoot).to.equal(latestTree.revocationTree.root.hex());
    expect(rhsStatus.issuer.rootOfRoots).to.equal(latestTree.rootsTree.root.hex());
    expect(rhsStatus.mtp.existence).to.equal(false);
  });
});
