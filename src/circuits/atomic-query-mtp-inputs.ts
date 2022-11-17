import { newHashFromString, ZERO_HASH } from '@iden3/js-merkletree';
import { Claim as CoreClaim, Id, SchemaHash } from '@iden3/js-iden3-core';
import { Query, CircuitClaim } from './models';
import { Signature } from '../identity/bjj/eddsa-babyjub';
import { Hash } from '@iden3/js-merkletree';
import { NodeAux } from '@iden3/js-merkletree/dist/cjs/types/types/merkletree';
import {
  BaseConfig,
  bigIntArrayToStringArray,
  ErrorEmptyAuthClaimNonRevProof,
  ErrorEmptyAuthClaimProof,
  ErrorEmptyChallengeSignature,
  ErrorEmptyClaimNonRevProof,
  ErrorEmptyClaimProof,
  prepareCircuitArrayValues,
  prepareSiblingsStr
} from './common';

// AtomicQueryMTPInputs ZK private inputs for credentialAtomicQueryMTP.circom
export class AtomicQueryMTPInputs extends BaseConfig {
  // auth
  id: Id;
  authClaim: CircuitClaim;
  challenge: bigint;
  signature: Signature;

  // claim issued for user
  claim: CircuitClaim;

  currentTimeStamp: number;

  // query
  query: Query;

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

    if (!this.claim.nonRevProof?.proof) {
      throw new Error(ErrorEmptyClaimNonRevProof);
    }

    if (!this.signature) {
      throw new Error(ErrorEmptyChallengeSignature);
    }

    const s: AtomicQueryMTPCircuitInputs = {
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
      challengeSignatureR8X: this.signature.r8[0].toString(),
      challengeSignatureR8Y: this.signature.r8[1].toString(),
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
      userState: this.authClaim.treeState.state,
      userRevTreeRoot: this.authClaim.treeState.revocationRoot,
      userRootsTreeRoot: this.authClaim.treeState.rootOfRoots,
      userID: this.id.bigInt().toString(),
      issuerID: this.claim.issuerId.bigInt().toString(),
      operator: this.query.operator,
      slotIndex: this.query.slotIndex,
      timestamp: this.currentTimeStamp
    };

    const values = prepareCircuitArrayValues(this.query.values, this.getValueArrSize());

    s.value = bigIntArrayToStringArray(values);

    const nodeAuxAuth = getNodeAuxValue(this.authClaim.nonRevProof.proof?.nodeAux);
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
  issuerID: string;
  operator: number;
  slotIndex: number;
  timestamp: number;
  value?: string[];
}

interface NodeAuxValue {
  key: Hash;
  value: Hash;
  noAux: string;
}

export function getNodeAuxValue(a: NodeAux | undefined): NodeAuxValue {
  const aux: NodeAuxValue = {
    key: ZERO_HASH,
    value: ZERO_HASH,
    noAux: '1'
  };

  if (a?.value && a?.key) {
    aux.key = a.key;
    aux.value = a.value;
    aux.noAux = '0';
  }

  return aux;
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
