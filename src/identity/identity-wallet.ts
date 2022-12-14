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
import { poseidon, PublicKey, Signature } from '@iden3/js-crypto';
import { hashElems, newBigIntFromBytes, ZERO_HASH } from '@iden3/js-merkletree';
import {} from '@iden3/js-iden3-core';

import { models } from '../constants';
import { subjectPositionIndex, treeEntryFromCoreClaim } from './common';
import * as uuid from 'uuid';
import {
  W3CCredential,
  Iden3SparseMerkleTreeProof,
  ProofType,
  CredentialStatusType,
  MerkleTreeProofWithTreeState
} from '../schema-processor';
import { ClaimRequest, createCredential } from './helper';
import { IDataStorage } from '../storage/interfaces/data-storage';
import { MerkleTreeType } from '../storage/entities/mt';
import { getRandomBytes, keyPath } from '../kms/provider-helpers';
import { UniversalSchemaLoader } from '../loaders';

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
          id: `${hostUrl}revocation/${revNonce}`,
          revNonce,
          type: CredentialStatusType.SparseMerkleTreeProof
        }
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

  async generateClaimMtp(
    did: DID,
    credential: W3CCredential
  ): Promise<MerkleTreeProofWithTreeState> {
    const coreClaim = await this.getCoreClaimFromCredential(credential);

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

    const { proof } = await claimsTree.generateProof(coreClaim.hIndex(), claimsTree.root);

    const currentState = await hashElems([
      claimsTree.root.bigInt(),
      revocationTree.root.bigInt(),
      rootsTree.root.bigInt()
    ]);
    return {
      proof,
      treeState: {
        state: currentState,
        claimsRoot: claimsTree.root,
        revocationRoot: revocationTree.root,
        rootOfRoots: rootsTree.root
      }
    };
  }

  async generateNonRevocationMtp(
    did: DID,
    credential: W3CCredential
  ): Promise<MerkleTreeProofWithTreeState> {
    const coreClaim = await this.getCoreClaimFromCredential(credential);

    const revNonce = coreClaim.getRevocationNonce();

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

    const { proof } = await revocationTree.generateProof(revNonce, revocationTree.root);

    const currentState = await hashElems([
      claimsTree.root.bigInt(),
      revocationTree.root.bigInt(),
      rootsTree.root.bigInt()
    ]);
    return {
      proof,
      treeState: {
        state: currentState,
        claimsRoot: claimsTree.root,
        revocationRoot: revocationTree.root,
        rootOfRoots: rootsTree.root
      }
    };
  }

  getLatestStateById(id: Id): IdentityState {
    return undefined;
  }

  async sign(message: Uint8Array, credential: W3CCredential): Promise<Signature> {
    if (credential.type.indexOf('AuthBJJCredential') === -1) {
      throw new Error("can't sign with not AuthBJJCredential credential");
    }
    const x = credential.credentialSubject['x'] as unknown as string;
    const y = credential.credentialSubject['y'] as unknown as string;

    var pb: PublicKey = new PublicKey([BigInt(x), BigInt(y)]);
    const kp = keyPath(KmsKeyType.BabyJubJub, pb.hex());

    const payload = poseidon.hashBytes(message);

    const signature = await this._kms.sign(
      { type: KmsKeyType.BabyJubJub, id: kp },
      BytesHelper.intToBytes(payload)
    );

    return Signature.newFromCompressed(signature);
  }

/*
func createCredential(issuer *core.DID, req claimReq, schema jsonSuite.Schema) (verifiable.W3CCredential, error) {

	credentialCtx := []string{verifiable.JSONLDSchemaW3CCredential2018, verifiable.JSONLDSchemaIden3Credential,
		schema.Metadata.Uris["jsonLdContext"].(string)}

	credentialType := []string{verifiable.TypeW3CVerifiableCredential, req.Type}

	expirationTime := time.Unix(req.Expiration, 0)

	issuanceDate := time.Now()

	var credentialSubject map[string]interface{}
	err := json.Unmarshal(req.CredentialSubject, &credentialSubject)
	if err != nil {
		return verifiable.W3CCredential{}, errors.WithStack(err)
	}

	idSubject, ok := credentialSubject["id"].(string)
	if ok {

		did, err := core.ParseDID(idSubject)
		if err != nil {
			return verifiable.W3CCredential{}, errors.WithStack(err)
		}

		credentialSubject["id"] = did.String()
	}

	credentialSubject["type"] = req.Type

	return verifiable.W3CCredential{
		Context:           credentialCtx,
		Type:              credentialType,
		Expiration:        &expirationTime,
		IssuanceDate:      &issuanceDate,
		CredentialSubject: credentialSubject,
		Issuer:            issuer.String(),
		CredentialSchema: verifiable.CredentialSchema{
			ID:   req.CredentialSchema,
			Type: verifiable.JSONSchemaValidator2018,
		},
	}, nil
}
*/

/*
  async issueCredential(issuerDID :DID ,req :claimRequest) {
    const tmpIdentifier = uuid.v4();


    const schema = await new UniversalSchemaLoader("ipfs.io").load(req.credentialSchema)

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
          id: `${hostUrl}revocation/${revNonce}`,
          revNonce,
          type: CredentialStatusType.SparseMerkleTreeProof
        }
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

    await this._storage.credential.saveCredential(credential);

    return {
      did,
      credential
    };
  }


  */
  private async getCoreClaimFromCredential(credential: W3CCredential): Promise<Claim> {
    const coreClaimFromSigProof = await credential.getCoreClaimFromProof(ProofType.BJJSignature);

    const coreClaimFromMtpProof = credential.getCoreClaimFromProof(ProofType.Iden3SparseMerkleTreeProof);

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

export interface claimRequest {
  credentialSchema:string;
  type:string;
  credentiaSubject: object,
  expiration:number;
  revocationNonce: number;
  subjectPosition:string;
  merklizedRootPosition:string;
}
