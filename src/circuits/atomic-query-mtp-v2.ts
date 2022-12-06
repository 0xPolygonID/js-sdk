import { newHashFromString, Proof } from '@iden3/js-merkletree';
import { Id, SchemaHash } from '@iden3/js-iden3-core';
import { Query, ClaimWithMTPProof, ValueProof, CircuitError } from './models';
import { Hash } from '@iden3/js-merkletree';
import {
  BaseConfig,
  bigIntArrayToStringArray,
  circomSiblings,
  existenceToInt,
  getNodeAuxValue,
  prepareCircuitArrayValues
} from './common';
import { Signature } from '@iden3/js-crypto';

// AtomicQueryMTPInputs ZK private inputs for credentialAtomicQueryMTP.circom
export class AtomicQueryMTPV2Inputs extends BaseConfig {
  // auth
  id: Id;
  nonce: bigint;
  claimSubjectProfileNonce: bigint;
  // claim issued for user
  claim: ClaimWithMTPProof;
  requestID: bigint;

  currentTimeStamp: number;

  // query
  query: Query;

  validate(): void {
    if (!this.requestID) {
      throw new Error(CircuitError.EmptyRequestID);
    }
  }

  inputsMarshal(): Uint8Array {
    this.validate();
    if (this.query.valueProof) {
      this.query.validate();
      this.query.valueProof.validate();
    }

    const valueProof = this.query.valueProof ?? new ValueProof();

    const s: Partial<AtomicQueryMTPV2CircuitInputs> = {
      requestID: this.requestID.toString(),
      userGenesisID: this.id.bigInt().toString(),
      nonce: this.nonce.toString(),
      claimSubjectProfileNonce: this.claimSubjectProfileNonce.toString(),
      issuerID: this.claim.issuerID?.bigInt().toString(),
      issuerClaim: this.claim.claim.marshalJson(),
      issuerClaimMtp: circomSiblings(this.claim.incProof.proof, this.getMTLevel()).map((s) =>
        s.bigInt().toString()
      ),
      issuerClaimClaimsTreeRoot: this.claim.incProof.treeState?.claimsRoot.bigInt().toString(),
      issuerClaimRevTreeRoot: this.claim.incProof.treeState?.revocationRoot.bigInt().toString(),
      issuerClaimRootsTreeRoot: this.claim.incProof.treeState?.rootOfRoots.bigInt().toString(),
      issuerClaimIdenState: this.claim.incProof.treeState?.state.bigInt().toString(),
      issuerClaimNonRevMtp: circomSiblings(this.claim.nonRevProof.proof, this.getMTLevel()).map(
        (s) => s.bigInt().toString()
      ),
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
      claimSchema: this.claim.claim.getSchemaHash().bigInt().toString(),
      claimPathMtp: circomSiblings(valueProof.mtp, this.getMTLevel()).map((s) =>
        s.bigInt().toString()
      ),
      claimPathValue: valueProof.value.toString(),
      operator: this.query.operator,
      slotIndex: this.query.slotIndex,
      timestamp: this.currentTimeStamp
    };

    const nodeAux = getNodeAuxValue(this.claim.nonRevProof.proof);
    s.issuerClaimNonRevMtpAuxHi = nodeAux.key.bigInt().toString();
    s.issuerClaimNonRevMtpAuxHv = nodeAux.value.bigInt().toString();
    s.issuerClaimNonRevMtpNoAux = nodeAux.noAux;

    s.claimPathNotExists = existenceToInt(valueProof.mtp.existence);
    const nodAuxJSONLD = getNodeAuxValue(valueProof.mtp);
    s.claimPathMtpNoAux = nodAuxJSONLD.noAux;
    s.claimPathMtpAuxHi = nodAuxJSONLD.key.bigInt().toString();
    s.claimPathMtpAuxHv = nodAuxJSONLD.value.bigInt().toString();

    s.claimPathKey = valueProof.path.toString();

    const values = prepareCircuitArrayValues(this.query.values, this.getValueArrSize());

    s.value = bigIntArrayToStringArray(values);

    return new TextEncoder().encode(JSON.stringify(s));
  }
}

// stateTransitionInputsInternal type represents credentialAtomicQueryMTP.circom private inputs required by prover
interface AtomicQueryMTPV2CircuitInputs {
  requestID: string;
  userGenesisID: string;
  nonce: string;
  claimSubjectProfileNonce: string;
  issuerID: string;
  issuerClaim?: string[];
  issuerClaimMtp: string[];
  issuerClaimClaimsTreeRoot?: string;
  issuerClaimRevTreeRoot?: string;
  issuerClaimRootsTreeRoot?: string;
  issuerClaimIdenState?: string;
  issuerClaimNonRevClaimsTreeRoot?: string;
  issuerClaimNonRevRevTreeRoot?: string;
  issuerClaimNonRevRootsTreeRoot?: string;
  issuerClaimNonRevState?: string;
  issuerClaimNonRevMtp: string[];
  issuerClaimNonRevMtpAuxHi?: string;
  issuerClaimNonRevMtpAuxHv?: string;
  issuerClaimNonRevMtpNoAux: string;
  claimSchema: string;
  claimPathNotExists: number;
  claimPathMtp: string[];
  claimPathMtpNoAux: string;
  claimPathMtpAuxHi?: string;
  claimPathMtpAuxHv?: string;
  claimPathKey: string;
  claimPathValue: string;
  operator: number;
  slotIndex: number;
  timestamp: number;
  value: string[];
}

// AtomicQueryMTPPubSignals public signals
export class AtomicQueryMTPV2PubSignals extends BaseConfig {
  requestID?: bigint;
  userID?: Id;
  issuerID?: Id;
  issuerClaimIdenState?: Hash;
  issuerClaimNonRevState?: Hash;
  claimSchema: SchemaHash;
  slotIndex: number;
  operator: number;
  value: bigint[];
  timestamp: number;
  merklized: number;
  claimPathKey?: bigint;
  claimPathNotExists: number;

  // PubSignalsUnmarshal unmarshal credentialAtomicQueryMTP.circom public signals array to AtomicQueryMTPPubSignals
  pubSignalsUnmarshal(data: Uint8Array): AtomicQueryMTPV2PubSignals {
    // expected order:
    // merklized
    // userID
    // requestID
    // issuerID
    // issuerClaimIdenState
    // issuerClaimNonRevState
    // timestamp
    // claimSchema
    // claimPathNotExists
    // claimPathKey
    // slotIndex
    // operator
    // value

    // 12 is a number of fields in AtomicQueryMTPV2PubSignals before values, values is last element in the proof and
    // it is length could be different base on the circuit configuration. The length could be modified by set value
    // in ValueArraySize
    const fieldLength = 12;

    const sVals: string[] = JSON.parse(new TextDecoder().decode(data));

    if (sVals.length !== fieldLength + this.getValueArrSize()) {
      throw new Error(
        `invalid number of Output values expected ${fieldLength + this.getValueArrSize()} got ${
          sVals.length
        }`
      );
    }

    let fieldIdx = 0;

    // -- merklized
    this.merklized = parseInt(sVals[fieldIdx]);
    fieldIdx++;

    //  - userID
    this.userID = Id.fromString(sVals[fieldIdx]);
    fieldIdx++;

    // - requestID
    this.requestID = BigInt(sVals[fieldIdx]);
    fieldIdx++;

    // - issuerID
    this.issuerID = Id.fromString(sVals[fieldIdx]);
    fieldIdx++;

    // - issuerClaimIdenState
    this.issuerClaimIdenState = newHashFromString(sVals[fieldIdx]);
    fieldIdx++;

    // - issuerClaimNonRevState
    this.issuerClaimNonRevState = newHashFromString(sVals[fieldIdx]);
    fieldIdx++;

    //  - timestamp
    this.timestamp = parseInt(sVals[fieldIdx]);
    fieldIdx++;

    //  - claimSchema
    this.claimSchema = SchemaHash.newSchemaHashFromInt(BigInt(sVals[fieldIdx]));
    fieldIdx++;

    // - ClaimPathNotExists
    this.claimPathNotExists = parseInt(sVals[fieldIdx]);
    fieldIdx++;

    // - ClaimPathKey
    this.claimPathKey = BigInt(sVals[fieldIdx]);
    fieldIdx++;

    // - slotIndex
    this.slotIndex = parseInt(sVals[fieldIdx]);
    fieldIdx++;

    // - operator
    this.operator = parseInt(sVals[fieldIdx]);
    fieldIdx++;

    //  - values
    for (let index = 0; index < this.getValueArrSize(); index++) {
      this.value.push(BigInt(sVals[fieldIdx]));
      fieldIdx++;
    }

    return this;
  }
}
