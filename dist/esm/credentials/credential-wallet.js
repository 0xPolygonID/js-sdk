import { DID } from '@iden3/js-iden3-core';
import { W3CCredential, VerifiableConstants, CredentialStatusType } from './../verifiable';
import * as uuid from 'uuid';
import { CredentialStatusResolverRegistry } from './status/resolver';
import { IssuerResolver } from './status/sparse-merkle-tree';
import { AgentResolver } from './status/agent-revocation';
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
export class CredentialWallet {
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
                VerifiableConstants.JSONLD_SCHEMA.W3C_CREDENTIAL_2018,
                VerifiableConstants.JSONLD_SCHEMA.IDEN3_CREDENTIAL,
                schema.$metadata.uris['jsonLdContext']
            ];
            const credentialType = [
                VerifiableConstants.CREDENTIAL_TYPE.W3C_VERIFIABLE_CREDENTIAL,
                request.type
            ];
            const expirationDate = !request.expiration || request.expiration == 0 ? null : request.expiration;
            const credentialSubject = request.credentialSubject;
            credentialSubject['type'] = request.type;
            const cr = new W3CCredential();
            cr.id = `urn:${uuid.v4()}`;
            cr['@context'] = context;
            cr.type = credentialType;
            cr.expirationDate = expirationDate ? new Date(expirationDate * 1000).toISOString() : undefined;
            cr.issuanceDate = new Date().toISOString();
            cr.credentialSubject = credentialSubject;
            cr.issuer = issuer.string();
            cr.credentialSchema = {
                id: request.credentialSchema,
                type: VerifiableConstants.JSON_SCHEMA_VALIDATOR
            };
            const id = request.revocationOpts.type === CredentialStatusType.SparseMerkleTreeProof
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
            this._credentialStatusResolverRegistry = new CredentialStatusResolverRegistry();
            this._credentialStatusResolverRegistry.register(CredentialStatusType.SparseMerkleTreeProof, new IssuerResolver());
            this._credentialStatusResolverRegistry.register(CredentialStatusType.Iden3commRevocationStatusV1, new AgentResolver());
        }
    }
    /**
     * {@inheritDoc ICredentialWallet.getAuthBJJCredential}
     */
    async getAuthBJJCredential(did) {
        // filter where the issuer of auth credential is given did
        const authBJJCredsOfIssuer = await this._storage.credential.findCredentialsByQuery({
            context: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_SCHEMA_JSONLD_URL,
            type: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_TYPE,
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
        const issuerDID = DID.parse(cred.issuer);
        let userDID;
        if (!cred.credentialSubject.id) {
            userDID = issuerDID;
        }
        else {
            if (typeof cred.credentialSubject.id !== 'string') {
                throw new Error('credential status `id` is not a string');
            }
            userDID = DID.parse(cred.credentialSubject.id);
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
//# sourceMappingURL=credential-wallet.js.map