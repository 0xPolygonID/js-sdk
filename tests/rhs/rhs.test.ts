import { InMemoryDataSource } from './../../src/storage/memory/data-source';
import { CredentialStorage } from './../../src/storage/shared/credential-storage';
import { Identity, IdentityStorage, IdentityWallet, Profile, byteEncoder } from '../../src';
import { BjjProvider, KMS, KmsKeyType } from '../../src/kms';
import { InMemoryPrivateKeyStore } from '../../src/kms/store';
import { IDataStorage, IStateStorage } from '../../src/storage/interfaces';
import { InMemoryMerkleTreeStorage } from '../../src/storage/memory';
import { CredentialRequest, CredentialWallet } from '../../src/credentials';
import { defaultEthConnectionConfig, EthStateStorage } from '../../src/storage/blockchain/state';
import {
  CredentialStatus,
  CredentialStatusType,
  RevocationStatus,
  VerifiableConstants,
  W3CCredential
} from '../../src/verifiable';
import { Proof } from '@iden3/js-merkletree';
import { RootInfo, StateProof } from '../../src/storage/entities/state';
import { Blockchain, DidMethod, NetworkId } from '@iden3/js-iden3-core';
import { expect } from 'chai';
import { RHSResolver } from '../../src/credentials';
import { CredentialStatusResolverRegistry } from '../../src/credentials';

describe('rhs', () => {
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
        state: 16074735548090432706010308621156024769148807454202029933745588915345672503542n,
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
  const mockStateStorageForSecondState: IStateStorage = {
    getLatestStateById: async () => {
      return {
        id: 25191641634853875207018381290409317860151551336133597267061715643603096065n,
        state: 6579597760262775007137624273344484963760596803465690980061360458400178710641n,
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

    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
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

  it('genesis reject : backup is called', async () => {
    const seedPhraseIssuer: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedseed');
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

    const credBasicStatus: CredentialStatus = {
      id: 'http://issuerurl.com',
      revocationNonce: 0,
      type: CredentialStatusType.SparseMerkleTreeProof
    };
    const credRHSStatus: CredentialStatus = {
      id: rhsUrl,
      type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      revocationNonce: 0,
      statusIssuer: credBasicStatus
    };

    const rhsResolver = new RHSResolver(mockStateStorageForGenesisState);

    return rhsResolver
      .resolve(credRHSStatus, { issuerDID })
      .then(function () {
        throw new Error('was not supposed to succeed');
      })
      .catch((m) => {
        expect((m as Error).message).to.contains(
          `can't fetch revocation status from backup endpoint`
        );
      });
  });

  it('mocked issuer state', async () => {
    const seedPhrase: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseeduser');

    const seedPhraseIssuer: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedseed');

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

    const credBasicStatus: CredentialStatus = {
      id: 'http://issuerurl.coml',
      revocationNonce: 0,
      type: CredentialStatusType.SparseMerkleTreeProof
    };

    const credRHSStatus: CredentialStatus = {
      id: rhsUrl,
      type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      revocationNonce: 0,
      statusIssuer: credBasicStatus
    };

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
        id: rhsUrl
      }
    };

    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    await credWallet.save(issuerCred);

    const res = await idWallet.addCredentialsToMerkleTree([issuerCred], issuerDID);

    await idWallet.publishStateToRHS(issuerDID, rhsUrl);

    const rhsResolver = new RHSResolver(mockStateStorageForDefinedState);
    const rhsStatus = await rhsResolver.resolve(credRHSStatus, { issuerDID });

    expect(rhsStatus.issuer.state).to.equal(res.newTreeState.state.hex());
    expect(rhsStatus.issuer.claimsTreeRoot).to.equal(res.newTreeState.claimsRoot.hex());
    expect(rhsStatus.issuer.revocationTreeRoot).to.equal(res.newTreeState.revocationRoot.hex());
    expect(rhsStatus.issuer.rootOfRoots).to.equal(res.newTreeState.rootOfRoots.hex());
    expect(rhsStatus.mtp.existence).to.equal(false);
  });
  it('two creds. one revoked', async () => {
    const seedPhrase: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseeduser');

    const seedPhraseIssuer: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedseed');
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

    const { did: userDID, credential } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl
      }
    });

    expect(credential).not.to.be.undefined;

    const credBasicStatus: CredentialStatus = {
      id: 'http://issuerurl.coml',
      revocationNonce: 0,
      type: CredentialStatusType.SparseMerkleTreeProof
    };
    const credRHSStatus: CredentialStatus = {
      id: rhsUrl,
      type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      revocationNonce: 1000,
      statusIssuer: credBasicStatus
    };

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
        nonce: 1000,
        id: rhsUrl
      }
    };

    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    await credWallet.save(issuerCred);

    await idWallet.addCredentialsToMerkleTree([issuerCred], issuerDID);

    // let's add  one more credential

    const claimReq2: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/kyc-nonmerklized.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.string(),
        birthday: 19960523,
        documentType: 1
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: rhsUrl,
        nonce: 1001
      }
    };

    const issuerCred2 = await idWallet.issueCredential(issuerDID, claimReq2);

    await credWallet.save(issuerCred2);

    await idWallet.addCredentialsToMerkleTree([issuerCred2], issuerDID);

    const nonce: number = await idWallet.revokeCredential(issuerDID, issuerCred2);

    const latestTree = await idWallet.getDIDTreeModel(issuerDID);

    await idWallet.publishStateToRHS(issuerDID, rhsUrl, [nonce]);

    // state is published to blockchain (2)
    dataStorage.states = mockStateStorageForSecondState;

    const rhsResolver = new RHSResolver(dataStorage.states);
    const rhsStatus = await rhsResolver.resolve(credRHSStatus, { issuerDID });

    expect(rhsStatus.issuer.state).to.equal(latestTree.state.hex());
    expect(rhsStatus.issuer.claimsTreeRoot).to.equal((await latestTree.claimsTree.root()).hex());
    expect(rhsStatus.issuer.revocationTreeRoot).to.equal(
      (await latestTree.revocationTree.root()).hex()
    );
    expect(rhsStatus.issuer.rootOfRoots).to.equal((await latestTree.rootsTree.root()).hex());
    expect(rhsStatus.mtp.existence).to.equal(false);
  });
});
