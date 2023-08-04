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
exports.CredentialWallet = void 0;
const js_iden3_core_1 = require("@iden3/js-iden3-core");
const verifiable_1 = require("./../verifiable");
const uuid = __importStar(require("uuid"));
const resolver_1 = require("./status/resolver");
const sparse_merkle_tree_1 = require("./status/sparse-merkle-tree");
const agent_revocation_1 = require("./status/agent-revocation");
// ErrAllClaimsRevoked all claims are revoked.
const ErrAllClaimsRevoked = 'all claims are revoked';
/**
 *
 * Wallet instance is a wrapper of CRUD logic for W3C credentials,
 * also it allows to fetch revocation statuses.
 *
 * @public
 * @class CredentialWallet
 * @implements implements ICredentialWallet interface
 */
class CredentialWallet {
    /**
     * Creates an instance of CredentialWallet.
     * @param {IDataStorage} _storage - data storage to access credential / identity / Merkle tree data
     * @param {CredentialStatusResolverRegistry} _credentialStatusResolverRegistry - list of credential status resolvers
     * if _credentialStatusResolverRegistry is not provided, default resolvers will be used
     */
    constructor(_storage, _credentialStatusResolverRegistry) {
        this._storage = _storage;
        this._credentialStatusResolverRegistry = _credentialStatusResolverRegistry;
        /**
         * {@inheritDoc ICredentialWallet.createCredential}
         */
        this.createCredential = (issuer, request, schema) => {
            if (!schema.$metadata.uris['jsonLdContext']) {
                throw new Error('jsonLdContext is missing is the schema');
            }
            const context = [
                verifiable_1.VerifiableConstants.JSONLD_SCHEMA.W3C_CREDENTIAL_2018,
                verifiable_1.VerifiableConstants.JSONLD_SCHEMA.IDEN3_CREDENTIAL,
                schema.$metadata.uris['jsonLdContext']
            ];
            const credentialType = [
                verifiable_1.VerifiableConstants.CREDENTIAL_TYPE.W3C_VERIFIABLE_CREDENTIAL,
                request.type
            ];
            const expirationDate = !request.expiration || request.expiration == 0 ? null : request.expiration;
            const credentialSubject = request.credentialSubject;
            credentialSubject['type'] = request.type;
            const cr = new verifiable_1.W3CCredential();
            cr.id = `urn:${uuid.v4()}`;
            cr['@context'] = context;
            cr.type = credentialType;
            cr.expirationDate = expirationDate ? new Date(expirationDate * 1000).toISOString() : undefined;
            cr.issuanceDate = new Date().toISOString();
            cr.credentialSubject = credentialSubject;
            cr.issuer = issuer.string();
            cr.credentialSchema = {
                id: request.credentialSchema,
                type: verifiable_1.VerifiableConstants.JSON_SCHEMA_VALIDATOR
            };
            const id = request.revocationOpts.type === verifiable_1.CredentialStatusType.SparseMerkleTreeProof
                ? `${request.revocationOpts.id.replace(/\/$/, '')}/${request.revocationOpts.nonce}`
                : request.revocationOpts.id;
            cr.credentialStatus = {
                id,
                revocationNonce: request.revocationOpts.nonce,
                type: request.revocationOpts.type
            };
            return cr;
        };
        // if no credential status resolvers are provided
        // register default issuer resolver
        if (!this._credentialStatusResolverRegistry) {
            this._credentialStatusResolverRegistry = new resolver_1.CredentialStatusResolverRegistry();
            this._credentialStatusResolverRegistry.register(verifiable_1.CredentialStatusType.SparseMerkleTreeProof, new sparse_merkle_tree_1.IssuerResolver());
            this._credentialStatusResolverRegistry.register(verifiable_1.CredentialStatusType.Iden3commRevocationStatusV1, new agent_revocation_1.AgentResolver());
        }
    }
    /**
     * {@inheritDoc ICredentialWallet.getAuthBJJCredential}
     */
    async getAuthBJJCredential(did) {
        // filter where the issuer of auth credential is given did
        const authBJJCredsOfIssuer = await this._storage.credential.findCredentialsByQuery({
            context: verifiable_1.VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_SCHEMA_JSONLD_URL,
            type: verifiable_1.VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_TYPE,
            allowedIssuers: [did.string()]
        });
        if (!authBJJCredsOfIssuer.length) {
            throw new Error('no auth credentials found');
        }
        for (let index = 0; index < authBJJCredsOfIssuer.length; index++) {
            const authCred = authBJJCredsOfIssuer[index];
            const revocationStatus = await this.getRevocationStatusFromCredential(authCred);
            if (!revocationStatus.mtp.existence) {
                return authCred;
            }
        }
        throw new Error('all auth bjj credentials are revoked');
    }
    /**
     * {@inheritDoc ICredentialWallet.getRevocationStatusFromCredential}
     */
    async getRevocationStatusFromCredential(cred) {
        const mtpProof = cred.getIden3SparseMerkleTreeProof();
        const sigProof = cred.getBJJSignature2021Proof();
        const issuerData = mtpProof
            ? mtpProof.issuerData
            : sigProof?.issuerData;
        if (!issuerData) {
            throw new Error('no sig / mtp proof to check issuer info');
        }
        const issuerDID = js_iden3_core_1.DID.parse(cred.issuer);
        let userDID;
        if (!cred.credentialSubject.id) {
            userDID = issuerDID;
        }
        else {
            if (typeof cred.credentialSubject.id !== 'string') {
                throw new Error('credential status `id` is not a string');
            }
            userDID = js_iden3_core_1.DID.parse(cred.credentialSubject.id);
        }
        const opts = {
            issuerData,
            issuerDID,
            userDID
        };
        return this.getRevocationStatus(cred.credentialStatus, opts);
    }
    /**
     * {@inheritDoc ICredentialWallet.getRevocationStatus}
     */
    async getRevocationStatus(credStatus, credentialStatusResolveOptions) {
        const statusResolver = this._credentialStatusResolverRegistry?.get(credStatus.type);
        if (!statusResolver) {
            throw new Error(`credential status resolver does not exist for ${credStatus.type} type`);
        }
        return statusResolver.resolve(credStatus, credentialStatusResolveOptions);
    }
    /**
     * {@inheritDoc ICredentialWallet.findById}
     */
    async findById(id) {
        return this._storage.credential.findCredentialById(id);
    }
    /**
     * {@inheritDoc ICredentialWallet.findByContextType}
     */
    async findByContextType(context, type) {
        return this._storage.credential.findCredentialsByQuery({ context, type });
    }
    /**
     * {@inheritDoc ICredentialWallet.save}
     */
    async save(credential) {
        return this._storage.credential.saveCredential(credential);
    }
    /**
     * {@inheritDoc ICredentialWallet.saveAll}
     */
    async saveAll(credentials) {
        return this._storage.credential.saveAllCredentials(credentials);
    }
    /**
     * {@inheritDoc ICredentialWallet.remove}
     */
    async remove(id) {
        return this._storage.credential.removeCredential(id);
    }
    /**
     * {@inheritDoc ICredentialWallet.list}
     */
    async list() {
        return this._storage.credential.listCredentials();
    }
    /**
     * {@inheritDoc ICredentialWallet.findByQuery}
     */
    async findByQuery(query) {
        return this._storage.credential.findCredentialsByQuery(query);
    }
    /**
     * {@inheritDoc ICredentialWallet.filterByCredentialSubject}
     */
    async filterByCredentialSubject(credentials, subject) {
        return credentials.filter((cred) => {
            return cred.credentialSubject['id'] === subject.string();
        });
    }
    async findNonRevokedCredential(creds) {
        for (const cred of creds) {
            const revStatus = await this.getRevocationStatusFromCredential(cred);
            if (revStatus.mtp.existence) {
                continue;
            }
            return { cred, revStatus };
        }
        throw new Error(ErrAllClaimsRevoked);
    }
}
exports.CredentialWallet = CredentialWallet;
//# sourceMappingURL=credential-wallet.js.map