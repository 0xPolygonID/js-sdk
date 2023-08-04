import { Id } from '@iden3/js-iden3-core';
import { newHashFromString } from '@iden3/js-merkletree';
import { BaseConfig, getNodeAuxValue, prepareSiblingsStr } from './common';
import { CircuitError } from './models';
import { byteDecoder, byteEncoder } from '../utils';
/**
 * StateTransition circuit representation
 * Inputs and public signals declaration, marshalling and parsing
 *
 * @public
 * @class StateTransitionInputs
 * @extends {BaseConfig}
 */
export class StateTransitionInputs extends BaseConfig {
    /**
     * CircuitInputMarshal returns Circom private inputs for stateTransition.circom
     *
     * @returns Uint8Array
     */
    inputsMarshal() {
        if (!this.authClaim?.incProof?.proof) {
            throw new Error(CircuitError.EmptyAuthClaimProof);
        }
        if (!this.authClaimNewStateIncProof) {
            throw new Error(CircuitError.EmptyAuthClaimProofInTheNewState);
        }
        if (!this.authClaim.nonRevProof?.proof) {
            throw new Error(CircuitError.EmptyAuthClaimNonRevProof);
        }
        const s = {
            authClaim: this.authClaim?.claim?.marshalJson(),
            authClaimMtp: prepareSiblingsStr(this.authClaim.incProof.proof, this.getMTLevel()),
            authClaimNonRevMtp: prepareSiblingsStr(this.authClaim.nonRevProof.proof, this.getMTLevel()),
            newAuthClaimMtp: prepareSiblingsStr(this.authClaimNewStateIncProof, this.getMTLevel()),
            userID: this.id?.bigInt().toString(),
            newUserState: this.newTreeState?.state?.bigInt().toString(),
            claimsTreeRoot: this.oldTreeState?.claimsRoot?.bigInt().toString(),
            oldUserState: this.oldTreeState?.state?.bigInt().toString(),
            revTreeRoot: this.oldTreeState?.revocationRoot?.bigInt().toString(),
            rootsTreeRoot: this.oldTreeState?.rootOfRoots?.bigInt().toString(),
            signatureR8x: this.signature.R8[0].toString(),
            signatureR8y: this.signature.R8[1].toString(),
            signatureS: this.signature.S.toString(),
            newClaimsTreeRoot: this.newTreeState?.claimsRoot?.bigInt().toString(),
            newRootsTreeRoot: this.newTreeState?.rootOfRoots?.bigInt().toString(),
            newRevTreeRoot: this.newTreeState?.revocationRoot?.bigInt().toString()
        };
        if (this.isOldStateGenesis) {
            s.isOldStateGenesis = '1';
        }
        else {
            s.isOldStateGenesis = '0';
        }
        const nodeAuxAuth = getNodeAuxValue(this.authClaim.nonRevProof.proof);
        s.authClaimNonRevMtpAuxHi = nodeAuxAuth.key.bigInt().toString();
        s.authClaimNonRevMtpAuxHv = nodeAuxAuth.value.bigInt().toString();
        s.authClaimNonRevMtpNoAux = nodeAuxAuth.noAux;
        return byteEncoder.encode(JSON.stringify(s));
    }
}
/**
 * Public signals of StateTransition circuit
 *
 * @public
 * @class StateTransitionPubSignals
 */
export class StateTransitionPubSignals {
    /**
     *
     *
     * PubSignalsUnmarshal unmarshal stateTransition.circom public signal
     * @param {Uint8Array} data
     * @returns StateTransitionPubSignals
     */
    pubSignalsUnmarshal(data) {
        const sVals = JSON.parse(byteDecoder.decode(data));
        const fieldLength = 4;
        if (sVals.length !== fieldLength) {
            throw new Error(`invalid number of Output values expected ${fieldLength} got ${sVals.length}`);
        }
        this.userId = Id.fromBigInt(BigInt(sVals[0]));
        this.oldUserState = newHashFromString(sVals[1]);
        this.newUserState = newHashFromString(sVals[2]);
        this.isOldStateGenesis = BigInt(sVals[3]) === BigInt(1);
        return this;
    }
}
//# sourceMappingURL=state-transition.js.map