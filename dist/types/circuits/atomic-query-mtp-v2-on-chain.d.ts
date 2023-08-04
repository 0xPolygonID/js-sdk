import { Proof } from '@iden3/js-merkletree';
import { Id, Claim } from '@iden3/js-iden3-core';
import { Signature } from '@iden3/js-crypto';
import { Query, TreeState, GISTProof, ClaimWithMTPProof } from './models';
import { Hash } from '@iden3/js-merkletree';
import { BaseConfig } from './common';
/**
 * AtomicQueryMTPV2OnChainInputs ZK private inputs for credentialAtomicQueryMTPV2OnChain.circom
 *
 * @public
 * @class AtomicQuerySigV2OnChainInputs
 * @extends {BaseConfig}
 */
export declare class AtomicQueryMTPV2OnChainInputs extends BaseConfig {
    id: Id;
    profileNonce: bigint;
    claimSubjectProfileNonce: bigint;
    claim: ClaimWithMTPProof;
    skipClaimRevocationCheck: boolean;
    requestID: bigint;
    currentTimeStamp: number;
    authClaim: Claim;
    authClaimIncMtp: Proof;
    authClaimNonRevMtp: Proof;
    treeState: TreeState;
    gistProof: GISTProof;
    signature: Signature;
    challenge: bigint;
    query: Query;
    /**
     *  Validate inputs
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
 *
 * public signals
 * @public
 * @class AtomicQueryMTPV2OnChainPubSignals
 * @extends {BaseConfig}
 */
export declare class AtomicQueryMTPV2OnChainPubSignals extends BaseConfig {
    requestID: bigint;
    userID: Id;
    issuerID: Id;
    issuerClaimIdenState: Hash;
    issuerClaimNonRevState: Hash;
    timestamp: number;
    merklized: number;
    isRevocationChecked: number;
    circuitQueryHash: bigint;
    challenge: bigint;
    gistRoot: Hash;
    /**
     *
     * // PubSignalsUnmarshal unmarshal credentialAtomicQueryMTPV2OnChain.circom public signals array to AtomicQueryMTPPubSignals
     * @param {Uint8Array} data
     * @returns AtomicQuerySigV2PubSignals
     */
    pubSignalsUnmarshal(data: Uint8Array): AtomicQueryMTPV2OnChainPubSignals;
}
