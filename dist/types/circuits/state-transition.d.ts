import { Signature } from '@iden3/js-crypto';
import { Id } from '@iden3/js-iden3-core';
import { Hash, Proof } from '@iden3/js-merkletree';
import { BaseConfig } from './common';
import { ClaimWithMTPProof, TreeState } from './models';
/**
 * StateTransition circuit representation
 * Inputs and public signals declaration, marshalling and parsing
 *
 * @public
 * @class StateTransitionInputs
 * @extends {BaseConfig}
 */
export declare class StateTransitionInputs extends BaseConfig {
    id: Id;
    oldTreeState: TreeState;
    newTreeState: TreeState;
    isOldStateGenesis: boolean;
    authClaim: ClaimWithMTPProof;
    authClaimNewStateIncProof: Proof;
    signature: Signature;
    /**
     * CircuitInputMarshal returns Circom private inputs for stateTransition.circom
     *
     * @returns Uint8Array
     */
    inputsMarshal(): Uint8Array;
}
/**
 * Public signals of StateTransition circuit
 *
 * @public
 * @class StateTransitionPubSignals
 */
export declare class StateTransitionPubSignals {
    userId: Id;
    oldUserState: Hash;
    newUserState: Hash;
    isOldStateGenesis: boolean;
    /**
     *
     *
     * PubSignalsUnmarshal unmarshal stateTransition.circom public signal
     * @param {Uint8Array} data
     * @returns StateTransitionPubSignals
     */
    pubSignalsUnmarshal(data: Uint8Array): StateTransitionPubSignals;
}
