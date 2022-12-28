import { IdentityWallet } from '../../src';
import { BjjProvider, KMS, KmsKeyType } from '../../src/kms';
import { InMemoryPrivateKeyStore } from '../../src/kms/store';
import { MerkleTreeType } from '../../src/storage/entities/mt';
import { IDataStorage, IStateStorage } from '../../src/storage/interfaces';
import {
  InMemoryCredentialStorage,
  InMemoryIdentityStorage,
  InMemoryMerkleTreeStorage
} from '../../src/storage/memory';
import { ClaimRequest, CredentialWallet } from '../../src/credentials';
import { StateInfo } from '../../src/storage/entities/state';
import { FullProof } from '../../src/proof';
import { Signer } from 'ethers';

describe('identity', () => {
  let wallet: IdentityWallet;
  let dataStorage: IDataStorage;

  const mockStateStorage = {
    getLatestStateById: jest.fn(async (issuerId: bigint) => {
      return { id: BigInt(0), state: BigInt(0) } as StateInfo;
    }),
    publishState: jest.fn(async (proof:FullProof, signer :Signer) => {
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
    const credWallet = new CredentialWallet(dataStorage);
    wallet = new IdentityWallet(kms, dataStorage, credWallet);
  });
  it('createIdentity', async () => {
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhrase
    );
    expect(did.toString()).toBe(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );
    const dbCred = await dataStorage.credential.findCredentialById(credential.id);
    expect(credential).toBe(dbCred);

    const claimsTree = await dataStorage.mt.getMerkleTreeByIdentifierAndType(
      did.toString(),
      MerkleTreeType.Claims
    );

    expect(claimsTree?.root.bigInt()).not.toBe(0);
  });
  it('createProfile', async () => {
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhrase
    );
    expect(did.toString()).toBe(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );

    const profileDID = await wallet.createProfile(did, 10, 'http://polygonissuer.com/');
    expect(profileDID.toString()).toBe(
      'did:iden3:polygon:mumbai:x2Ld4XmxEo6oGCSr3MsqBa5PmJie6WJ6pFbetzYuq'
    );

    const dbProfile = await dataStorage.identity.getProfileByVerifier('http://polygonissuer.com/');
    expect(dbProfile.id).toBe(profileDID.toString());
    expect(dbProfile.genesisIdentifier).toBe(did.toString());
    expect(dbProfile.nonce).toBe(10);
  });
  it('sign', async () => {
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhrase
    );
    expect(did.toString()).toBe(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );

    const enc = new TextEncoder(); // always utf-8

    const message = enc.encode('payload');
    const sig = await wallet.sign(message, credential);

    expect(sig.hex()).toBe(
      '5fdb4fc15898ee2eeed2ed13c5369a4f28870e51ac1aae8ad1f2108d2d39f38969881d7553344c658e63344e4ddc151fabfed5bf8fcf8663c183248b714d8b03'
    );
  });
  it('generateMtp', async () => {
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhrase
    );
    expect(did.toString()).toBe(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );

    const proof = await wallet.generateClaimMtp(did, credential);

    expect(proof.proof.existence).toBe(true);
  });
  it('generateNonRevProof', async () => {
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhrase
    );
    expect(did.toString()).toBe(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );

    const proof = await wallet.generateNonRevocationMtp(did, credential);

    expect(proof.proof.existence).toBe(false);
  });

  it('generateNonRevProof', async () => {
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseedseed');

    const { did, credential } = await wallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhrase
    );
    expect(did.toString()).toBe(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );

    const proof = await wallet.generateNonRevocationMtp(did, credential);

    expect(proof.proof.existence).toBe(false);
  });

  it('issueCredential', async () => {
    const seedPhraseIssuer: Uint8Array = new TextEncoder().encode(
      'seedseedseedseedseedseedseedseed'
    );
    const seedPhraseUser: Uint8Array = new TextEncoder().encode('userseedseedseedseedseedseeduser');

    const { did: issuerDID, credential: issuerAuthCredential } = await wallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhraseIssuer
    );

    expect(issuerDID.toString()).toBe(
      'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    );

    const { did: userDID, credential: userAuthCredential } = await wallet.createIdentity(
      'http://metamask.com/',
      'http://rhs.com/node',
      seedPhraseUser
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
      expiration: 12345678888
    };
    const issuerCred = await wallet.issueCredential(issuerDID, claimReq, 'http://metamask.com/', {
      withPublish: false,
      withRHS: 'http://rhs.node'
    });
  });
});
