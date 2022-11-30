import { newHashFromString, Proof } from '@iden3/js-merkletree';
import { Claim, Id, SchemaHash } from '@iden3/js-iden3-core';
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

// AtomicQueryMTPInputs ZK private inputs for credentialAtomicQueryMTP.circom
export class AtomicQuerySigV2Inputs extends BaseConfig {
  // auth
  id: Id;
  nonce: bigint;
  claimSubjectProfileNonce: bigint;

  // claim issued for user
  claim: ClaimWithSigProof;

  currentTimeStamp: number;

  // query
  query: Query;

  validate(): void {
    if (!this.claim.nonRevProof.proof) {
      throw new Error(CircuitError.EmptyClaimNonRevProof);
    }

    if (!this.claim.signatureProof.issuerAuthIncProof.proof) {
      throw new Error(CircuitError.EmptyIssuerAuthClaimProof);
    }

    if (!this.claim.signatureProof.issuerAuthNonRevProof.proof) {
      throw new Error(CircuitError.EmptyIssuerAuthClaimNonRevProof);
    }

    if (!this.claim.signatureProof.signature) {
      throw new Error(CircuitError.EmptyClaimSignature);
    }

    if (!this.query.values) {
      throw new Error(CircuitError.EmptyQueryValue);
    }
  }

  inputsMarshal(): Uint8Array {
    this.validate();
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

    const s: Partial<AtomicQuerySigV2CircuitInputs> = {
      userGenesisId: this.id.bigInt().toString(),
      nonce: this.nonce.toString(),
      claimSubjectProfileNonce: this.claimSubjectProfileNonce.toString(),
      issuerId: this.claim.issuerId.bigInt().toString(),
      issuerClaim: this.claim.claim,
      issuerClaimNonRevClaimsTreeRoot: this.claim.nonRevProof.treeState.claimsRoot
        .bigInt()
        .toString(),
      issuerClaimNonRevRevTreeRoot: this.claim.nonRevProof.treeState.revocationRoot
        .bigInt()
        .toString(),
      issuerClaimNonRevRootsTreeRoot: this.claim.nonRevProof.treeState.rootOfRoots
        .bigInt()
        .toString(),
      issuerClaimNonRevState: this.claim.nonRevProof.treeState.state.bigInt().toString(),
      issuerClaimNonRevMtp: prepareSiblingsStr(
        this.claim.nonRevProof.proof.allSiblings(),
        this.getMTLevel()
      ),
      issuerClaimSignatureR8x: this.claim.signatureProof.signature.R8[0].toString(),
      issuerClaimSignatureR8y: this.claim.signatureProof.signature.R8[1].toString(),
      issuerClaimSignatureS: this.claim.signatureProof.signature.S.toString(),
      issuerAuthClaim: this.claim.signatureProof.issuerAuthClaim,
      issuerAuthClaimMtp: prepareSiblingsStr(
        this.claim.signatureProof.issuerAuthIncProof.proof.allSiblings(),
        this.getMTLevel()
      ),
      issuerAuthClaimsTreeRoot: this.claim.signatureProof.issuerAuthIncProof.treeState.claimsRoot
        .bigInt()
        .toString(),
      issuerAuthRevTreeRoot: this.claim.signatureProof.issuerAuthIncProof.treeState.revocationRoot
        .bigInt()
        .toString(),
      issuerAuthRootsTreeRoot: this.claim.signatureProof.issuerAuthIncProof.treeState.rootOfRoots
        .bigInt()
        .toString(),

      issuerAuthClaimNonRevMtp: prepareSiblingsStr(
        this.claim.signatureProof.issuerAuthNonRevProof.proof.allSiblings(),
        this.getMTLevel()
      ),

      claimSchema: this.claim.claim.getSchemaHash().bigInt().toString(),

      claimPathMtp: prepareSiblingsStr(valueProof.mtp.allSiblings(), this.getMTLevel()),
      claimPathValue: valueProof.value.toString(),
      operator: this.query.operator,
      timestamp: this.currentTimeStamp,
      // value in this path in merklized json-ld document

      slotIndex: this.query.slotIndex
    };

    const nodeAuxNonRev = getNodeAuxValue(this.claim.nonRevProof.proof);
    s.issuerClaimNonRevMtpAuxHi = nodeAuxNonRev.key;
    s.issuerClaimNonRevMtpAuxHv = nodeAuxNonRev.value;
    s.issuerClaimNonRevMtpNoAux = nodeAuxNonRev.noAux;

    const nodeAuxIssuerAuthNonRev = getNodeAuxValue(
      this.claim.signatureProof.issuerAuthNonRevProof.proof
    );
    s.issuerAuthClaimNonRevMtpAuxHi = nodeAuxIssuerAuthNonRev.key;
    s.issuerAuthClaimNonRevMtpAuxHv = nodeAuxIssuerAuthNonRev.value;
    s.issuerAuthClaimNonRevMtpNoAux = nodeAuxIssuerAuthNonRev.noAux;

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
interface AtomicQuerySigV2CircuitInputs {
  userGenesisId: string;
  nonce: string;
  claimSubjectProfileNonce: string;
  issuerId: string;
  issuerClaim?: Claim;
  issuerClaimNonRevClaimsTreeRoot: string;
  issuerClaimNonRevRevTreeRoot: string;
  issuerClaimNonRevRootsTreeRoot: string;
  issuerClaimNonRevState: string;
  issuerClaimNonRevMtp: string[];
  issuerClaimNonRevMtpAuxHi?: Hash;
  issuerClaimNonRevMtpAuxHv?: Hash;
  issuerClaimNonRevMtpNoAux: string;
  claimSchema: string;
  issuerClaimSignatureR8x: string;
  issuerClaimSignatureR8y: string;
  issuerClaimSignatureS: string;
  issuerAuthClaim?: Claim;
  issuerAuthClaimMtp: string[];
  issuerAuthClaimNonRevMtp: string[];
  issuerAuthClaimNonRevMtpAuxHi?: Hash;
  issuerAuthClaimNonRevMtpAuxHv?: Hash;
  issuerAuthClaimNonRevMtpNoAux: string;
  issuerAuthClaimsTreeRoot: string;
  issuerAuthRevTreeRoot: string;
  issuerAuthRootsTreeRoot: string;
  claimPathNotExists: number;
  claimPathMtp: string[];
  claimPathMtpNoAux: string;
  claimPathMtpAuxHi?: Hash;
  claimPathMtpAuxHv?: Hash;
  claimPathKey: string;
  claimPathValue: string;
  operator: number;
  slotIndex: number;
  timestamp: number;
  value: string[];
}

// AtomicQueryMTPPubSignals public signals
export class AtomicQuerySigV2PubSignals extends BaseConfig {
  userId?: Id;
  issuerId?: Id;
  issuerAuthState?: Hash;
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
  pubSignalsUnmarshal(data: Uint8Array): AtomicQuerySigV2PubSignals {
    // expected order:
    // merklized
    // userID
    // issuerAuthState
    // issuerID
    // issuerClaimNonRevState
    // timestamp
    // claimSchema
    // claimPathNotExists
    // claimPathKey
    // slotIndex
    // operator
    // value

    // 10 is a number of fields in AtomicQuerySigV2PubSignals before values, values is last element in the proof and
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

    // - issuerAuthState
    this.issuerAuthState = newHashFromString(sVals[fieldIdx]);
    fieldIdx++;

    // - issuerID
    this.issuerId = Id.fromBigInt(BigInt(sVals[fieldIdx]));
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
