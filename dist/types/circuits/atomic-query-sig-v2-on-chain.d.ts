import { Proof } from '@iden3/js-merkletree';
import { Id, Claim } from '@iden3/js-iden3-core';
import { Signature } from '@iden3/js-crypto';
import { Query, ClaimWithSigProof, TreeState, GISTProof } from './models';
import { Hash } from '@iden3/js-merkletree';
import { BaseConfig } from './common';
/**
 * AtomicQuerySigV2OnChainInputs ZK private inputs for credentialAtomicQuerySig.circom
 *
 * @public
 * @class AtomicQuerySigV2OnChainInputs
 * @extends {BaseConfig}
 */
export declare class AtomicQuerySigV2OnChainInputs extends BaseConfig {
    requestID: bigint;
    id: Id;
    profileNonce: bigint;
    claimSubjectProfileNonce: bigint;
    claim: ClaimWithSigProof;
    skipClaimRevocationCheck: boolean;
    authClaim: Claim;
    authClaimIncMtp: Proof;
    authClaimNonRevMtp: Proof;
    treeState: TreeState;
    gistProof: GISTProof;
    signature: Signature;
    challenge: bigint;
    query: Query;
    currentTimeStamp: number;
    /**
     *  Validate inputs
     *
     *
     */
    validate(): void;
    /**
     * marshal inputs
     *
     * @returns Uint8Array
     */
    inputsMarshal(): Uint8Array;
}
/**
 * AtomicQuerySigV2OnChainCircuitInputs type represents credentialAtomicQuerySig.circom private inputs required by prover
 *
 * @public
 * @class AtomicQuerySigV2OnChainCircuitInputs
 */
export declare class AtomicQuerySigV2OnChainCircuitInputs {
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
    isRevocationChecked: number;
    claimPathNotExists: number;
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
    authClaim: string[];
    authClaimIncMtp: string[];
    authClaimNonRevMtp: string[];
    authClaimNonRevMtpAuxHi: string;
    authClaimNonRevMtpAuxHv: string;
    authClaimNonRevMtpNoAux: string;
    challenge: string;
    challengeSignatureR8x: string;
    challengeSignatureR8y: string;
    challengeSignatureS: string;
    userClaimsTreeRoot: string;
    userRevTreeRoot: string;
    userRootsTreeRoot: string;
    userState: string;
    gistRoot: string;
    gistMtp: string[];
    gistMtpAuxHi: string;
    gistMtpAuxHv: string;
    gistMtpNoAux: string;
}
/**
 *
 * public signals
 * @public
 * @class AtomicQuerySigV2OnChainPubSignals
 * @extends {BaseConfig}
 */
export declare class AtomicQuerySigV2OnChainPubSignals extends BaseConfig {
    requestID: bigint;
    userID: Id;
    issuerID: Id;
    issuerAuthState: Hash;
    issuerClaimNonRevState: Hash;
    timestamp: number;
    merklized: number;
    isRevocationChecked: number;
    circuitQueryHash: bigint;
    challenge: bigint;
    gistRoot: Hash;
    /**
     *
     * // PubSignalsUnmarshal unmarshal credentialAtomicQuerySig.circom public signals
     * @param {Uint8Array} data
     * @returns AtomicQuerySigV2PubSignals
     */
    pubSignalsUnmarshal(data: Uint8Array): AtomicQuerySigV2OnChainPubSignals;
}
