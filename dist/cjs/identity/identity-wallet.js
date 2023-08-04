"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityWallet = void 0;
const kms_1 = require("../kms");
const js_iden3_core_1 = require("@iden3/js-iden3-core");
const js_crypto_1 = require("@iden3/js-crypto");
const js_merkletree_1 = require("@iden3/js-merkletree");
const common_1 = require("./common");
const uuid = __importStar(require("uuid"));
const schema_processor_1 = require("../schema-processor");
const mt_1 = require("../storage/entities/mt");
const provider_helpers_1 = require("../kms/provider-helpers");
const verifiable_1 = require("../verifiable");
const rhs_1 = require("../credentials/rhs");
const utils_1 = require("../utils");
const js_jsonld_merklization_1 = require("@iden3/js-jsonld-merklization");
const cross_sha256_1 = require("cross-sha256");
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
class IdentityWallet {
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
            ? uuid.v5(new cross_sha256_1.sha256js().update(opts.seed).digest('hex'), uuid.NIL)
            : uuid.v4();
        opts.method = opts.method ?? js_iden3_core_1.DidMethod.Iden3;
        opts.blockchain = opts.blockchain ?? js_iden3_core_1.Blockchain.Polygon;
        opts.networkId = opts.networkId ?? js_iden3_core_1.NetworkId.Mumbai;
        await this._storage.mt.createIdentityMerkleTrees(tmpIdentifier);
        opts.seed = opts.seed ?? (0, provider_helpers_1.getRandomBytes)(32);
        const keyId = await this._kms.createKeyFromSeed(kms_1.KmsKeyType.BabyJubJub, opts.seed);
        const pubKeyHex = await this._kms.publicKey(keyId);
        const pubKey = js_crypto_1.PublicKey.newFromHex(pubKeyHex);
        const schemaHash = js_iden3_core_1.SchemaHash.authSchemaHash;
        const authClaim = js_iden3_core_1.Claim.newClaim(schemaHash, js_iden3_core_1.ClaimOptions.withIndexDataInts(pubKey.p[0], pubKey.p[1]), js_iden3_core_1.ClaimOptions.withRevocationNonce(BigInt(0)));
        const revNonce = opts.revocationOpts.nonce ?? 0;
        authClaim.setRevocationNonce(BigInt(revNonce));
        await this._storage.mt.addToMerkleTree(tmpIdentifier, mt_1.MerkleTreeType.Claims, authClaim.hiHv().hi, authClaim.hiHv().hv);
        const claimsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(tmpIdentifier, mt_1.MerkleTreeType.Claims);
        const currentState = (0, js_merkletree_1.hashElems)([
            (await claimsTree.root()).bigInt(),
            js_merkletree_1.ZERO_HASH.bigInt(),
            js_merkletree_1.ZERO_HASH.bigInt()
        ]);
        const didType = (0, js_iden3_core_1.buildDIDType)(opts.method, opts.blockchain, opts.networkId);
        const identifier = js_iden3_core_1.Id.idGenesisFromIdenState(didType, currentState.bigInt());
        const did = js_iden3_core_1.DID.parseFromId(identifier);
        await this._storage.mt.bindMerkleTreeToNewIdentifier(tmpIdentifier, did.string());
        const schema = JSON.parse(verifiable_1.VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_SCHEMA_JSON);
        const authData = authClaim.getExpirationDate();
        const expiration = authData ? (0, js_iden3_core_1.getUnixTimestamp)(authData) : 0;
        const request = {
            credentialSchema: verifiable_1.VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_SCHEMA_JSON_URL,
            type: verifiable_1.VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_TYPE,
            credentialSubject: {
                x: pubKey.p[0].toString(),
                y: pubKey.p[1].toString()
            },
            subjectPosition: (0, common_1.subjectPositionIndex)(authClaim.getIdPosition()),
            version: 0,
            expiration,
            revocationOpts: {
                nonce: revNonce,
                id: opts.revocationOpts.id.replace(/\/$/, ''),
                type: opts.revocationOpts.type
            }
        };
        let credential = new verifiable_1.W3CCredential();
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
        const mtpProof = new verifiable_1.Iden3SparseMerkleTreeProof({
            type: verifiable_1.ProofType.Iden3SparseMerkleTreeProof,
            mtp: proof,
            issuerData: new verifiable_1.IssuerData({
                id: did.string(),
                state: {
                    rootOfRoots: js_merkletree_1.ZERO_HASH.hex(),
                    revocationTreeRoot: js_merkletree_1.ZERO_HASH.hex(),
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
            return { nonce: 0, genesisDID: js_iden3_core_1.DID.parse(identity.did) };
        }
        const profile = await this._storage.identity.getProfileById(did.string());
        if (!profile) {
            throw new Error('profile or identity not found');
        }
        return { nonce: profile.nonce, genesisDID: js_iden3_core_1.DID.parse(profile.genesisIdentifier) };
    }
    /** {@inheritDoc IIdentityWallet.createProfile} */
    async createProfile(did, nonce, verifier) {
        const profileDID = (0, common_1.generateProfileDID)(did, nonce);
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
        const key = await this._kms.createKeyFromSeed(keyType, (0, provider_helpers_1.getRandomBytes)(32));
        return key;
    }
    async getProfileByVerifier(verifier) {
        return this._storage.identity.getProfileByVerifier(verifier);
    }
    /** {@inheritDoc IIdentityWallet.getDIDTreeModel} */
    async getDIDTreeModel(did) {
        const claimsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(did.string(), mt_1.MerkleTreeType.Claims);
        const revocationTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(did.string(), mt_1.MerkleTreeType.Revocations);
        const rootsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(did.string(), mt_1.MerkleTreeType.Roots);
        const state = await (0, js_merkletree_1.hashElems)([
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
        const claimsTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(did.string(), mt_1.MerkleTreeType.Claims);
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
        const revocationTree = await this._storage.mt.getMerkleTreeByIdentifierAndType(did.string(), mt_1.MerkleTreeType.Revocations);
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
        const payload = js_crypto_1.poseidon.hashBytes(message);
        const signature = await this._kms.sign(keyKMSId, js_iden3_core_1.BytesHelper.intToBytes(payload));
        return js_crypto_1.Signature.newFromCompressed(signature);
    }
    /** {@inheritDoc IIdentityWallet.signChallenge} */
    async signChallenge(challenge, credential) {
        const keyKMSId = this.getKMSIdByAuthCredential(credential);
        const signature = await this._kms.sign(keyKMSId, js_iden3_core_1.BytesHelper.intToBytes(challenge));
        return js_crypto_1.Signature.newFromCompressed(signature);
    }
    /** {@inheritDoc IIdentityWallet.issueCredential} */
    async issueCredential(issuerDID, req, opts) {
        req.revocationOpts.id = req.revocationOpts.id.replace(/\/$/, '');
        let schema;
        const loader = (0, js_jsonld_merklization_1.getDocumentLoader)(opts);
        try {
            schema = (await loader(req.credentialSchema)).document;
        }
        catch (e) {
            throw new Error(`can't load credential schema ${req.credentialSchema}`);
        }
        const jsonSchema = schema;
        let credential = new verifiable_1.W3CCredential();
        req.revocationOpts.nonce =
            typeof req.revocationOpts.nonce === 'number'
                ? req.revocationOpts.nonce
                : Math.round(Math.random() * 10000);
        req.subjectPosition = req.subjectPosition ?? verifiable_1.SubjectPosition.Index;
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
        const schemaBytes = utils_1.byteEncoder.encode(JSON.stringify(jsonSchema));
        const credentialType = await js_jsonld_merklization_1.Path.getTypeIDFromContext(JSON.stringify(jsonLDCtx), req.type, opts);
        const coreClaim = await new schema_processor_1.Parser().parseClaim(credential, credentialType, schemaBytes, coreClaimOpts);
        const { hi, hv } = coreClaim.hiHv();
        const coreClaimHash = js_crypto_1.poseidon.hash([hi, hv]);
        const keyKMSId = this.getKMSIdByAuthCredential(issuerAuthBJJCredential);
        const signature = await this._kms.sign(keyKMSId, js_iden3_core_1.BytesHelper.intToBytes(coreClaimHash));
        if (!issuerAuthBJJCredential.proof) {
            throw new Error('issuer auth credential must have proof');
        }
        const mtpAuthBJJProof = issuerAuthBJJCredential.proof[0];
        const sigProof = new verifiable_1.BJJSignatureProof2021({
            type: verifiable_1.ProofType.BJJSignature,
            issuerData: new verifiable_1.IssuerData({
                id: issuerDID.string(),
                state: mtpAuthBJJProof.issuerData.state,
                authCoreClaim: mtpAuthBJJProof.coreClaim,
                mtp: mtpAuthBJJProof.mtp,
                credentialStatus: mtpAuthBJJProof.issuerData.credentialStatus
            }),
            coreClaim: coreClaim.hex(),
            signature: js_crypto_1.Hex.encodeString(signature)
        });
        credential.proof = [sigProof];
        return credential;
    }
    /** {@inheritDoc IIdentityWallet.revokeCredential} */
    async revokeCredential(issuerDID, credential) {
        const issuerTree = await this.getDIDTreeModel(issuerDID);
        const coreClaim = credential.getCoreClaimFromProof(verifiable_1.ProofType.BJJSignature);
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
            const coreClaim = await credential.getCoreClaimFromProof(verifiable_1.ProofType.BJJSignature);
            if (!coreClaim) {
                throw new Error('credential must have coreClaim representation in the signature proof');
            }
            await this._storage.mt.addToMerkleTree(issuerDID.string(), mt_1.MerkleTreeType.Claims, coreClaim.hIndex(), coreClaim.hValue());
        }
        const newIssuerTreeState = await this.getDIDTreeModel(issuerDID);
        const claimTreeRoot = await newIssuerTreeState.claimsTree.root();
        await this._storage.mt.addToMerkleTree(issuerDID.string(), mt_1.MerkleTreeType.Roots, claimTreeRoot.bigInt(), BigInt(0));
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
            const coreClaim = credential.getCoreClaimFromProof(verifiable_1.ProofType.BJJSignature);
            if (!coreClaim) {
                throw new Error('credential must have coreClaim representation in the signature proof');
            }
            const mtpProof = new verifiable_1.Iden3SparseMerkleTreeProof({
                type: verifiable_1.ProofType.Iden3SparseMerkleTreeProof,
                mtp: mtpWithProof.proof,
                issuerData: new verifiable_1.IssuerData({
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
        await (0, rhs_1.pushHashesToRHS)(treeState.state, {
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
        const pb = new js_crypto_1.PublicKey([BigInt(x), BigInt(y)]);
        const kp = (0, provider_helpers_1.keyPath)(kms_1.KmsKeyType.BabyJubJub, pb.hex());
        return { type: kms_1.KmsKeyType.BabyJubJub, id: kp };
    }
    defineMTRootPosition(schema, position) {
        if (schema.$metadata?.serialization) {
            return '';
        }
        if (position) {
            return position;
        }
        return verifiable_1.MerklizedRootPosition.Index;
    }
    async getCoreClaimFromCredential(credential) {
        const coreClaimFromSigProof = credential.getCoreClaimFromProof(verifiable_1.ProofType.BJJSignature);
        const coreClaimFromMtpProof = credential.getCoreClaimFromProof(verifiable_1.ProofType.Iden3SparseMerkleTreeProof);
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
exports.IdentityWallet = IdentityWallet;
//# sourceMappingURL=identity-wallet.js.map