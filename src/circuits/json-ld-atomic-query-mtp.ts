import { Claim, Id, SchemaHash } from '@iden3/js-iden3-core';
import { Hash, ZERO_HASH, newHashFromString } from '@iden3/js-merkletree';
import { Signature } from '../identity/bjj/eddsa-babyjub';
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
  async inputsMarshal(): Promise<Uint8Array> {
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
      userAuthClaim: this.authClaim.claim,
      userAuthClaimMtp: prepareSiblingsStr(
        await this.authClaim.incProof.proof.allSiblings(),
        this.getMTLevel()
      ),
      userAuthClaimNonRevMtp: prepareSiblingsStr(
        await this.authClaim.nonRevProof.proof.allSiblings(),
        this.getMTLevel()
      ),
      challenge: this.challenge.toString(),
      challengeSignatureR8x: this.signature.r8[0].toString(),
      challengeSignatureR8y: this.signature.r8[1].toString(),
      challengeSignatureS: this.signature.s.toString(),
      issuerClaim: this.claim.claim,
      issuerClaimMtp: prepareSiblingsStr(
        await this.claim.incProof.proof.allSiblings(),
        this.getMTLevel()
      ),
      issuerClaimIdenState: this.claim.incProof.treeState.state,
      issuerClaimClaimsTreeRoot: this.claim.incProof.treeState.claimsRoot,
      issuerClaimRevTreeRoot: this.claim.incProof.treeState.revocationRoot,
      issuerClaimRootsTreeRoot: this.claim.incProof.treeState.rootOfRoots,
      issuerClaimNonRevClaimsTreeRoot: this.claim.nonRevProof.treeState.claimsRoot,
      issuerClaimNonRevRevTreeRoot: this.claim.nonRevProof.treeState.revocationRoot,
      issuerClaimNonRevRootsTreeRoot: this.claim.nonRevProof.treeState.rootOfRoots,
      issuerClaimNonRevState: this.claim.nonRevProof.treeState.state,
      issuerClaimNonRevMtp: prepareSiblingsStr(
        await this.claim.nonRevProof.proof.allSiblings(),
        this.getMTLevel()
      ),
      claimSchema: this.claim.claim.getSchemaHash().bigInt().toString(),
      userClaimsTreeRoot: this.authClaim.incProof.treeState.claimsRoot,
      userState: this.authClaim.incProof.treeState.state,
      userRevTreeRoot: this.authClaim.incProof.treeState.revocationRoot,
      userRootsTreeRoot: this.authClaim.incProof.treeState.rootOfRoots,
      userId: this.id.bigInt().toString(),
      issuerId: this.claim.issuerId.bigInt().toString(),
      claimPathNotExists: claimPathNotExists,
      claimPathMtp: prepareSiblingsStr(
        await (this.query.valueProof ?? new ValueProof()).mtp.allSiblings(),
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

interface JsonLDatomicQueryMTPCircuitInputs extends BaseConfig {
  userAuthClaim: Claim;
  userAuthClaimMtp: string[];
  userAuthClaimNonRevMtp: string[];
  userAuthClaimNonRevMtpAuxHi: Hash;
  userAuthClaimNonRevMtpAuxHv: Hash;
  userAuthClaimNonRevMtpNoAux: string;
  userClaimsTreeRoot: Hash;
  userState: Hash;
  userRevTreeRoot: Hash;
  userRootsTreeRoot: Hash;
  userId: string;
  challenge: string;
  challengeSignatureR8x: string;
  challengeSignatureR8y: string;
  challengeSignatureS: string;
  issuerClaim: Claim;
  issuerClaimClaimsTreeRoot: Hash;
  issuerClaimIdenState: Hash;
  issuerClaimMtp: string[];
  issuerClaimRevTreeRoot: Hash;
  issuerClaimRootsTreeRoot: Hash;
  issuerClaimNonRevClaimsTreeRoot: Hash;
  issuerClaimNonRevRevTreeRoot: Hash;
  issuerClaimNonRevRootsTreeRoot: Hash;
  issuerClaimNonRevState: Hash;
  issuerClaimNonRevMtp: string[];
  issuerClaimNonRevMtpAuxHi: Hash;
  issuerClaimNonRevMtpAuxHv: Hash;
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
  userId: Id;
  userState: Hash;
  challenge: bigint;
  claimSchema: SchemaHash;
  issuerClaimIdenState: Hash;
  issuerClaimNonRevState: Hash;
  issuerId: Id;
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
    this.userId = Id.fromBigInt(BigInt(sVals[fieldIdx]));
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
    this.issuerId = Id.fromBigInt(BigInt(sVals[fieldIdx]));
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
