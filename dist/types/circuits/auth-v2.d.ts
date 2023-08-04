import { Hash, Proof } from '@iden3/js-merkletree';
import { Claim, Id } from '@iden3/js-iden3-core';
import { GISTProof, TreeState } from './models';
import { BaseConfig } from './common';
import { Signature } from '@iden3/js-crypto';
/**
 * Auth v2 circuit representation
 * Inputs and public signals declaration, marshalling and parsing
 *
 * @public
 * @class AuthV2Inputs
 * @extends {BaseConfig}
 */
export declare class AuthV2Inputs extends BaseConfig {
    genesisID: Id;
    profileNonce: bigint;
    authClaim: Claim;
    authClaimIncMtp: Proof;
    authClaimNonRevMtp: Proof;
    treeState: TreeState;
    gistProof: GISTProof;
    signature: Signature;
    challenge: bigint;
    validate(): void;
    inputsMarshal(): Uint8Array;
}
/**
 * public signals
 *
 * @public
 * @class AuthV2PubSignals
 */
export declare class AuthV2PubSignals {
    userID: Id;
    challenge: bigint;
    GISTRoot: Hash;
    /**
     * PubSignalsUnmarshal unmarshal auth.circom public inputs to AuthPubSignals
     *
     * @param {Uint8Array} data
     * @returns AuthV2PubSignals
     */
    pubSignalsUnmarshal(data: Uint8Array): AuthV2PubSignals;
}
