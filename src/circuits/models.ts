import { Signature } from '@iden3/js-crypto';
import { Claim, Claim as CoreClaim, Id } from '@iden3/js-iden3-core';
import { Hash, Proof } from '@iden3/js-merkletree';
import { Operators } from './comparer';

export interface TreeState {
  state: Hash;
  claimsRoot: Hash;
  revocationRoot: Hash;
  rootOfRoots: Hash;
}

export interface ClaimNonRevStatus {
  treeState: TreeState;
  proof: Proof;
}
// Query represents basic request to claim slot verification
export class Query {
  slotIndex: number;
  values: bigint[];
  operator: Operators;
  valueProof?: ValueProof;

  validate(): void {
    if (this.values.some((v) => !v)) throw new Error(CircuitError.EmptyQueryValue);
  }
}

// CircuitID is alias for circuit identifier
export enum CircuitId {
  // AuthCircuitID is a type that must be used for auth.circom
  Auth = 'auth',
  // StateTransition is a type that must be used for stateTransition.circom
  StateTransition = 'stateTransition',
  // AtomicQueryMTP is a type for credentialAtomicQueryMTP.circom
  AtomicQueryMTP = 'credentialAtomicQueryMTP',
  // AtomicQuerySig is a type for credentialAttrQuerySig.circom
  AtomicQuerySig = 'credentialAtomicQuerySig',
  // AtomicQueryMTPWithRelay is a type for credentialAtomicQueryMTPWithRelay.circom
  AtomicQueryMTPWithRelay = 'credentialAtomicQueryMTPWithRelay',
  // AtomicQuerySigWithRelay is a type for credentialAttrQuerySigWithRelay.circom
  AtomicQuerySigWithRelay = 'credentialAtomicQuerySigWithRelay'
}

export class CircuitClaim {
  issuerId: Id;
  claim: CoreClaim;
  treeState: TreeState;
  proof: Proof;
  nonRevProof: ClaimNonRevStatus; // Claim non revocation proof
  //todo; js-circuits BJJSignatureProof
  signatureProof: BJJSignatureProof;
}

export interface ClaimWithSigProof {
  issuerId: Id;
  claim: Claim;
  nonRevProof: MTProof;
  signatureProof: BJJSignatureProof;
}

export interface ClaimWithMTPProof {
  issuerID?: Id;
  claim: Claim;
  incProof: MTProof;
  nonRevProof: MTProof;
}

export interface BJJSignatureProof {
  signature: Signature;
  issuerAuthClaim?: Claim;
  issuerAuthIncProof: MTProof;
  issuerAuthNonRevProof: MTProof;
}

export interface MTProof {
  proof: Proof;
  treeState?: TreeState;
}
export interface GISTProof {
  root: Hash;
  proof: Proof;
}

export enum CircuitError {
  EmptyAuthClaimProof = 'empty auth claim mtp proof',
  EmptyAuthClaimNonRevProof = 'empty auth claim non-revocation mtp proof',
  EmptyChallengeSignature = 'empty challenge signature',
  EmptyClaimSignature = 'empty claim signature',
  EmptyClaimProof = 'empty claim mtp proof',
  EmptyClaimNonRevProof = 'empty claim non-revocation mtp proof',
  EmptyIssuerAuthClaimProof = 'empty issuer auth claim mtp proof',
  EmptyIssuerAuthClaimNonRevProof = 'empty issuer auth claim non-revocation mtp proof',
  EmptyJsonLDQueryProof = 'empty JSON-LD query mtp proof',
  EmptyJsonLDQueryValue = 'empty JSON-LD query value',
  EmptyQueryValue = 'empty query value',
  EmptyJsonLDQueryValues = 'empty JSON-LD query values',
  EmptyId = 'empty Id',
  EmptyChallenge = 'empty challenge',
  EmptyGlobalProof = 'empty global identity mtp proof'
}

// ValueProof represents a Merkle Proof for a value stored as MT
export class ValueProof {
  //todo: replace by  merklize.Path
  path: any;
  value: bigint;
  mtp: Proof;

  constructor() {
    this.path = null;
    this.value = BigInt(0);
    this.mtp = new Proof();
  }

  validate(): void {
    if (!this.value) {
      throw new Error(CircuitError.EmptyJsonLDQueryValue);
    }
    if (!this.mtp) {
      throw new Error(CircuitError.EmptyJsonLDQueryProof);
    }
  }
}
