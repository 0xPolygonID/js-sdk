"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateTransitionPubSignals = exports.StateTransitionInputs = void 0;
const js_iden3_core_1 = require("@iden3/js-iden3-core");
const js_merkletree_1 = require("@iden3/js-merkletree");
const common_1 = require("./common");
const models_1 = require("./models");
const utils_1 = require("../utils");
/**
 * StateTransition circuit representation
 * Inputs and public signals declaration, marshalling and parsing
 *
 * @public
 * @class StateTransitionInputs
 * @extends {BaseConfig}
 */
class StateTransitionInputs extends common_1.BaseConfig {
    /**
     * CircuitInputMarshal returns Circom private inputs for stateTransition.circom
     *
     * @returns Uint8Array
     */
    inputsMarshal() {
        if (!this.authClaim?.incProof?.proof) {
            throw new Error(models_1.CircuitError.EmptyAuthClaimProof);
        }
        if (!this.authClaimNewStateIncProof) {
            throw new Error(models_1.CircuitError.EmptyAuthClaimProofInTheNewState);
        }
        if (!this.authClaim.nonRevProof?.proof) {
            throw new Error(models_1.CircuitError.EmptyAuthClaimNonRevProof);
        }
        const s = {
            authClaim: this.authClaim?.claim?.marshalJson(),
            authClaimMtp: (0, common_1.prepareSiblingsStr)(this.authClaim.incProof.proof, this.getMTLevel()),
            authClaimNonRevMtp: (0, common_1.prepareSiblingsStr)(this.authClaim.nonRevProof.proof, this.getMTLevel()),
            newAuthClaimMtp: (0, common_1.prepareSiblingsStr)(this.authClaimNewStateIncProof, this.getMTLevel()),
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
        const nodeAuxAuth = (0, common_1.getNodeAuxValue)(this.authClaim.nonRevProof.proof);
        s.authClaimNonRevMtpAuxHi = nodeAuxAuth.key.bigInt().toString();
        s.authClaimNonRevMtpAuxHv = nodeAuxAuth.value.bigInt().toString();
        s.authClaimNonRevMtpNoAux = nodeAuxAuth.noAux;
        return utils_1.byteEncoder.encode(JSON.stringify(s));
    }
}
exports.StateTransitionInputs = StateTransitionInputs;
/**
 * Public signals of StateTransition circuit
 *
 * @public
 * @class StateTransitionPubSignals
 */
class StateTransitionPubSignals {
    /**
     *
     *
     * PubSignalsUnmarshal unmarshal stateTransition.circom public signal
     * @param {Uint8Array} data
     * @returns StateTransitionPubSignals
     */
    pubSignalsUnmarshal(data) {
        const sVals = JSON.parse(utils_1.byteDecoder.decode(data));
        const fieldLength = 4;
        if (sVals.length !== fieldLength) {
            throw new Error(`invalid number of Output values expected ${fieldLength} got ${sVals.length}`);
        }
        this.userId = js_iden3_core_1.Id.fromBigInt(BigInt(sVals[0]));
        this.oldUserState = (0, js_merkletree_1.newHashFromString)(sVals[1]);
        this.newUserState = (0, js_merkletree_1.newHashFromString)(sVals[2]);
        this.isOldStateGenesis = BigInt(sVals[3]) === BigInt(1);
        return this;
    }
}
exports.StateTransitionPubSignals = StateTransitionPubSignals;
//# sourceMappingURL=state-transition.js.map