import { Claim, Id, SchemaHash } from '@iden3/js-iden3-core';
import {
  BaseConfig,
  bigIntArrayToStringArray,
  circomSiblings,
  existenceToInt,
  getNodeAuxValue,
  prepareCircuitArrayValues,
  prepareSiblingsStr
} from './common';
import { BJJSignatureProof, CircuitError, MTProof, Query, ValueProof } from './models';
import { Hash, Proof, ZERO_HASH, newHashFromString } from '@iden3/js-merkletree';
import { byteDecoder, byteEncoder } from '../utils';

export type ProofType = 'sig' | 'mtp';

export interface ClaimWithSigAndMTPProof {
  issuerID: Id;
  claim: Claim;
  nonRevProof: MTProof;
  signatureProof: BJJSignatureProof;
  incProof: MTProof;
}
/**
 * AtomicQueryV3Inputs ZK private inputs for credentialAtomicQuerySig.circom
 *
 * @export
 * @class AtomicQuerySigV2Inputs
 * @extends {BaseConfig}
 */
export class AtomicQueryV3Inputs extends BaseConfig {
  requestID!: bigint;
  id!: Id;
  profileNonce!: bigint;
  claimSubjectProfileNonce!: bigint;
  claim!: ClaimWithSigAndMTPProof;
  skipClaimRevocationCheck!: boolean;
  query!: Query;
  currentTimeStamp!: number;
  proofType!: ProofType;

  validate(): void {
    if (!this.requestID) {
      throw new Error(CircuitError.EmptyRequestID);
    }

    if (!this.claim.nonRevProof.proof) {
      throw new Error(CircuitError.EmptyClaimNonRevProof);
    }

    if (!this.query.values) {
      throw new Error(CircuitError.EmptyQueryValue);
    }

    if (!this.proofType) {
      throw new Error(CircuitError.InvalidProofType);
    }

    if (this.proofType === 'sig') {
      if (!this.claim.signatureProof.issuerAuthIncProof.proof) {
        throw new Error(CircuitError.EmptyIssuerAuthClaimProof);
      }

      if (!this.claim.signatureProof.issuerAuthNonRevProof.proof) {
        throw new Error(CircuitError.EmptyIssuerAuthClaimNonRevProof);
      }

      if (!this.claim.signatureProof.signature) {
        throw new Error(CircuitError.EmptyClaimSignature);
      }
    }
    if (this.proofType === 'mtp') {
      if (!this.claim.incProof.proof) {
        throw new Error(CircuitError.EmptyClaimProof);
      }
    }
  }

  fillMTPProofsWithZero(s: Partial<AtomicQueryV3CircuitInputs>) {
    s.issuerClaimMtp = circomSiblings(new Proof(), this.getMTLevel());
    s.issuerClaimClaimsTreeRoot = ZERO_HASH;
    s.issuerClaimRevTreeRoot = ZERO_HASH;
    s.issuerClaimRootsTreeRoot = ZERO_HASH;
    s.issuerClaimIdenState = ZERO_HASH;
  }

  fillSigProofWithZero(s: Partial<AtomicQueryV3CircuitInputs>) {
    s.issuerClaimSignatureR8x = '0';
    s.issuerClaimSignatureR8y = '0';
    s.issuerClaimSignatureS = '0';
    s.issuerAuthClaim = new Claim();
    s.issuerAuthClaimMtp = prepareSiblingsStr(new Proof(), this.getMTLevel());
    s.issuerAuthClaimsTreeRoot = '0';
    s.issuerAuthRevTreeRoot = '0';
    s.issuerAuthRootsTreeRoot = '0';
    s.issuerAuthClaimNonRevMtp = prepareSiblingsStr(new Proof(), this.getMTLevel());

    s.issuerAuthClaimNonRevMtpAuxHi = ZERO_HASH;
    s.issuerAuthClaimNonRevMtpAuxHv = ZERO_HASH;
    s.issuerAuthClaimNonRevMtpNoAux = '0';
  }

  // InputsMarshal returns Circom private inputs for credentialAtomicQueryV3.circom
  inputsMarshal(): Uint8Array {
    this.validate();

    if (this.query.valueProof) {
      this.query.validate();
      this.query.valueProof.validate();
    }

    let valueProof = this.query.valueProof;

    if (!valueProof) {
      valueProof = new ValueProof();
      valueProof.path = BigInt(0);
      valueProof.value = BigInt(0);
      valueProof.mtp = new Proof();
    }

    const treeState = this.claim.nonRevProof.treeState;

    if (!treeState) {
      throw new Error(CircuitError.EmptyTreeState);
    }

    const s: Partial<AtomicQueryV3CircuitInputs> = {
      requestID: this.requestID.toString(),
      userGenesisID: this.id.bigInt().toString(),
      profileNonce: this.profileNonce.toString(),
      claimSubjectProfileNonce: this.claimSubjectProfileNonce.toString(),
      issuerID: this.claim.issuerID.bigInt().toString(),
      issuerClaim: this.claim.claim,

      issuerClaimNonRevClaimsTreeRoot: treeState.claimsRoot.bigInt().toString(),
      issuerClaimNonRevRevTreeRoot: treeState.revocationRoot.bigInt().toString(),
      issuerClaimNonRevRootsTreeRoot: treeState.rootOfRoots.bigInt().toString(),
      issuerClaimNonRevState: treeState.state.bigInt().toString(),
      issuerClaimNonRevMtp: prepareSiblingsStr(
        this.claim.nonRevProof.proof as Proof,
        this.getMTLevel()
      ),

      claimSchema: this.claim.claim.getSchemaHash().bigInt().toString(),

      claimPathMtp: prepareSiblingsStr(valueProof.mtp, this.getMTLevelsClaim()),
      claimPathValue: valueProof.value.toString(),
      operator: this.query.operator,
      timestamp: this.currentTimeStamp,
      // value in this path in merklized json-ld document

      slotIndex: this.query.slotIndex,
      isRevocationChecked: 1
    };

    if (this.skipClaimRevocationCheck) {
      s.isRevocationChecked = 0;
    }

    if (this.proofType === 'sig') {
      s.proofType = '0';

      s.issuerClaimSignatureR8x = this.claim.signatureProof.signature.R8[0].toString();
      s.issuerClaimSignatureR8y = this.claim.signatureProof.signature.R8[1].toString();
      s.issuerClaimSignatureS = this.claim.signatureProof.signature.S.toString();
      s.issuerAuthClaim = this.claim.signatureProof.issuerAuthClaim;
      s.issuerAuthClaimMtp = prepareSiblingsStr(
        this.claim.signatureProof.issuerAuthIncProof.proof as Proof,
        this.getMTLevel()
      );
      const issuerAuthTreeState = this.claim.nonRevProof.treeState;

      if (!issuerAuthTreeState) {
        throw new Error(CircuitError.EmptyTreeState);
      }
      s.issuerAuthClaimsTreeRoot = issuerAuthTreeState.claimsRoot.bigInt().toString();
      s.issuerAuthRevTreeRoot = issuerAuthTreeState.revocationRoot.bigInt().toString();
      s.issuerAuthRootsTreeRoot = issuerAuthTreeState.rootOfRoots.bigInt().toString();
      s.issuerAuthClaimNonRevMtp = prepareSiblingsStr(
        this.claim.signatureProof.issuerAuthNonRevProof.proof as Proof,
        this.getMTLevel()
      );

      const nodeAuxIssuerAuthNonRev = getNodeAuxValue(
        this.claim.signatureProof.issuerAuthNonRevProof.proof
      );
      s.issuerAuthClaimNonRevMtpAuxHi = nodeAuxIssuerAuthNonRev.key;
      s.issuerAuthClaimNonRevMtpAuxHv = nodeAuxIssuerAuthNonRev.value;
      s.issuerAuthClaimNonRevMtpNoAux = nodeAuxIssuerAuthNonRev.noAux;

      this.fillMTPProofsWithZero(s);
    } else if (this.proofType === 'mtp') {
      s.proofType = '1';

      const incProofTreeState = this.claim.incProof.treeState;

      if (!incProofTreeState) {
        throw new Error(CircuitError.EmptyTreeState);
      }

      s.issuerClaimMtp = circomSiblings(this.claim.incProof.proof as Proof, this.getMTLevel());
      s.issuerClaimClaimsTreeRoot = incProofTreeState.claimsRoot;
      s.issuerClaimRevTreeRoot = incProofTreeState.revocationRoot;
      s.issuerClaimRootsTreeRoot = incProofTreeState.rootOfRoots;
      s.issuerClaimIdenState = incProofTreeState.state;

      this.fillSigProofWithZero(s);
    }

    const nodeAuxNonRev = getNodeAuxValue(this.claim.nonRevProof.proof);
    s.issuerClaimNonRevMtpAuxHi = nodeAuxNonRev.key;
    s.issuerClaimNonRevMtpAuxHv = nodeAuxNonRev.value;
    s.issuerClaimNonRevMtpNoAux = nodeAuxNonRev.noAux;

    s.claimPathNotExists = existenceToInt(valueProof.mtp.existence);
    const nodAuxJSONLD = getNodeAuxValue(valueProof.mtp);
    s.claimPathMtpNoAux = nodAuxJSONLD.noAux;
    s.claimPathMtpAuxHi = nodAuxJSONLD.key;
    s.claimPathMtpAuxHv = nodAuxJSONLD.value;

    s.claimPathKey = valueProof.path.toString();

    const values = prepareCircuitArrayValues(this.query.values, this.getValueArrSize());
    s.value = bigIntArrayToStringArray(values);

    return byteEncoder.encode(JSON.stringify(s));
  }
}

// atomicQueryV3CircuitInputs type represents credentialAtomicQueryV3.circom private inputs required by prover
interface AtomicQueryV3CircuitInputs {
  requestID: string;
  // user data
  userGenesisID: string;
  profileNonce: string;
  claimSubjectProfileNonce: string;

  issuerID: string;
  // Claim
  issuerClaim: Claim;
  issuerClaimNonRevClaimsTreeRoot: string;
  issuerClaimNonRevRevTreeRoot: string;
  issuerClaimNonRevRootsTreeRoot: string;
  issuerClaimNonRevState: string;
  issuerClaimNonRevMtp: string[];
  issuerClaimNonRevMtpAuxHi: Hash;
  issuerClaimNonRevMtpAuxHv: Hash;
  issuerClaimNonRevMtpNoAux: string;
  claimSchema: string;
  issuerClaimSignatureR8x: string;
  issuerClaimSignatureR8y: string;
  issuerClaimSignatureS: string;
  issuerAuthClaim: Claim;
  issuerAuthClaimMtp: string[];
  issuerAuthClaimNonRevMtp: string[];
  issuerAuthClaimNonRevMtpAuxHi: Hash;
  issuerAuthClaimNonRevMtpAuxHv: Hash;
  issuerAuthClaimNonRevMtpNoAux: string;
  issuerAuthClaimsTreeRoot: string;
  issuerAuthRevTreeRoot: string;
  issuerAuthRootsTreeRoot: string;

  isRevocationChecked: number;
  // Query
  // JSON path
  claimPathNotExists: number; // 0 for inclusion, 1 for non-inclusion
  claimPathMtp: string[];
  claimPathMtpNoAux: string; // 1 if aux node is empty, 0 if non-empty or for inclusion proofs
  claimPathMtpAuxHi: Hash; // 0 for inclusion proof
  claimPathMtpAuxHv: Hash; // 0 for inclusion proof
  claimPathKey: string; // hash of path in merklized json-ld document
  claimPathValue: string; // value in this path in merklized json-ld document

  operator: number;
  slotIndex: number;
  timestamp: number;
  value: string[];

  issuerClaimMtp: Hash[];
  issuerClaimClaimsTreeRoot: Hash;
  issuerClaimRevTreeRoot: Hash;
  issuerClaimRootsTreeRoot: Hash;
  issuerClaimIdenState: Hash;

  proofType: string;
}

// AtomicQueryV3PubSignals public inputs
export class AtomicQueryV3PubSignals extends BaseConfig {
  requestID!: bigint;
  userID!: Id;
  issuerID!: Id;
  issuerAuthState!: Hash;
  issuerClaimNonRevState!: Hash;
  claimSchema!: SchemaHash;
  slotIndex!: number;
  operator!: number;
  value!: bigint[];
  timestamp!: number;
  merklized!: number;
  claimPathKey!: bigint;
  claimPathNotExists!: number;
  isRevocationChecked!: number;
  issuerClaimIdenState!: Hash;
  proofType!: number;

  // PubSignalsUnmarshal unmarshal credentialAtomicQueryV3.circom public signals
  pubSignalsUnmarshal(data: Uint8Array): AtomicQueryV3PubSignals {
    // expected order:
    // merklized
    // userID
    // issuerAuthState
    // proofType
    // requestID
    // issuerID
    // isRevocationChecked
    // issuerClaimNonRevState
    // timestamp
    // claimSchema
    // claimPathNotExists
    // claimPathKey
    // slotIndex
    // operator
    // value
    // issuerClaimIdenState

    // 12 is a number of fields in AtomicQueryV3PubSignals before values, values is last element in the proof and
    // it is length could be different base on the circuit configuration. The length could be modified by set value
    // in ValueArraySize
    const fieldLength = 15;

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

    // proofType
    this.proofType = parseInt(sVals[fieldIdx]);
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

    // - issuerClaimIdenState
    this.issuerClaimIdenState = newHashFromString(sVals[fieldIdx]);

    return this;
  }
}
