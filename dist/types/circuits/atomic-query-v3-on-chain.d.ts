import { Claim, Id } from '@iden3/js-iden3-core';
import { BaseConfig, IStateInfoPubSignals, StatesInfo } from './common';
import { GISTProof, Query, TreeState } from './models';
import { Hash, Proof } from '@iden3/js-merkletree';
import { ClaimWithSigAndMTPProof } from './atomic-query-v3';
import { Signature } from '@iden3/js-crypto';
import { ProofType } from '../verifiable';
/**
 * AtomicQueryV3OnChainInputs ZK private inputs for credentialAtomicQueryV3OnChain.circom
 *
 * @class AtomicQueryV3OnChainInputs
 * @extends {BaseConfig}
 */
export declare class AtomicQueryV3OnChainInputs extends BaseConfig {
    constructor(opts?: {
        mtLevel?: number;
        mtLevelClaim?: number;
        mtLevelOnChain?: number;
    });
    requestID: bigint;
    id: Id;
    profileNonce: bigint;
    claimSubjectProfileNonce: bigint;
    claim: ClaimWithSigAndMTPProof;
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
    proofType: ProofType;
    linkNonce: bigint;
    verifierID?: Id;
    nullifierSessionID: bigint;
    isBJJAuthEnabled: number;
    validate(): void;
    fillMTPProofsWithZero(s: Partial<AtomicQueryV3OnChainCircuitInputs>): void;
    fillSigProofWithZero(s: Partial<AtomicQueryV3OnChainCircuitInputs>): void;
    fillAuthWithZero(s: Partial<AtomicQueryV3OnChainCircuitInputs>): void;
    inputsMarshal(): Uint8Array;
}
/**
 * AtomicQueryV3OnChainCircuitInputs type represents credentialAtomicQueryV3OnChain.circom private inputs required by prover
 */
interface AtomicQueryV3OnChainCircuitInputs {
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
    authClaim?: string[];
    authClaimIncMtp?: string[];
    authClaimNonRevMtp: string[];
    authClaimNonRevMtpAuxHi?: string;
    authClaimNonRevMtpAuxHv?: string;
    authClaimNonRevMtpNoAux: string;
    challenge: string;
    challengeSignatureR8x: string;
    challengeSignatureR8y: string;
    challengeSignatureS: string;
    userClaimsTreeRoot?: string;
    userRevTreeRoot?: string;
    userRootsTreeRoot?: string;
    userState?: string;
    gistRoot?: string;
    gistMtp: string[];
    gistMtpAuxHi?: string;
    gistMtpAuxHv?: string;
    gistMtpNoAux: string;
    linkNonce: string;
    verifierID: string;
    nullifierSessionID: string;
    isBJJAuthEnabled: string;
}
/**
 * @beta
 * AtomicQueryV3OnChainPubSignals public inputs
 */
export declare class AtomicQueryV3OnChainPubSignals extends BaseConfig implements IStateInfoPubSignals {
    requestID: bigint;
    userID: Id;
    issuerID: Id;
    issuerState: Hash;
    issuerClaimNonRevState: Hash;
    timestamp: number;
    circuitQueryHash: bigint;
    challenge: bigint;
    gistRoot: Hash;
    proofType: number;
    linkID: bigint;
    nullifier: bigint;
    operatorOutput: bigint;
    isBJJAuthEnabled: number;
    pubSignalsUnmarshal(data: Uint8Array): AtomicQueryV3OnChainPubSignals;
    /** {@inheritDoc IStateInfoPubSignals.getStatesInfo} */
    getStatesInfo(): StatesInfo;
}
export {};
//# sourceMappingURL=atomic-query-v3-on-chain.d.ts.map