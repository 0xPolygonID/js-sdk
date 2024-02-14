import { Signature } from '@iden3/js-crypto';
import { Claim, Claim as CoreClaim, Id } from '@iden3/js-iden3-core';
import { Hash, Proof } from '@iden3/js-merkletree';
import { QueryOperators } from './comparer';

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
export class Query {
  slotIndex!: number;
  values!: bigint[];
  operator!: number;
  valueProof!: ValueProof;

  /**
   * Validates Query instance
   *
   */
  validate(): void {
    if (
      this.operator !== QueryOperators.$noop &&
      this.operator !== QueryOperators.$sd &&
      this.values?.some((v) => typeof v !== 'bigint')
    )
      throw new Error(CircuitError.EmptyQueryValue);
  }
}

/**
 * CircuitID is alias for circuit identifier
 *
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
  AtomicQuerySigV2OnChain = 'credentialAtomicQuerySigV2OnChain',
  /**
   * @beta
   */
  // AtomicQueryV3CircuitID is a type for credentialAtomicQueryV3.circom
  AtomicQueryV3 = 'credentialAtomicQueryV3-beta.0',
  /**
   * @beta
   */
  // AtomicQueryV3OnChainCircuitID is a type for credentialAtomicQueryV3OnChain.circom
  AtomicQueryV3OnChain = 'credentialAtomicQueryV3OnChain-beta.0',
  /**
   * @beta
   */
  // LinkedMultiQuery is a type for linkedMultiQuery.circom
  LinkedMultiQuery10 = 'linkedMultiQuery10-beta.0'
}

/**
 * Claim structure for circuit inputs
 *
 * @public
 * @class CircuitClaim
 */
export class CircuitClaim {
  issuerId!: Id;
  claim!: CoreClaim;
  treeState!: TreeState;
  proof!: Proof;
  nonRevProof!: ClaimNonRevStatus; // Claim non revocation proof
  signatureProof!: BJJSignatureProof;
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
  EmptyTreeState = 'empty tree state',
  EmptyRequestID = 'empty request ID',
  InvalidProofType = 'invalid proof type'
}

/**
 * ValueProof represents a Merkle Proof for a value stored as MT
 *
 * @public
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
