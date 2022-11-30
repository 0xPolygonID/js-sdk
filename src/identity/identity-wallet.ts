import { BjjProvider, KMS, KmsKeyId, KmsKeyType } from './kms';
import {
  Blockchain,
  buildDIDType,
  Claim,
  ClaimOptions,
  DidMethod,
  Id,
  NetworkId,
  SchemaHash,
  getUnixTimestamp
} from '@iden3/js-iden3-core';
import { Signature } from '@iden3/js-crypto';
import { hashElems, ZERO_HASH } from '@iden3/js-merkletree';
import { models } from '../constants';
import { IdentityMerkleTrees } from '../merkle-tree';
import { subjectPositionIndex, treeEntryFromCoreClaim } from './common';
import { Iden3Credential } from '../schema-processor';
import { ClaimRequest, createIden3Credential } from './helper';

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
  createIdentity(seed: Uint8Array): Promise<{ identifier: Id, credential: Iden3Credential }>;
  createProfile(nonce: number): Promise<void>;
  generateKey(): Promise<KmsKeyId>;
  getLatestStateById(id: Id): IdentityState;
  generateMtp(credential): Promise<Claim>;
  generateNonRevocationProof(credential): Promise<Claim>;
  getGenesisIdentifier(): Id;
  revokeKey(keyId: KmsKeyId): Promise<void>;
  getIdentityInfo(id: Id): Promise<IdentityState>;
  sign(payload, credential): Promise<Signature>;
}

export class IdentityWallet implements IIdentityWallet{
  private kms: KMS;
  constructor() {
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub);
    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);
    this.kms = kms;
  }

  async createIdentity(seed: Uint8Array) {
    const seedPhrase: Uint8Array = new TextEncoder().encode('seedseedseedseedseedseedseedseed');

    const identityMerkleTreesService = IdentityMerkleTrees.createIdentityMerkleTrees();
    const keyID = await this.kms.createKeyFromSeed(KmsKeyType.BabyJubJub, seedPhrase);

    const pubKey = await this.kms.publicKey(keyID);

    const schemaHash = SchemaHash.newSchemaHashFromHex(models.AuthBJJCredentialHash);
  
    const authClaim = Claim.newClaim(schemaHash,
      ClaimOptions.withIndexDataInts(pubKey.p[0], pubKey.p[1]),
      ClaimOptions.withRevocationNonce(0)
    );
    const revNonce = 0;
    authClaim.setRevocationNonce(revNonce);
    
    const entry = treeEntryFromCoreClaim(authClaim);
    
    await identityMerkleTreesService.addEntry(entry);

    const claimsTree = identityMerkleTreesService.claimsTree();

    const currentState = await hashElems([claimsTree.root.bigInt(), ZERO_HASH.bigInt(), ZERO_HASH.bigInt()]);
  
  
    const didType = buildDIDType(DidMethod.Iden3, Blockchain.Polygon, NetworkId.Mumbai);
    const identifier = Id.idGenesisFromIdenState(didType, currentState.bigInt());
    
    identityMerkleTreesService.bindToIdentifier(identifier);
    
    const schema = JSON.parse(models.AuthBJJCredentialSchemaJSON);
    
    const expiration = authClaim.getExpirationDate() ? getUnixTimestamp(authClaim.getExpirationDate()): 0;
    
    const request: ClaimRequest = {
      credentialSchema: models.AuthBJJCredentialURL,
      type: models.AuthBJJCredential,
      credentialSubject: {
        x: pubKey.p[0].toString(),
        y: pubKey.p[1].toString(),
      },
      subjectPosition: subjectPositionIndex(authClaim.getIdPosition()),
      version: 0,
      expiration,
      revNonce: revNonce
    };
    let credential: Iden3Credential = null;
    try {
      credential = createIden3Credential(identifier, request, schema);
  
    } catch (e) {
      throw new Error('Error create Iden3Credential');
    }
  
    return {
      identifier,
      credential
    };
  }
  
  createProfile(nonce: number): Promise<void> {
    return Promise.resolve(undefined);
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
  
  sign(payload, credential): Promise<Signature> {
    return Promise.resolve(undefined);
  }
}
