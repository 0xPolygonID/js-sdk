import { Id, SchemaHash } from '@iden3/js-iden3-core';
import { Query, ClaimWithSigProof } from './models';
import { Hash } from '@iden3/js-merkletree';
import { BaseConfig } from './common';
/**
 * AtomicQuerySigV2Inputs representation for credentialAtomicQuerySig.circom
 * Inputs and public signals declaration, marshalling and parsing
 *
 * @public
 * @class AtomicQuerySigV2Inputs
 * @extends {BaseConfig}
 */
export declare class AtomicQuerySigV2Inputs extends BaseConfig {
    requestID: bigint;
    id: Id;
    profileNonce: bigint;
    claimSubjectProfileNonce: bigint;
    claim: ClaimWithSigProof;
    skipClaimRevocationCheck: boolean;
    currentTimeStamp: number;
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
 * @class AtomicQuerySigV2PubSignals
 * @extends {BaseConfig}
 */
export declare class AtomicQuerySigV2PubSignals extends BaseConfig {
    requestID: bigint;
    userID: Id;
    issuerID: Id;
    issuerAuthState: Hash;
    issuerClaimNonRevState: Hash;
    claimSchema: SchemaHash;
    slotIndex: number;
    operator: number;
    value: bigint[];
    timestamp: number;
    merklized: number;
    claimPathKey: bigint;
    claimPathNotExists: number;
    isRevocationChecked: number;
    /**
     *
     * PubSignalsUnmarshal unmarshal credentialAtomicQuerySig.circom public signals array to AtomicQuerySugPubSignals
     * @param {Uint8Array} data
     * @returns AtomicQuerySigV2PubSignals
     */
    pubSignalsUnmarshal(data: Uint8Array): AtomicQuerySigV2PubSignals;
}
