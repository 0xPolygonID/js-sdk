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
      userAuthClaim: this.authClaim.claim,
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
      issuerClaim: this.claim.claim,
      issuerClaimNonRevClaimsTreeRoot: this.claim.nonRevProof.treeState.claimsRoot,
      issuerClaimNonRevRevTreeRoot: this.claim.nonRevProof.treeState.revocationRoot,
      issuerClaimNonRevRootsTreeRoot: this.claim.nonRevProof.treeState.rootOfRoots,
      issuerClaimNonRevState: this.claim.nonRevProof.treeState.state,
      issuerClaimNonRevMtp: prepareSiblingsStr(
        this.claim.nonRevProof.proof.allSiblings(),
        this.getMTLevel()
      ),
      claimSchema: this.claim.claim.getSchemaHash().bigInt().toString(),
      userClaimsTreeRoot: this.authClaim.incProof.treeState.claimsRoot,
      userState: this.authClaim.incProof.treeState.state,
      userRevTreeRoot: this.authClaim.incProof.treeState.revocationRoot,
      userRootsTreeRoot: this.authClaim.incProof.treeState.rootOfRoots,
      userID: this.id.bigInt().toString(),
      issuerID: this.claim.issuerId.bigInt().toString(),
      operator: this.query.operator,
      slotIndex: this.query.slotIndex,
      timestamp: this.currentTimeStamp,
      issuerClaimSignatureR8x: this.claim.signatureProof.signature.R8[0].toString(),
      issuerClaimSignatureR8y: this.claim.signatureProof.signature.R8[1].toString(),
      issuerClaimSignatureS: this.claim.signatureProof.signature.S.toString(),

      issuerAuthClaimMtp: bigIntArrayToStringArray(
        prepareSiblings(
          this.claim.signatureProof.issuerAuthIncProof.proof.allSiblings(),
          this.getMTLevel()
        )
      ),

      issuerAuthClaimsTreeRoot: this.claim.signatureProof.issuerAuthIncProof.treeState.claimsRoot,
      issuerAuthRevTreeRoot: this.claim.signatureProof.issuerAuthIncProof.treeState.revocationRoot,
      issuerAuthRootsTreeRoot: this.claim.signatureProof.issuerAuthIncProof.treeState.rootOfRoots,

      issuerAuthClaim: this.claim.signatureProof.issuerAuthClaim,

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
    s.userAuthClaimNonRevMtpAuxHi = nodeAuxAuth.key;
    s.userAuthClaimNonRevMtpAuxHv = nodeAuxAuth.value;
    s.userAuthClaimNonRevMtpNoAux = nodeAuxAuth.noAux;

    const nodeAux = getNodeAuxValue(this.claim.nonRevProof.proof);
    s.issuerClaimNonRevMtpAuxHi = nodeAux.key;
    s.issuerClaimNonRevMtpAuxHv = nodeAux.value;
    s.issuerClaimNonRevMtpNoAux = nodeAux.noAux;

    const issuerAuthNodeAux = getNodeAuxValue(
      this.claim.signatureProof.issuerAuthNonRevProof.proof
    );
    s.issuerAuthClaimNonRevMtpAuxHi = issuerAuthNodeAux.key;
    s.issuerAuthClaimNonRevMtpAuxHv = issuerAuthNodeAux.value;
    s.issuerAuthClaimNonRevMtpNoAux = issuerAuthNodeAux.noAux;

    return new TextEncoder().encode(JSON.stringify(s));
  }
}

export interface AtomicQuerySigCircuitInputs {
  userAuthClaim?: CoreClaim;
  userAuthClaimMtp: string[];
  userAuthClaimNonRevMtp: string[];
  userAuthClaimNonRevMtpAuxHi?: Hash;
  userAuthClaimNonRevMtpAuxHv?: Hash;
  userAuthClaimNonRevMtpNoAux: string;
  userClaimsTreeRoot?: Hash;
  userState?: Hash;
  userRevTreeRoot?: Hash;
  userRootsTreeRoot?: Hash;
  userID: string;
  challenge: string;
  challengeSignatureR8x: string;
  challengeSignatureR8y: string;
  challengeSignatureS: string;
  issuerClaim?: CoreClaim;
  issuerClaimNonRevClaimsTreeRoot?: Hash;
  issuerClaimNonRevRevTreeRoot?: Hash;
  issuerClaimNonRevRootsTreeRoot?: Hash;
  issuerClaimNonRevState?: Hash;
  issuerClaimNonRevMtp: string[];
  issuerClaimNonRevMtpAuxHi?: Hash;
  issuerClaimNonRevMtpAuxHv?: Hash;
  issuerClaimNonRevMtpNoAux: string;
  claimSchema: string;
  issuerID: string;
  operator: number;
  slotIndex: number;
  timestamp: number;
  value: string[];
  issuerClaimSignatureR8x: string;
  issuerClaimSignatureR8y: string;
  issuerClaimSignatureS: string;
  issuerAuthClaim?: CoreClaim;
  issuerAuthClaimMtp: string[];
  issuerAuthClaimNonRevMtp: string[];
  issuerAuthClaimNonRevMtpAuxHi?: Hash;
  issuerAuthClaimNonRevMtpAuxHv?: Hash;
  issuerAuthClaimNonRevMtpNoAux: string;
  issuerAuthClaimsTreeRoot?: Hash;
  issuerAuthRevTreeRoot?: Hash;
  issuerAuthRootsTreeRoot?: Hash;
}

// AtomicQuerySigPubSignals public inputs
export class AtomicQuerySigPubSignals extends BaseConfig {
  userId: Id;
  userState: Hash;
  issuerId: Id;
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

    this.userId = Id.fromBigInt(BigInt(sVals[1]));

    this.userState = newHashFromString(sVals[2]);

    this.challenge = BigInt(sVals[3]);

    this.issuerId = Id.fromBigInt(BigInt(sVals[4]));

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
