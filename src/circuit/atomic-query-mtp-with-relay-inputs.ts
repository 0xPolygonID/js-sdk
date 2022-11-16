import { Id, Claim as CoreClaim, SchemaHash } from '@iden3/js-iden3-core';
import { Hash, newHashFromString } from '@iden3/js-merkletree';
import { Signature } from '../identity/bjj/eddsa-babyjub';
import { getNodeAuxValue } from './atomic-query-mtp-inputs';
import {
  BaseConfig,
  bigIntArrayToStringArray,
  ErrorEmptyAuthClaimNonRevProof,
  ErrorEmptyAuthClaimProof,
  ErrorEmptyChallengeSignature,
  ErrorEmptyClaimNonRevProof,
  ErrorEmptyClaimProof,
  ErrorUserStateInRelayClaimProof,
  prepareCircuitArrayValues,
  prepareSiblings,
  prepareSiblingsStr
} from './common';
import { CircuitClaim, Query } from './models';

// AtomicQueryMTPWithRelayInputs ZK private inputs for credentialAtomicQueryMTPWithRelay.circom
export class AtomicQueryMTPWithRelayInputs extends BaseConfig {
  // auth
  id: Id;
  authClaim: CircuitClaim;
  challenge: bigint;
  signature: Signature;

  // relay
  userStateInRelayClaim: CircuitClaim;

  // claim
  claim: CircuitClaim;

  currentTimeStamp: number;

  // query
  query: Query;

  // InputsMarshal returns Circom private inputs for credentialAtomicQueryMTPWithRelay.circom
  async inputsMarshal(): Promise<Uint8Array> {
    if (!this.authClaim.proof) {
      throw new Error(ErrorEmptyAuthClaimProof);
    }

    if (!this.authClaim.nonRevProof || !this.authClaim.nonRevProof.proof) {
      throw new Error(ErrorEmptyAuthClaimNonRevProof);
    }

    if (!this.claim.proof) {
      throw new Error(ErrorEmptyClaimProof);
    }

    if (!this.claim.nonRevProof || !this.claim.nonRevProof.proof) {
      throw new Error(ErrorEmptyClaimNonRevProof);
    }

    if (!this.userStateInRelayClaim.proof) {
      throw new Error(ErrorUserStateInRelayClaimProof);
    }

    if (!this.signature) {
      throw new Error(ErrorEmptyChallengeSignature);
    }

    const s: Partial<AtomicQueryMTPWithRelayCircuitInputs> = {
      userAuthClaim: this.authClaim.claim,
      userAuthClaimMtp: prepareSiblingsStr(
        await this.authClaim.proof.allSiblings(),
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
      issuerClaimClaimsTreeRoot: this.claim.treeState.claimsRoot,
      issuerClaimIdenState: this.claim.treeState.state,
      issuerClaimMtp: prepareSiblingsStr(await this.claim.proof.allSiblings(), this.getMTLevel()),
      issuerClaimRevTreeRoot: this.claim.treeState.revocationRoot,
      issuerClaimRootsTreeRoot: this.claim.treeState.rootOfRoots,
      issuerClaimNonRevClaimsTreeRoot: this.claim.nonRevProof.treeState.claimsRoot,
      issuerClaimNonRevRevTreeRoot: this.claim.nonRevProof.treeState.revocationRoot,
      issuerClaimNonRevRootsTreeRoot: this.claim.nonRevProof.treeState.rootOfRoots,
      issuerClaimNonRevState: this.claim.nonRevProof.treeState.state,
      issuerClaimNonRevMtp: prepareSiblingsStr(
        await this.claim.nonRevProof.proof.allSiblings(),
        this.getMTLevel()
      ),
      claimSchema: this.claim.claim.getSchemaHash().bigInt().toString(),
      userClaimsTreeRoot: this.authClaim.treeState.claimsRoot,
      userRevTreeRoot: this.authClaim.treeState.revocationRoot,
      userRootsTreeRoot: this.authClaim.treeState.rootOfRoots,
      userID: this.id.bigInt().toString(),
      issuerID: this.claim.issuerId.bigInt().toString(),
      operator: this.query.operator,
      slotIndex: this.query.slotIndex,
      timestamp: this.currentTimeStamp,

      relayProofValidClaimsTreeRoot: this.userStateInRelayClaim.treeState.claimsRoot,
      relayProofValidRevTreeRoot: this.userStateInRelayClaim.treeState.revocationRoot,
      relayProofValidRootsTreeRoot: this.userStateInRelayClaim.treeState.rootOfRoots,
      relayState: this.userStateInRelayClaim.treeState.state,
      userStateInRelayClaim: this.userStateInRelayClaim.claim,
      userStateInRelayClaimMtp: bigIntArrayToStringArray(
        prepareSiblings(await this.userStateInRelayClaim.proof.allSiblings(), this.getMTLevel())
      )
    };

    const values = prepareCircuitArrayValues(this.query.values, this.getValueArrSize());

    s.value = bigIntArrayToStringArray(values);

    const nodeAuxAuth = getNodeAuxValue(this.authClaim.nonRevProof.proof.nodeAux);
    s.userAuthClaimNonRevMtpAuxHi = nodeAuxAuth.key;
    s.userAuthClaimNonRevMtpAuxHv = nodeAuxAuth.value;
    s.userAuthClaimNonRevMtpNoAux = nodeAuxAuth.noAux;

    const nodeAux = getNodeAuxValue(this.claim.nonRevProof.proof.nodeAux);
    s.issuerClaimNonRevMtpAuxHi = nodeAux.key;
    s.issuerClaimNonRevMtpAuxHv = nodeAux.value;
    s.issuerClaimNonRevMtpNoAux = nodeAux.noAux;

    return new TextEncoder().encode(JSON.stringify(s));
  }
}

// atomicQueryMTPWithRelayCircuitInputs export interface represents credentialAtomicQueryMTPWithRelay.circom
declare interface AtomicQueryMTPWithRelayCircuitInputs {
  userAuthClaim?: CoreClaim;
  userAuthClaimMtp: string[];
  userAuthClaimNonRevMtp: string[];
  userAuthClaimNonRevMtpAuxHi?: Hash;
  userAuthClaimNonRevMtpAuxHv?: Hash;
  userAuthClaimNonRevMtpNoAux: string;
  userClaimsTreeRoot?: Hash;
  userRevTreeRoot?: Hash;
  userRootsTreeRoot?: Hash;
  userID: string;
  challenge: string;
  challengeSignatureR8x: string;
  challengeSignatureR8y: string;
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
  issuerClaimNonRevMtpNoAux: string;
  claimSchema: string;
  issuerID: string;
  operator: number;
  slotIndex: number;
  timestamp: number;
  value: string[];
  relayProofValidClaimsTreeRoot?: Hash;
  relayProofValidRevTreeRoot?: Hash;
  relayProofValidRootsTreeRoot?: Hash;
  relayState?: Hash;
  userStateInRelayClaim?: CoreClaim;
  userStateInRelayClaimMtp: string[];
}

// AtomicQueryMTPWithRelayPubSignals public signals
export class AtomicQueryMTPWithRelayPubSignals extends BaseConfig {
  userID: Id;
  relayState: Hash;
  challenge: bigint;
  claimSchema: SchemaHash;
  slotIndex: number;
  operator: number;
  values: bigint[] = [];
  timestamp: number;
  issuerID: Id;

  // PubSignalsUnmarshal unmarshal credentialAtomicQueryMTPWithRelay.circom public signals
  pubSignalsUnmarshal(data: Uint8Array): AtomicQueryMTPWithRelayPubSignals {
    // 8 is a number of fields in AtomicQueryMTPWithRelayPubSignals before values, values is last element in the proof and
    // it is length could be dif(ferent base on the circuit configuration. The length could be modif(ied by set valu)e
    // in ValueArraySize
    const fieldLength = 8;
    const sVals: string[] = JSON.parse(new TextDecoder().decode(data));

    if (sVals.length !== fieldLength + this.getValueArrSize()) {
      throw new Error(`invalid number of Output values expected 9 got ${sVals.length}`);
    }
    // todo: convert json to userId intead of userID
    this.userID = Id.fromBigInt(BigInt(sVals[0]));

    this.relayState = newHashFromString(sVals[1]);

    this.challenge = BigInt(sVals[2]);

    this.issuerID = Id.fromBigInt(BigInt(sVals[3]));

    this.timestamp = parseInt(sVals[4]);

    this.claimSchema = SchemaHash.newSchemaHashFromInt(BigInt(sVals[5]));

    this.slotIndex = parseInt(sVals[6]);

    this.operator = parseInt(sVals[7]);

    sVals.slice(fieldLength, fieldLength + this.getValueArrSize()).forEach((v) => {
      this.values.push(BigInt(v));
    });

    return this;
  }

  // todo: skip for now
  // // GetObjMap returns struct field as a map
  // getObjMap(): map[string]interface{} {
  // 	return toMap(ao)
  // }
}
