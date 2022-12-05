import { Signature } from '@iden3/js-crypto';
import { Id, Claim as CoreClaim, SchemaHash } from '@iden3/js-iden3-core';
import { Hash, newHashFromString } from '@iden3/js-merkletree';

import {
  BaseConfig,
  bigIntArrayToStringArray,
  getNodeAuxValue,
  prepareCircuitArrayValues,
  prepareSiblings,
  prepareSiblingsStr
} from './common';
import { CircuitError, ClaimWithMTPProof, ClaimWithSigProof, Query } from './models';

// AtomicQuerySigInputs ZK private inputs for credentialAtomicQuerySig.circom
export class AtomicQuerySigInputs extends BaseConfig {
  // auth
  id: Id;
  authClaim: ClaimWithMTPProof;
  challenge: bigint;
  signature: Signature;
  // issuerClaim
  claim: ClaimWithSigProof;
  query: Query;
  currentTimeStamp: number;

  // InputsMarshal returns Circom private inputs for credentialAtomicQuerySig.circom
  inputsMarshal(): Uint8Array {
    if (!this.authClaim.incProof.proof) {
      throw new Error(CircuitError.EmptyAuthClaimProof);
    }

    if (!this.authClaim.nonRevProof || !this.authClaim.nonRevProof.proof) {
      throw new Error(CircuitError.EmptyAuthClaimNonRevProof);
    }

    if (!this.claim.nonRevProof || !this.claim.nonRevProof.proof) {
      throw new Error(CircuitError.EmptyClaimNonRevProof);
    }

    if (!this.claim.signatureProof?.issuerAuthNonRevProof?.proof) {
      throw new Error(CircuitError.EmptyIssuerAuthClaimNonRevProof);
    }

    if (!this.signature) {
      throw new Error(CircuitError.EmptyChallengeSignature);
    }

    if (!this.claim.signatureProof.signature) {
      throw new Error(CircuitError.EmptyClaimSignature);
    }

    const s: Partial<AtomicQuerySigCircuitInputs> = {
      userAuthClaim: this.authClaim.claim.marshalJson(),
      userAuthClaimMtp: prepareSiblingsStr(
        this.authClaim.incProof.proof.allSiblings(),
        this.getMTLevel()
      ),
      userAuthClaimNonRevMtp: prepareSiblingsStr(
        this.authClaim.nonRevProof.proof.allSiblings(),
        this.getMTLevel()
      ),
      challenge: this.challenge.toString(),
      challengeSignatureR8x: this.signature.R8[0].toString(),
      challengeSignatureR8y: this.signature.R8[1].toString(),
      challengeSignatureS: this.signature.S.toString(),
      issuerClaim: this.claim.claim.marshalJson(),
      issuerClaimNonRevClaimsTreeRoot: this.claim.nonRevProof.treeState?.claimsRoot
        .bigInt()
        .toString(),
      issuerClaimNonRevRevTreeRoot: this.claim.nonRevProof.treeState?.revocationRoot
        .bigInt()
        .toString(),
      issuerClaimNonRevRootsTreeRoot: this.claim.nonRevProof.treeState?.rootOfRoots
        .bigInt()
        .toString(),
      issuerClaimNonRevState: this.claim.nonRevProof.treeState?.state.bigInt().toString(),
      issuerClaimNonRevMtp: prepareSiblingsStr(
        this.claim.nonRevProof.proof.allSiblings(),
        this.getMTLevel()
      ),
      claimSchema: this.claim.claim.getSchemaHash().bigInt().toString(),
      userClaimsTreeRoot: this.authClaim.incProof.treeState?.claimsRoot.bigInt().toString(),
      userState: this.authClaim.incProof.treeState?.state.bigInt().toString(),
      userRevTreeRoot: this.authClaim.incProof.treeState?.revocationRoot.bigInt().toString(),
      userRootsTreeRoot: this.authClaim.incProof.treeState?.rootOfRoots.bigInt().toString(),
      userID: this.id.bigInt().toString(),
      issuerID: this.claim.issuerID.bigInt().toString(),
      operator: this.query.operator,
      slotIndex: this.query.slotIndex,
      timestamp: this.currentTimeStamp.toString(),
      issuerClaimSignatureR8x: this.claim.signatureProof.signature.R8[0].toString(),
      issuerClaimSignatureR8y: this.claim.signatureProof.signature.R8[1].toString(),
      issuerClaimSignatureS: this.claim.signatureProof.signature.S.toString(),

      issuerAuthClaimMtp: bigIntArrayToStringArray(
        prepareSiblings(
          this.claim.signatureProof.issuerAuthIncProof.proof.allSiblings(),
          this.getMTLevel()
        )
      ),

      issuerAuthClaimsTreeRoot: this.claim.signatureProof.issuerAuthIncProof.treeState?.claimsRoot
        .bigInt()
        .toString(),
      issuerAuthRevTreeRoot: this.claim.signatureProof.issuerAuthIncProof.treeState?.revocationRoot
        .bigInt()
        .toString(),
      issuerAuthRootsTreeRoot: this.claim.signatureProof.issuerAuthIncProof.treeState?.rootOfRoots
        .bigInt()
        .toString(),

      issuerAuthClaim: this.claim.signatureProof.issuerAuthClaim?.marshalJson(),

      issuerAuthClaimNonRevMtp: bigIntArrayToStringArray(
        prepareSiblings(
          this.claim.signatureProof.issuerAuthNonRevProof.proof.allSiblings(),
          this.getMTLevel()
        )
      )
    };

    const values = prepareCircuitArrayValues(this.query.values, this.getValueArrSize());
    s.value = bigIntArrayToStringArray(values);

    const nodeAuxAuth = getNodeAuxValue(this.authClaim.nonRevProof.proof);
    s.userAuthClaimNonRevMtpAuxHi = nodeAuxAuth.key.bigInt().toString();
    s.userAuthClaimNonRevMtpAuxHv = nodeAuxAuth.value.bigInt().toString();
    s.userAuthClaimNonRevMtpNoAux = nodeAuxAuth.noAux;

    const nodeAux = getNodeAuxValue(this.claim.nonRevProof.proof);
    s.issuerClaimNonRevMtpAuxHi = nodeAux.key.bigInt().toString();
    s.issuerClaimNonRevMtpAuxHv = nodeAux.value.bigInt().toString();
    s.issuerClaimNonRevMtpNoAux = nodeAux.noAux;

    const issuerAuthNodeAux = getNodeAuxValue(
      this.claim.signatureProof.issuerAuthNonRevProof.proof
    );
    s.issuerAuthClaimNonRevMtpAuxHi = issuerAuthNodeAux.key.bigInt().toString();
    s.issuerAuthClaimNonRevMtpAuxHv = issuerAuthNodeAux.value.bigInt().toString();
    s.issuerAuthClaimNonRevMtpNoAux = issuerAuthNodeAux.noAux;

    return new TextEncoder().encode(JSON.stringify(s));
  }
}

export interface AtomicQuerySigCircuitInputs {
  userAuthClaim?: string[];
  userAuthClaimMtp: string[];
  userAuthClaimNonRevMtp: string[];
  userAuthClaimNonRevMtpAuxHi?: string;
  userAuthClaimNonRevMtpAuxHv?: string;
  userAuthClaimNonRevMtpNoAux: string;
  userClaimsTreeRoot?: string;
  userState?: string;
  userRevTreeRoot?: string;
  userRootsTreeRoot?: string;
  userID: string;
  challenge: string;
  challengeSignatureR8x: string;
  challengeSignatureR8y: string;
  challengeSignatureS: string;
  issuerClaim?: string[];
  issuerClaimNonRevClaimsTreeRoot?: string;
  issuerClaimNonRevRevTreeRoot?: string;
  issuerClaimNonRevRootsTreeRoot?: string;
  issuerClaimNonRevState?: string;
  issuerClaimNonRevMtp: string[];
  issuerClaimNonRevMtpAuxHi?: string;
  issuerClaimNonRevMtpAuxHv?: string;
  issuerClaimNonRevMtpNoAux: string;
  claimSchema: string;
  issuerID: string;
  operator: number;
  slotIndex: number;
  timestamp: string;
  value: string[];
  issuerClaimSignatureR8x: string;
  issuerClaimSignatureR8y: string;
  issuerClaimSignatureS: string;
  issuerAuthClaim?: string[];
  issuerAuthClaimMtp: string[];
  issuerAuthClaimNonRevMtp: string[];
  issuerAuthClaimNonRevMtpAuxHi?: string;
  issuerAuthClaimNonRevMtpAuxHv?: string;
  issuerAuthClaimNonRevMtpNoAux: string;
  issuerAuthClaimsTreeRoot?: string;
  issuerAuthRevTreeRoot?: string;
  issuerAuthRootsTreeRoot?: string;
}

// AtomicQuerySigPubSignals public inputs
export class AtomicQuerySigPubSignals extends BaseConfig {
  userID: Id;
  userState: Hash;
  issuerID: Id;
  issuerAuthState: Hash;
  issuerClaimNonRevState: Hash;
  claimSchema: SchemaHash;
  slotIndex: number;
  operator: number;
  values: bigint[] = [];
  timestamp: number;
  merklized: Hash;
  challenge: bigint;

  // PubSignalsUnmarshal unmarshal credentialAtomicQuerySig.circom public signals
  pubSignalsUnmarshal(data: Uint8Array): AtomicQuerySigPubSignals {
    // 10 is a number of fields in AtomicQuerySigPubSignals before values, values is last element in the proof and
    // it is length could be different base on the circuit configuration. The length could be modified by set value
    // in ValueArraySize
    const fieldLength = 10;
    const sVals: string[] = JSON.parse(new TextDecoder().decode(data));

    if (sVals.length !== fieldLength + this.getValueArrSize()) {
      throw new Error(
        `invalid number of Output values expected ${fieldLength + this.getValueArrSize()} got ${
          sVals.length
        }`
      );
    }

    this.issuerAuthState = newHashFromString(sVals[0]);

    this.userID = Id.fromBigInt(BigInt(sVals[1]));

    this.userState = newHashFromString(sVals[2]);

    this.challenge = BigInt(sVals[3]);

    this.issuerID = Id.fromBigInt(BigInt(sVals[4]));

    this.issuerClaimNonRevState = newHashFromString(sVals[5]);

    this.timestamp = parseInt(sVals[6]);
    this.claimSchema = SchemaHash.newSchemaHashFromInt(BigInt(sVals[7]));

    this.slotIndex = parseInt(sVals[8]);

    this.operator = parseInt(sVals[9]);

    sVals.slice(fieldLength, fieldLength + this.getValueArrSize()).forEach((v) => {
      this.values.push(BigInt(v));
    });
    return this;
  }
}
