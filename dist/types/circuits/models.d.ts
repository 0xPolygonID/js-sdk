import { Signature } from '@iden3/js-crypto';
import { Claim, Claim as CoreClaim, Id } from '@iden3/js-iden3-core';
import { Hash, Proof } from '@iden3/js-merkletree';
/**
 * TreeState is model for merkle tree roots
 *
 * @public
 * @interface   TreeState
 */
export interface TreeState {
    state: Hash;
    claimsRoot: Hash;
    revocationRoot: Hash;
    rootOfRoots: Hash;
}
/**
 * claim non revocation status for circuit
 * TreeState and Proof of inclusion / non-inclusion
 *
 * @public
 * @interface   ClaimNonRevStatus
 */
export interface ClaimNonRevStatus {
    treeState: TreeState;
    proof: Proof;
}
/**
 * Query represents basic request to claim slot verification
 *
 * @public
 * @class Query
 */
export declare class Query {
    slotIndex: number;
    values: bigint[];
    operator: number;
    valueProof: ValueProof;
    /**
     * Validates Query instance
     *
     */
    validate(): void;
}
/**
 * CircuitID is alias for circuit identifier
 *
 * @enum {number}
 */
export declare enum CircuitId {
    AuthV2 = "authV2",
    StateTransition = "stateTransition",
    AtomicQueryMTPV2 = "credentialAtomicQueryMTPV2",
    AtomicQueryMTPV2OnChain = "credentialAtomicQueryMTPV2OnChain",
    AtomicQuerySigV2 = "credentialAtomicQuerySigV2",
    AtomicQuerySigV2OnChain = "credentialAtomicQuerySigV2OnChain"
}
/**
 * Claim structure for circuit inputs
 *
 * @public
 * @class CircuitClaim
 */
export declare class CircuitClaim {
    issuerId: Id;
    claim: CoreClaim;
    treeState: TreeState;
    proof: Proof;
    nonRevProof: ClaimNonRevStatus;
    signatureProof: BJJSignatureProof;
}
/**
 *
 * Claim for circuit with non revocation proof and signature proof
 * @public
 * @interface   ClaimWithSigProof
 */
export interface ClaimWithSigProof {
    issuerID?: Id;
    claim?: Claim;
    nonRevProof?: MTProof;
    signatureProof?: BJJSignatureProof;
}
/**
 * Claim for circuit with non revocation proof and proof of merkle tree inclusion
 *
 * @public
 * @interface   ClaimWithMTPProof
 */
export interface ClaimWithMTPProof {
    issuerID?: Id;
    claim?: Claim;
    incProof?: MTProof;
    nonRevProof?: MTProof;
}
/**
 * prepared bjj signature for circuits with auth bjj claim data
 *
 * @public
 * @interface   BJJSignatureProof
 */
export interface BJJSignatureProof {
    signature: Signature;
    issuerAuthClaim?: Claim;
    issuerAuthIncProof: MTProof;
    issuerAuthNonRevProof: MTProof;
}
/**
 * prepared mtp with a tree state
 *
 * @public
 * @interface   MTProof
 */
export interface MTProof {
    proof?: Proof;
    treeState?: TreeState;
}
/**
 * global identity state proof
 *
 * @public
 * @interface   GISTProof
 */
export interface GISTProof {
    root: Hash;
    proof: Proof;
}
/**
 * List of errors of circuit inputs processing
 *
 * @enum {number}
 */
export declare enum CircuitError {
    EmptyAuthClaimProof = "empty auth claim mtp proof",
    EmptyAuthClaimProofInTheNewState = "empty auth claim mtp proof in the new state",
    EmptyAuthClaimNonRevProof = "empty auth claim non-revocation mtp proof",
    EmptyChallengeSignature = "empty challenge signature",
    EmptyClaimSignature = "empty claim signature",
    EmptyClaimProof = "empty claim mtp proof",
    EmptyClaimNonRevProof = "empty claim non-revocation mtp proof",
    EmptyIssuerAuthClaimProof = "empty issuer auth claim mtp proof",
    EmptyIssuerAuthClaimNonRevProof = "empty issuer auth claim non-revocation mtp proof",
    EmptyJsonLDQueryProof = "empty JSON-LD query mtp proof",
    EmptyJsonLDQueryValue = "empty JSON-LD query value",
    EmptyJsonLDQueryPath = "empty JSON-LD query path",
    EmptyQueryValue = "empty query value",
    EmptyJsonLDQueryValues = "empty JSON-LD query values",
    EmptyId = "empty Id",
    EmptyChallenge = "empty challenge",
    EmptyGISTProof = "empty GIST merkle tree proof",
    EmptyRequestID = "empty request ID"
}
/**
 * ValueProof represents a Merkle Proof for a value stored as MT
 *
 * @public
 * @class ValueProof
 */
export declare class ValueProof {
    path: bigint;
    value: bigint;
    mtp: Proof;
    /**
     * Creates an instance of ValueProof.
     */
    constructor();
    /**
     * validates instance of ValueProof
     *
     */
    validate(): void;
}
