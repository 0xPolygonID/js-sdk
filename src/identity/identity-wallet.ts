import {  KMS, KmsKeyId, KmsKeyType } from '../kms';
import {
  Blockchain,
  buildDIDType,
  Claim,
  ClaimOptions,
  DID,
  DidMethod,
  getUnixTimestamp,
  Id,
  NetworkId,
  SchemaHash
} from '@iden3/js-iden3-core';
import { Signature } from '@iden3/js-crypto';
import { hashElems, ZERO_HASH } from '@iden3/js-merkletree';
import { models } from '../constants';
import { subjectPositionIndex, treeEntryFromCoreClaim } from './common';
import * as uuid from 'uuid';
import {
  W3CCredential,
  Iden3SparseMerkleProof,
  ProofType,
  CredentialStatusType
} from '../schema-processor';
import { ClaimRequest, createCredential } from './helper';
import { IDataStorage } from '../storage/interfaces/data-storage';
import { MerkleTreeType } from '../storage/entities/mt';


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
  createProfile(did :DID,nonce: number): Promise<DID>;
  generateKey(): Promise<KmsKeyId>;
  getLatestStateById(id: Id): IdentityState;
  generateMtp(credential): Promise<Claim>;
  generateNonRevocationProof(credential): Promise<Claim>;
  getGenesisIdentifier(): Id;
  revokeKey(keyId: KmsKeyId): Promise<void>;
  getIdentityInfo(id: Id): Promise<IdentityState>;
  sign(payload, credential): Promise<Signature>;
}

export class IdentityWallet implements IIdentityWallet {

  constructor(private readonly _kms: KMS, private readonly _storage: IDataStorage) {

  }

  async createIdentity(seed: Uint8Array, hostUrl: string) {
    
    const tmpIdentifier = uuid.v4();
    
    await this._storage.mt.createIdentityMerkleTrees(tmpIdentifier);

    const keyID = await this._kms.createKeyFromSeed(KmsKeyType.BabyJubJub, seed);

    const pubKey = await this._kms.publicKey(keyID);

    const schemaHash = SchemaHash.newSchemaHashFromHex(models.AuthBJJCredentialHash);

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

    const schema = JSON.parse(models.AuthBJJCredentialSchemaJson);

    const expiration = authClaim.getExpirationDate()
      ? getUnixTimestamp(authClaim.getExpirationDate())
      : 0;

    const request: ClaimRequest = {
      credentialSchema: models.AuthBJJCredentialSchemJsonURL,
      type: models.AuthBJJCredential,
      credentialSubject: {
        x: pubKey.p[0].toString(),
        y: pubKey.p[1].toString()
      },
      subjectPosition: subjectPositionIndex(authClaim.getIdPosition()),
      version: 0,
      expiration,
      revNonce: revNonce
    };
    hostUrl = hostUrl.replace(/\/$/, '').concat('/');

    let credential: W3CCredential = null;
    try {
      credential = createCredential(hostUrl, identifier, request, schema);
    } catch (e) {
      throw new Error('Error create Iden3Credential');
    }

    const index = authClaim.hIndex();

    const { proof } = await claimsTree.generateProof(index, claimsTree.root);

    const claimsTreeHex = claimsTree.root.hex();
    const stateHex = currentState.hex();

    const mtpProof: Iden3SparseMerkleProof = {
      type: ProofType.Iden3SparseMerkle,
      mtp: proof,
      issuerData: {
        id: did.toString(),
        state: {
          claimsTreeRoot: claimsTreeHex,
          value: stateHex
        },
        authCoreClaim: authClaim.hex(),
        credentialStatus: {
          id: `${hostUrl}revocation/${revNonce}`,
          revNonce,
          type: CredentialStatusType.SparseMerkleTreeProof
        }
      },
      coreClaim: authClaim.hex()
    };

    credential.proof = [mtpProof];

    return {
      did,
      credential
    };
  }

  async createProfile(did:DID, nonce: number): Promise<DID> {
    
    const id = did.id;

    const identityM = await this._storage.identity.getIdentity(did.toString())
    
    if (identityM.profileNonce !== 0 ){
      throw new Error("profiles can be created only from genesis identity")
    }
    
    const profile = Id.profileId(id,BigInt(nonce));
    const profileDID = DID.parseFromId(profile);
    await this._storage.identity.saveIdentity({profileNonce:nonce,identifier:profileDID.toString()});
    return profileDID;
  }

  generateKey(): Promise<KmsKeyId> {
    return Promise.resolve(undefined);
  }

  generateMtp(credential): Promise<Claim> {
    return Promise.resolve(undefined);
  }

  generateNonRevocationProof(credential): Promise<Claim> {
    return Promise.resolve(undefined);
  }

  getGenesisIdentifier(): Id {
    return undefined;
  }

  getIdentityInfo(id: Id): Promise<IdentityState> {
    return Promise.resolve(undefined);
  }

  getLatestStateById(id: Id): IdentityState {
    return undefined;
  }

  revokeKey(keyId: KmsKeyId): Promise<void> {
    return Promise.resolve(undefined);
  }

  sign(payload:Uint8Array, credential:W3CCredential): Promise<Signature> {
    this._kms.createKeyFromSeed()
  }
}
