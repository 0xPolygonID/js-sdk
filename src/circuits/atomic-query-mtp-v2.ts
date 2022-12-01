import { newHashFromString, Proof } from '@iden3/js-merkletree';
import { Claim as CoreClaim, Id, SchemaHash } from '@iden3/js-iden3-core';
import { Query, ClaimWithMTPProof, ValueProof } from './models';
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
  claimSubjectProfileNonce: bigint;
  nonce: bigint;
  signature: Signature;

  // claim issued for user
  claim: ClaimWithMTPProof;

  currentTimeStamp: number;

  // query
  query: Query;

  inputsMarshal(): Uint8Array {
    let queryPathKey = BigInt(0);
    if (this.query.valueProof) {
      this.query.valueProof.validate();
      queryPathKey = this.query.valueProof.path.mtEntry();
    }

    let valueProof = this.query.valueProof;
    if (!valueProof) {
      valueProof = new ValueProof();
      valueProof.value = BigInt(0);
      valueProof.mtp = new Proof();
    }

    const s: Partial<AtomicQueryMTPV2CircuitInputs> = {
      userGenesisId: this.id.bigInt().toString(),
      nonce: this.nonce.toString(),
      claimSubjectProfileNonce: this.claimSubjectProfileNonce.toString(),
      issuerId: this.claim.issuerID?.bigInt().toString(),
      issuerClaim: this.claim.claim,
      issuerClaimMtp: circomSiblings(this.claim.incProof.proof, this.getMTLevel()),
      issuerClaimClaimsTreeRoot: this.claim.incProof.treeState.claimsRoot,
      issuerClaimRevTreeRoot: this.claim.incProof.treeState.revocationRoot,
      issuerClaimRootsTreeRoot: this.claim.incProof.treeState.rootOfRoots,
      issuerClaimIdenState: this.claim.incProof.treeState.state,
      issuerClaimNonRevMtp: circomSiblings(this.claim.nonRevProof.proof, this.getMTLevel()),
      issuerClaimNonRevClaimsTreeRoot: this.claim.nonRevProof.treeState.claimsRoot,
      issuerClaimNonRevRevTreeRoot: this.claim.nonRevProof.treeState.revocationRoot,
      issuerClaimNonRevRootsTreeRoot: this.claim.nonRevProof.treeState.rootOfRoots,
      issuerClaimNonRevState: this.claim.nonRevProof.treeState.state,
      claimSchema: this.claim.claim.getSchemaHash().bigInt().toString(),
      claimPathMtp: circomSiblings(valueProof.mtp, this.getMTLevel()),
      claimPathValue: valueProof.value.toString(),
      operator: this.query.operator,
      slotIndex: this.query.slotIndex,
      timestamp: this.currentTimeStamp
    };

    const nodeAux = getNodeAuxValue(this.claim.nonRevProof.proof);
    s.issuerClaimNonRevMtpAuxHi = nodeAux.key;
    s.issuerClaimNonRevMtpAuxHv = nodeAux.value;
    s.issuerClaimNonRevMtpNoAux = nodeAux.noAux;

    s.claimPathNotExists = existenceToInt(valueProof.mtp.existence);
    const nodAuxJSONLD = getNodeAuxValue(valueProof.mtp);
    s.claimPathMtpNoAux = nodAuxJSONLD.noAux;
    s.claimPathMtpAuxHi = nodAuxJSONLD.key;
    s.claimPathMtpAuxHv = nodAuxJSONLD.value;

    s.claimPathKey = queryPathKey.toString();

    const values = prepareCircuitArrayValues(this.query.values, this.getValueArrSize());

    s.value = bigIntArrayToStringArray(values);

    return new TextEncoder().encode(JSON.stringify(s));
  }
}

// stateTransitionInputsInternal type represents credentialAtomicQueryMTP.circom private inputs required by prover
interface AtomicQueryMTPV2CircuitInputs {
  userGenesisId: string;
  nonce: string;
  claimSubjectProfileNonce: string;
  issuerId: string;
  issuerClaim?: CoreClaim;
  issuerClaimMtp: Hash[];
  issuerClaimClaimsTreeRoot: Hash;
  issuerClaimRevTreeRoot: Hash;
  issuerClaimRootsTreeRoot: Hash;
  issuerClaimIdenState: Hash;
  issuerClaimNonRevClaimsTreeRoot: Hash;
  issuerClaimNonRevRevTreeRoot: Hash;
  issuerClaimNonRevRootsTreeRoot: Hash;
  issuerClaimNonRevState: Hash;
  issuerClaimNonRevMtp: Hash[];
  issuerClaimNonRevMtpAuxHi: Hash;
  issuerClaimNonRevMtpAuxHv: Hash;
  issuerClaimNonRevMtpNoAux: string;
  claimSchema: string;
  claimPathNotExists: number;
  claimPathMtp: Hash[];
  claimPathMtpNoAux: string;
  claimPathMtpAuxHi: Hash;
  claimPathMtpAuxHv: Hash;
  claimPathKey: string;
  claimPathValue: string;
  operator: number;
  slotIndex: number;
  timestamp: number;
  value: string[];
}

// AtomicQueryMTPPubSignals public signals
export class AtomicQueryMTPV2PubSignals extends BaseConfig {
  userId?: Id;
  issuerId?: Id;
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

    // 11 is a number of fields in AtomicQueryMTPV2PubSignals before values, values is last element in the proof and
    // it is length could be different base on the circuit configuration. The length could be modified by set value
    // in ValueArraySize
    const fieldLength = 11;

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
    this.userId = Id.fromString(sVals[fieldIdx]);
    fieldIdx++;

    // - issuerID
    this.issuerId = Id.fromString(sVals[fieldIdx]);
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
