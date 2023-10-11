import { newHashFromString } from '@iden3/js-merkletree';
import { Id } from '@iden3/js-iden3-core';
import { ValueProof, CircuitError } from './models';
import { BaseConfig, bigIntArrayToStringArray, existenceToInt, getNodeAuxValue, prepareCircuitArrayValues, prepareSiblingsStr } from './common';
import { byteDecoder, byteEncoder } from '../utils';
/**
 * AtomicQueryMTPV2OnChainInputs ZK private inputs for credentialAtomicQueryMTPV2OnChain.circom
 *
 * @public
 * @class AtomicQuerySigV2OnChainInputs
 * @extends {BaseConfig}
 */
export class AtomicQueryMTPV2OnChainInputs extends BaseConfig {
    /**
     *  Validate inputs
     *
     */
    validate() {
        if (!this.requestID) {
            throw new Error(CircuitError.EmptyRequestID);
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
        if (this.query.valueProof) {
            this.query.validate();
            this.query.valueProof.validate();
        }
        const valueProof = this.query.valueProof ?? new ValueProof();
        const s = {
            requestID: this.requestID.toString(),
            userGenesisID: this.id.bigInt().toString(),
            profileNonce: this.profileNonce.toString(),
            claimSubjectProfileNonce: this.claimSubjectProfileNonce?.toString(),
            issuerID: this.claim.issuerID?.bigInt().toString(),
            issuerClaim: this.claim.claim?.marshalJson(),
            issuerClaimMtp: this.claim.incProof?.proof &&
                prepareSiblingsStr(this.claim.incProof.proof, this.getMTLevel()),
            issuerClaimClaimsTreeRoot: this.claim.incProof?.treeState?.claimsRoot?.string(),
            issuerClaimRevTreeRoot: this.claim.incProof?.treeState?.revocationRoot?.string(),
            issuerClaimRootsTreeRoot: this.claim.incProof?.treeState?.rootOfRoots?.string(),
            issuerClaimIdenState: this.claim.incProof?.treeState?.state?.string(),
            issuerClaimNonRevMtp: this.claim.nonRevProof?.proof &&
                prepareSiblingsStr(this.claim.nonRevProof?.proof, this.getMTLevel()),
            issuerClaimNonRevClaimsTreeRoot: this.claim.nonRevProof?.treeState?.claimsRoot?.string(),
            issuerClaimNonRevRevTreeRoot: this.claim.nonRevProof?.treeState?.revocationRoot?.string(),
            issuerClaimNonRevRootsTreeRoot: this.claim.nonRevProof?.treeState?.rootOfRoots?.string(),
            issuerClaimNonRevState: this.claim.nonRevProof?.treeState?.state?.string(),
            claimSchema: this.claim.claim?.getSchemaHash().bigInt().toString(),
            claimPathMtp: prepareSiblingsStr(valueProof.mtp, this.getMTLevelsClaimMerklization()),
            claimPathValue: valueProof.value.toString(),
            operator: this.query.operator,
            slotIndex: this.query.slotIndex,
            timestamp: this.currentTimeStamp ?? undefined,
            isRevocationChecked: 1,
            authClaim: this.authClaim.marshalJson(),
            authClaimIncMtp: this.authClaimIncMtp && prepareSiblingsStr(this.authClaimIncMtp, this.getMTLevel()),
            authClaimNonRevMtp: this.authClaimNonRevMtp && prepareSiblingsStr(this.authClaimNonRevMtp, this.getMTLevel()),
            challenge: this.challenge.toString(),
            challengeSignatureR8x: this.signature.R8[0].toString(),
            challengeSignatureR8y: this.signature.R8[1].toString(),
            challengeSignatureS: this.signature.S.toString(),
            userClaimsTreeRoot: this.treeState.claimsRoot?.string(),
            userRevTreeRoot: this.treeState.revocationRoot?.string(),
            userRootsTreeRoot: this.treeState.rootOfRoots?.string(),
            userState: this.treeState.state?.string(),
            gistRoot: this.gistProof.root?.string(),
            gistMtp: this.gistProof && prepareSiblingsStr(this.gistProof.proof, this.getMTLevelOnChain())
        };
        if (this.skipClaimRevocationCheck) {
            s.isRevocationChecked = 0;
        }
        const nodeAuxNonRev = this.claim.nonRevProof?.proof && getNodeAuxValue(this.claim.nonRevProof.proof);
        s.issuerClaimNonRevMtpAuxHi = nodeAuxNonRev?.key.bigInt().toString();
        s.issuerClaimNonRevMtpAuxHv = nodeAuxNonRev?.value.bigInt().toString();
        s.issuerClaimNonRevMtpNoAux = nodeAuxNonRev?.noAux;
        s.claimPathNotExists = existenceToInt(valueProof.mtp.existence);
        const nodAuxJSONLD = getNodeAuxValue(valueProof.mtp);
        s.claimPathMtpNoAux = nodAuxJSONLD.noAux;
        s.claimPathMtpAuxHi = nodAuxJSONLD.key.bigInt().toString();
        s.claimPathMtpAuxHv = nodAuxJSONLD.value.bigInt().toString();
        s.claimPathKey = valueProof.path.toString();
        const values = this.query.values && prepareCircuitArrayValues(this.query.values, this.getValueArrSize());
        s.value = values && bigIntArrayToStringArray(values);
        const nodeAuxAuth = this.authClaimNonRevMtp && getNodeAuxValue(this.authClaimNonRevMtp);
        s.authClaimNonRevMtpAuxHi = nodeAuxAuth.key.string();
        s.authClaimNonRevMtpAuxHv = nodeAuxAuth.value.string();
        s.authClaimNonRevMtpNoAux = nodeAuxAuth.noAux;
        const globalNodeAux = this.gistProof && getNodeAuxValue(this.gistProof.proof);
        s.gistMtpAuxHi = globalNodeAux.key.string();
        s.gistMtpAuxHv = globalNodeAux.value.string();
        s.gistMtpNoAux = globalNodeAux.noAux;
        return byteEncoder.encode(JSON.stringify(s));
    }
}
/**
 *
 * public signals
 * @public
 * @class AtomicQueryMTPV2OnChainPubSignals
 * @extends {BaseConfig}
 */
export class AtomicQueryMTPV2OnChainPubSignals extends BaseConfig {
    /**
     *
     * // PubSignalsUnmarshal unmarshal credentialAtomicQueryMTPV2OnChain.circom public signals array to AtomicQueryMTPPubSignals
     * @param {Uint8Array} data
     * @returns AtomicQuerySigV2PubSignals
     */
    pubSignalsUnmarshal(data) {
        // expected order:
        // merklized
        // userID
        // circuitQueryHash
        // requestID
        // challenge
        // gistRoot
        // issuerID
        // issuerClaimIdenState
        // isRevocationChecked
        // issuerClaimNonRevState
        // timestamp
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
        // - issuerClaimIdenState
        this.issuerClaimIdenState = newHashFromString(sVals[fieldIdx]);
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
//# sourceMappingURL=atomic-query-mtp-v2-on-chain.js.map