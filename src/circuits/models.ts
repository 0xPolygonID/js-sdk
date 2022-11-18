import { Signature } from './../identity/bjj/eddsa-babyjub';
import { Claim as CoreClaim, Id } from '@iden3/js-iden3-core';
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

export interface BJJSignatureProof {
  issuerId?: Id;
  signature?: Signature;
  issuerTreeState: TreeState;
  issuerAuthClaim?: CoreClaim;
  issuerAuthClaimMTP?: Proof;
  issuerAuthNonRevProof?: ClaimNonRevStatus;
}

// Query represents basic request to claim slot verification
export interface Query {
  slotIndex: number;
  values: bigint[];
  operator: Operators;
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
