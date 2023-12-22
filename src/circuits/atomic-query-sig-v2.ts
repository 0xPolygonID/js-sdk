import { newHashFromString } from '@iden3/js-merkletree';
import { Id, SchemaHash } from '@iden3/js-iden3-core';
import { Query, ValueProof, CircuitError, ClaimWithSigProof } from './models';
import { Hash } from '@iden3/js-merkletree';
import {
  BaseConfig,
  bigIntArrayToStringArray,
  existenceToInt,
  getNodeAuxValue,
  prepareCircuitArrayValues,
  prepareSiblingsStr
} from './common';
import { QueryOperators } from './comparer';
import { byteDecoder, byteEncoder } from '../utils';

/**
 * AtomicQuerySigV2Inputs representation for credentialAtomicQuerySig.circom
 * Inputs and public signals declaration, marshalling and parsing
 *
 * @public
 * @class AtomicQuerySigV2Inputs
 * @extends {BaseConfig}
 */
export class AtomicQuerySigV2Inputs extends BaseConfig {
  requestID!: bigint;
  // auth
  id!: Id;
  profileNonce!: bigint;
  claimSubjectProfileNonce!: bigint;

  // claim issued for user
  claim!: ClaimWithSigProof;
  skipClaimRevocationCheck!: boolean;

  currentTimeStamp!: number;

  // query
  query!: Query;

  /**
   *  Validate inputs
   *
   */
  validate(): void {
    if (!this.requestID) {
      throw new Error(CircuitError.EmptyRequestID);
    }
    if (!this.claim.nonRevProof?.proof) {
      throw new Error(CircuitError.EmptyClaimNonRevProof);
    }

    if (!this.claim.signatureProof?.issuerAuthIncProof.proof) {
      throw new Error(CircuitError.EmptyIssuerAuthClaimProof);
    }

    if (!this.claim.signatureProof.issuerAuthNonRevProof.proof) {
      throw new Error(CircuitError.EmptyIssuerAuthClaimNonRevProof);
    }

    if (!this.claim.signatureProof.signature) {
      throw new Error(CircuitError.EmptyClaimSignature);
    }

    if (!this.query.values && this.query.operator !== QueryOperators.$noop) {
      throw new Error(CircuitError.EmptyQueryValue);
    }
  }

  /**
   * marshal inputs
   *
   * @returns Uint8Array
   */
  inputsMarshal(): Uint8Array {
    this.validate();
    if (this.query.valueProof) {
      this.query.validate();
      this.query.valueProof.validate();
    }

    const valueProof = this.query.valueProof ?? new ValueProof();

    const treeState = this.skipClaimRevocationCheck
      ? this.claim.signatureProof?.issuerAuthNonRevProof.treeState
      : this.claim.nonRevProof?.treeState;

    const s: Partial<AtomicQuerySigV2CircuitInputs> = {
      requestID: this.requestID.toString(),
      userGenesisID: this.id.bigInt().toString(),
      profileNonce: this.profileNonce.toString(),
      claimSubjectProfileNonce: this.claimSubjectProfileNonce?.toString(),
      issuerID: this.claim.issuerID?.bigInt().toString(),
      issuerClaim: this.claim.claim?.marshalJson(),
      issuerClaimNonRevClaimsTreeRoot: treeState?.claimsRoot.bigInt().toString(),
      issuerClaimNonRevRevTreeRoot: treeState?.revocationRoot.bigInt().toString(),
      issuerClaimNonRevRootsTreeRoot: treeState?.rootOfRoots.bigInt().toString(),
      issuerClaimNonRevState: treeState?.state.bigInt().toString(),
      issuerClaimNonRevMtp:
        this.claim.nonRevProof?.proof &&
        prepareSiblingsStr(this.claim.nonRevProof.proof, this.getMTLevel()),
      issuerClaimSignatureR8x: this.claim.signatureProof?.signature.R8[0].toString(),
      issuerClaimSignatureR8y: this.claim.signatureProof?.signature.R8[1].toString(),
      issuerClaimSignatureS: this.claim.signatureProof?.signature.S.toString(),
      issuerAuthClaim: this.claim.signatureProof?.issuerAuthClaim?.marshalJson(),
      issuerAuthClaimMtp:
        this.claim.signatureProof?.issuerAuthIncProof?.proof &&
        prepareSiblingsStr(this.claim.signatureProof.issuerAuthIncProof.proof, this.getMTLevel()),
      issuerAuthClaimsTreeRoot: this.claim.signatureProof?.issuerAuthIncProof.treeState?.claimsRoot
        .bigInt()
        .toString(),
      issuerAuthRevTreeRoot:
        this.claim.signatureProof?.issuerAuthIncProof?.treeState?.revocationRoot
          .bigInt()
          .toString(),
      issuerAuthRootsTreeRoot: this.claim.signatureProof?.issuerAuthIncProof?.treeState?.rootOfRoots
        .bigInt()
        .toString(),

      issuerAuthClaimNonRevMtp:
        this.claim.signatureProof?.issuerAuthNonRevProof?.proof &&
        prepareSiblingsStr(
          this.claim.signatureProof.issuerAuthNonRevProof.proof,
          this.getMTLevel()
        ),

      claimSchema: this.claim.claim?.getSchemaHash().bigInt().toString(),

      claimPathMtp: prepareSiblingsStr(valueProof.mtp, this.getMTLevelsClaim()),
      claimPathValue: valueProof.value.toString(),
      operator: this.query.operator,
      timestamp: this.currentTimeStamp,
      // value in this path in merklized json-ld document
      slotIndex: this.query.slotIndex
    };

    if (this.skipClaimRevocationCheck) {
      s.isRevocationChecked = 0;
    } else {
      s.isRevocationChecked = 1;
    }
    const nodeAuxNonRev = getNodeAuxValue(this.claim.nonRevProof?.proof);
    s.issuerClaimNonRevMtpAuxHi = nodeAuxNonRev?.key.bigInt().toString();
    s.issuerClaimNonRevMtpAuxHv = nodeAuxNonRev?.value.bigInt().toString();
    s.issuerClaimNonRevMtpNoAux = nodeAuxNonRev?.noAux;

    const nodeAuxIssuerAuthNonRev =
      this.claim.signatureProof &&
      getNodeAuxValue(this.claim.signatureProof.issuerAuthNonRevProof.proof);
    s.issuerAuthClaimNonRevMtpAuxHi = nodeAuxIssuerAuthNonRev?.key.bigInt().toString();
    s.issuerAuthClaimNonRevMtpAuxHv = nodeAuxIssuerAuthNonRev?.value.bigInt().toString();
    s.issuerAuthClaimNonRevMtpNoAux = nodeAuxIssuerAuthNonRev?.noAux;

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

    const values = prepareCircuitArrayValues(this.query.values, this.getValueArrSize());
    s.value = bigIntArrayToStringArray(values);

    return byteEncoder.encode(JSON.stringify(s));
  }
}

interface AtomicQuerySigV2CircuitInputs {
  requestID: string;
  userGenesisID: string;
  profileNonce: string;
  claimSubjectProfileNonce: string;
  issuerID: string;
  issuerClaim?: string[];
  issuerClaimNonRevClaimsTreeRoot: string;
  issuerClaimNonRevRevTreeRoot: string;
  issuerClaimNonRevRootsTreeRoot: string;
  issuerClaimNonRevState: string;
  issuerClaimNonRevMtp: string[];
  issuerClaimNonRevMtpAuxHi?: string;
  issuerClaimNonRevMtpAuxHv?: string;
  issuerClaimNonRevMtpNoAux: string;
  claimSchema: string;
  issuerClaimSignatureR8x: string;
  issuerClaimSignatureR8y: string;
  issuerClaimSignatureS: string;
  issuerAuthClaim?: string[];
  issuerAuthClaimMtp: string[];
  issuerAuthClaimNonRevMtp: string[];
  issuerAuthClaimNonRevMtpAuxHi?: string;
  issuerAuthClaimNonRevMtpAuxHv?: string;
  issuerAuthClaimNonRevMtpNoAux: string;
  issuerAuthClaimsTreeRoot: string;
  issuerAuthRevTreeRoot: string;
  issuerAuthRootsTreeRoot: string;
  isRevocationChecked: number;
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
 *
 * public signals
 * @public
 * @class AtomicQuerySigV2PubSignals
 * @extends {BaseConfig}
 */
export class AtomicQuerySigV2PubSignals extends BaseConfig {
  requestID!: bigint;
  userID!: Id;
  issuerID!: Id;
  issuerAuthState!: Hash;
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

  //
  /**
   *
   * PubSignalsUnmarshal unmarshal credentialAtomicQuerySig.circom public signals array to AtomicQuerySugPubSignals
   * @param {Uint8Array} data
   * @returns AtomicQuerySigV2PubSignals
   */
  pubSignalsUnmarshal(data: Uint8Array): AtomicQuerySigV2PubSignals {
    // expected order:
    // merklized
    // userID
    // issuerAuthState
    // requestID
    // issuerID
    // issuerClaimNonRevState
    // timestamp
    // claimSchema
    // claimPathNotExists
    // claimPathKey
    // slotIndex
    // operator
    // value

    // 12 is a number of fields in AtomicQuerySigV2PubSignals before values, values is last element in the proof and
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

    // - issuerAuthState
    this.issuerAuthState = newHashFromString(sVals[fieldIdx]);
    fieldIdx++;

    // - requestID
    this.requestID = BigInt(sVals[fieldIdx]);
    fieldIdx++;

    // - issuerID
    this.issuerID = Id.fromBigInt(BigInt(sVals[fieldIdx]));
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
