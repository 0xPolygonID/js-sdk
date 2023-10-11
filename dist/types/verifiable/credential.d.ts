import { BJJSignatureProof2021, Iden3SparseMerkleTreeProof, CredentialStatus } from './proof';
import { Claim } from '@iden3/js-iden3-core';
import { ProofType } from './constants';
import { Proof } from '@iden3/js-merkletree';
import { Merklizer, Options } from '@iden3/js-jsonld-merklization';
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
    issuanceDate?: string;
    credentialSubject: {
        [key: string]: object | string | number | boolean;
    };
    credentialStatus: CredentialStatus;
    issuer: string;
    credentialSchema: CredentialSchema;
    proof?: object | unknown[];
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
