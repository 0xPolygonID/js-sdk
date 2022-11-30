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
      challengeSignatureR8X: this.signature.R8[0].toString(),
      challengeSignatureR8Y: this.signature.R8[1].toString(),
      challengeSignatureS: this.signature.S.toString(),
      issuerClaim: this.claim.claim,
      issuerClaimClaimsTreeRoot: this.claim.incProof.treeState.claimsRoot,
      issuerClaimIdenState: this.claim.incProof.treeState.state,
      issuerClaimMtp: prepareSiblingsStr(
        this.claim.incProof.proof.allSiblings(),
        this.getMTLevel()
      ),
      issuerClaimRevTreeRoot: this.claim.incProof.treeState.revocationRoot,
      issuerClaimRootsTreeRoot: this.claim.incProof.treeState.rootOfRoots,
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
      userId: this.id.bigInt().toString(),
      issuerId: this.claim.issuerId?.bigInt().toString(),
      operator: this.query.operator,
      slotIndex: this.query.slotIndex,
      timestamp: this.currentTimeStamp
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

    return new TextEncoder().encode(JSON.stringify(s));
  }
}

// stateTransitionInputsInternal type represents credentialAtomicQueryMTP.circom private inputs required by prover
interface AtomicQueryMTPCircuitInputs {
  userAuthClaim?: CoreClaim;
  userAuthClaimMtp: string[];
  userAuthClaimNonRevMtp: string[];
  userAuthClaimNonRevMtpAuxHi?: Hash;
  userAuthClaimNonRevMtpAuxHv?: Hash;
  userAuthClaimNonRevMtpNoAux?: string;
  userClaimsTreeRoot?: Hash;
  userState?: Hash;
  userRevTreeRoot?: Hash;
  userRootsTreeRoot?: Hash;
  userID: string;
  challenge: string;
  challengeSignatureR8X: string;
  challengeSignatureR8Y: string;
  challengeSignatureS: string;
  issuerClaim?: CoreClaim;
  issuerClaimClaimsTreeRoot?: Hash;
  issuerClaimIdenState?: Hash;
  issuerClaimMtp: string[];
  issuerClaimRevTreeRoot?: Hash;
  issuerClaimRootsTreeRoot?: Hash;
  issuerClaimNonRevClaimsTreeRoot?: Hash;
  issuerClaimNonRevRevTreeRoot?: Hash;
  issuerClaimNonRevRootsTreeRoot?: Hash;
  issuerClaimNonRevState?: Hash;
  issuerClaimNonRevMtp: string[];
  issuerClaimNonRevMtpAuxHi?: Hash;
  issuerClaimNonRevMtpAuxHv?: Hash;
  issuerClaimNonRevMtpNoAux?: string;
  claimSchema: string;
  issuerId?: string;
  operator: number;
  slotIndex: number;
  timestamp: number;
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
