import { newHashFromString } from '@iden3/js-merkletree';
import { Claim as CoreClaim, Id, SchemaHash } from '@iden3/js-iden3-core';
import { Query, ClaimWithMTPProof, CircuitError } from './models';
import { Hash } from '@iden3/js-merkletree';
import {
  BaseConfig,
  bigIntArrayToStringArray,
  getNodeAuxValue,
  prepareCircuitArrayValues,
  prepareSiblingsStr
} from './common';
import { Signature } from '@iden3/js-crypto';

// AtomicQueryMTPInputs ZK private inputs for credentialAtomicQueryMTP.circom
export class AtomicQueryMTPInputs extends BaseConfig {
  // auth
  id: Id;
  authClaim: ClaimWithMTPProof;
  challenge: bigint;
  signature: Signature;

  // claim issued for user
  claim: ClaimWithMTPProof;

  currentTimeStamp: number;

  // query
  query: Query;

  inputsMarshal(): Uint8Array {
    if (!this.authClaim.incProof.proof) {
      throw new Error(CircuitError.EmptyAuthClaimProof);
    }

    if (!this.authClaim.nonRevProof || !this.authClaim.nonRevProof.proof) {
      throw new Error(CircuitError.EmptyAuthClaimNonRevProof);
    }

    if (!this.claim.incProof.proof) {
      throw new Error(CircuitError.EmptyClaimProof);
    }

    if (!this.claim.nonRevProof?.proof) {
      throw new Error(CircuitError.EmptyClaimNonRevProof);
    }

    if (!this.signature) {
      throw new Error(CircuitError.EmptyChallengeSignature);
    }

    const s: Partial<AtomicQueryMTPCircuitInputs> = {
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
      issuerClaimClaimsTreeRoot: this.claim.incProof?.treeState?.claimsRoot.bigInt().toString(),
      issuerClaimIdenState: this.claim.incProof.treeState?.state.bigInt().toString(),
      issuerClaimMtp: prepareSiblingsStr(
        this.claim.incProof.proof.allSiblings(),
        this.getMTLevel()
      ),
      issuerClaimRevTreeRoot: this.claim.incProof.treeState?.revocationRoot.bigInt().toString(),
      issuerClaimRootsTreeRoot: this.claim.incProof.treeState?.rootOfRoots.bigInt().toString(),
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
      issuerID: this.claim.issuerID?.bigInt().toString(),
      operator: this.query.operator,
      slotIndex: this.query.slotIndex,
      timestamp: this.currentTimeStamp.toString()
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

    return new TextEncoder().encode(JSON.stringify(s));
  }
}

// stateTransitionInputsInternal type represents credentialAtomicQueryMTP.circom private inputs required by prover
interface AtomicQueryMTPCircuitInputs {
  userAuthClaim?: string[];
  userAuthClaimMtp: string[];
  userAuthClaimNonRevMtp: string[];
  userAuthClaimNonRevMtpAuxHi?: string;
  userAuthClaimNonRevMtpAuxHv?: string;
  userAuthClaimNonRevMtpNoAux?: string;
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
  issuerClaimClaimsTreeRoot?: string;
  issuerClaimIdenState?: string;
  issuerClaimMtp: string[];
  issuerClaimRevTreeRoot?: string;
  issuerClaimRootsTreeRoot?: string;
  issuerClaimNonRevClaimsTreeRoot?: string;
  issuerClaimNonRevRevTreeRoot?: string;
  issuerClaimNonRevRootsTreeRoot?: string;
  issuerClaimNonRevState?: string;
  issuerClaimNonRevMtp: string[];
  issuerClaimNonRevMtpAuxHi?: string;
  issuerClaimNonRevMtpAuxHv?: string;
  issuerClaimNonRevMtpNoAux?: string;
  claimSchema: string;
  issuerID?: string;
  operator: number;
  slotIndex: number;
  timestamp: string;
  value?: string[];
}

// AtomicQueryMTPPubSignals public signals
export class AtomicQueryMTPPubSignals extends BaseConfig {
  userID?: Id;
  userState?: Hash;
  challenge?: bigint;
  claimSchema: SchemaHash;
  issuerClaimIdenState?: Hash;
  issuerClaimNonRevState?: Hash;
  issuerID?: Id;
  slotIndex: number;
  values: bigint[] = [];
  operator: number;
  timestamp: number;

  // PubSignalsUnmarshal unmarshal credentialAtomicQueryMTP.circom public signals array to AtomicQueryMTPPubSignals
  pubSignalsUnmarshal(data: Uint8Array): AtomicQueryMTPPubSignals {
    // 10 is a number of fields in AtomicQueryMTPPubSignals before values, values is last element in the proof and
    // it is length could be different base on the circuit configuration. The length could be modified by set value
    // in ValueArraySize
    const fieldLength = 10;

    const sVals: string[] = JSON.parse(new TextDecoder().decode(data));
    // console.log('sVals', sVals, sVals.length, typeof sVals);
    if (sVals.length !== fieldLength + this.getValueArrSize()) {
      throw new Error(
        `invalid number of Output values expected ${fieldLength + this.getValueArrSize()} got ${
          sVals.length
        }`
      );
    }

    this.userID = Id.fromBigInt(BigInt(sVals[0]));

    this.userState = newHashFromString(sVals[1]);

    this.challenge = BigInt(sVals[2]);

    this.issuerClaimIdenState = newHashFromString(sVals[3]);

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
