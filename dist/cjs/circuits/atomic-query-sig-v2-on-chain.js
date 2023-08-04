"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtomicQuerySigV2OnChainPubSignals = exports.AtomicQuerySigV2OnChainCircuitInputs = exports.AtomicQuerySigV2OnChainInputs = void 0;
const js_merkletree_1 = require("@iden3/js-merkletree");
const js_iden3_core_1 = require("@iden3/js-iden3-core");
const models_1 = require("./models");
const common_1 = require("./common");
const utils_1 = require("../utils");
/**
 * AtomicQuerySigV2OnChainInputs ZK private inputs for credentialAtomicQuerySig.circom
 *
 * @public
 * @class AtomicQuerySigV2OnChainInputs
 * @extends {BaseConfig}
 */
class AtomicQuerySigV2OnChainInputs extends common_1.BaseConfig {
    /**
     *  Validate inputs
     *
     *
     */
    validate() {
        if (!this.requestID) {
            throw new Error(models_1.CircuitError.EmptyRequestID);
        }
        if (!this.claim.nonRevProof?.proof) {
            throw new Error(models_1.CircuitError.EmptyClaimNonRevProof);
        }
        if (!this.claim.signatureProof?.issuerAuthIncProof.proof) {
            throw new Error(models_1.CircuitError.EmptyIssuerAuthClaimProof);
        }
        if (!this.claim.signatureProof.issuerAuthNonRevProof.proof) {
            throw new Error(models_1.CircuitError.EmptyIssuerAuthClaimNonRevProof);
        }
        if (!this.claim.signatureProof.signature) {
            throw new Error(models_1.CircuitError.EmptyClaimSignature);
        }
        if (!this.query?.values) {
            throw new Error(models_1.CircuitError.EmptyQueryValue);
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
        if (this.challenge === null || this.challenge === undefined) {
            throw new Error(models_1.CircuitError.EmptyChallenge);
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
        const valueProof = this.query?.valueProof ?? new models_1.ValueProof();
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
                (0, common_1.prepareSiblingsStr)(this.claim.nonRevProof.proof, this.getMTLevel()),
            issuerClaimSignatureR8x: this.claim.signatureProof && this.claim.signatureProof.signature.R8[0].toString(),
            issuerClaimSignatureR8y: this.claim.signatureProof?.signature.R8[1].toString(),
            issuerClaimSignatureS: this.claim.signatureProof?.signature.S.toString(),
            issuerAuthClaim: this.claim.signatureProof?.issuerAuthClaim?.marshalJson(),
            issuerAuthClaimMtp: this.claim.signatureProof?.issuerAuthIncProof?.proof &&
                (0, common_1.prepareSiblingsStr)(this.claim.signatureProof.issuerAuthIncProof.proof, this.getMTLevel()),
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
                (0, common_1.prepareSiblingsStr)(this.claim.signatureProof.issuerAuthNonRevProof.proof, this.getMTLevel()),
            claimSchema: this.claim.claim?.getSchemaHash().bigInt().toString(),
            claimPathMtp: (0, common_1.prepareSiblingsStr)(valueProof.mtp, this.getMTLevelsClaimMerklization()),
            claimPathValue: valueProof.value.toString(),
            operator: this.query?.operator,
            timestamp: this.currentTimeStamp,
            // value in this path in merklized json-ld document
            slotIndex: this.query?.slotIndex,
            isRevocationChecked: 1,
            authClaim: this.authClaim.marshalJson(),
            authClaimIncMtp: this.authClaimIncMtp && (0, common_1.prepareSiblingsStr)(this.authClaimIncMtp, this.getMTLevel()),
            authClaimNonRevMtp: this.authClaimNonRevMtp && (0, common_1.prepareSiblingsStr)(this.authClaimNonRevMtp, this.getMTLevel()),
            challenge: this.challenge?.toString(),
            challengeSignatureR8x: this.signature.R8[0].toString(),
            challengeSignatureR8y: this.signature.R8[1].toString(),
            challengeSignatureS: this.signature.S.toString(),
            userClaimsTreeRoot: this.treeState.claimsRoot?.string(),
            userRevTreeRoot: this.treeState.revocationRoot?.string(),
            userRootsTreeRoot: this.treeState.rootOfRoots?.string(),
            userState: this.treeState.state?.string(),
            gistRoot: this.gistProof.root.string(),
            gistMtp: this.gistProof && (0, common_1.prepareSiblingsStr)(this.gistProof.proof, this.getMTLevelOnChain())
        };
        if (this.skipClaimRevocationCheck) {
            s.isRevocationChecked = 0;
        }
        const nodeAuxNonRev = (0, common_1.getNodeAuxValue)(this.claim.nonRevProof?.proof);
        s.issuerClaimNonRevMtpAuxHi = nodeAuxNonRev?.key.bigInt().toString();
        s.issuerClaimNonRevMtpAuxHv = nodeAuxNonRev?.value.bigInt().toString();
        s.issuerClaimNonRevMtpNoAux = nodeAuxNonRev?.noAux;
        const nodeAuxIssuerAuthNonRev = (0, common_1.getNodeAuxValue)(this.claim.signatureProof?.issuerAuthNonRevProof.proof);
        s.issuerAuthClaimNonRevMtpAuxHi = nodeAuxIssuerAuthNonRev?.key.bigInt().toString();
        s.issuerAuthClaimNonRevMtpAuxHv = nodeAuxIssuerAuthNonRev?.value.bigInt().toString();
        s.issuerAuthClaimNonRevMtpNoAux = nodeAuxIssuerAuthNonRev?.noAux;
        s.claimPathNotExists = (0, common_1.existenceToInt)(valueProof.mtp.existence);
        const nodAuxJSONLD = (0, common_1.getNodeAuxValue)(valueProof.mtp);
        s.claimPathMtpNoAux = nodAuxJSONLD.noAux;
        s.claimPathMtpAuxHi = nodAuxJSONLD.key.bigInt().toString();
        s.claimPathMtpAuxHv = nodAuxJSONLD.value.bigInt().toString();
        s.claimPathKey = valueProof.path.toString();
        const values = (0, common_1.prepareCircuitArrayValues)(this.query.values, this.getValueArrSize());
        s.value = (0, common_1.bigIntArrayToStringArray)(values);
        const nodeAuxAuth = (0, common_1.getNodeAuxValue)(this.authClaimNonRevMtp);
        s.authClaimNonRevMtpAuxHi = nodeAuxAuth.key.string();
        s.authClaimNonRevMtpAuxHv = nodeAuxAuth.value.string();
        s.authClaimNonRevMtpNoAux = nodeAuxAuth.noAux;
        const globalNodeAux = (0, common_1.getNodeAuxValue)(this.gistProof.proof);
        s.gistMtpAuxHi = globalNodeAux.key.string();
        s.gistMtpAuxHv = globalNodeAux.value.string();
        s.gistMtpNoAux = globalNodeAux.noAux;
        return utils_1.byteEncoder.encode(JSON.stringify(s));
    }
}
exports.AtomicQuerySigV2OnChainInputs = AtomicQuerySigV2OnChainInputs;
/**
 * AtomicQuerySigV2OnChainCircuitInputs type represents credentialAtomicQuerySig.circom private inputs required by prover
 *
 * @public
 * @class AtomicQuerySigV2OnChainCircuitInputs
 */
class AtomicQuerySigV2OnChainCircuitInputs {
}
exports.AtomicQuerySigV2OnChainCircuitInputs = AtomicQuerySigV2OnChainCircuitInputs;
/**
 *
 * public signals
 * @public
 * @class AtomicQuerySigV2OnChainPubSignals
 * @extends {BaseConfig}
 */
class AtomicQuerySigV2OnChainPubSignals extends common_1.BaseConfig {
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
        const sVals = JSON.parse(utils_1.byteDecoder.decode(data));
        let fieldIdx = 0;
        // -- merklized
        this.merklized = parseInt(sVals[fieldIdx]);
        fieldIdx++;
        //  - userID
        this.userID = js_iden3_core_1.Id.fromBigInt(BigInt(sVals[fieldIdx]));
        fieldIdx++;
        //  - circuitQueryHash
        this.circuitQueryHash = BigInt(sVals[fieldIdx]);
        fieldIdx++;
        // - issuerAuthState
        this.issuerAuthState = (0, js_merkletree_1.newHashFromString)(sVals[fieldIdx]);
        fieldIdx++;
        // - requestID
        this.requestID = BigInt(sVals[fieldIdx]);
        fieldIdx++;
        // - challenge
        this.challenge = BigInt(sVals[fieldIdx]);
        fieldIdx++;
        // - gistRoot
        this.gistRoot = (0, js_merkletree_1.newHashFromString)(sVals[fieldIdx]);
        fieldIdx++;
        // - issuerID
        this.issuerID = js_iden3_core_1.Id.fromBigInt(BigInt(sVals[fieldIdx]));
        fieldIdx++;
        // - isRevocationChecked
        this.isRevocationChecked = parseInt(sVals[fieldIdx]);
        fieldIdx++;
        // - issuerClaimNonRevState
        this.issuerClaimNonRevState = (0, js_merkletree_1.newHashFromString)(sVals[fieldIdx]);
        fieldIdx++;
        //  - timestamp
        this.timestamp = parseInt(sVals[fieldIdx]);
        fieldIdx++;
        return this;
    }
}
exports.AtomicQuerySigV2OnChainPubSignals = AtomicQuerySigV2OnChainPubSignals;
//# sourceMappingURL=atomic-query-sig-v2-on-chain.js.map