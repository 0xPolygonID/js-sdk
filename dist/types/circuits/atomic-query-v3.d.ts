import { Claim, Id, SchemaHash } from '@iden3/js-iden3-core';
import { BaseConfig } from './common';
import { BJJSignatureProof, MTProof, Query } from './models';
import { Hash } from '@iden3/js-merkletree';
import { ProofType } from '../verifiable';
export interface ClaimWithSigAndMTPProof {
    issuerID: Id;
    claim: Claim;
    nonRevProof: MTProof;
    signatureProof?: BJJSignatureProof;
    incProof?: MTProof;
}
/**
 * AtomicQueryV3Inputs ZK private inputs for credentialAtomicQueryV3.circom
 *
 * @beta
 * @class AtomicQueryV3Inputs
 * @extends {BaseConfig}
 */
export declare class AtomicQueryV3Inputs extends BaseConfig {
    constructor(opts?: {
        mtLevel?: number;
        mtLevelClaim?: number;
    });
    requestID: bigint;
    id: Id;
    profileNonce: bigint;
    claimSubjectProfileNonce: bigint;
    claim: ClaimWithSigAndMTPProof;
    skipClaimRevocationCheck: boolean;
    query: Query;
    currentTimeStamp: number;
    proofType: ProofType;
    linkNonce: bigint;
    verifierID?: Id;
    nullifierSessionID: bigint;
    validate(): void;
    fillMTPProofsWithZero(s: Partial<AtomicQueryV3CircuitInputs>): void;
    fillSigProofWithZero(s: Partial<AtomicQueryV3CircuitInputs>): void;
    inputsMarshal(): Uint8Array;
}
/**
 * @beta
 * AtomicQueryV3CircuitInputs type represents credentialAtomicQueryV3.circom private inputs required by prover
 */
interface AtomicQueryV3CircuitInputs {
    requestID: string;
    userGenesisID: string;
    profileNonce: string;
    claimSubjectProfileNonce: string;
    issuerID: string;
    issuerClaim: string[];
    issuerClaimNonRevClaimsTreeRoot: string;
    issuerClaimNonRevRevTreeRoot: string;
    issuerClaimNonRevRootsTreeRoot: string;
    issuerClaimNonRevState: string;
    issuerClaimNonRevMtp: string[];
    issuerClaimNonRevMtpAuxHi: string;
    issuerClaimNonRevMtpAuxHv: string;
    issuerClaimNonRevMtpNoAux: string;
    claimSchema: string;
    issuerClaimSignatureR8x: string;
    issuerClaimSignatureR8y: string;
    issuerClaimSignatureS: string;
    issuerAuthClaim: string[];
    issuerAuthClaimMtp: string[];
    issuerAuthClaimNonRevMtp: string[];
    issuerAuthClaimNonRevMtpAuxHi: string;
    issuerAuthClaimNonRevMtpAuxHv: string;
    issuerAuthClaimNonRevMtpNoAux: string;
    issuerAuthClaimsTreeRoot: string;
    issuerAuthRevTreeRoot: string;
    issuerAuthRootsTreeRoot: string;
    issuerAuthState: string;
    isRevocationChecked: number;
    claimPathMtp: string[];
    claimPathMtpNoAux: string;
    claimPathMtpAuxHi: string;
    claimPathMtpAuxHv: string;
    claimPathKey: string;
    claimPathValue: string;
    operator: number;
    slotIndex: number;
    timestamp: number;
    value: string[];
    valueArraySize: number;
    issuerClaimMtp: string[];
    issuerClaimClaimsTreeRoot: string;
    issuerClaimRevTreeRoot: string;
    issuerClaimRootsTreeRoot: string;
    issuerClaimIdenState: string;
    proofType: string;
    linkNonce: string;
    verifierID: string;
    nullifierSessionID: string;
}
/**
 * @beta
 * AtomicQueryV3PubSignals public inputs
 */
export declare class AtomicQueryV3PubSignals extends BaseConfig {
    constructor(opts?: {
        mtLevel?: number;
        mtLevelClaim?: number;
    });
    requestID: bigint;
    userID: Id;
    issuerID: Id;
    issuerState: Hash;
    issuerClaimNonRevState: Hash;
    claimSchema: SchemaHash;
    slotIndex: number;
    operator: number;
    value: bigint[];
    valueArraySize: number;
    timestamp: number;
    merklized: number;
    claimPathKey: bigint;
    isRevocationChecked: number;
    proofType: number;
    linkID: bigint;
    nullifier: bigint;
    operatorOutput: bigint;
    verifierID: Id;
    nullifierSessionID: bigint;
    pubSignalsUnmarshal(data: Uint8Array): AtomicQueryV3PubSignals;
}
export {};
//# sourceMappingURL=atomic-query-v3.d.ts.map