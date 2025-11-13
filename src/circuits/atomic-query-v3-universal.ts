import { Id, SchemaHash } from '@iden3/js-iden3-core';
import { byteDecoder } from '../utils/encoding';
import { BaseConfig } from './common';
import { Hash } from '@iden3/js-merkletree';

/**

 * AtomicQueryV3PubSignals public inputs
 */
export class AtomicQueryV3UniversalPubSignals extends BaseConfig {
  constructor(opts?: { mtLevel?: number; mtLevelClaim?: number }) {
    super();
    if (!opts) {
      return;
    }
    const { mtLevel, mtLevelClaim } = opts;
    mtLevel && this.setMTLevel(mtLevel);
    mtLevelClaim && this.setMTLevelClaim(mtLevelClaim);
  }

  requestID!: bigint;
  userID!: Id;
  issuerID!: Id;
  issuerState!: Hash;
  issuerClaimNonRevState!: Hash;
  claimSchema!: SchemaHash;
  slotIndex!: number;
  operator!: number;
  value: bigint[] = [];
  valueArraySize!: number;
  timestamp!: number;
  claimPathKey!: bigint;
  isRevocationChecked!: number;
  proofType!: number;
  linkID!: bigint;
  nullifier!: bigint;
  operatorOutput!: bigint;
  verifierID!: Id;
  nullifierSessionID!: bigint;
  circuitQueryHash!: bigint;

  // PubSignalsUnmarshal unmarshal credentialAtomicQueryV3.circom public signals
  pubSignalsUnmarshal(data: Uint8Array): AtomicQueryV3UniversalPubSignals {
    const pubSignals = JSON.parse(byteDecoder.decode(data));
    let fieldIdx = 0;
    this.userID = Id.fromBigInt(BigInt(pubSignals[fieldIdx]));
    fieldIdx++;

    this.circuitQueryHash = BigInt(pubSignals[fieldIdx]);
    fieldIdx++;

    this.issuerState = Hash.fromString(pubSignals[fieldIdx]);
    fieldIdx++;

    this.linkID = BigInt(pubSignals[fieldIdx]);
    fieldIdx++;

    this.nullifier = BigInt(pubSignals[fieldIdx]);
    fieldIdx++;

    this.operatorOutput = BigInt(pubSignals[fieldIdx]);
    fieldIdx++;

    this.proofType = parseInt(pubSignals[fieldIdx]);
    fieldIdx++;

    this.requestID = BigInt(pubSignals[fieldIdx]);
    fieldIdx++;

    this.issuerID = Id.fromBigInt(BigInt(pubSignals[fieldIdx]));
    fieldIdx++;

    this.isRevocationChecked = parseInt(pubSignals[fieldIdx]);
    fieldIdx++;

    this.issuerClaimNonRevState = Hash.fromString(pubSignals[fieldIdx]);
    fieldIdx++;

    this.timestamp = parseInt(pubSignals[fieldIdx]);
    fieldIdx++;

    this.claimSchema = SchemaHash.newSchemaHashFromInt(BigInt(pubSignals[fieldIdx]));
    fieldIdx++;

    this.claimPathKey = BigInt(pubSignals[fieldIdx]);
    fieldIdx++;

    this.slotIndex = parseInt(pubSignals[fieldIdx]);
    fieldIdx++;

    this.operator = parseInt(pubSignals[fieldIdx]);
    fieldIdx++;
    //  - values
    for (let index = 0; index < this.getValueArrSize(); index++) {
      this.value.push(BigInt(pubSignals[fieldIdx]));
      fieldIdx++;
    }

    this.valueArraySize = parseInt(pubSignals[fieldIdx]);
    fieldIdx++;
    if (pubSignals[fieldIdx] !== '0') {
      this.verifierID = Id.fromBigInt(BigInt(pubSignals[fieldIdx]));
    }
    fieldIdx++;

    this.nullifierSessionID = BigInt(pubSignals[fieldIdx]);
    fieldIdx++;

    return this;
  }
}
