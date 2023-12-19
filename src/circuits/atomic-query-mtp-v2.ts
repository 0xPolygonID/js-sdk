import { newHashFromString } from '@iden3/js-merkletree';
import { Id, SchemaHash } from '@iden3/js-iden3-core';
import { Query, ClaimWithMTPProof, ValueProof, CircuitError } from './models';
import { Hash } from '@iden3/js-merkletree';
import {
  BaseConfig,
  bigIntArrayToStringArray,
  existenceToInt,
  getNodeAuxValue,
  prepareCircuitArrayValues,
  prepareSiblingsStr
} from './common';
import { byteDecoder, byteEncoder } from '../utils';

/**
 * AtomicQueryMTPInputs ZK private inputs for credentialAtomicQueryMTP.circom
 *
 * @public
 * @class AtomicQueryMTPV2Inputs
 * @extends {BaseConfig}
 */
export class AtomicQueryMTPV2Inputs extends BaseConfig {
  // auth
  id!: Id;
  profileNonce!: bigint;
  claimSubjectProfileNonce!: bigint;
  // claim issued for user
  claim!: ClaimWithMTPProof;
  skipClaimRevocationCheck!: boolean;
  requestID!: bigint;

  currentTimeStamp!: number;

  // query
  query!: Query;

  /**
   * Validate AtomicQueryMTPV2 inputs
   *
   */
  validate(): void {
    if (!this.requestID) {
      throw new Error(CircuitError.EmptyRequestID);
    }
  }

  /**
   *
   * Inputs marshalling
   * @returns {Uint8Array}
   */
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
      profileNonce: this.profileNonce?.toString(),
      claimSubjectProfileNonce: this.claimSubjectProfileNonce?.toString(),
      issuerID: this.claim.issuerID?.bigInt().toString(),
      issuerClaim: this.claim.claim?.marshalJson(),
      issuerClaimMtp:
        this.claim.incProof?.proof &&
        prepareSiblingsStr(this.claim.incProof.proof, this.getMTLevel()),
      issuerClaimClaimsTreeRoot: this.claim.incProof?.treeState?.claimsRoot?.bigInt().toString(),
      issuerClaimRevTreeRoot: this.claim.incProof?.treeState?.revocationRoot?.bigInt().toString(),
      issuerClaimRootsTreeRoot: this.claim.incProof?.treeState?.rootOfRoots?.bigInt().toString(),
      issuerClaimIdenState: this.claim.incProof?.treeState?.state?.bigInt().toString(),
      issuerClaimNonRevMtp:
        this.claim.nonRevProof?.proof &&
        prepareSiblingsStr(this.claim.nonRevProof.proof, this.getMTLevel()),
      issuerClaimNonRevClaimsTreeRoot: this.claim.nonRevProof?.treeState?.claimsRoot
        ?.bigInt()
        .toString(),
      issuerClaimNonRevRevTreeRoot: this.claim.nonRevProof?.treeState?.revocationRoot
        ?.bigInt()
        .toString(),
      issuerClaimNonRevRootsTreeRoot: this.claim.nonRevProof?.treeState?.rootOfRoots
        ?.bigInt()
        .toString(),
      issuerClaimNonRevState: this.claim.nonRevProof?.treeState?.state?.bigInt().toString(),
      claimSchema: this.claim.claim?.getSchemaHash().bigInt().toString(),
      claimPathMtp: prepareSiblingsStr(valueProof.mtp, this.getMTLevelsClaim()),
      claimPathValue: valueProof.value.toString(),
      operator: this.query.operator,
      slotIndex: this.query.slotIndex,
      timestamp: this.currentTimeStamp
    };

    const nodeAux = getNodeAuxValue(this.claim.nonRevProof?.proof);
    s.issuerClaimNonRevMtpAuxHi = nodeAux?.key.bigInt().toString();
    s.issuerClaimNonRevMtpAuxHv = nodeAux?.value.bigInt().toString();
    s.issuerClaimNonRevMtpNoAux = nodeAux?.noAux;

    s.claimPathNotExists = existenceToInt(valueProof.mtp.existence);
    const nodAuxJSONLD = getNodeAuxValue(valueProof.mtp);
    s.claimPathMtpNoAux = nodAuxJSONLD.noAux;
    s.claimPathMtpAuxHi = nodAuxJSONLD.key.bigInt().toString();
    s.claimPathMtpAuxHv = nodAuxJSONLD.value.bigInt().toString();

    s.claimPathKey = valueProof.path.toString();

    if (this.skipClaimRevocationCheck) {
      s.isRevocationChecked = 0;
    } else {
      s.isRevocationChecked = 1;
    }

    const values =
      this.query.values && prepareCircuitArrayValues(this.query.values, this.getValueArrSize());

    s.value = bigIntArrayToStringArray(values);

    return byteEncoder.encode(JSON.stringify(s));
  }
}

// stateTransitionInputsInternal type represents credentialAtomicQueryMTP.circom private inputs required by prover
interface AtomicQueryMTPV2CircuitInputs {
  requestID: string;
  userGenesisID: string;
  profileNonce: string;
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
  isRevocationChecked: number;
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

/**
 * Public signals
 *
 * @public
 * @class AtomicQueryMTPV2PubSignals
 * @extends {BaseConfig}
 */
export class AtomicQueryMTPV2PubSignals extends BaseConfig {
  requestID!: bigint;
  userID!: Id;
  issuerID!: Id;
  issuerClaimIdenState!: Hash;
  issuerClaimNonRevState!: Hash;
  claimSchema!: SchemaHash;
  slotIndex!: number;
  operator!: number;
  value: bigint[] = [];
  timestamp!: number;
  merklized!: number;
  claimPathKey!: bigint;
  // 0 for inclusion, 1 for non-inclusion
  claimPathNotExists!: number;
  // 0 revocation not check, // 1 for check revocation
  isRevocationChecked!: number;

  /**
   * PubSignalsUnmarshal unmarshal credentialAtomicQueryMTP.circom public signals array to AtomicQueryMTPPubSignals
   *
   * @param {Uint8Array} data
   * @returns AtomicQueryMTPV2PubSignals
   */
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
    const fieldLength = 13;

    const sVals: string[] = JSON.parse(byteDecoder.decode(data));

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
    this.userID = Id.fromBigInt(BigInt(sVals[fieldIdx]));
    fieldIdx++;

    // - requestID
    this.requestID = BigInt(sVals[fieldIdx]);
    fieldIdx++;

    // - issuerID
    this.issuerID = Id.fromBigInt(BigInt(sVals[fieldIdx]));
    fieldIdx++;

    // - issuerClaimIdenState
    this.issuerClaimIdenState = newHashFromString(sVals[fieldIdx]);
    fieldIdx++;

    // - isRevocationChecked
    this.isRevocationChecked = parseInt(sVals[fieldIdx]);
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
