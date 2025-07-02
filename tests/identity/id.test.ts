/* eslint-disable no-console */
import path from 'path';
import {
  IdentityWallet,
  byteEncoder,
  MerkleTreeType,
  IDataStorage,
  CredentialRequest,
  ICredentialWallet,
  CredentialWallet,
  CredentialStatusResolverRegistry,
  RHSResolver,
  CredentialStatusType,
  FSCircuitStorage,
  NativeProver,
  Iden3SparseMerkleTreeProof,
  BJJSignatureProof2021,
  TreeState,
  IdentityCreationOptions
} from '../../src';
import {
  MOCK_STATE_STORAGE,
  SEED_USER,
  createIdentity,
  RHS_URL,
  getInMemoryDataStorage,
  registerKeyProvidersInMemoryKMS,
  WALLET_KEY,
  createEthereumBasedIdentity,
  SEED_ISSUER,
  RHS_CONTRACT_ADDRESS
} from '../helpers';
import { expect } from 'chai';
import { Wallet } from 'ethers';
import { getRandomBytes } from '@iden3/js-crypto';
import { Blockchain, DidMethod, NetworkId } from '@iden3/js-iden3-core';
import { ZERO_HASH } from '@iden3/js-merkletree';

describe('identity', () => {
  let credWallet: ICredentialWallet;
  let idWallet: IdentityWallet;
  let dataStorage: IDataStorage;

  const expectedDID = 'did:iden3:polygon:amoy:xCRp75DgAdS63W65fmXHz6p9DwdonuRU9e46DifhX';

  const createClaimReq = (
    credentialSubjectId: string,
    opts?: Partial<CredentialRequest>
  ): CredentialRequest => {
    return {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/kyc-nonmerklized.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: credentialSubjectId,
        birthday: 19960424,
        documentType: 99
      },
      expiration: 12345678888,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: RHS_URL
      },
      ...opts
    };
  };

  beforeEach(async () => {
    dataStorage = getInMemoryDataStorage(MOCK_STATE_STORAGE);
    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );
    credWallet = new CredentialWallet(dataStorage, resolvers);
    idWallet = new IdentityWallet(registerKeyProvidersInMemoryKMS(), dataStorage, credWallet);
  });

  it('createIdentity', async () => {
    const { did, credential } = await createIdentity(idWallet);

    expect(did.string()).to.equal(expectedDID);
    const dbCred = await dataStorage.credential.findCredentialById(credential.id);
    expect(credential).to.deep.equal(dbCred);

    const claimsTree = await dataStorage.mt.getMerkleTreeByIdentifierAndType(
      did.string(),
      MerkleTreeType.Claims
    );

    expect((await claimsTree.root()).bigInt()).not.to.equal(0);
  });

  it('createProfile', async () => {
    const { did } = await createIdentity(idWallet);

    expect(did.string()).to.equal(expectedDID);
    const verifier = 'http://issuer.com/';
    const tags1 = ['senderAddress=0x123'];
    const tags2 = ['senderAddress=0x123', 'app=mobile'];

    const profileDid = await idWallet.createProfile(did, 10, verifier);
    expect(profileDid.string()).to.equal(
      'did:iden3:polygon:amoy:xHMd1mimHu3Gc1nhe3DXrimqUCNtgYP8gcuGAHgxm'
    );

    const dbProfile = await dataStorage.identity.getProfileByVerifier(verifier);
    expect(dbProfile).not.to.be.undefined;
    if (dbProfile) {
      expect(dbProfile.id).to.equal(profileDid.string());
      expect(dbProfile.genesisIdentifier).to.equal(did.string());
      expect(dbProfile.nonce).to.equal(10);
    }
    const dbProfiles = await dataStorage.identity.getProfilesByVerifier(verifier);
    expect(dbProfiles).not.to.be.undefined;
    expect(dbProfiles.length).to.be.eq(1);

    const profileDid2 = await idWallet.createProfile(did, 11, verifier, tags1);
    expect(profileDid2.string()).to.equal(
      'did:iden3:polygon:amoy:x85NhWKFLHRyunDDmT2jBUpAs27JhJWSAjsnCEEuR'
    );

    const profileDid3 = await idWallet.createProfile(did, 12, verifier, tags2);
    expect(profileDid3.string()).to.equal(
      'did:iden3:polygon:amoy:xGCZ8wFysKpozg4r5bQxNunZi8gL4jmsT1srRNubb'
    );

    const profilesByTag = await idWallet.getProfilesByVerifier(verifier, tags1);
    expect(profilesByTag.length).not.to.be.undefined;
    expect(profilesByTag.length).to.be.eq(2);
    expect(profilesByTag.map((p) => p.id).includes(profileDid2.string())).to.be.true;

    const profilesByVerifierOnly = await idWallet.getProfilesByVerifier(verifier);
    expect(profilesByVerifierOnly.length).not.to.be.undefined;
    expect(profilesByVerifierOnly.length).to.be.eq(3);
    expect(profilesByVerifierOnly.map((p) => p.id).includes(profileDid.string())).to.be.true;
    expect(profilesByVerifierOnly.map((p) => p.id).includes(profileDid2.string())).to.be.true;
    expect(profilesByVerifierOnly.map((p) => p.id).includes(profileDid3.string())).to.be.true;

    const profilesByNonExistingVerifier = await idWallet.getProfilesByVerifier(
      'non-existing-verifier'
    );
    expect(profilesByNonExistingVerifier.length).to.be.eq(0);
  });

  it('sign', async () => {
    const { did, credential } = await createIdentity(idWallet);
    expect(did.string()).to.equal(expectedDID);

    const enc = byteEncoder; // always utf-8

    const message = enc.encode('payload');
    const sig = await idWallet.sign(message, credential);

    expect(sig.hex()).to.equal(
      '5fdb4fc15898ee2eeed2ed13c5369a4f28870e51ac1aae8ad1f2108d2d39f38969881d7553344c658e63344e4ddc151fabfed5bf8fcf8663c183248b714d8b03'
    );
  });

  it('generateMtp', async () => {
    const { did, credential } = await createIdentity(idWallet);
    expect(did.string()).to.equal(expectedDID);

    const proof = await idWallet.generateCredentialMtp(did, credential);

    expect(proof.proof.existence).to.equal(true);
  });

  it('generateNonRevProof', async () => {
    const { did, credential } = await createIdentity(idWallet);
    expect(did.string()).to.equal(expectedDID);

    const proof = await idWallet.generateNonRevocationMtp(did, credential);

    expect(proof.proof.existence).to.equal(false);
  });

  it('issueCredential', async () => {
    const { did: issuerDID, credential: issuerAuthCredential } = await createIdentity(idWallet);

    expect(issuerDID.string()).to.equal(expectedDID);

    expect(issuerAuthCredential).not.to.be.undefined;

    const { did: userDID, credential: userAuthCredential } = await createIdentity(idWallet, {
      seed: SEED_USER
    });

    expect(userAuthCredential).not.to.be.undefined;

    const claimReq: CredentialRequest = createClaimReq(userDID.string());
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    expect(issuerCred.credentialSubject.id).to.equal(userDID.string());
  });

  it('build non-inclusion proof from issuer data', async () => {
    const { did: issuerDID } = await createIdentity(idWallet);

    const { did: userDID } = await createIdentity(idWallet, {
      seed: SEED_USER
    });

    const claimReq: CredentialRequest = createClaimReq(userDID.string());
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);
    issuerCred.credentialStatus.id = RHS_URL;

    await credWallet.getRevocationStatusFromCredential(issuerCred);
  });

  it('createIdentity Secp256k1', async () => {
    const ethSigner = new Wallet(WALLET_KEY, dataStorage.states.getRpcProvider());

    const { did, credential } = await createEthereumBasedIdentity(idWallet, {
      ethSigner
    });

    expect(did.string()).to.equal(
      'did:iden3:polygon:amoy:x6x5sor7zpxsu478u36QvEgaRUfPjmzqFo5PHHzbM'
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const dbCred = await dataStorage.credential.findCredentialById(credential!.id);
    expect(credential).to.deep.equal(dbCred);

    const claimsTree = await dataStorage.mt.getMerkleTreeByIdentifierAndType(
      did.string(),
      MerkleTreeType.Claims
    );

    expect((await claimsTree.root()).bigInt()).not.to.equal(0);
  });

  it('createIdentity Secp256k1 w/o auth bjj cred and add after creation', async () => {
    const authBJJCredentialCreationOptions = {
      seed: SEED_ISSUER,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: RHS_URL
      }
    };
    // create identity without auth bjj credential
    const { did, credential } = await idWallet.createEthereumBasedIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Amoy,
      ...authBJJCredentialCreationOptions,
      createBjjCredential: false
    });

    expect(did.string()).to.equal(
      'did:iden3:polygon:amoy:x6x5sor7zpxsu478u36QvEgaRUfPjmzqFo5PHHzbM'
    );
    expect(credential).to.be.undefined;

    // add bjj credential
    const ethSigner = new Wallet(WALLET_KEY, dataStorage.states.getRpcProvider());

    const oldTreeState: TreeState = {
      revocationRoot: ZERO_HASH,
      claimsRoot: ZERO_HASH,
      state: ZERO_HASH,
      rootOfRoots: ZERO_HASH
    };

    const credential2 = await idWallet.addBJJAuthCredential(
      did,
      oldTreeState,
      true,
      ethSigner,
      authBJJCredentialCreationOptions
    );

    const dbCred = await dataStorage.credential.findCredentialById(credential2.id);
    expect(credential2).to.deep.equal(dbCred);

    const claimsTree = await dataStorage.mt.getMerkleTreeByIdentifierAndType(
      did.string(),
      MerkleTreeType.Claims
    );

    expect((await claimsTree.root()).bigInt()).not.to.equal(0);
  });

  it('createIdentity Secp256k1 with bjj cred and no signer', async () => {
    try {
      await createEthereumBasedIdentity(idWallet);
      expect.fail();
    } catch (err: unknown) {
      expect((err as Error).message).to.be.eq(
        `Ethereum signer is required to create Ethereum identities in order to transit state`
      );
    }
  });

  it('add auth bjj credential', async () => {
    const { did, credential } = await createIdentity(idWallet);
    expect(did.string()).to.equal(expectedDID);

    const proof = await idWallet.generateCredentialMtp(did, credential);
    expect(proof.proof.existence).to.equal(true);

    const circuitStorage = new FSCircuitStorage({
      dirname: path.join(__dirname, '../proofs/testdata')
    });
    const prover = new NativeProver(circuitStorage);

    const ethSigner = new Wallet(WALLET_KEY, dataStorage.states.getRpcProvider());
    const opts = {
      seed: SEED_USER,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: RHS_URL
      }
    };

    const treesModel = await idWallet.getDIDTreeModel(did);
    const [ctrHex, rtrHex, rorTrHex] = await Promise.all([
      treesModel.claimsTree.root(),
      treesModel.revocationTree.root(),
      treesModel.rootsTree.root()
    ]);

    const oldTreeState = {
      state: treesModel.state,
      claimsRoot: ctrHex,
      revocationRoot: rtrHex,
      rootOfRoots: rorTrHex
    };

    expect(credential?.proof).not.to.be.undefined;
    expect((credential?.proof as unknown[])[0]).to.instanceOf(Iden3SparseMerkleTreeProof);
    expect((credential?.proof as unknown[]).length).to.equal(1);

    const credential2 = await idWallet.addBJJAuthCredential(
      did,
      oldTreeState,
      false,
      ethSigner,
      opts,
      prover
    );
    expect(credential2?.proof).not.to.be.undefined;
    expect((credential2?.proof as unknown[]).length).to.equal(2);
    expect((credential2?.proof as unknown[])[0]).to.instanceOf(BJJSignatureProof2021);
    expect((credential2?.proof as unknown[])[1]).to.instanceOf(Iden3SparseMerkleTreeProof);

    const proof2 = await idWallet.generateCredentialMtp(did, credential2);
    expect(proof2.proof.existence).to.equal(true);
  });

  it('rotate identity keys', async () => {
    const { did, credential } = await createIdentity(idWallet);
    expect(did.string()).to.equal(expectedDID);

    const proof = await idWallet.generateCredentialMtp(did, credential);
    expect(proof.proof.existence).to.equal(true);

    const circuitStorage = new FSCircuitStorage({
      dirname: path.join(__dirname, '../proofs/testdata')
    });
    const prover = new NativeProver(circuitStorage);

    const ethSigner = new Wallet(WALLET_KEY, dataStorage.states.getRpcProvider());
    const opts = {
      seed: SEED_USER,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: RHS_URL
      }
    };

    const treesModel = await idWallet.getDIDTreeModel(did);
    const [ctrHex, rtrHex, rorTrHex] = await Promise.all([
      treesModel.claimsTree.root(),
      treesModel.revocationTree.root(),
      treesModel.rootsTree.root()
    ]);

    const oldTreeState = {
      state: treesModel.state,
      claimsRoot: ctrHex,
      revocationRoot: rtrHex,
      rootOfRoots: rorTrHex
    };

    expect(credential?.proof).not.to.be.undefined;
    expect((credential?.proof as unknown[])[0]).to.instanceOf(Iden3SparseMerkleTreeProof);
    expect((credential?.proof as unknown[]).length).to.equal(1);

    const credential2 = await idWallet.addBJJAuthCredential(
      did,
      oldTreeState,
      false,
      ethSigner,
      opts,
      prover
    );
    expect(credential2?.proof).not.to.be.undefined;
    expect((credential2?.proof as unknown[]).length).to.equal(2);
    expect((credential2?.proof as unknown[])[0]).to.instanceOf(BJJSignatureProof2021);
    expect((credential2?.proof as unknown[])[1]).to.instanceOf(Iden3SparseMerkleTreeProof);

    const proof2 = await idWallet.generateCredentialMtp(did, credential2);
    expect(proof2.proof.existence).to.equal(true);

    const proofNRcredential = await idWallet.generateNonRevocationMtp(did, credential);
    expect(proofNRcredential.proof.existence).to.equal(false);

    const proofNRcredential2 = await idWallet.generateNonRevocationMtp(did, credential2);
    expect(proofNRcredential2.proof.existence).to.equal(false);

    const nonce = await idWallet.revokeCredential(did, credential);

    await idWallet.publishStateToRHS(did, RHS_URL, [nonce]);

    const afterRevokeProofNRcredential = await idWallet.generateNonRevocationMtp(did, credential);
    expect(afterRevokeProofNRcredential.proof.existence).to.equal(true);

    const afterRevokeProofNRcredential2 = await idWallet.generateNonRevocationMtp(did, credential2);
    expect(afterRevokeProofNRcredential2.proof.existence).to.equal(false);
  });

  it("restore identity (doesn't create a new auth BJJ credential)", async () => {
    const seed = getRandomBytes(32);
    const { did, credential } = await createIdentity(idWallet, { seed });

    // "restore" identity from the same seed
    const { did: restoredDid, credential: restoredCredential } = await createIdentity(idWallet, {
      seed
    });
    expect(credential).to.be.deep.eq(restoredCredential);
    expect(did.string()).to.be.eq(restoredDid.string());
  });

  it('replace auth bjj credential', async () => {
    const idRequest: IdentityCreationOptions = {
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Amoy,
      seed: SEED_ISSUER,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: RHS_URL
      }
    };
    const { did, credential } = await idWallet.createIdentity(idRequest);
    expect(did.string()).to.equal(expectedDID);

    let credentials = await credWallet.findByQuery({
      credentialSubject: {
        x: {
          $eq: credential.credentialSubject['x']
        },
        y: {
          $eq: credential.credentialSubject['y']
        }
      }
    });
    expect(credentials.length).to.be.equal(1);

    idRequest.revocationOpts.type = CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023;
    idRequest.revocationOpts.id = RHS_CONTRACT_ADDRESS;
    idRequest.revocationOpts.genesisPublishingDisabled = true;

    const { did: did2, credential: credential2 } = await idWallet.createIdentity(idRequest);
    expect(did2.string()).to.equal(expectedDID);
    expect(credential2.credentialStatus.type).to.be.equal(
      CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023
    );
    expect(credential2.credentialStatus.id).to.contain('state');

    credentials = await credWallet.findByQuery({
      credentialSubject: {
        x: {
          $eq: credential2.credentialSubject['x']
        },
        y: {
          $eq: credential2.credentialSubject['y']
        }
      }
    });
    expect(credentials.length).to.be.equal(1);
  });
});
