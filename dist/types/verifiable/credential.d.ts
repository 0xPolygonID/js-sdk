import { BJJSignatureProof2021, Iden3SparseMerkleTreeProof, CredentialStatus, RefreshService, DisplayMethod } from './proof';
import { Claim, DID } from '@iden3/js-iden3-core';
import { Proof } from '@iden3/js-merkletree';
import { Merklizer, Options } from '@iden3/js-jsonld-merklization';
import { CredentialRequest, CredentialStatusResolverRegistry } from '../credentials';
import { ProofType } from './constants';
import { CoreClaimCreationOptions } from './core-utils';
import { JsonDocumentObject } from '../iden3comm';
/**
 * W3C Verifiable credential
 *
 * @public
 * @export
 * @class W3CCredential
 */
export declare class W3CCredential {
    id: string;
    '@context': string[];
    type: string[];
    expirationDate?: string;
    refreshService?: RefreshService;
    displayMethod?: DisplayMethod;
    issuanceDate?: string;
    credentialSubject: JsonDocumentObject;
    credentialStatus: CredentialStatus;
    issuer: string;
    credentialSchema: CredentialSchema;
    proof?: object | unknown[];
    /**
     *
     * @param issuer - DID of the issuer
     * @param request - Credential request
     * @returns - W3C Credential
     */
    static fromCredentialRequest(issuer: DID, request: CredentialRequest): W3CCredential;
    /**
     * Builds credential status
     * @param {CredentialRequest} request
     * @returns `CredentialStatus`
     */
    private static buildCredentialStatus;
    toJSON(): this & {
        proof: any;
    };
    private proofToJSON;
    private static proofFromJSON;
    static fromJSON(obj: any): W3CCredential;
    /**
     * merklization of the verifiable credential
     *
     * @returns `Promise<Merklizer>`
     */
    merklize(opts?: Options): Promise<Merklizer>;
    /**
     * gets core claim representation from credential proof
     *
     * @param {ProofType} proofType
     * @returns {*}  {(Claim | undefined)}
     */
    getCoreClaimFromProof(proofType: ProofType): Claim | undefined;
    /**
     * gets core claim representation from W3CCredential
     *
     * @param {CoreClaimParsingOptions} [opts] - options to create core claim
     * @returns {*}  {(Promise<Claim>)}
     */
    toCoreClaim(opts?: CoreClaimCreationOptions): Promise<Claim>;
    /**
     * checks BJJSignatureProof2021 in W3C VC
     *
     * @returns BJJSignatureProof2021 | undefined
     */
    getBJJSignature2021Proof(): BJJSignatureProof2021 | undefined;
    /**
     * checks Iden3SparseMerkleTreeProof in W3C VC
     *
     * @returns {*}  {(Iden3SparseMerkleTreeProof | undefined)}
     */
    getIden3SparseMerkleTreeProof(): Iden3SparseMerkleTreeProof | undefined;
    /**
     * Verify credential proof
     *
     * @returns {*}  {(boolean)}
     */
    verifyProof(proofType: ProofType, resolverURL: string, opts?: W3CProofVerificationOptions): Promise<boolean>;
    /**
     * Verify credential proofs
     *
     * @returns {*}  {(boolean)}
     */
    verifyProofs(resolverURL: string, opts?: W3CProofVerificationOptions): Promise<boolean>;
    private verifyCoreClaimMatch;
    private verifyBJJSignatureProof;
    private verifyIden3SparseMerkleTreeProof;
    private getProofByType;
}
/**
 * extracts core claim from Proof and returns Proof Type
 *
 * @param {object} proof - proof of vc
 * @returns {*}  {{ claim: Claim; proofType: ProofType }}
 */
export declare function extractProof(proof: object): {
    claim: Claim;
    proofType: ProofType;
};
/**
 * validate tree state by recalculating poseidon hash of roots and comparing with state
 *
 * @param {Issuer} treeState - issuer struct
 * @returns {boolean}
 */
export declare function validateTreeState(treeState: Issuer): boolean;
/**
 * Credential schema vc
 *
 * @public
 * @interface   CredentialSchema
 */
export interface CredentialSchema {
    id: string;
    type: string;
}
/**
 * Issuer tree information
 *
 * @public
 * @interface   Issuer
 */
export interface Issuer {
    state?: string;
    rootOfRoots?: string;
    claimsTreeRoot?: string;
    revocationTreeRoot?: string;
}
/**
 *
 * RevocationStatus status of revocation nonce. Info required to check revocation state of claim in circuits
 * @public
 * @interface   RevocationStatus
 */
export interface RevocationStatus {
    mtp: Proof;
    issuer: Issuer;
}
/**
 *
 * Proof verification options
 * @public
 * @interface   W3CProofVerificationOptions
 */
export interface W3CProofVerificationOptions {
    credStatusResolverRegistry?: CredentialStatusResolverRegistry;
    merklizeOptions?: Options;
}
//# sourceMappingURL=credential.d.ts.map