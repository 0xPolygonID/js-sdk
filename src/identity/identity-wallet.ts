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
import {} from '@iden3/js-iden3-core';

import { subjectPositionIndex, treeEntryFromCoreClaim } from './common';
import * as uuid from 'uuid';
import {
  W3CCredential,
  Iden3SparseMerkleTreeProof,
  ProofType,
  Schema,
  CredentialStatusType,
  MerkleTreeProofWithTreeState,
  Parser,
  CoreClaimOptions
} from '../schema-processor';
import { ClaimRequest, createCredential } from './helper';
import { IDataStorage } from '../storage/interfaces/data-storage';
import { MerkleTreeType } from '../storage/entities/mt';
import { getRandomBytes, keyPath } from '../kms/provider-helpers';
import { UniversalSchemaLoader } from '../loaders';
import { VerifiableConstants, BJJSignatureProof2021 } from '../verifiable';
import { TreeState } from '../circuits';

// IdentityStatus represents type for state Status
export enum IdentityStatus {
  Created = 'created',
  // StatusTransacted is a status for state that was published but result is not known
  Transacted = 'transacted',
  // StatusConfirmed is a status for confirmed transaction
  Confirmed = 'confirmed',
  // StatusFailed is a status for failed transaction
  Failed = 'failed'
}

// IdentityState identity state model
export interface IdentityState {
  stateId: number;
  identifier: string;
  state?: string;
  rootOfRoots?: string;
  claimsTreeRoot?: string;
  revocationTreeRoot?: string;
  blockTimestamp?: number;
  blockNumber?: number;
  txId?: string;
  previousState?: string;
  status?: IdentityStatus;
  modifiedAt?: string;
  createdAt?: string;
}

export interface IIdentityWallet {
  createIdentity(
    seed: Uint8Array,
    hostUrl: string
  ): Promise<{ did: DID; credential: W3CCredential }>;
  createProfile(did: DID, nonce: number, verifier: string): Promise<DID>;
  generateKey(keyType: KmsKeyType): Promise<KmsKeyId>;
  getLatestStateById(id: Id): IdentityState;
  generateClaimMtp(did: DID, credential: W3CCredential): Promise<MerkleTreeProofWithTreeState>;
  generateNonRevocationMtp(
    did: DID,
    credential: W3CCredential
  ): Promise<MerkleTreeProofWithTreeState>;
  sign(payload, credential): Promise<Signature>;
}

export class IdentityWallet implements IIdentityWallet {
  constructor(private readonly _kms: KMS, private readonly _storage: IDataStorage) {}

  async createIdentity(seed: Uint8Array, hostUrl: string) {
    const tmpIdentifier = uuid.v4();

    await this._storage.mt.createIdentityMerkleTrees(tmpIdentifier);

    const keyID = await this._kms.createKeyFromSeed(KmsKeyType.BabyJubJub, seed);

    const pubKey = await this._kms.publicKey(keyID);

    const schemaHash = SchemaHash.newSchemaHashFromHex(
      VerifiableConstants.AUTH.AUTH_BJJ_CREDENTAIL_HASH
    );

    const authClaim = Claim.newClaim(
      schemaHash,
      ClaimOptions.withIndexDataInts(pubKey.p[0], pubKey.p[1]),
      ClaimOptions.withRevocationNonce(BigInt(0))
    );
    const revNonce = 0;
    authClaim.setRevocationNonce(BigInt(revNonce));

    const entry = treeEntryFromCoreClaim(authClaim);

    await this._storage.mt.addEntryToMerkleTree(tmpIdentifier, MerkleTreeType.Claims, entry);

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

    const expiration = authClaim.getExpirationDate()
      ? getUnixTimestamp(authClaim.getExpirationDate())
      : 0;

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

    let credential: W3CCredential = null;
    try {
      credential = createCredential(hostUrl, did, request, schema);
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
        credentialStatus: {
          id: `${hostUrl}/revocation/${revNonce}`,
          revocatioNonce: revNonce,
          type: CredentialStatusType.SparseMerkleTreeProof
        }
      },
      coreClaim: authClaim.hex()
    };

    credential.credentialStatus = {
      id: `${hostUrl}/revocation/${revNonce}`,
      revocationNonce: revNonce,
      type: CredentialStatusType.SparseMerkleTreeProof
    };
    credential.proof = [mtpProof];

    await this._storage.identity.saveIdentity({
      identifier: did.toString(),
      state: currentState,
      published: false,
      genesis: true
    });

    await this._storage.credential.saveCredential(credential);

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
    if (!!existingProfile) {
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

  private async getDIDTreeState(did: DID): Promise<TreeState> {
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
    const currentState = await hashElems([
      claimsTree.root.bigInt(),
      revocationTree.root.bigInt(),
      rootsTree.root.bigInt()
    ]);
    return {
      state: currentState,
      claimsRoot: claimsTree.root,
      revocationRoot: revocationTree.root,
      rootOfRoots: rootsTree.root
    };
  }
  async generateClaimMtp(
    did: DID,
    credential: W3CCredential
  ): Promise<MerkleTreeProofWithTreeState> {
    const coreClaim = await this.getCoreClaimFromCredential(credential);

    const treeState = await this.getDIDTreeState(did);

    const claimsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      did.toString(),
      MerkleTreeType.Claims
    );

    const { proof } = await claimsTree.generateProof(coreClaim.hIndex(), claimsTree.root);

    return {
      proof,
      treeState
    };
  }

  async generateNonRevocationMtp(
    did: DID,
    credential: W3CCredential
  ): Promise<MerkleTreeProofWithTreeState> {
    const coreClaim = await this.getCoreClaimFromCredential(credential);

    const revNonce = coreClaim.getRevocationNonce();

    const treeState = await this.getDIDTreeState(did);

    const revocationTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(
      did.toString(),
      MerkleTreeType.Revocations
    );

    const { proof } = await revocationTree.generateProof(revNonce, revocationTree.root);

    return {
      proof,
      treeState
    };
  }

  getLatestStateById(id: Id): IdentityState {
    return undefined;
  }

  private getKMSIdByAuthCredential(credential: W3CCredential): KmsKeyId {
    if (credential.type.indexOf('AuthBJJCredential') === -1) {
      throw new Error("can't sign with not AuthBJJCredential credential");
    }
    const x = credential.credentialSubject['x'] as unknown as string;
    const y = credential.credentialSubject['y'] as unknown as string;

    var pb: PublicKey = new PublicKey([BigInt(x), BigInt(y)]);
    const kp = keyPath(KmsKeyType.BabyJubJub, pb.hex());
    return { type: KmsKeyType.BabyJubJub, id: kp };
  }

  async sign(message: Uint8Array, credential: W3CCredential): Promise<Signature> {
    const keyKMSId = this.getKMSIdByAuthCredential(credential);
    const payload = poseidon.hashBytes(message);

    const signature = await this._kms.sign(keyKMSId, BytesHelper.intToBytes(payload));

    return Signature.newFromCompressed(signature);
  }

  async issueCredential(issuerDID: DID, req: ClaimRequest, hostUrl: string) {
    const schema = await new UniversalSchemaLoader('ipfs.io').load(req.credentialSchema);

    const jsonSchema: Schema = JSON.parse(new TextDecoder().decode(schema));

    let credential: W3CCredential = null;
    try {
      credential = createCredential(hostUrl, issuerDID, req, jsonSchema);
    } catch (e) {
      throw new Error('Error create Iden3Credential');
    }

    const issuerAuthBJJCredential = await this._storage.credential.findCredentialByQuery({
      context: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_SCHEMA_JSONLD_URL,
      type: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_TYPE,
      allowedIssuers: [issuerDID.toString()]
    });

    const revNonce = Math.random() * 10000; // todo: rework
    credential.credentialStatus = {
      id: `${hostUrl}/revocation/${revNonce}`,
      revocationNonce: revNonce,
      type: CredentialStatusType.SparseMerkleTreeProof
    };
    var coreClaimOpts: CoreClaimOptions = {
      revNonce: revNonce,
      subjectPosition: req.subjectPosition,
      merklizedRootPosition: req.merklizedRootPosition,
      updatable: false,
      version: 0
    };

    // TODO
    //
    /*
        func DefineMerklizedRootPosition(metadata *jsonSuite.SchemaMetadata, position string) string {

          if metadata != nil && metadata.Serialization != nil {
            return ""
          }

          if position != "" {
            return position
          }

          return utils.MerklizedRootPositionIndex
        }
    */
    const coreClaim = new Parser().parseClaim(
      credential,
      `${jsonSchema.$metadata.uris['jsonLdContext']}#${req.type}}`,
      schema,
      coreClaimOpts
    );

    const { hi, hv } = coreClaim.hiHv();

    const coreClaimHash = poseidon.hash([hi, hv]);

    const keyKMSId = this.getKMSIdByAuthCredential(issuerAuthBJJCredential[0]);

    const signature = await this._kms.sign(keyKMSId, BytesHelper.intToBytes(coreClaimHash));

    const authIssuerCoreClaim = await this.getCoreClaimFromCredential(credential);
    const issuerTreeState = await this.getDIDTreeState(issuerDID);
    const sigProof: BJJSignatureProof2021 = {
      type: ProofType.BJJSignature,
      issuerData: {
        id: issuerDID.toString(),
        state: {
          value: issuerTreeState.state.hex(),
          claimsTreeRoot: issuerTreeState.claimsRoot.hex(),
          revocationTreeRoot: issuerTreeState.revocationRoot.hex(),
          rootOfRoots: issuerTreeState.rootOfRoots.hex()
        },
        authCoreClaim: authIssuerCoreClaim.hex(),
        credentialStatus: issuerAuthBJJCredential[0].credentialStatus
      },
      coreClaim: coreClaim.hex(),
      signature: Hex.encodeString(signature)
    };
    credential.proof = [sigProof];
    return credential;
  }

  private async getCoreClaimFromCredential(credential: W3CCredential): Promise<Claim> {
    const coreClaimFromSigProof = await credential.getCoreClaimFromProof(ProofType.BJJSignature);

    const coreClaimFromMtpProof = credential.getCoreClaimFromProof(
      ProofType.Iden3SparseMerkleTreeProof
    );

    var coreClaim: Claim;
    if (!coreClaimFromMtpProof && !coreClaimFromSigProof) {
      throw new Error('core claim is not set proof');
    }
    if (!coreClaimFromMtpProof) {
      coreClaim = coreClaimFromSigProof;
    }
    if (!coreClaimFromSigProof) {
      coreClaim = coreClaimFromMtpProof;
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
