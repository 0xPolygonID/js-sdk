import { newHashFromString } from '@iden3/js-merkletree';
import { Id } from '@iden3/js-iden3-core';
import { CircuitError } from './models';
import { BaseConfig, getNodeAuxValue, prepareSiblingsStr } from './common';
import { byteDecoder, byteEncoder } from '../utils';
/**
 * Auth v2 circuit representation
 * Inputs and public signals declaration, marshalling and parsing
 *
 * @public
 * @class AuthV2Inputs
 * @extends {BaseConfig}
 */
export class AuthV2Inputs extends BaseConfig {
    validate() {
        if (!this.genesisID) {
            throw new Error(CircuitError.EmptyId);
        }
        if (!this.authClaimIncMtp) {
            throw new Error(CircuitError.EmptyAuthClaimProof);
        }
        if (!this.authClaimNonRevMtp) {
            throw new Error(CircuitError.EmptyAuthClaimNonRevProof);
        }
        if (!this.gistProof.proof) {
            throw new Error(CircuitError.EmptyGISTProof);
        }
        if (!this.signature) {
            throw new Error(CircuitError.EmptyChallengeSignature);
        }
        if (!this.challenge) {
            throw new Error(CircuitError.EmptyChallenge);
        }
    }
    // InputsMarshal returns Circom private inputs for auth.circom
    inputsMarshal() {
        this.validate();
        const s = {
            genesisID: this.genesisID?.bigInt().toString(),
            profileNonce: this.profileNonce?.toString(),
            authClaim: this.authClaim?.marshalJson(),
            authClaimIncMtp: prepareSiblingsStr(this.authClaimIncMtp, this.getMTLevel()),
            authClaimNonRevMtp: prepareSiblingsStr(this.authClaimNonRevMtp, this.getMTLevel()),
            challenge: this.challenge?.toString(),
            challengeSignatureR8x: this.signature.R8[0].toString(),
            challengeSignatureR8y: this.signature.R8[1].toString(),
            challengeSignatureS: this.signature.S.toString(),
            claimsTreeRoot: this.treeState.claimsRoot?.bigInt().toString(),
            revTreeRoot: this.treeState.revocationRoot?.bigInt().toString(),
            rootsTreeRoot: this.treeState.rootOfRoots?.bigInt().toString(),
            state: this.treeState.state?.bigInt().toString(),
            gistRoot: this.gistProof.root.bigInt().toString(),
            gistMtp: this.gistProof && prepareSiblingsStr(this.gistProof.proof, this.getMTLevelOnChain())
        };
        const nodeAuxAuth = getNodeAuxValue(this.authClaimNonRevMtp);
        s.authClaimNonRevMtpAuxHi = nodeAuxAuth.key.bigInt().toString();
        s.authClaimNonRevMtpAuxHv = nodeAuxAuth.value.bigInt().toString();
        s.authClaimNonRevMtpNoAux = nodeAuxAuth.noAux;
        const globalNodeAux = getNodeAuxValue(this.gistProof.proof);
        s.gistMtpAuxHi = globalNodeAux.key.bigInt().toString();
        s.gistMtpAuxHv = globalNodeAux.value.bigInt().toString();
        s.gistMtpNoAux = globalNodeAux.noAux;
        return byteEncoder.encode(JSON.stringify(s));
    }
}
// AuthV2PubSignals auth.circom public signals
/**
 * public signals
 *
 * @public
 * @class AuthV2PubSignals
 */
export class AuthV2PubSignals {
    /**
     * PubSignalsUnmarshal unmarshal auth.circom public inputs to AuthPubSignals
     *
     * @param {Uint8Array} data
     * @returns AuthV2PubSignals
     */
    pubSignalsUnmarshal(data) {
        const len = 3;
        const sVals = JSON.parse(byteDecoder.decode(data));
        if (sVals.length !== len) {
            throw new Error(`invalid number of Output values expected ${len} got ${sVals.length}`);
        }
        this.userID = Id.fromBigInt(BigInt(sVals[0]));
        this.challenge = BigInt(sVals[1]);
        this.GISTRoot = newHashFromString(sVals[2]);
        return this;
    }
}
//# sourceMappingURL=auth-v2.js.map