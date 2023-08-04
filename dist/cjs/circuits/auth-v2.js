"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthV2PubSignals = exports.AuthV2Inputs = void 0;
const js_merkletree_1 = require("@iden3/js-merkletree");
const js_iden3_core_1 = require("@iden3/js-iden3-core");
const models_1 = require("./models");
const common_1 = require("./common");
const utils_1 = require("../utils");
/**
 * Auth v2 circuit representation
 * Inputs and public signals declaration, marshalling and parsing
 *
 * @public
 * @class AuthV2Inputs
 * @extends {BaseConfig}
 */
class AuthV2Inputs extends common_1.BaseConfig {
    validate() {
        if (!this.genesisID) {
            throw new Error(models_1.CircuitError.EmptyId);
        }
        if (!this.authClaimIncMtp) {
            throw new Error(models_1.CircuitError.EmptyAuthClaimProof);
        }
        if (!this.authClaimNonRevMtp) {
            throw new Error(models_1.CircuitError.EmptyAuthClaimNonRevProof);
        }
        if (!this.gistProof.proof) {
            throw new Error(models_1.CircuitError.EmptyGISTProof);
        }
        if (!this.signature) {
            throw new Error(models_1.CircuitError.EmptyChallengeSignature);
        }
        if (!this.challenge) {
            throw new Error(models_1.CircuitError.EmptyChallenge);
        }
    }
    // InputsMarshal returns Circom private inputs for auth.circom
    inputsMarshal() {
        this.validate();
        const s = {
            genesisID: this.genesisID?.bigInt().toString(),
            profileNonce: this.profileNonce?.toString(),
            authClaim: this.authClaim?.marshalJson(),
            authClaimIncMtp: (0, common_1.prepareSiblingsStr)(this.authClaimIncMtp, this.getMTLevel()),
            authClaimNonRevMtp: (0, common_1.prepareSiblingsStr)(this.authClaimNonRevMtp, this.getMTLevel()),
            challenge: this.challenge?.toString(),
            challengeSignatureR8x: this.signature.R8[0].toString(),
            challengeSignatureR8y: this.signature.R8[1].toString(),
            challengeSignatureS: this.signature.S.toString(),
            claimsTreeRoot: this.treeState.claimsRoot?.bigInt().toString(),
            revTreeRoot: this.treeState.revocationRoot?.bigInt().toString(),
            rootsTreeRoot: this.treeState.rootOfRoots?.bigInt().toString(),
            state: this.treeState.state?.bigInt().toString(),
            gistRoot: this.gistProof.root.bigInt().toString(),
            gistMtp: this.gistProof && (0, common_1.prepareSiblingsStr)(this.gistProof.proof, this.getMTLevelOnChain())
        };
        const nodeAuxAuth = (0, common_1.getNodeAuxValue)(this.authClaimNonRevMtp);
        s.authClaimNonRevMtpAuxHi = nodeAuxAuth.key.bigInt().toString();
        s.authClaimNonRevMtpAuxHv = nodeAuxAuth.value.bigInt().toString();
        s.authClaimNonRevMtpNoAux = nodeAuxAuth.noAux;
        const globalNodeAux = (0, common_1.getNodeAuxValue)(this.gistProof.proof);
        s.gistMtpAuxHi = globalNodeAux.key.bigInt().toString();
        s.gistMtpAuxHv = globalNodeAux.value.bigInt().toString();
        s.gistMtpNoAux = globalNodeAux.noAux;
        return utils_1.byteEncoder.encode(JSON.stringify(s));
    }
}
exports.AuthV2Inputs = AuthV2Inputs;
// AuthV2PubSignals auth.circom public signals
/**
 * public signals
 *
 * @public
 * @class AuthV2PubSignals
 */
class AuthV2PubSignals {
    /**
     * PubSignalsUnmarshal unmarshal auth.circom public inputs to AuthPubSignals
     *
     * @param {Uint8Array} data
     * @returns AuthV2PubSignals
     */
    pubSignalsUnmarshal(data) {
        const len = 3;
        const sVals = JSON.parse(utils_1.byteDecoder.decode(data));
        if (sVals.length !== len) {
            throw new Error(`invalid number of Output values expected ${len} got ${sVals.length}`);
        }
        this.userID = js_iden3_core_1.Id.fromBigInt(BigInt(sVals[0]));
        this.challenge = BigInt(sVals[1]);
        this.GISTRoot = (0, js_merkletree_1.newHashFromString)(sVals[2]);
        return this;
    }
}
exports.AuthV2PubSignals = AuthV2PubSignals;
//# sourceMappingURL=auth-v2.js.map