import { KmsKeyType } from '../kms';
import { Blockchain, buildDIDType, BytesHelper, Claim, ClaimOptions, DID, DidMethod, getUnixTimestamp, Id, NetworkId, SchemaHash } from '@iden3/js-iden3-core';
import { Hex, poseidon, PublicKey, Signature } from '@iden3/js-crypto';
import { hashElems, ZERO_HASH } from '@iden3/js-merkletree';
import { generateProfileDID, subjectPositionIndex } from './common';
import * as uuid from 'uuid';
import { Parser } from '../schema-processor';
import { MerkleTreeType } from '../storage/entities/mt';
import { getRandomBytes, keyPath } from '../kms/provider-helpers';
import { VerifiableConstants, BJJSignatureProof2021, MerklizedRootPosition, SubjectPosition, W3CCredential, Iden3SparseMerkleTreeProof, ProofType, IssuerData } from '../verifiable';
import { pushHashesToRHS } from '../credentials/rhs';
import { byteEncoder } from '../utils';
import { Path, getDocumentLoader } from '@iden3/js-jsonld-merklization';
import { sha256js } from 'cross-sha256';
/**
 * @public
 * Wallet instance to manage the digital identity based on iden3 protocol
 * allows to: create identity/profile, sign payloads (bigint / bytes), generate keys,
 * generate Merkle tree proofs of inclusion / non-inclusion to Merkle trees, issue credentials with a BJJSignature and Iden3SparseMerkleTree Proofs,
 * revoke credentials, add credentials to Merkle trees, push states to reverse hash service
 *
 *
 * @class IdentityWallet - class
 * @implements implements IIdentityWallet interface
 */
export class IdentityWallet {
    /**
     * Constructs a new instance of the `IdentityWallet` class
     *
     * @param {KMS} _kms - Key Management System that allows signing data with BJJ key
     * @param {IDataStorage} _storage - data storage to access credential / identity / Merkle tree data
     * @param {ICredentialWallet} _credentialWallet - credential wallet instance to quickly access credential CRUD functionality
     * @public
     */
    constructor(_kms, _storage, _credentialWallet) {
        this._kms = _kms;
        this._storage = _storage;
        this._credentialWallet = _credentialWallet;
    }
    /**
     * {@inheritDoc IIdentityWallet.createIdentity}
     */
    async createIdentity(opts) {
        const tmpIdentifier = opts.seed
            ? uuid.v5(new sha256js().update(opts.seed).digest('hex'), uuid.NIL)
            : uuid.v4();
        opts.method = opts.method ?? DidMethod.Iden3;
        opts.blockchain = opts.blockchain ?? Blockchain.Polygon;
        opts.networkId = opts.networkId ?? NetworkId.Mumbai;
        await this._storage.mt.createIdentityMerkleTrees(tmpIdentifier);
        opts.seed = opts.seed ?? getRandomBytes(32);
        const keyId = await this._kms.createKeyFromSeed(KmsKeyType.BabyJubJub, opts.seed);
        const pubKeyHex = await this._kms.publicKey(keyId);
        const pubKey = PublicKey.newFromHex(pubKeyHex);
        const schemaHash = SchemaHash.authSchemaHash;
        const authClaim = Claim.newClaim(schemaHash, ClaimOptions.withIndexDataInts(pubKey.p[0], pubKey.p[1]), ClaimOptions.withRevocationNonce(BigInt(0)));
        const revNonce = opts.revocationOpts.nonce ?? 0;
        authClaim.setRevocationNonce(BigInt(revNonce));
        await this._storage.mt.addToMerkleTree(tmpIdentifier, MerkleTreeType.Claims, authClaim.hiHv().hi, authClaim.hiHv().hv);
        const claimsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(tmpIdentifier, MerkleTreeType.Claims);
        const currentState = hashElems([
            (await claimsTree.root()).bigInt(),
            ZERO_HASH.bigInt(),
            ZERO_HASH.bigInt()
        ]);
        const didType = buildDIDType(opts.method, opts.blockchain, opts.networkId);
        const identifier = Id.idGenesisFromIdenState(didType, currentState.bigInt());
        const did = DID.parseFromId(identifier);
        await this._storage.mt.bindMerkleTreeToNewIdentifier(tmpIdentifier, did.string());
        const schema = JSON.parse(VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_SCHEMA_JSON);
        const authData = authClaim.getExpirationDate();
        const expiration = authData ? getUnixTimestamp(authData) : 0;
        const request = {
            credentialSchema: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_SCHEMA_JSON_URL,
            type: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_TYPE,
            credentialSubject: {
                x: pubKey.p[0].toString(),
                y: pubKey.p[1].toString()
            },
            subjectPosition: subjectPositionIndex(authClaim.getIdPosition()),
            version: 0,
            expiration,
            revocationOpts: {
                nonce: revNonce,
                id: opts.revocationOpts.id.replace(/\/$/, ''),
                type: opts.revocationOpts.type
            }
        };
        let credential = new W3CCredential();
        try {
            credential = this._credentialWallet.createCredential(did, request, schema);
        }
        catch (e) {
            throw new Error('Error create Iden3Credential');
        }
        const index = authClaim.hIndex();
        const ctr = await claimsTree.root();
        const { proof } = await claimsTree.generateProof(index, ctr);
        const claimsTreeHex = ctr.hex();
        const stateHex = currentState.hex();
        const mtpProof = new Iden3SparseMerkleTreeProof({
            type: ProofType.Iden3SparseMerkleTreeProof,
            mtp: proof,
            issuerData: new IssuerData({
                id: did.string(),
                state: {
                    rootOfRoots: ZERO_HASH.hex(),
                    revocationTreeRoot: ZERO_HASH.hex(),
                    claimsTreeRoot: claimsTreeHex,
                    value: stateHex
                },
                authCoreClaim: authClaim.hex(),
                credentialStatus: credential.credentialStatus,
                mtp: proof
            }),
            coreClaim: authClaim.hex()
        });
        credential.proof = [mtpProof];
        await this._storage.identity.saveIdentity({
            did: did.string(),
            state: currentState,
            isStatePublished: false,
            isStateGenesis: true
        });
        await this._credentialWallet.save(credential);
        return {
            did,
            credential
        };
    }
    /** {@inheritDoc IIdentityWallet.getGenesisDIDMetadata} */
    async getGenesisDIDMetadata(did) {
        // check if it is a genesis identity
        const identity = await this._storage.identity.getIdentity(did.string());
        if (identity) {
            return { nonce: 0, genesisDID: DID.parse(identity.did) };
        }
        const profile = await this._storage.identity.getProfileById(did.string());
        if (!profile) {
            throw new Error('profile or identity not found');
        }
        return { nonce: profile.nonce, genesisDID: DID.parse(profile.genesisIdentifier) };
    }
    /** {@inheritDoc IIdentityWallet.createProfile} */
    async createProfile(did, nonce, verifier) {
        const profileDID = generateProfileDID(did, nonce);
        const identityProfiles = await this._storage.identity.getProfilesByGenesisIdentifier(did.string());
        const existingProfile = identityProfiles.find((p) => p.nonce == nonce || p.verifier == verifier);
        if (existingProfile) {
            throw new Error('profile with given nonce or verifier already exists');
        }
        await this._storage.identity.saveProfile({
            id: profileDID.string(),
            nonce,
            genesisIdentifier: did.string(),
            verifier
        });
        return profileDID;
    }
    /**
     *
     * gets profile identity by genesis identifiers
     *
     * @param {string} genesisIdentifier - genesis identifier from which profile has been derived
     * @returns `{Promise<Profile[]>}`
     */
    async getProfilesByDID(did) {
        return this._storage.identity.getProfilesByGenesisIdentifier(did.string());
    }
    /** {@inheritDoc IIdentityWallet.generateKey} */
    async generateKey(keyType) {
        const key = await this._kms.createKeyFromSeed(keyType, getRandomBytes(32));
        return key;
    }
    async getProfileByVerifier(verifier) {
        return this._storage.identity.getProfileByVerifier(verifier);
    }
    /** {@inheritDoc IIdentityWallet.getDIDTreeModel} */
    async getDIDTreeModel(did) {
        const claimsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(did.string(), MerkleTreeType.Claims);
        const revocationTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(did.string(), MerkleTreeType.Revocations);
        const rootsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(did.string(), MerkleTreeType.Roots);
        const state = await hashElems([
            (await claimsTree.root()).bigInt(),
            (await revocationTree.root()).bigInt(),
            (await rootsTree.root()).bigInt()
        ]);
        return {
            state,
            claimsTree,
            revocationTree,
            rootsTree
        };
    }
    /** {@inheritDoc IIdentityWallet.generateClaimMtp} */
    async generateCredentialMtp(did, credential, treeState) {
        const coreClaim = await this.getCoreClaimFromCredential(credential);
        const treesModel = await this.getDIDTreeModel(did);
        const claimsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(did.string(), MerkleTreeType.Claims);
        const claimsRoot = await treesModel.claimsTree.root();
        const rootOfRoots = await treesModel.rootsTree.root();
        const revocationRoot = await treesModel.revocationTree.root();
        const { proof } = await claimsTree.generateProof(coreClaim.hIndex(), treeState ? treeState.claimsRoot : claimsRoot);
        return {
            proof,
            treeState: treeState ?? {
                state: treesModel.state,
                claimsRoot,
                rootOfRoots,
                revocationRoot
            }
        };
    }
    /** {@inheritDoc IIdentityWallet.generateNonRevocationMtp} */
    async generateNonRevocationMtp(did, credential, treeState) {
        const coreClaim = await this.getCoreClaimFromCredential(credential);
        const revNonce = coreClaim.getRevocationNonce();
        const treesModel = await this.getDIDTreeModel(did);
        const revocationTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(did.string(), MerkleTreeType.Revocations);
        const claimsRoot = await treesModel.claimsTree.root();
        const rootOfRoots = await treesModel.rootsTree.root();
        const revocationRoot = await treesModel.revocationTree.root();
        const { proof } = await revocationTree.generateProof(revNonce, treeState ? treeState.revocationRoot : revocationRoot);
        return {
            proof,
            treeState: treeState ?? {
                state: treesModel.state,
                claimsRoot,
                rootOfRoots,
                revocationRoot
            }
        };
    }
    /** {@inheritDoc IIdentityWallet.sign} */
    async sign(message, credential) {
        const keyKMSId = this.getKMSIdByAuthCredential(credential);
        const payload = poseidon.hashBytes(message);
        const signature = await this._kms.sign(keyKMSId, BytesHelper.intToBytes(payload));
        return Signature.newFromCompressed(signature);
    }
    /** {@inheritDoc IIdentityWallet.signChallenge} */
    async signChallenge(challenge, credential) {
        const keyKMSId = this.getKMSIdByAuthCredential(credential);
        const signature = await this._kms.sign(keyKMSId, BytesHelper.intToBytes(challenge));
        return Signature.newFromCompressed(signature);
    }
    /** {@inheritDoc IIdentityWallet.issueCredential} */
    async issueCredential(issuerDID, req, opts) {
        req.revocationOpts.id = req.revocationOpts.id.replace(/\/$/, '');
        let schema;
        const loader = getDocumentLoader(opts);
        try {
            schema = (await loader(req.credentialSchema)).document;
        }
        catch (e) {
            throw new Error(`can't load credential schema ${req.credentialSchema}`);
        }
        const jsonSchema = schema;
        let credential = new W3CCredential();
        req.revocationOpts.nonce =
            typeof req.revocationOpts.nonce === 'number'
                ? req.revocationOpts.nonce
                : Math.round(Math.random() * 10000);
        req.subjectPosition = req.subjectPosition ?? SubjectPosition.Index;
        try {
            credential = this._credentialWallet.createCredential(issuerDID, req, jsonSchema);
        }
        catch (e) {
            throw new Error('Error create Iden3Credential');
        }
        const issuerAuthBJJCredential = await this._credentialWallet.getAuthBJJCredential(issuerDID);
        const coreClaimOpts = {
            revNonce: req.revocationOpts.nonce,
            subjectPosition: req.subjectPosition,
            merklizedRootPosition: this.defineMTRootPosition(jsonSchema, req.merklizedRootPosition),
            updatable: false,
            version: 0,
            merklizeOpts: opts
        };
        let jsonLDCtx;
        try {
            jsonLDCtx = (await loader(jsonSchema.$metadata.uris.jsonLdContext)).document;
        }
        catch (e) {
            throw new Error(`can't load json-ld schema ${jsonSchema.$metadata.uris.jsonLdContext}`);
        }
        const schemaBytes = byteEncoder.encode(JSON.stringify(jsonSchema));
        const credentialType = await Path.getTypeIDFromContext(JSON.stringify(jsonLDCtx), req.type, opts);
        const coreClaim = await new Parser().parseClaim(credential, credentialType, schemaBytes, coreClaimOpts);
        const { hi, hv } = coreClaim.hiHv();
        const coreClaimHash = poseidon.hash([hi, hv]);
        const keyKMSId = this.getKMSIdByAuthCredential(issuerAuthBJJCredential);
        const signature = await this._kms.sign(keyKMSId, BytesHelper.intToBytes(coreClaimHash));
        if (!issuerAuthBJJCredential.proof) {
            throw new Error('issuer auth credential must have proof');
        }
        const mtpAuthBJJProof = issuerAuthBJJCredential.proof[0];
        const sigProof = new BJJSignatureProof2021({
            type: ProofType.BJJSignature,
            issuerData: new IssuerData({
                id: issuerDID.string(),
                state: mtpAuthBJJProof.issuerData.state,
                authCoreClaim: mtpAuthBJJProof.coreClaim,
                mtp: mtpAuthBJJProof.mtp,
                credentialStatus: mtpAuthBJJProof.issuerData.credentialStatus
            }),
            coreClaim: coreClaim.hex(),
            signature: Hex.encodeString(signature)
        });
        credential.proof = [sigProof];
        return credential;
    }
    /** {@inheritDoc IIdentityWallet.revokeCredential} */
    async revokeCredential(issuerDID, credential) {
        const issuerTree = await this.getDIDTreeModel(issuerDID);
        const coreClaim = credential.getCoreClaimFromProof(ProofType.BJJSignature);
        if (!coreClaim) {
            throw new Error('credential must have coreClaim representation in the signature proof');
        }
        const nonce = coreClaim.getRevocationNonce();
        await issuerTree.revocationTree.add(nonce, BigInt(0));
        return Number(BigInt.asUintN(64, nonce));
    }
    /** {@inheritDoc IIdentityWallet.addCredentialsToMerkleTree} */
    async addCredentialsToMerkleTree(credentials, issuerDID) {
        const oldIssuerTree = await this.getDIDTreeModel(issuerDID);
        let claimsRoot = await oldIssuerTree.claimsTree.root();
        let rootOfRoots = await oldIssuerTree.rootsTree.root();
        let revocationRoot = await oldIssuerTree.revocationTree.root();
        const oldTreeState = {
            state: oldIssuerTree.state,
            claimsRoot,
            revocationRoot,
            rootOfRoots
        };
        for (let index = 0; index < credentials.length; index++) {
            const credential = credentials[index];
            // credential must have a bjj signature proof
            const coreClaim = await credential.getCoreClaimFromProof(ProofType.BJJSignature);
            if (!coreClaim) {
                throw new Error('credential must have coreClaim representation in the signature proof');
            }
            await this._storage.mt.addToMerkleTree(issuerDID.string(), MerkleTreeType.Claims, coreClaim.hIndex(), coreClaim.hValue());
        }
        const newIssuerTreeState = await this.getDIDTreeModel(issuerDID);
        const claimTreeRoot = await newIssuerTreeState.claimsTree.root();
        await this._storage.mt.addToMerkleTree(issuerDID.string(), MerkleTreeType.Roots, claimTreeRoot.bigInt(), BigInt(0));
        const newIssuerTreeStateWithROR = await this.getDIDTreeModel(issuerDID);
        claimsRoot = await newIssuerTreeStateWithROR.claimsTree.root();
        rootOfRoots = await newIssuerTreeStateWithROR.rootsTree.root();
        revocationRoot = await newIssuerTreeStateWithROR.revocationTree.root();
        return {
            credentials,
            newTreeState: {
                state: newIssuerTreeStateWithROR.state,
                claimsRoot,
                rootOfRoots,
                revocationRoot
            },
            oldTreeState: oldTreeState
        };
    }
    /** {@inheritDoc IIdentityWallet.generateIden3SparseMerkleTreeProof} */
    async generateIden3SparseMerkleTreeProof(issuerDID, credentials, txId, blockNumber, blockTimestamp) {
        for (let index = 0; index < credentials.length; index++) {
            const credential = credentials[index];
            const mtpWithProof = await this.generateCredentialMtp(issuerDID, credential);
            // credential must have a bjj signature proof
            const coreClaim = credential.getCoreClaimFromProof(ProofType.BJJSignature);
            if (!coreClaim) {
                throw new Error('credential must have coreClaim representation in the signature proof');
            }
            const mtpProof = new Iden3SparseMerkleTreeProof({
                type: ProofType.Iden3SparseMerkleTreeProof,
                mtp: mtpWithProof.proof,
                issuerData: new IssuerData({
                    id: issuerDID.string(),
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
                }),
                coreClaim: coreClaim.hex()
            });
            if (Array.isArray(credentials[index].proof)) {
                credentials[index].proof.push(mtpProof);
            }
            else {
                credentials[index].proof = mtpProof;
            }
        }
        return credentials;
    }
    /** {@inheritDoc IIdentityWallet.publishStateToRHS} */
    async publishStateToRHS(issuerDID, rhsURL, revokedNonces) {
        const treeState = await this.getDIDTreeModel(issuerDID);
        await pushHashesToRHS(treeState.state, {
            revocationTree: treeState.revocationTree,
            claimsTree: treeState.claimsTree,
            state: treeState.state,
            rootsTree: treeState.rootsTree
        }, rhsURL, revokedNonces);
    }
    getKMSIdByAuthCredential(credential) {
        if (credential.type.indexOf('AuthBJJCredential') === -1) {
            throw new Error("can't sign with not AuthBJJCredential credential");
        }
        const x = credential.credentialSubject['x'];
        const y = credential.credentialSubject['y'];
        const pb = new PublicKey([BigInt(x), BigInt(y)]);
        const kp = keyPath(KmsKeyType.BabyJubJub, pb.hex());
        return { type: KmsKeyType.BabyJubJub, id: kp };
    }
    defineMTRootPosition(schema, position) {
        if (schema.$metadata?.serialization) {
            return '';
        }
        if (position) {
            return position;
        }
        return MerklizedRootPosition.Index;
    }
    async getCoreClaimFromCredential(credential) {
        const coreClaimFromSigProof = credential.getCoreClaimFromProof(ProofType.BJJSignature);
        const coreClaimFromMtpProof = credential.getCoreClaimFromProof(ProofType.Iden3SparseMerkleTreeProof);
        if (coreClaimFromMtpProof &&
            coreClaimFromSigProof &&
            coreClaimFromMtpProof.hex() !== coreClaimFromSigProof.hex()) {
            throw new Error('core claim representations is set in both proofs but they are not equal');
        }
        if (!coreClaimFromMtpProof && !coreClaimFromSigProof) {
            throw new Error('core claim is not set in credential proofs');
        }
        //eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        const coreClaim = coreClaimFromMtpProof ?? coreClaimFromSigProof;
        return coreClaim;
    }
    async findOwnedCredentialsByDID(did, query) {
        const credentials = await this._credentialWallet.findByQuery(query);
        if (!credentials.length) {
            throw new Error(`no credential satisfied query`);
        }
        const { genesisDID } = await this.getGenesisDIDMetadata(did);
        const profiles = await this.getProfilesByDID(genesisDID);
        return credentials.filter((cred) => {
            const credentialSubjectId = cred.credentialSubject['id']; // credential subject
            return (credentialSubjectId == genesisDID.string() ||
                profiles.some((p) => {
                    return p.id === credentialSubjectId;
                }));
        });
    }
}
//# sourceMappingURL=identity-wallet.js.map