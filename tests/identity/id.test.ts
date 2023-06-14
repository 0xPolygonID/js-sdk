/* eslint-disable no-console */
import {
  CredentialStorage,
  Identity,
  IdentityStorage,
  IdentityWallet,
  Profile,
  byteEncoder
} from '../../src';
import { BjjProvider, KMS, KmsKeyType } from '../../src/kms';
import { InMemoryPrivateKeyStore } from '../../src/kms/store';
import { MerkleTreeType } from '../../src/storage/entities/mt';
import { IDataStorage, IStateStorage } from '../../src/storage/interfaces';
import { InMemoryDataSource, InMemoryMerkleTreeStorage } from '../../src/storage/memory';
import { CredentialRequest, CredentialWallet } from '../../src/credentials';
import { CredentialStatusType, VerifiableConstants, W3CCredential } from '../../src/verifiable';
import { RootInfo, StateProof } from '../../src/storage/entities/state';
import { Blockchain, DidMethod, NetworkId } from '@iden3/js-iden3-core';
import { expect } from 'chai';

describe('identity', () => {
  let wallet: IdentityWallet;
  let dataStorage: IDataStorage;

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
    const credWallet = new CredentialWallet(dataStorage);
    wallet = new IdentityWallet(kms, dataStorage, credWallet);
  });
  it('createIdentity', async () => {
    const seedPhrase: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        baseUrl: 'http://rhs.com/node'
      }
    });
    expect(did.string()).to.equal(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );
    const dbCred = await dataStorage.credential.findCredentialById(credential.id);
    expect(credential).to.deep.equal(dbCred);

    const claimsTree = await dataStorage.mt.getMerkleTreeByIdentifierAndType(
      did.string(),
      MerkleTreeType.Claims
    );

    console.log(JSON.stringify(credential));
    expect((await claimsTree.root()).bigInt()).not.to.equal(0);
  });
  it('createProfile', async () => {
    const seedPhrase: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedseed');

    const { did } = await wallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        baseUrl: 'http://rhs.com/node'
      }
    });
    expect(did.string()).to.equal(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );

    const profileDID = await wallet.createProfile(did, 10, 'http://polygonissuer.com/');
    expect(profileDID.string()).to.equal(
      'did:iden3:polygon:mumbai:x2Ld4XmxEo6oGCSr3MsqBa5PmJie6WJ6pFbetzYuq'
    );

    const dbProfile = await dataStorage.identity.getProfileByVerifier('http://polygonissuer.com/');
    expect(dbProfile.id).to.equal(profileDID.string());
    expect(dbProfile.genesisIdentifier).to.equal(did.string());
    expect(dbProfile.nonce).to.equal(10);
  });
  it('sign', async () => {
    const seedPhrase: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        baseUrl: 'http://rhs.com/node'
      }
    });
    expect(did.string()).to.equal(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );

    const enc = byteEncoder; // always utf-8

    const message = enc.encode('payload');
    const sig = await wallet.sign(message, credential);

    expect(sig.hex()).to.equal(
      '5fdb4fc15898ee2eeed2ed13c5369a4f28870e51ac1aae8ad1f2108d2d39f38969881d7553344c658e63344e4ddc151fabfed5bf8fcf8663c183248b714d8b03'
    );
  });
  it('generateMtp', async () => {
    const seedPhrase: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        baseUrl: 'http://rhs.com/node'
      }
    });
    expect(did.string()).to.equal(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );

    const proof = await wallet.generateCredentialMtp(did, credential);

    expect(proof.proof.existence).to.equal(true);
  });
  it('generateNonRevProof', async () => {
    const seedPhrase: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        baseUrl: 'http://rhs.com/node'
      }
    });
    expect(did.string()).to.equal(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );

    const proof = await wallet.generateNonRevocationMtp(did, credential);

    expect(proof.proof.existence).to.equal(false);
  });

  it('generateNonRevProof', async () => {
    const seedPhrase: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        baseUrl: 'http://rhs.com/node'
      }
    });
    expect(did.string()).to.equal(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );

    const proof = await wallet.generateNonRevocationMtp(did, credential);

    expect(proof.proof.existence).to.equal(false);
  });

  it('issueCredential', async () => {
    const seedPhraseIssuer: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedseed');
    const seedPhraseUser: Uint8Array = byteEncoder.encode('userseedseedseedseedseedseeduser');

    const { did: issuerDID, credential: issuerAuthCredential } = await wallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhraseIssuer,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        baseUrl: 'http://rhs.com/node'
      }
    });

    expect(issuerDID.string()).to.equal(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );

    expect(issuerAuthCredential).not.to.be.undefined;

    const { did: userDID, credential: userAuthCredential } = await wallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhraseUser,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        baseUrl: 'http://rhs.com/node'
      }
    });
    expect(userAuthCredential).not.to.be.undefined;

    const claimReq: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v2.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.string(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 12345678888,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        baseUrl: 'http://rhs.com/node'
      }
    };
    const issuerCred = await wallet.issueCredential(issuerDID, claimReq);

    expect(issuerCred.credentialSubject.id).to.equal(userDID.string());
  });
});
