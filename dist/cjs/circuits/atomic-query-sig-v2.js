"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtomicQuerySigV2PubSignals = exports.AtomicQuerySigV2Inputs = void 0;
const js_merkletree_1 = require("@iden3/js-merkletree");
const js_iden3_core_1 = require("@iden3/js-iden3-core");
const models_1 = require("./models");
const common_1 = require("./common");
const comparer_1 = require("./comparer");
const utils_1 = require("../utils");
/**
 * AtomicQuerySigV2Inputs representation for credentialAtomicQuerySig.circom
 * Inputs and public signals declaration, marshalling and parsing
 *
 * @public
 * @class AtomicQuerySigV2Inputs
 * @extends {BaseConfig}
 */
class AtomicQuerySigV2Inputs extends common_1.BaseConfig {
    /**
     *  Validate inputs
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
        if (!this.query.values && this.query.operator !== comparer_1.QueryOperators.$noop) {
            throw new Error(models_1.CircuitError.EmptyQueryValue);
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
            issuerClaimSignatureR8x: this.claim.signatureProof?.signature.R8[0].toString(),
            issuerClaimSignatureR8y: this.claim.signatureProof?.signature.R8[1].toString(),
            issuerClaimSignatureS: this.claim.signatureProof?.signature.S.toString(),
            issuerAuthClaim: this.claim.signatureProof?.issuerAuthClaim?.marshalJson(),
            issuerAuthClaimMtp: this.claim.signatureProof?.issuerAuthIncProof?.proof &&
                (0, common_1.prepareSiblingsStr)(this.claim.signatureProof.issuerAuthIncProof.proof, this.getMTLevel()),
            issuerAuthClaimsTreeRoot: this.claim.signatureProof?.issuerAuthIncProof.treeState?.claimsRoot
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
            operator: this.query.operator,
            timestamp: this.currentTimeStamp,
            // value in this path in merklized json-ld document
            slotIndex: this.query.slotIndex
        };
        if (this.skipClaimRevocationCheck) {
            s.isRevocationChecked = 0;
        }
        else {
            s.isRevocationChecked = 1;
        }
        const nodeAuxNonRev = (0, common_1.getNodeAuxValue)(this.claim.nonRevProof?.proof);
        s.issuerClaimNonRevMtpAuxHi = nodeAuxNonRev?.key.bigInt().toString();
        s.issuerClaimNonRevMtpAuxHv = nodeAuxNonRev?.value.bigInt().toString();
        s.issuerClaimNonRevMtpNoAux = nodeAuxNonRev?.noAux;
        const nodeAuxIssuerAuthNonRev = this.claim.signatureProof &&
            (0, common_1.getNodeAuxValue)(this.claim.signatureProof.issuerAuthNonRevProof.proof);
        s.issuerAuthClaimNonRevMtpAuxHi = nodeAuxIssuerAuthNonRev?.key.bigInt().toString();
        s.issuerAuthClaimNonRevMtpAuxHv = nodeAuxIssuerAuthNonRev?.value.bigInt().toString();
        s.issuerAuthClaimNonRevMtpNoAux = nodeAuxIssuerAuthNonRev?.noAux;
        s.claimPathNotExists = (0, common_1.existenceToInt)(valueProof.mtp.existence);
        const nodAuxJSONLD = (0, common_1.getNodeAuxValue)(valueProof.mtp);
        s.claimPathMtpNoAux = nodAuxJSONLD.noAux;
        s.claimPathMtpAuxHi = nodAuxJSONLD.key.bigInt().toString();
        s.claimPathMtpAuxHv = nodAuxJSONLD.value.bigInt().toString();
        s.claimPathKey = valueProof.path.toString();
        if (this.skipClaimRevocationCheck) {
            s.isRevocationChecked = 0;
        }
        else {
            s.isRevocationChecked = 1;
        }
        const values = (0, common_1.prepareCircuitArrayValues)(this.query.values, this.getValueArrSize());
        s.value = (0, common_1.bigIntArrayToStringArray)(values);
        return utils_1.byteEncoder.encode(JSON.stringify(s));
    }
}
exports.AtomicQuerySigV2Inputs = AtomicQuerySigV2Inputs;
/**
 *
 * public signals
 * @public
 * @class AtomicQuerySigV2PubSignals
 * @extends {BaseConfig}
 */
class AtomicQuerySigV2PubSignals extends common_1.BaseConfig {
    constructor() {
        super(...arguments);
        this.value = [];
    }
    //
    /**
     *
     * PubSignalsUnmarshal unmarshal credentialAtomicQuerySig.circom public signals array to AtomicQuerySugPubSignals
     * @param {Uint8Array} data
     * @returns AtomicQuerySigV2PubSignals
     */
    pubSignalsUnmarshal(data) {
        // expected order:
        // merklized
        // userID
        // issuerAuthState
        // requestID
        // issuerID
        // issuerClaimNonRevState
        // timestamp
        // claimSchema
        // claimPathNotExists
        // claimPathKey
        // slotIndex
        // operator
        // value
        // 12 is a number of fields in AtomicQuerySigV2PubSignals before values, values is last element in the proof and
        // it is length could be different base on the circuit configuration. The length could be modified by set value
        // in ValueArraySize
        const fieldLength = 13;
        const sVals = JSON.parse(utils_1.byteDecoder.decode(data));
        if (sVals.length !== fieldLength + this.getValueArrSize()) {
            throw new Error(`invalid number of Output values expected ${fieldLength + this.getValueArrSize()} got ${sVals.length}`);
        }
        let fieldIdx = 0;
        // -- merklized
        this.merklized = parseInt(sVals[fieldIdx]);
        fieldIdx++;
        //  - userID
        this.userID = js_iden3_core_1.Id.fromBigInt(BigInt(sVals[fieldIdx]));
        fieldIdx++;
        // - issuerAuthState
        this.issuerAuthState = (0, js_merkletree_1.newHashFromString)(sVals[fieldIdx]);
        fieldIdx++;
        // - requestID
        this.requestID = BigInt(sVals[fieldIdx]);
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
        //  - claimSchema
        this.claimSchema = js_iden3_core_1.SchemaHash.newSchemaHashFromInt(BigInt(sVals[fieldIdx]));
        fieldIdx++;
        // - ClaimPathNotExists
        this.claimPathNotExists = parseInt(sVals[fieldIdx]);
        fieldIdx++;
        // - ClaimPathKey
        this.claimPathKey = BigInt(sVals[fieldIdx]);
        fieldIdx++;
        // - slotIndex
        this.slotIndex = parseInt(sVals[fieldIdx]);
        fieldIdx++;
        // - operator
        this.operator = parseInt(sVals[fieldIdx]);
        fieldIdx++;
        //  - values
        for (let index = 0; index < this.getValueArrSize(); index++) {
            this.value.push(BigInt(sVals[fieldIdx]));
            fieldIdx++;
        }
        return this;
    }
}
exports.AtomicQuerySigV2PubSignals = AtomicQuerySigV2PubSignals;
//# sourceMappingURL=atomic-query-sig-v2.js.map