"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtomicQueryMTPV2OnChainPubSignals = exports.AtomicQueryMTPV2OnChainInputs = void 0;
const js_merkletree_1 = require("@iden3/js-merkletree");
const js_iden3_core_1 = require("@iden3/js-iden3-core");
const models_1 = require("./models");
const common_1 = require("./common");
const utils_1 = require("../utils");
/**
 * AtomicQueryMTPV2OnChainInputs ZK private inputs for credentialAtomicQueryMTPV2OnChain.circom
 *
 * @public
 * @class AtomicQuerySigV2OnChainInputs
 * @extends {BaseConfig}
 */
class AtomicQueryMTPV2OnChainInputs extends common_1.BaseConfig {
    /**
     *  Validate inputs
     *
     */
    validate() {
        if (!this.requestID) {
            throw new Error(models_1.CircuitError.EmptyRequestID);
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
        if (this.query.valueProof) {
            this.query.validate();
            this.query.valueProof.validate();
        }
        const valueProof = this.query.valueProof ?? new models_1.ValueProof();
        const s = {
            requestID: this.requestID.toString(),
            userGenesisID: this.id.bigInt().toString(),
            profileNonce: this.profileNonce.toString(),
            claimSubjectProfileNonce: this.claimSubjectProfileNonce?.toString(),
            issuerID: this.claim.issuerID?.bigInt().toString(),
            issuerClaim: this.claim.claim?.marshalJson(),
            issuerClaimMtp: this.claim.incProof?.proof &&
                (0, common_1.prepareSiblingsStr)(this.claim.incProof.proof, this.getMTLevel()),
            issuerClaimClaimsTreeRoot: this.claim.incProof?.treeState?.claimsRoot?.string(),
            issuerClaimRevTreeRoot: this.claim.incProof?.treeState?.revocationRoot?.string(),
            issuerClaimRootsTreeRoot: this.claim.incProof?.treeState?.rootOfRoots?.string(),
            issuerClaimIdenState: this.claim.incProof?.treeState?.state?.string(),
            issuerClaimNonRevMtp: this.claim.nonRevProof?.proof &&
                (0, common_1.prepareSiblingsStr)(this.claim.nonRevProof?.proof, this.getMTLevel()),
            issuerClaimNonRevClaimsTreeRoot: this.claim.nonRevProof?.treeState?.claimsRoot?.string(),
            issuerClaimNonRevRevTreeRoot: this.claim.nonRevProof?.treeState?.revocationRoot?.string(),
            issuerClaimNonRevRootsTreeRoot: this.claim.nonRevProof?.treeState?.rootOfRoots?.string(),
            issuerClaimNonRevState: this.claim.nonRevProof?.treeState?.state?.string(),
            claimSchema: this.claim.claim?.getSchemaHash().bigInt().toString(),
            claimPathMtp: (0, common_1.prepareSiblingsStr)(valueProof.mtp, this.getMTLevelsClaimMerklization()),
            claimPathValue: valueProof.value.toString(),
            operator: this.query.operator,
            slotIndex: this.query.slotIndex,
            timestamp: this.currentTimeStamp ?? undefined,
            isRevocationChecked: 1,
            authClaim: this.authClaim.marshalJson(),
            authClaimIncMtp: this.authClaimIncMtp && (0, common_1.prepareSiblingsStr)(this.authClaimIncMtp, this.getMTLevel()),
            authClaimNonRevMtp: this.authClaimNonRevMtp && (0, common_1.prepareSiblingsStr)(this.authClaimNonRevMtp, this.getMTLevel()),
            challenge: this.challenge.toString(),
            challengeSignatureR8x: this.signature.R8[0].toString(),
            challengeSignatureR8y: this.signature.R8[1].toString(),
            challengeSignatureS: this.signature.S.toString(),
            userClaimsTreeRoot: this.treeState.claimsRoot?.string(),
            userRevTreeRoot: this.treeState.revocationRoot?.string(),
            userRootsTreeRoot: this.treeState.rootOfRoots?.string(),
            userState: this.treeState.state?.string(),
            gistRoot: this.gistProof.root?.string(),
            gistMtp: this.gistProof && (0, common_1.prepareSiblingsStr)(this.gistProof.proof, this.getMTLevelOnChain())
        };
        if (this.skipClaimRevocationCheck) {
            s.isRevocationChecked = 0;
        }
        const nodeAuxNonRev = this.claim.nonRevProof?.proof && (0, common_1.getNodeAuxValue)(this.claim.nonRevProof.proof);
        s.issuerClaimNonRevMtpAuxHi = nodeAuxNonRev?.key.bigInt().toString();
        s.issuerClaimNonRevMtpAuxHv = nodeAuxNonRev?.value.bigInt().toString();
        s.issuerClaimNonRevMtpNoAux = nodeAuxNonRev?.noAux;
        s.claimPathNotExists = (0, common_1.existenceToInt)(valueProof.mtp.existence);
        const nodAuxJSONLD = (0, common_1.getNodeAuxValue)(valueProof.mtp);
        s.claimPathMtpNoAux = nodAuxJSONLD.noAux;
        s.claimPathMtpAuxHi = nodAuxJSONLD.key.bigInt().toString();
        s.claimPathMtpAuxHv = nodAuxJSONLD.value.bigInt().toString();
        s.claimPathKey = valueProof.path.toString();
        const values = this.query.values && (0, common_1.prepareCircuitArrayValues)(this.query.values, this.getValueArrSize());
        s.value = values && (0, common_1.bigIntArrayToStringArray)(values);
        const nodeAuxAuth = this.authClaimNonRevMtp && (0, common_1.getNodeAuxValue)(this.authClaimNonRevMtp);
        s.authClaimNonRevMtpAuxHi = nodeAuxAuth.key.string();
        s.authClaimNonRevMtpAuxHv = nodeAuxAuth.value.string();
        s.authClaimNonRevMtpNoAux = nodeAuxAuth.noAux;
        const globalNodeAux = this.gistProof && (0, common_1.getNodeAuxValue)(this.gistProof.proof);
        s.gistMtpAuxHi = globalNodeAux.key.string();
        s.gistMtpAuxHv = globalNodeAux.value.string();
        s.gistMtpNoAux = globalNodeAux.noAux;
        return utils_1.byteEncoder.encode(JSON.stringify(s));
    }
}
exports.AtomicQueryMTPV2OnChainInputs = AtomicQueryMTPV2OnChainInputs;
/**
 *
 * public signals
 * @public
 * @class AtomicQueryMTPV2OnChainPubSignals
 * @extends {BaseConfig}
 */
class AtomicQueryMTPV2OnChainPubSignals extends common_1.BaseConfig {
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
        // - issuerClaimIdenState
        this.issuerClaimIdenState = (0, js_merkletree_1.newHashFromString)(sVals[fieldIdx]);
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
exports.AtomicQueryMTPV2OnChainPubSignals = AtomicQueryMTPV2OnChainPubSignals;
//# sourceMappingURL=atomic-query-mtp-v2-on-chain.js.map