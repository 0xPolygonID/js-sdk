import { Signature } from '@iden3/js-crypto';
import { Id, SchemaHash } from '@iden3/js-iden3-core';
import { Hash, ZERO_HASH, newHashFromString } from '@iden3/js-merkletree';
import {
  BaseConfig,
  bigIntArrayToStringArray,
  getNodeAuxValue,
  NodeAuxValue,
  prepareCircuitArrayValues,
  prepareSiblingsStr
} from './common';
import { CircuitError, ClaimWithMTPProof, Query, ValueProof } from './models';

export class JsonLDAtomicQueryMTPInputs extends BaseConfig {
  id: Id;
  authClaim: ClaimWithMTPProof;
  challenge: bigint;
  signature: Signature;
  claim: ClaimWithMTPProof;
  currentTimeStamp: number;
  query: Query;

  //   InputsMarshal returns Circom private inputs for credentialJsonLDAtomicQueryMTP.circom
  inputsMarshal(): Uint8Array {
    if (!this.authClaim.incProof.proof) {
      throw new Error(CircuitError.EmptyAuthClaimProof);
    }

    if (!this.authClaim.nonRevProof.proof) {
      throw new Error(CircuitError.EmptyAuthClaimNonRevProof);
    }

    if (!this.claim.incProof.proof) {
      throw new Error(CircuitError.EmptyClaimProof);
    }

    if (!this.claim.nonRevProof.proof) {
      throw new Error(CircuitError.EmptyClaimNonRevProof);
    }

    if (!this.signature) {
      throw new Error(CircuitError.EmptyChallengeSignature);
    }

    this.query.validate();

    let claimPathNodeAuxValue: NodeAuxValue = {
      key: ZERO_HASH,
      value: ZERO_HASH,
      noAux: '0'
    };
    let claimPathNotExists;
    if (this.query.valueProof?.mtp.existence) {
      claimPathNotExists = 0;
    } else {
      claimPathNotExists = 1;
      claimPathNodeAuxValue = getNodeAuxValue(this.query.valueProof?.mtp);
    }

    const queryPathKey = this.query.valueProof?.path.mtEntry();

    const s: Partial<JsonLDatomicQueryMTPCircuitInputs> = {
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
      issuerClaimMtp: prepareSiblingsStr(
        this.claim.incProof.proof.allSiblings(),
        this.getMTLevel()
      ),
      issuerClaimIdenState: this.claim.incProof.treeState?.state.bigInt().toString(),
      issuerClaimClaimsTreeRoot: this.claim.incProof.treeState?.claimsRoot.bigInt().toString(),
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
      userId: this.id.bigInt().toString(),
      issuerId: this.claim.issuerID?.bigInt().toString(),
      claimPathNotExists: claimPathNotExists,
      claimPathMtp: prepareSiblingsStr(
        (this.query.valueProof ?? new ValueProof()).mtp.allSiblings(),
        this.getMTLevel()
      ),
      claimPathMtpNoAux: claimPathNodeAuxValue.noAux,
      claimPathMtpAuxHi: claimPathNodeAuxValue.key,
      claimPathMtpAuxHv: claimPathNodeAuxValue.value,
      claimPathKey: queryPathKey.totoString(),
      claimPathValue: this.query.valueProof?.value.toString(10),
      operator: this.query.operator,
      timestamp: this.currentTimeStamp
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

interface JsonLDatomicQueryMTPCircuitInputs extends BaseConfig {
  userAuthClaim: string[];
  userAuthClaimMtp: string[];
  userAuthClaimNonRevMtp: string[];
  userAuthClaimNonRevMtpAuxHi: string;
  userAuthClaimNonRevMtpAuxHv: string;
  userAuthClaimNonRevMtpNoAux: string;
  userClaimsTreeRoot: string;
  userState: string;
  userRevTreeRoot: string;
  userRootsTreeRoot: string;
  userId: string;
  challenge: string;
  challengeSignatureR8x: string;
  challengeSignatureR8y: string;
  challengeSignatureS: string;
  issuerClaim: string[];
  issuerClaimClaimsTreeRoot: string;
  issuerClaimIdenState: string;
  issuerClaimMtp: string[];
  issuerClaimRevTreeRoot: string;
  issuerClaimRootsTreeRoot: string;
  issuerClaimNonRevClaimsTreeRoot: string;
  issuerClaimNonRevRevTreeRoot: string;
  issuerClaimNonRevRootsTreeRoot: string;
  issuerClaimNonRevState: string;
  issuerClaimNonRevMtp: string[];
  issuerClaimNonRevMtpAuxHi: string;
  issuerClaimNonRevMtpAuxHv: string;
  issuerClaimNonRevMtpNoAux: string;
  claimSchema: string;
  issuerId: string;
  claimPathNotExists: number;
  claimPathMtp: string[];
  claimPathMtpNoAux: string;
  claimPathMtpAuxHi: Hash;
  claimPathMtpAuxHv: Hash;
  claimPathKey: string;
  claimPathValue: string;
  operator: number;
  timestamp: number;
  value: string[];
}

export class JsonLDAtomicQueryMTPPubSignals extends BaseConfig {
  userID: Id;
  userState: Hash;
  challenge: bigint;
  claimSchema: SchemaHash;
  issuerClaimIdenState: Hash;
  issuerClaimNonRevState: Hash;
  issuerID: Id;
  claimPathKey: Hash;
  values: bigint[];
  operator: number;
  timestamp: number;

  // PubSignalsUnmarshal unmarshal credentialJsonLDAtomicQueryMTP.circom public
  // signals array to JsonLDAtomicQueryMTPPubSignals
  pubSignalsUnmarshal(data: Uint8Array): JsonLDAtomicQueryMTPPubSignals {
    // expected order:
    //userID
    //userState
    //challenge
    //issuerID
    //timestamp
    //claimSchema
    //claimPathKey
    //operator
    //value
    //  - issuerClaimIdenState
    //  - issuerID
    //  - issuerClaimNonRevState
    //  - timestamp
    //  - claimSchema
    //  - claimPathKey
    //  - operator
    //  - values

    // 10 is a number of fields in AtomicQueryMTPPubSignals before values, values is last element in the proof and
    // it is length could be dif(ferent base on the circuit configuration. The length could be modif(ied by set) value
    // in ValueArraySize
    const fieldLength = 10;

    const sVals: string = JSON.parse(new TextDecoder().decode(data));

    if (sVals.length !== fieldLength + this.getValueArrSize()) {
      throw new Error(
        `invalid number of Output values expected ${fieldLength + this.getValueArrSize()} got ${
          sVals.length
        }`
      );
    }

    let fieldIdx = 0;
    //  - userID
    this.userID = Id.fromBigInt(BigInt(sVals[fieldIdx]));
    fieldIdx++;

    //  - userState
    this.userState = newHashFromString(sVals[fieldIdx]);
    fieldIdx++;

    //  - challenge
    this.challenge = BigInt(sVals[fieldIdx]);
    fieldIdx++;

    //  - issuerClaimIdenState
    this.issuerClaimIdenState = newHashFromString(sVals[fieldIdx]);
    fieldIdx++;

    //  - issuerID
    this.issuerID = Id.fromBigInt(BigInt(sVals[fieldIdx]));
    fieldIdx++;

    //  - issuerClaimNonRevState
    this.issuerClaimNonRevState = newHashFromString(sVals[fieldIdx]);
    fieldIdx++;

    //  - timestamp
    this.timestamp = parseInt(sVals[fieldIdx]);
    fieldIdx++;

    //  - claimSchema
    this.claimSchema = SchemaHash.newSchemaHashFromInt(BigInt(sVals[fieldIdx]));
    fieldIdx++;

    //  - claimPathKey
    this.claimPathKey = newHashFromString(sVals[fieldIdx]);
    fieldIdx++;

    //  - operator
    this.operator = parseInt(sVals[fieldIdx]);
    fieldIdx++;

    //  - values
    const valuesNum = this.getValueArrSize();
    for (let i = 0; i < valuesNum; i++) {
      const bi = BigInt(sVals[fieldIdx]);
      this.values.push(bi);
      fieldIdx++;
    }

    return this;
  }
}
