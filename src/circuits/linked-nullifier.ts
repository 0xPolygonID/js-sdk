import { Claim, Id } from '@iden3/js-iden3-core';
import { byteDecoder, byteEncoder } from '../utils';

/**
 * LinkedNullifier circuit representation
 * Inputs and public signals declaration, marshalling and parsing
 *
 * @beta
 * @class LinkedNullifierInputs
 */
export class LinkedNullifierInputs {
  linkID!: bigint;
  linkNonce!: bigint;
  issuerClaim!: Claim;
  id!: Id;
  claimSubjectProfileNonce!: bigint;
  verifierID!: Id;
  verifierSessionID!: bigint;

  // InputsMarshal returns Circom private inputs for nullifier.circom
  inputsMarshal(): Uint8Array {
    const s: LinkedNullifierCircuitInputs = {
      linkID: this.linkID.toString(),
      linkNonce: this.linkNonce.toString(),
      issuerClaim: this.issuerClaim.marshalJson(),
      userGenesisID: this.id.bigInt().toString(),
      claimSubjectProfileNonce: this.claimSubjectProfileNonce.toString(),
      claimSchema: this.issuerClaim.getSchemaHash().bigInt().toString(),
      verifierID: this.verifierID.bigInt().toString(),
      verifierSessionID: this.verifierSessionID.toString()
    };

    return byteEncoder.encode(JSON.stringify(s));
  }
}

/**
 * @beta
 */
interface LinkedNullifierCircuitInputs {
  linkID: string;
  linkNonce: string;
  issuerClaim: string[];
  userGenesisID: string;
  claimSubjectProfileNonce: string;
  claimSchema: string;
  verifierID: string;
  verifierSessionID: string;
}

// LinkedNullifierPubSignals nullifier.circom public signals
/**
 * public signals
 *
 * @beta
 * @class LinkedNullifierPubSignals
 */
export class LinkedNullifierPubSignals {
  nullifier!: bigint;
  linkID!: bigint;
  verifierID!: Id;
  verifierSessionID!: bigint;

  /**
   * PubSignalsUnmarshal unmarshal nullifier.circom public inputs to LinkedNullifierPubSignals
   *
   * @beta
   * @param {Uint8Array} data
   * @returns LinkedNullifierPubSignals
   */
  pubSignalsUnmarshal(data: Uint8Array): LinkedNullifierPubSignals {
    const len = 4;
    const sVals: string[] = JSON.parse(byteDecoder.decode(data));

    if (sVals.length !== len) {
      throw new Error(`invalid number of Output values expected ${len} got ${sVals.length}`);
    }

    this.nullifier = BigInt(sVals[0]);

    this.linkID = BigInt(sVals[1]);

    this.verifierID = Id.fromBigInt(BigInt(sVals[2]));

    this.verifierSessionID = BigInt(sVals[3]);

    return this;
  }
}
