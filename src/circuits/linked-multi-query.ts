import { Claim } from '@iden3/js-iden3-core';
import { byteDecoder, byteEncoder } from '../utils';
import {
  BaseConfig,
  bigIntArrayToStringArray,
  existenceToInt,
  getNodeAuxValue,
  prepareCircuitArrayValues,
  prepareSiblingsStr
} from './common';
import { Query, ValueProof } from './models';

/**
 * LinkedMultiQuery circuit representation
 * Inputs and public signals declaration, marshalling and parsing
 *
 * @beta
 * @class LinkedMultiQueryInputs
 */
export class LinkedMultiQueryInputs extends BaseConfig {
  linkNonce!: bigint;
  claim!: Claim;
  query!: Query[];

  // InputsMarshal returns Circom private inputs for linkedMultiQueryInputs.circom
  inputsMarshal(): Uint8Array {
    const valueProofs: ValueProof[] = this.query.map((i) => i.valueProof);

    const s: Partial<LinkedMultiQueryCircuitInputs> = {
      linkNonce: this.linkNonce.toString(),
      issuerClaim: this.claim.marshalJson(),
      claimSchema: this.claim.getSchemaHash().bigInt().toString(),
      claimPathNotExists: valueProofs.map((i) => existenceToInt(i.mtp.existence)),
      claimPathMtp: valueProofs.map((i) => prepareSiblingsStr(i.mtp, this.getMTLevelsClaim()))
    };

    const nodAuxJSONLDs = valueProofs.map((i) => getNodeAuxValue(i.mtp));

    s.claimPathMtpNoAux = nodAuxJSONLDs.map((i) => i.noAux);
    s.claimPathMtpAuxHi = nodAuxJSONLDs.map((i) => i.key.bigInt().toString());
    s.claimPathMtpAuxHv = nodAuxJSONLDs.map((i) => i.value.bigInt().toString());

    s.claimPathKey = valueProofs.map((i) => i.path.toString());

    s.claimPathValue = valueProofs.map((i) => i.value.toString());

    s.slotIndex = this.query.map((i) => i.slotIndex);

    s.operator = this.query.map((i) => i.operator);

    const valuesArr = this.query.map((i) =>
      prepareCircuitArrayValues(i.values, this.getValueArrSize())
    );
    s.value = valuesArr.map((i) => bigIntArrayToStringArray(i));

    return byteEncoder.encode(JSON.stringify(s));
  }
}

/**
 * @beta
 */
interface LinkedMultiQueryCircuitInputs {
  linkID: string;
  linkNonce: string;
  issuerClaim: string[];
  claimSchema: string;
  claimPathNotExists: number[];
  claimPathMtp: string[][];
  claimPathMtpNoAux: string[];
  claimPathMtpAuxHi: string[];
  claimPathMtpAuxHv: string[];
  claimPathKey: string[];
  claimPathValue: string[];
  slotIndex: number[];
  operator: number[];
  value: string[][];
}

// LinkedMultiQueryPubSignals linkedMultiQuery.circom public signals
/**
 * public signals
 *
 * @beta
 * @class LinkedMultiQueryPubSignals
 */
export class LinkedMultiQueryPubSignals {
  linkID!: bigint;
  merklized!: number;
  operatorOutput!: bigint[];
  circuitQueryHash!: bigint[];

  /**
   * PubSignalsUnmarshal unmarshal linkedMultiQuery.circom public inputs to LinkedMultiQueryPubSignals
   *
   * @beta
   * @param {Uint8Array} data
   * @returns LinkedMultiQueryPubSignals
   */
  pubSignalsUnmarshal(data: Uint8Array, queryLength: number): LinkedMultiQueryPubSignals {
    const len = queryLength * 2 + 2;
    const sVals: string[] = JSON.parse(byteDecoder.decode(data));

    if (sVals.length !== len) {
      throw new Error(`invalid number of Output values expected ${len} got ${sVals.length}`);
    }

    let fieldIdx = 0;

    // -- linkID
    this.linkID = BigInt(sVals[fieldIdx]);
    fieldIdx++;

    // -- merklized
    this.merklized = parseInt(sVals[fieldIdx]);
    fieldIdx++;

    // - operatorOutput
    this.operatorOutput = [];
    for (let i = 0; i < queryLength; i++) {
      this.operatorOutput.push(BigInt(sVals[fieldIdx]));
      fieldIdx++;
    }

    // - circuitQueryHash
    this.circuitQueryHash = [];
    for (let i = 0; i < queryLength; i++) {
      this.circuitQueryHash.push(BigInt(sVals[fieldIdx]));
      fieldIdx++;
    }

    return this;
  }
}
