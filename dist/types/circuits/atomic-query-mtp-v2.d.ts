import { Id, SchemaHash } from '@iden3/js-iden3-core';
import { Query, ClaimWithMTPProof } from './models';
import { Hash } from '@iden3/js-merkletree';
import { BaseConfig } from './common';
/**
 * AtomicQueryMTPInputs ZK private inputs for credentialAtomicQueryMTP.circom
 *
 * @public
 * @class AtomicQueryMTPV2Inputs
 * @extends {BaseConfig}
 */
export declare class AtomicQueryMTPV2Inputs extends BaseConfig {
    id: Id;
    profileNonce: bigint;
    claimSubjectProfileNonce: bigint;
    claim: ClaimWithMTPProof;
    skipClaimRevocationCheck: boolean;
    requestID: bigint;
    currentTimeStamp: number;
    query: Query;
    /**
     * Validate AtomicQueryMTPV2 inputs
     *
     */
    validate(): void;
    /**
     *
     * Inputs marshalling
     * @returns {Uint8Array}
     */
    inputsMarshal(): Uint8Array;
}
/**
 * Public signals
 *
 * @public
 * @class AtomicQueryMTPV2PubSignals
 * @extends {BaseConfig}
 */
export declare class AtomicQueryMTPV2PubSignals extends BaseConfig {
    requestID?: bigint;
    userID?: Id;
    issuerID?: Id;
    issuerClaimIdenState?: Hash;
    issuerClaimNonRevState?: Hash;
    claimSchema?: SchemaHash;
    slotIndex?: number;
    operator?: number;
    value: bigint[];
    timestamp?: number;
    merklized?: number;
    claimPathKey?: bigint;
    claimPathNotExists?: number;
    isRevocationChecked?: number;
    /**
     * PubSignalsUnmarshal unmarshal credentialAtomicQueryMTP.circom public signals array to AtomicQueryMTPPubSignals
     *
     * @param {Uint8Array} data
     * @returns AtomicQueryMTPV2PubSignals
     */
    pubSignalsUnmarshal(data: Uint8Array): AtomicQueryMTPV2PubSignals;
}
