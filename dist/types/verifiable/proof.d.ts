import { Hash, Proof } from '@iden3/js-merkletree';
import { ProofType, CredentialStatusType, RefreshServiceType, DisplayMethodType } from './constants';
import { TreeState } from '../circuits';
import { Signature } from '@iden3/js-crypto';
import { Claim, DID } from '@iden3/js-iden3-core';
import { JsonDocumentObject, JSONObject } from '../iden3comm';
/**
 * Represents the published state of the issuer
 *
 * @public
 * @interface   State
 */
export interface State {
    txId?: string;
    blockTimestamp?: number;
    blockNumber?: number;
    rootOfRoots: Hash;
    claimsTreeRoot: Hash;
    revocationTreeRoot: Hash;
    value: Hash;
    status?: string;
}
/**
 * Iden3SparseMerkleProof is a iden3 protocol merkle tree proof
 *
 * @public
 * @class Iden3SparseMerkleTreeProof
 */
export declare class Iden3SparseMerkleTreeProof {
    type: ProofType;
    issuerData: {
        id: DID;
        state: State;
    };
    mtp: Proof;
    coreClaim: Claim;
    /**
     * Creates an instance of Iden3SparseMerkleTreeProof.
     * @param {object} obj
     */
    constructor(obj: {
        issuerData: {
            id: DID;
            state: State;
        };
        mtp: Proof;
        coreClaim: Claim;
    });
    /**
     *
     *
     * @returns `json object in serialized presentation`
     */
    toJSON(): {
        issuerData: {
            id: string;
            state: {
                rootOfRoots: string;
                claimsTreeRoot: string;
                revocationTreeRoot: string;
                value: string;
                txId?: string;
                blockTimestamp?: number;
                blockNumber?: number;
                status?: string;
            };
        };
        type: ProofType;
        coreClaim: string;
        mtp: {
            existence: boolean;
            siblings: string[];
            node_aux: {
                key: string;
                value: string;
            } | undefined;
        };
    };
    static fromJSON(obj: any): Iden3SparseMerkleTreeProof;
}
/**
 *
 * BJJSignatureProof2021 is a signature of core claim by BJJ key
 * @public
 * @class BJJSignatureProof2021
 */
export declare class BJJSignatureProof2021 {
    type: ProofType;
    issuerData: {
        id: DID;
        state: State;
        authCoreClaim: Claim;
        mtp: Proof;
        credentialStatus: CredentialStatus;
    };
    signature: Signature;
    coreClaim: Claim;
    constructor(obj: {
        issuerData: {
            id: DID;
            state: State;
            authCoreClaim: Claim;
            mtp: Proof;
            credentialStatus: CredentialStatus;
        };
        coreClaim: Claim;
        signature: Signature;
    });
    /**
     * toJSON is a method to serialize BJJSignatureProof2021 to json
     *
     * @returns `json object in serialized presentation`
     */
    toJSON(): {
        issuerData: {
            id: string;
            state: {
                rootOfRoots: string;
                claimsTreeRoot: string;
                revocationTreeRoot: string;
                value: string;
                txId?: string;
                blockTimestamp?: number;
                blockNumber?: number;
                status?: string;
            };
            mtp: {
                existence: boolean;
                siblings: string[];
                node_aux: {
                    key: string;
                    value: string;
                } | undefined;
            };
            authCoreClaim: string;
            credentialStatus: CredentialStatus;
        };
        type: ProofType;
        coreClaim: string;
        signature: string;
    };
    /**
     * fromJSON is a method to deserialize BJJSignatureProof2021 from json
     * @param obj
     */
    static fromJSON(obj: any): BJJSignatureProof2021;
}
/**
 *  Query represents structure for query to atomic circuit
 *
 * @public
 * @interface   ProofQuery
 */
export interface ProofQuery {
    allowedIssuers?: string[];
    credentialSubject?: JsonDocumentObject;
    schema?: string;
    claimId?: string;
    credentialSubjectId?: string;
    context?: string;
    type?: string;
    skipClaimRevocationCheck?: boolean;
    proofType?: string;
    groupId?: number;
    params?: JSONObject;
}
/**
 * Proof with MerkleTree info
 *
 * @public
 * @interface   MerkleTreeProofWithTreeState
 */
export interface MerkleTreeProofWithTreeState {
    proof: Proof;
    treeState: TreeState;
}
/**
 *
 * CredentialStatus contains type and revocation Url
 * @public
 * @interface   CredentialStatus
 */
export interface CredentialStatus {
    id: string;
    type: CredentialStatusType;
    revocationNonce?: number;
    statusIssuer?: {
        id: string;
        type: CredentialStatusType;
        revocationNonce?: number;
    };
}
/**
 * RefreshService contains type and id
 * @public
 * @interface   RefreshService
 */
export interface RefreshService {
    id: string;
    type: RefreshServiceType | string;
}
/**
 * DisplayMethod contains type and id
 * @public
 * @interface   DisplayMethod
 */
export interface DisplayMethod {
    id: string;
    type: DisplayMethodType | string;
}
//# sourceMappingURL=proof.d.ts.map