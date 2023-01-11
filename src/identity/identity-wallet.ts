import { KMS, KmsKeyId, KmsKeyType } from '../kms';
import {
  Blockchain,
  buildDIDType,
  BytesHelper,
  Claim,
  ClaimOptions,
  DID,
  DidMethod,
  getUnixTimestamp,
  Id,
  NetworkId,
  SchemaHash
} from '@iden3/js-iden3-core';
import { Hex, poseidon, PublicKey, Signature } from '@iden3/js-crypto';
import { hashElems, ZERO_HASH } from '@iden3/js-merkletree';

import { subjectPositionIndex } from './common';
import * as uuid from 'uuid';
import { Schema, Parser, CoreClaimOptions } from '../schema-processor';
import { IDataStorage } from '../storage/interfaces/data-storage';
import { MerkleTreeType } from '../storage/entities/mt';
import { getRandomBytes, keyPath } from '../kms/provider-helpers';
import { UniversalSchemaLoader } from '../loaders';
import {
  VerifiableConstants,
  BJJSignatureProof2021,
  MerklizedRootPosition,
  SubjectPosition,
  W3CCredential,
  MerkleTreeProofWithTreeState,
  Iden3SparseMerkleTreeProof,
  ProofType
} from '../verifiable';
import { ClaimRequest, ICredentialWallet } from '../credentials';
import { pushHashesToRHS, TreesModel } from '../credentials/revocation';
import { TreeState } from '../circuits';

// CredentialIssueOptions
export interface CredentialIssueOptions {
  withPublish: boolean;
  withRHS: string;
}
// CredentialIssueOptions
export interface Iden3ProofCreationResult {
  credentials: W3CCredential[];
  oldTreeState: TreeState;
  newTreeState: TreeState;
}

export interface IIdentityWallet {
  createIdentity(
    hostUrl: string,
    rhsUrl: string,
    seed?: Uint8Array
  ): Promise<{ did: DID; credential: W3CCredential }>;
  createProfile(did: DID, nonce: number, verifier: string): Promise<DID>;
  generateKey(keyType: KmsKeyType): Promise<KmsKeyId>;
  getDIDTreeState(did: DID): Promise<TreesModel>;
  generateClaimMtp(
    did: DID,
    credential: W3CCredential,
    treeState?: TreeState
  ): Promise<MerkleTreeProofWithTreeState>;
  generateNonRevocationMtp(
    did: DID,
    credential: W3CCredential,
    treeState?: TreeState
  ): Promise<MerkleTreeProofWithTreeState>;
  sign(payload: Uint8Array, credential: W3CCredential): Promise<Signature>;
  signChallenge(payload: bigint, credential: W3CCredential): Promise<Signature>;
}

export class IdentityWallet implements IIdentityWallet {
  constructor(
    private readonly _kms: KMS,
    private readonly _storage: IDataStorage,
    private readonly _credentialWallet: ICredentialWallet
  ) {}

  async createIdentity(
    hostUrl: string,
    rhsUrl: string,
    seed?: Uint8Array
  ): Promise<{ did: DID; credential: W3CCredential }> {
    const tmpIdentifier = uuid.v4();

    await this._storage.mt.createIdentityMerkleTrees(tmpIdentifier);

    if (!seed) {
      seed = getRandomBytes(32);
    }

    const keyID = await this._kms.createKeyFromSeed(KmsKeyType.BabyJubJub, seed);

    const pubKey = await this._kms.publicKey(keyID);

    const schemaHash = SchemaHash.authSchemaHash;

    const authClaim = Claim.newClaim(
      schemaHash,
      ClaimOptions.withIndexDataInts(pubKey.p[0], pubKey.p[1]),
      ClaimOptions.withRevocationNonce(BigInt(0))
    );
    const revNonce = 0;
    authClaim.setRevocationNonce(BigInt(revNonce));

    await this._storage.mt.addToMerkleTree(
      tmpIdentifier,
      MerkleTreeType.Claims,
      authClaim.hiHv().hi,
      authClaim.hiHv().hv
    );

    const claimsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      tmpIdentifier,
      MerkleTreeType.Claims
    );

    const currentState = await hashElems([
      claimsTree.root.bigInt(),
      ZERO_HASH.bigInt(),
      ZERO_HASH.bigInt()
    ]);

    const didType = buildDIDType(DidMethod.Iden3, Blockchain.Polygon, NetworkId.Mumbai);
    const identifier = Id.idGenesisFromIdenState(didType, currentState.bigInt());
    const did = DID.parseFromId(identifier);

    await this._storage.mt.bindMerkleTreeToNewIdentifier(tmpIdentifier, did.toString());

    const schema = JSON.parse(VerifiableConstants.AUTH.AUTH_BJJ_CREDENTAIL_SCHEMA_JSON);

    const authData = authClaim.getExpirationDate();
    const expiration = authData ? getUnixTimestamp(authData) : 0;

    const request: ClaimRequest = {
      credentialSchema: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_SCHEMA_JSON_URL,
      type: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_TYPE,
      credentialSubject: {
        x: pubKey.p[0].toString(),
        y: pubKey.p[1].toString()
      },
      subjectPosition: subjectPositionIndex(authClaim.getIdPosition()),
      version: 0,
      expiration,
      revNonce: revNonce
    };

    hostUrl = hostUrl.replace(/\/$/, '');

    let credential: W3CCredential = new W3CCredential();
    try {
      credential = this._credentialWallet.createCredential(hostUrl, did, request, schema, rhsUrl);
    } catch (e) {
      throw new Error('Error create Iden3Credential');
    }

    const index = authClaim.hIndex();

    const { proof } = await claimsTree.generateProof(index, claimsTree.root);

    const claimsTreeHex = claimsTree.root.hex();
    const stateHex = currentState.hex();

    const mtpProof: Iden3SparseMerkleTreeProof = {
      type: ProofType.Iden3SparseMerkleTreeProof,
      mtp: proof,
      issuerData: {
        id: did.toString(),
        state: {
          claimsTreeRoot: claimsTreeHex,
          value: stateHex
        },
        authCoreClaim: authClaim.hex(),
        credentialStatus: credential.credentialStatus,
        mtp: proof
      },
      coreClaim: authClaim.hex()
    };

    credential.proof = [mtpProof];

    await this._storage.identity.saveIdentity({
      identifier: did.toString(),
      state: currentState,
      published: false,
      genesis: true
    });

    await this._credentialWallet.save(credential);

    return {
      did,
      credential
    };
  }

  async createProfile(did: DID, nonce: number, verifier: string): Promise<DID> {
    const id = did.id;

    const identityProfiles = await this._storage.identity.getProfilesByGenesisIdentifier(
      did.toString()
    );

    const existingProfile = identityProfiles.find(
      (p) => p.nonce == nonce || p.verifier == verifier
    );
    if (existingProfile) {
      throw new Error('profile with given nonce or verifier already exists');
    }

    const profile = Id.profileId(id, BigInt(nonce));
    const profileDID = DID.parseFromId(profile);

    await this._storage.identity.saveProfile({
      id: profileDID.toString(),
      nonce,
      genesisIdentifier: did.toString(),
      verifier
    });
    return profileDID;
  }

  async generateKey(keyType: KmsKeyType): Promise<KmsKeyId> {
    const key = await this._kms.createKeyFromSeed(keyType, getRandomBytes(32));
    return key;
  }

  async getDIDTreeState(did: DID): Promise<TreesModel> {
    const claimsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      did.toString(),
      MerkleTreeType.Claims
    );
    const revocationTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      did.toString(),
      MerkleTreeType.Revocations
    );
    const rootsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      did.toString(),
      MerkleTreeType.Roots
    );
    const state = await hashElems([
      claimsTree.root.bigInt(),
      revocationTree.root.bigInt(),
      rootsTree.root.bigInt()
    ]);

    return {
      state,
      claimsTree,
      revocationTree,
      rootsTree
    };
  }

  async generateClaimMtp(
    did: DID,
    credential: W3CCredential,
    treeState?: TreeState
  ): Promise<MerkleTreeProofWithTreeState> {
    const coreClaim = await this.getCoreClaimFromCredential(credential);

    const treesModel = await this.getDIDTreeState(did);

    const claimsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      did.toString(),
      MerkleTreeType.Claims
    );

    const { proof } = await claimsTree.generateProof(
      coreClaim.hIndex(),
      treeState ? treeState.claimsRoot : treesModel.claimsTree.root
    );

    return {
      proof,
      treeState: treeState ?? {
        state: treesModel.state,
        claimsRoot: treesModel.claimsTree.root,
        rootOfRoots: treesModel.rootsTree.root,
        revocationRoot: treesModel.revocationTree.root
      }
    };
  }
  s;

  async generateNonRevocationMtp(
    did: DID,
    credential: W3CCredential,
    treeState?: TreeState
  ): Promise<MerkleTreeProofWithTreeState> {
    const coreClaim = await this.getCoreClaimFromCredential(credential);

    const revNonce = coreClaim.getRevocationNonce();

    const treesModel = await this.getDIDTreeState(did);

    const revocationTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      did.toString(),
      MerkleTreeType.Revocations
    );

    const { proof } = await revocationTree.generateProof(
      revNonce,
      treeState ? treeState.revocationRoot : treesModel.revocationTree.root
    );

    return {
      proof,
      treeState: treeState ?? {
        state: treesModel.state,
        claimsRoot: treesModel.claimsTree.root,
        rootOfRoots: treesModel.rootsTree.root,
        revocationRoot: treesModel.revocationTree.root
      }
    };
  }

  private getKMSIdByAuthCredential(credential: W3CCredential): KmsKeyId {
    if (credential.type.indexOf('AuthBJJCredential') === -1) {
      throw new Error("can't sign with not AuthBJJCredential credential");
    }
    const x = credential.credentialSubject['x'] as unknown as string;
    const y = credential.credentialSubject['y'] as unknown as string;

    const pb: PublicKey = new PublicKey([BigInt(x), BigInt(y)]);
    const kp = keyPath(KmsKeyType.BabyJubJub, pb.hex());
    return { type: KmsKeyType.BabyJubJub, id: kp };
  }

  async sign(message: Uint8Array, credential: W3CCredential): Promise<Signature> {
    const keyKMSId = this.getKMSIdByAuthCredential(credential);
    const payload = poseidon.hashBytes(message);

    const signature = await this._kms.sign(keyKMSId, BytesHelper.intToBytes(payload));

    return Signature.newFromCompressed(signature);
  }
  async signChallenge(challenge: bigint, credential: W3CCredential): Promise<Signature> {
    const keyKMSId = this.getKMSIdByAuthCredential(credential);

    const signature = await this._kms.sign(keyKMSId, BytesHelper.intToBytes(challenge));

    return Signature.newFromCompressed(signature);
  }

  async issueCredential(
    issuerDID: DID,
    req: ClaimRequest,
    hostUrl: string,
    opts?: CredentialIssueOptions
  ) {
    if (!opts) {
      opts = {
        withPublish: true,
        withRHS: ''
      };
    }
    hostUrl = hostUrl.replace(/\/$/, '');

    const schema = await new UniversalSchemaLoader('ipfs.io').load(req.credentialSchema);

    const jsonSchema: Schema = JSON.parse(new TextDecoder().decode(schema));

    let credential: W3CCredential = new W3CCredential();

    let revNonce = 0;
    if (!req.revNonce) {
      req.revNonce = Math.round(Math.random() * 10000);
    }
    req.subjectPosition = req.subjectPosition ?? SubjectPosition.Index;

    revNonce = req.revNonce;

    try {
      credential = this._credentialWallet.createCredential(
        hostUrl,
        issuerDID,
        req,
        jsonSchema,
        opts.withRHS
      );
    } catch (e) {
      throw new Error('Error create Iden3Credential');
    }

    const issuerAuthBJJCredential = await this._credentialWallet.getAuthBJJCredential(issuerDID);

    const coreClaimOpts: CoreClaimOptions = {
      revNonce: revNonce,
      subjectPosition: req.subjectPosition,
      merklizedRootPosition: this.defineMTRootPosition(jsonSchema, req.merklizedRootPosition),
      updatable: false,
      version: 0
    };

    const coreClaim = await new Parser().parseClaim(
      credential,
      `${jsonSchema.$metadata.uris['jsonLdContext']}#${req.type}`,
      schema,
      coreClaimOpts
    );

    const { hi, hv } = coreClaim.hiHv();

    const coreClaimHash = poseidon.hash([hi, hv]);

    const keyKMSId = this.getKMSIdByAuthCredential(issuerAuthBJJCredential);

    const signature = await this._kms.sign(keyKMSId, BytesHelper.intToBytes(coreClaimHash));

    const mtpAuthBJJProof = issuerAuthBJJCredential.proof[0] as Iden3SparseMerkleTreeProof;

    const sigProof: BJJSignatureProof2021 = {
      type: ProofType.BJJSignature,
      issuerData: {
        id: issuerDID.toString(),
        state: mtpAuthBJJProof.issuerData.state,
        authCoreClaim: mtpAuthBJJProof.coreClaim,
        mtp: mtpAuthBJJProof.mtp,
        credentialStatus: mtpAuthBJJProof.issuerData.credentialStatus
      },
      coreClaim: coreClaim.hex(),
      signature: Hex.encodeString(signature)
    };
    credential.proof = [sigProof];

    return credential;
  }
  async revokeCredential(issuerDID: DID, credential: W3CCredential): Promise<number> {
    const issuerTree = await this.getDIDTreeState(issuerDID);

    const coreClaim = await credential.getCoreClaimFromProof(ProofType.BJJSignature);

    const nonce = coreClaim.getRevocationNonce();

    await issuerTree.revocationTree.add(nonce, BigInt(0));

    return Number(BigInt.asUintN(64, nonce));
  }

  async addCredentialsToMerkleTree(
    credentials: W3CCredential[],
    issuerDID: DID
  ): Promise<Iden3ProofCreationResult> {
    const oldIssuerTree = await this.getDIDTreeState(issuerDID);

    const oldTreeState: TreeState = {
      revocationRoot: oldIssuerTree.revocationTree.root,
      claimsRoot: oldIssuerTree.claimsTree.root,
      state: oldIssuerTree.state,
      rootOfRoots: oldIssuerTree.rootsTree.root
    };

    for (let index = 0; index < credentials.length; index++) {
      const credential = credentials[index];

      // credential must have a bjj signature proof
      const coreClaim = await credential.getCoreClaimFromProof(ProofType.BJJSignature);

      await this._storage.mt.addToMerkleTree(
        issuerDID.toString(),
        MerkleTreeType.Claims,
        coreClaim.hIndex(),
        coreClaim.hValue()
      );
    }

    const newIssuerTreeState = await this.getDIDTreeState(issuerDID);

    await this._storage.mt.addToMerkleTree(
      issuerDID.toString(),
      MerkleTreeType.Roots,
      newIssuerTreeState.claimsTree.root.bigInt(),
      BigInt(0)
    );
    const newIssuerTreeStateWithROR = await this.getDIDTreeState(issuerDID);

    return {
      credentials,
      newTreeState: {
        revocationRoot: newIssuerTreeStateWithROR.revocationTree.root,
        claimsRoot: newIssuerTreeStateWithROR.claimsTree.root,
        state: newIssuerTreeStateWithROR.state,
        rootOfRoots: newIssuerTreeStateWithROR.rootsTree.root
      },
      oldTreeState: oldTreeState
    };
  }

  async generateIden3SparseMerkleTreeProof(
    issuerDID: DID,
    credentials: W3CCredential[],
    txId: string,
    blockNumber?: number,
    blockTimestamp?: number
  ): Promise<W3CCredential[]> {
    for (let index = 0; index < credentials.length; index++) {
      const credential = credentials[index];

      const mtpWithProof = await this.generateClaimMtp(issuerDID, credential);

      // credential must have a bjj signature proof
      const coreClaim = credential.getCoreClaimFromProof(ProofType.BJJSignature);

      const mtpProof: Iden3SparseMerkleTreeProof = {
        type: ProofType.Iden3SparseMerkleTreeProof,
        mtp: mtpWithProof.proof,
        issuerData: {
          id: issuerDID.toString(),
          state: {
            claimsTreeRoot: mtpWithProof.treeState.claimsRoot.hex(),
            revocationTreeRoot: mtpWithProof.treeState.revocationRoot.hex(),
            rootOfRoots: mtpWithProof.treeState.rootOfRoots.hex(),
            value: mtpWithProof.treeState.state.hex(),
            txId,
            blockNumber,
            blockTimestamp
          },
          mtp: mtpWithProof.proof
        },
        coreClaim: coreClaim.hex()
      };
      if (Array.isArray(credentials[index].proof)) {
        (credentials[index].proof as unknown[]).push(mtpProof);
      } else {
        credentials[index].proof = mtpProof;
      }
    }
    return credentials;
  }
  async publishStateToRHS(issuerDID: DID, rhsURL: string, revokedNonces?: number[]): Promise<void> {
    const treeState = await this.getDIDTreeState(issuerDID);

    await pushHashesToRHS(
      treeState.state,
      {
        revocationTree: treeState.revocationTree,
        claimsTree: treeState.claimsTree,
        state: treeState.state,
        rootsTree: treeState.rootsTree
      },
      rhsURL,
      revokedNonces
    );
  }
  private defineMTRootPosition(schema: Schema, position: string): string {
    if (!!schema.$metadata && !!schema.$metadata.serialization) {
      return '';
    }
    if (position !== undefined && position !== '') {
      return position;
    }
    return MerklizedRootPosition.Index;
  }

  private async getCoreClaimFromCredential(credential: W3CCredential): Promise<Claim> {
    const coreClaimFromSigProof = await credential.getCoreClaimFromProof(ProofType.BJJSignature);

    const coreClaimFromMtpProof = credential.getCoreClaimFromProof(
      ProofType.Iden3SparseMerkleTreeProof
    );

    let coreClaim: Claim;
    if (!coreClaimFromMtpProof && !coreClaimFromSigProof) {
      throw new Error('core claim is not set proof');
    }
    if (!coreClaimFromMtpProof) {
      return coreClaimFromSigProof;
    }
    if (!coreClaimFromSigProof) {
      return coreClaimFromMtpProof;
    }
    if (
      coreClaimFromMtpProof &&
      coreClaimFromSigProof &&
      coreClaimFromMtpProof != coreClaimFromSigProof
    ) {
      throw new Error('core claim is set in both proofs but not equal');
    } else {
      coreClaim = coreClaimFromMtpProof;
    }
    return coreClaim;
  }
}
