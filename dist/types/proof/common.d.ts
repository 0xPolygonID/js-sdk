import { CircuitId, ClaimNonRevStatus, GISTProof, Operators } from '../circuits';
import { StateProof } from '../storage/entities/state';
import { MerkleTreeProofWithTreeState, RevocationStatus, W3CCredential } from '../verifiable';
import { Options, Path } from '@iden3/js-jsonld-merklization';
import { JsonDocumentObject } from '../iden3comm';
import { Claim } from '@iden3/js-iden3-core';
export type PreparedCredential = {
    credential: W3CCredential;
    credentialCoreClaim: Claim;
    revStatus?: RevocationStatus;
};
export type PreparedAuthBJJCredential = {
    credential: W3CCredential;
    incProof: MerkleTreeProofWithTreeState;
    nonRevProof: MerkleTreeProofWithTreeState;
    coreClaim: Claim;
};
/**
 * converts verifiable RevocationStatus model to circuits structure
 *
 * @param {RevocationStatus} - credential.status of the verifiable credential
 * @returns {ClaimNonRevStatus}
 */
export declare const toClaimNonRevStatus: (s?: RevocationStatus) => ClaimNonRevStatus;
/**
 * converts state info from smart contract to gist proof
 *
 * @param {StateProof} smtProof  - state proof from smart contract
 * @returns {GISTProof}
 */
export declare const toGISTProof: (smtProof: StateProof) => GISTProof;
export type PropertyQuery = {
    fieldName: string;
    operator: Operators;
    operatorValue?: unknown;
};
export type QueryMetadata = PropertyQuery & {
    slotIndex: number;
    values: bigint[];
    path: Path;
    claimPathKey: bigint;
    datatype: string;
    merklizedSchema: boolean;
};
export declare const parseCredentialSubject: (credentialSubject?: JsonDocumentObject) => PropertyQuery[];
export type ParseOptions = Options & {
    legacyNoopOperator?: boolean;
};
export declare const parseQueryMetadata: (propertyQuery: PropertyQuery, ldContextJSON: string, credentialType: string, options: ParseOptions) => Promise<QueryMetadata>;
export declare const parseQueriesMetadata: (credentialType: string, ldContextJSON: string, credentialSubject: JsonDocumentObject, options: ParseOptions) => Promise<QueryMetadata[]>;
export declare const transformQueryValueToBigInts: (value: unknown, ldType: string) => Promise<bigint[]>;
export declare const isAuthCircuit: (circuitId: CircuitId) => boolean;
//# sourceMappingURL=common.d.ts.map