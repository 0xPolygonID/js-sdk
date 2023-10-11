"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueProof = exports.CircuitError = exports.CircuitClaim = exports.CircuitId = exports.Query = void 0;
const js_merkletree_1 = require("@iden3/js-merkletree");
const comparer_1 = require("./comparer");
/**
 * Query represents basic request to claim slot verification
 *
 * @public
 * @class Query
 */
class Query {
    /**
     * Validates Query instance
     *
     */
    validate() {
        if (this.operator !== comparer_1.QueryOperators.$noop && this.values?.some((v) => typeof v !== 'bigint'))
            throw new Error(CircuitError.EmptyQueryValue);
    }
}
exports.Query = Query;
/**
 * CircuitID is alias for circuit identifier
 *
 * @enum {number}
 */
var CircuitId;
(function (CircuitId) {
    // Auth is a type that must be used for authV2.circom
    CircuitId["AuthV2"] = "authV2";
    // StateTransition is a type that must be used for stateTransition.circom
    CircuitId["StateTransition"] = "stateTransition";
    // AtomicQueryMTPV2 is a type for credentialAtomicQueryMTPV2.circom
    CircuitId["AtomicQueryMTPV2"] = "credentialAtomicQueryMTPV2";
    // AtomicQueryMTPV2OnChain is a type for credentialAtomicQueryMTPV2OnChain.circom
    CircuitId["AtomicQueryMTPV2OnChain"] = "credentialAtomicQueryMTPV2OnChain";
    // AtomicQuerySig is a type for credentialAttrQuerySig.circom
    CircuitId["AtomicQuerySigV2"] = "credentialAtomicQuerySigV2";
    // AtomicQuerySigOnChain is a type for credentialAtomicQuerySigOnChain.circom
    CircuitId["AtomicQuerySigV2OnChain"] = "credentialAtomicQuerySigV2OnChain";
})(CircuitId = exports.CircuitId || (exports.CircuitId = {}));
/**
 * Claim structure for circuit inputs
 *
 * @public
 * @class CircuitClaim
 */
class CircuitClaim {
}
exports.CircuitClaim = CircuitClaim;
/**
 * List of errors of circuit inputs processing
 *
 * @enum {number}
 */
var CircuitError;
(function (CircuitError) {
    CircuitError["EmptyAuthClaimProof"] = "empty auth claim mtp proof";
    CircuitError["EmptyAuthClaimProofInTheNewState"] = "empty auth claim mtp proof in the new state";
    CircuitError["EmptyAuthClaimNonRevProof"] = "empty auth claim non-revocation mtp proof";
    CircuitError["EmptyChallengeSignature"] = "empty challenge signature";
    CircuitError["EmptyClaimSignature"] = "empty claim signature";
    CircuitError["EmptyClaimProof"] = "empty claim mtp proof";
    CircuitError["EmptyClaimNonRevProof"] = "empty claim non-revocation mtp proof";
    CircuitError["EmptyIssuerAuthClaimProof"] = "empty issuer auth claim mtp proof";
    CircuitError["EmptyIssuerAuthClaimNonRevProof"] = "empty issuer auth claim non-revocation mtp proof";
    CircuitError["EmptyJsonLDQueryProof"] = "empty JSON-LD query mtp proof";
    CircuitError["EmptyJsonLDQueryValue"] = "empty JSON-LD query value";
    CircuitError["EmptyJsonLDQueryPath"] = "empty JSON-LD query path";
    CircuitError["EmptyQueryValue"] = "empty query value";
    CircuitError["EmptyJsonLDQueryValues"] = "empty JSON-LD query values";
    CircuitError["EmptyId"] = "empty Id";
    CircuitError["EmptyChallenge"] = "empty challenge";
    CircuitError["EmptyGISTProof"] = "empty GIST merkle tree proof";
    CircuitError["EmptyRequestID"] = "empty request ID";
})(CircuitError = exports.CircuitError || (exports.CircuitError = {}));
/**
 * ValueProof represents a Merkle Proof for a value stored as MT
 *
 * @public
 * @class ValueProof
 */
class ValueProof {
    /**
     * Creates an instance of ValueProof.
     */
    constructor() {
        this.path = BigInt(0);
        this.value = BigInt(0);
        this.mtp = new js_merkletree_1.Proof();
    }
    /**
     * validates instance of ValueProof
     *
     */
    validate() {
        if (typeof this.path !== 'bigint') {
            throw new Error(CircuitError.EmptyJsonLDQueryPath);
        }
        if (typeof this.value !== 'bigint') {
            throw new Error(CircuitError.EmptyJsonLDQueryValue);
        }
        if (!this.mtp) {
            throw new Error(CircuitError.EmptyJsonLDQueryProof);
        }
    }
}
exports.ValueProof = ValueProof;
//# sourceMappingURL=models.js.map