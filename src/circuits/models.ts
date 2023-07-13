import { Signature } from '@iden3/js-crypto';
import { Claim, Claim as CoreClaim, Id } from '@iden3/js-iden3-core';
import { Hash, Proof } from '@iden3/js-merkletree';
import { QueryOperators } from './comparer';

/**
 * TreeState is model for merkle tree roots
 *
 * @export
 * @beta
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
 * @export
 * @beta
 * @interface   ClaimNonRevStatus
 */
export interface ClaimNonRevStatus {
  treeState: TreeState;
  proof: Proof;
}
/**
 * Query represents basic request to claim slot verification
 *
 * @export
 * @beta
 * @class Query
 */
export class Query {
  slotIndex?: number;
  values?: bigint[];
  operator?: number;
  valueProof?: ValueProof;

  /**
   * Validates Query instance
   *
   */
  validate(): void {
    if (this.operator !== QueryOperators.$noop && this.values?.some((v) => typeof v !== 'bigint'))
      throw new Error(CircuitError.EmptyQueryValue);
  }
}

/**
 * CircuitID is alias for circuit identifier
 *
 * @export
 * @enum {number}
 */
export enum CircuitId {
  // Auth is a type that must be used for authV2.circom
  AuthV2 = 'authV2',
  // StateTransition is a type that must be used for stateTransition.circom
  StateTransition = 'stateTransition',
  // AtomicQueryMTPV2 is a type for credentialAtomicQueryMTPV2.circom
  AtomicQueryMTPV2 = 'credentialAtomicQueryMTPV2',
  // AtomicQueryMTPV2OnChain is a type for credentialAtomicQueryMTPV2OnChain.circom
  AtomicQueryMTPV2OnChain = 'credentialAtomicQueryMTPV2OnChain',
  // AtomicQuerySig is a type for credentialAttrQuerySig.circom
  AtomicQuerySigV2 = 'credentialAtomicQuerySigV2',
  // AtomicQuerySigOnChain is a type for credentialAtomicQuerySigOnChain.circom
  AtomicQuerySigV2OnChain = 'credentialAtomicQuerySigV2OnChain'
}

/**
 * Claim structure for circuit inputs
 *
 * @export
 * @beta
 * @class CircuitClaim
 */
export class CircuitClaim {
  issuerId: Id | null = null;
  claim: CoreClaim | null = null;
  treeState: TreeState | null = null;
  proof: Proof | null = null;
  nonRevProof: ClaimNonRevStatus | null = null; // Claim non revocation proof
  signatureProof: BJJSignatureProof | null = null;
}

/**
 *
 * Claim for circuit with non revocation proof and signature proof
 * @export
 * @beta
 * @interface   ClaimWithSigProof
 */
export interface ClaimWithSigProof {
  issuerID: Id;
  claim: Claim;
  nonRevProof: MTProof;
  signatureProof: BJJSignatureProof;
}

/**
 * Claim for circuit with non revocation proof and proof of merkle tree inclusion
 *
 * @export
 * @beta
 * @interface   ClaimWithMTPProof
 */
export interface ClaimWithMTPProof {
  issuerID?: Id;
  claim: Claim;
  incProof: MTProof;
  nonRevProof: MTProof;
}

/**
 * prepared bjj signature for circuits with auth bjj claim data
 *
 * @export
 * @beta
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
 * @export
 * @beta
 * @interface   MTProof
 */
export interface MTProof {
  proof: Proof;
  treeState?: TreeState;
}
/**
 * global identity state proof
 *
 * @export
 * @beta
 * @interface   GISTProof
 */
export interface GISTProof {
  root: Hash;
  proof: Proof;
}

/**
 * List of errors of circuit inputs processing
 *
 * @export
 * @enum {number}
 */
export enum CircuitError {
  EmptyAuthClaimProof = 'empty auth claim mtp proof',
  EmptyAuthClaimProofInTheNewState = 'empty auth claim mtp proof in the new state',
  EmptyAuthClaimNonRevProof = 'empty auth claim non-revocation mtp proof',
  EmptyChallengeSignature = 'empty challenge signature',
  EmptyClaimSignature = 'empty claim signature',
  EmptyClaimProof = 'empty claim mtp proof',
  EmptyClaimNonRevProof = 'empty claim non-revocation mtp proof',
  EmptyIssuerAuthClaimProof = 'empty issuer auth claim mtp proof',
  EmptyIssuerAuthClaimNonRevProof = 'empty issuer auth claim non-revocation mtp proof',
  EmptyJsonLDQueryProof = 'empty JSON-LD query mtp proof',
  EmptyJsonLDQueryValue = 'empty JSON-LD query value',
  EmptyJsonLDQueryPath = 'empty JSON-LD query path',
  EmptyQueryValue = 'empty query value',
  EmptyJsonLDQueryValues = 'empty JSON-LD query values',
  EmptyId = 'empty Id',
  EmptyChallenge = 'empty challenge',
  EmptyGISTProof = 'empty GIST merkle tree proof',
  EmptyRequestID = 'empty request ID'
}

/**
 * ValueProof represents a Merkle Proof for a value stored as MT
 *
 * @export
 * @beta
 * @class ValueProof
 */
export class ValueProof {
  path: bigint;
  value: bigint;
  mtp: Proof;

  /**
   * Creates an instance of ValueProof.
   */
  constructor() {
    this.path = BigInt(0);
    this.value = BigInt(0);
    this.mtp = new Proof();
  }

  /**
   * validates instance of ValueProof
   *
   */
  validate(): void {
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
