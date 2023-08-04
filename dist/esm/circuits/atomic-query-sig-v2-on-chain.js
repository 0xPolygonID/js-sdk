import { newHashFromString } from '@iden3/js-merkletree';
import { Id } from '@iden3/js-iden3-core';
import { ValueProof, CircuitError } from './models';
import { BaseConfig, bigIntArrayToStringArray, existenceToInt, getNodeAuxValue, prepareCircuitArrayValues, prepareSiblingsStr } from './common';
import { byteDecoder, byteEncoder } from '../utils';
/**
 * AtomicQuerySigV2OnChainInputs ZK private inputs for credentialAtomicQuerySig.circom
 *
 * @public
 * @class AtomicQuerySigV2OnChainInputs
 * @extends {BaseConfig}
 */
export class AtomicQuerySigV2OnChainInputs extends BaseConfig {
    /**
     *  Validate inputs
     *
     *
     */
    validate() {
        if (!this.requestID) {
            throw new Error(CircuitError.EmptyRequestID);
        }
        if (!this.claim.nonRevProof?.proof) {
            throw new Error(CircuitError.EmptyClaimNonRevProof);
        }
        if (!this.claim.signatureProof?.issuerAuthIncProof.proof) {
            throw new Error(CircuitError.EmptyIssuerAuthClaimProof);
        }
        if (!this.claim.signatureProof.issuerAuthNonRevProof.proof) {
            throw new Error(CircuitError.EmptyIssuerAuthClaimNonRevProof);
        }
        if (!this.claim.signatureProof.signature) {
            throw new Error(CircuitError.EmptyClaimSignature);
        }
        if (!this.query?.values) {
            throw new Error(CircuitError.EmptyQueryValue);
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
        if (this.challenge === null || this.challenge === undefined) {
            throw new Error(CircuitError.EmptyChallenge);
        }
    }
    /**
     * marshal inputs
     *
     * @returns Uint8Array
     */
    inputsMarshal() {
        this.validate();
        if (this.query?.valueProof) {
            this.query.validate();
            this.query.valueProof.validate();
        }
        const valueProof = this.query?.valueProof ?? new ValueProof();
        const s = {
            requestID: this.requestID.toString(),
            userGenesisID: this.id.bigInt().toString(),
            profileNonce: this.profileNonce.toString(),
            claimSubjectProfileNonce: this.claimSubjectProfileNonce?.toString(),
            issuerID: this.claim.issuerID?.bigInt().toString(),
            issuerClaim: this.claim.claim?.marshalJson(),
            issuerClaimNonRevClaimsTreeRoot: this.claim.nonRevProof?.treeState?.claimsRoot
                ?.bigInt()
                .toString(),
            issuerClaimNonRevRevTreeRoot: this.claim.nonRevProof?.treeState?.revocationRoot
                ?.bigInt()
                .toString(),
            issuerClaimNonRevRootsTreeRoot: this.claim.nonRevProof?.treeState?.rootOfRoots
                ?.bigInt()
                .toString(),
            issuerClaimNonRevState: this.claim.nonRevProof?.treeState?.state?.bigInt().toString(),
            issuerClaimNonRevMtp: this.claim.nonRevProof?.proof &&
                prepareSiblingsStr(this.claim.nonRevProof.proof, this.getMTLevel()),
            issuerClaimSignatureR8x: this.claim.signatureProof && this.claim.signatureProof.signature.R8[0].toString(),
            issuerClaimSignatureR8y: this.claim.signatureProof?.signature.R8[1].toString(),
            issuerClaimSignatureS: this.claim.signatureProof?.signature.S.toString(),
            issuerAuthClaim: this.claim.signatureProof?.issuerAuthClaim?.marshalJson(),
            issuerAuthClaimMtp: this.claim.signatureProof?.issuerAuthIncProof?.proof &&
                prepareSiblingsStr(this.claim.signatureProof.issuerAuthIncProof.proof, this.getMTLevel()),
            issuerAuthClaimsTreeRoot: this.claim.signatureProof?.issuerAuthIncProof?.treeState?.claimsRoot
                ?.bigInt()
                .toString(),
            issuerAuthRevTreeRoot: this.claim.signatureProof?.issuerAuthIncProof?.treeState?.revocationRoot
                ?.bigInt()
                .toString(),
            issuerAuthRootsTreeRoot: this.claim.signatureProof?.issuerAuthIncProof?.treeState?.rootOfRoots
                ?.bigInt()
                .toString(),
            issuerAuthClaimNonRevMtp: this.claim.signatureProof?.issuerAuthNonRevProof?.proof &&
                prepareSiblingsStr(this.claim.signatureProof.issuerAuthNonRevProof.proof, this.getMTLevel()),
            claimSchema: this.claim.claim?.getSchemaHash().bigInt().toString(),
            claimPathMtp: prepareSiblingsStr(valueProof.mtp, this.getMTLevelsClaimMerklization()),
            claimPathValue: valueProof.value.toString(),
            operator: this.query?.operator,
            timestamp: this.currentTimeStamp,
            // value in this path in merklized json-ld document
            slotIndex: this.query?.slotIndex,
            isRevocationChecked: 1,
            authClaim: this.authClaim.marshalJson(),
            authClaimIncMtp: this.authClaimIncMtp && prepareSiblingsStr(this.authClaimIncMtp, this.getMTLevel()),
            authClaimNonRevMtp: this.authClaimNonRevMtp && prepareSiblingsStr(this.authClaimNonRevMtp, this.getMTLevel()),
            challenge: this.challenge?.toString(),
            challengeSignatureR8x: this.signature.R8[0].toString(),
            challengeSignatureR8y: this.signature.R8[1].toString(),
            challengeSignatureS: this.signature.S.toString(),
            userClaimsTreeRoot: this.treeState.claimsRoot?.string(),
            userRevTreeRoot: this.treeState.revocationRoot?.string(),
            userRootsTreeRoot: this.treeState.rootOfRoots?.string(),
            userState: this.treeState.state?.string(),
            gistRoot: this.gistProof.root.string(),
            gistMtp: this.gistProof && prepareSiblingsStr(this.gistProof.proof, this.getMTLevelOnChain())
        };
        if (this.skipClaimRevocationCheck) {
            s.isRevocationChecked = 0;
        }
        const nodeAuxNonRev = getNodeAuxValue(this.claim.nonRevProof?.proof);
        s.issuerClaimNonRevMtpAuxHi = nodeAuxNonRev?.key.bigInt().toString();
        s.issuerClaimNonRevMtpAuxHv = nodeAuxNonRev?.value.bigInt().toString();
        s.issuerClaimNonRevMtpNoAux = nodeAuxNonRev?.noAux;
        const nodeAuxIssuerAuthNonRev = getNodeAuxValue(this.claim.signatureProof?.issuerAuthNonRevProof.proof);
        s.issuerAuthClaimNonRevMtpAuxHi = nodeAuxIssuerAuthNonRev?.key.bigInt().toString();
        s.issuerAuthClaimNonRevMtpAuxHv = nodeAuxIssuerAuthNonRev?.value.bigInt().toString();
        s.issuerAuthClaimNonRevMtpNoAux = nodeAuxIssuerAuthNonRev?.noAux;
        s.claimPathNotExists = existenceToInt(valueProof.mtp.existence);
        const nodAuxJSONLD = getNodeAuxValue(valueProof.mtp);
        s.claimPathMtpNoAux = nodAuxJSONLD.noAux;
        s.claimPathMtpAuxHi = nodAuxJSONLD.key.bigInt().toString();
        s.claimPathMtpAuxHv = nodAuxJSONLD.value.bigInt().toString();
        s.claimPathKey = valueProof.path.toString();
        const values = prepareCircuitArrayValues(this.query.values, this.getValueArrSize());
        s.value = bigIntArrayToStringArray(values);
        const nodeAuxAuth = getNodeAuxValue(this.authClaimNonRevMtp);
        s.authClaimNonRevMtpAuxHi = nodeAuxAuth.key.string();
        s.authClaimNonRevMtpAuxHv = nodeAuxAuth.value.string();
        s.authClaimNonRevMtpNoAux = nodeAuxAuth.noAux;
        const globalNodeAux = getNodeAuxValue(this.gistProof.proof);
        s.gistMtpAuxHi = globalNodeAux.key.string();
        s.gistMtpAuxHv = globalNodeAux.value.string();
        s.gistMtpNoAux = globalNodeAux.noAux;
        return byteEncoder.encode(JSON.stringify(s));
    }
}
/**
 * AtomicQuerySigV2OnChainCircuitInputs type represents credentialAtomicQuerySig.circom private inputs required by prover
 *
 * @public
 * @class AtomicQuerySigV2OnChainCircuitInputs
 */
export class AtomicQuerySigV2OnChainCircuitInputs {
}
/**
 *
 * public signals
 * @public
 * @class AtomicQuerySigV2OnChainPubSignals
 * @extends {BaseConfig}
 */
export class AtomicQuerySigV2OnChainPubSignals extends BaseConfig {
    //
    /**
     *
     * // PubSignalsUnmarshal unmarshal credentialAtomicQuerySig.circom public signals
     * @param {Uint8Array} data
     * @returns AtomicQuerySigV2PubSignals
     */
    pubSignalsUnmarshal(data) {
        // expected order:
        // merklized
        // userID
        // circuitQueryHash
        // issuerAuthState
        // requestID
        // challenge
        // gistRoot
        // issuerID
        // isRevocationChecked
        // issuerClaimNonRevState
        // timestamp
        // claimPathNotExists
        // claimPathKey
        const sVals = JSON.parse(byteDecoder.decode(data));
        let fieldIdx = 0;
        // -- merklized
        this.merklized = parseInt(sVals[fieldIdx]);
        fieldIdx++;
        //  - userID
        this.userID = Id.fromBigInt(BigInt(sVals[fieldIdx]));
        fieldIdx++;
        //  - circuitQueryHash
        this.circuitQueryHash = BigInt(sVals[fieldIdx]);
        fieldIdx++;
        // - issuerAuthState
        this.issuerAuthState = newHashFromString(sVals[fieldIdx]);
        fieldIdx++;
        // - requestID
        this.requestID = BigInt(sVals[fieldIdx]);
        fieldIdx++;
        // - challenge
        this.challenge = BigInt(sVals[fieldIdx]);
        fieldIdx++;
        // - gistRoot
        this.gistRoot = newHashFromString(sVals[fieldIdx]);
        fieldIdx++;
        // - issuerID
        this.issuerID = Id.fromBigInt(BigInt(sVals[fieldIdx]));
        fieldIdx++;
        // - isRevocationChecked
        this.isRevocationChecked = parseInt(sVals[fieldIdx]);
        fieldIdx++;
        // - issuerClaimNonRevState
        this.issuerClaimNonRevState = newHashFromString(sVals[fieldIdx]);
        fieldIdx++;
        //  - timestamp
        this.timestamp = parseInt(sVals[fieldIdx]);
        fieldIdx++;
        return this;
    }
}
//# sourceMappingURL=atomic-query-sig-v2-on-chain.js.map