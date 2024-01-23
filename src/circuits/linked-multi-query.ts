import { poseidon } from '@iden3/js-crypto';
import { Claim } from '@iden3/js-iden3-core';
import { DocumentLoader, Path } from '@iden3/js-jsonld-merklization';
import { JSONObject } from '../iden3comm';
import { parseQueriesMetadata } from '../proof';
import { cacheLoader, createSchemaHash } from '../schema-processor';
import { byteDecoder, byteEncoder } from '../utils';
import { ProofQuery } from '../verifiable';
import {
  BaseConfig,
  bigIntArrayToStringArray,
  existenceToInt,
  getNodeAuxValue,
  prepareCircuitArrayValues,
  prepareSiblingsStr
} from './common';
import { Query } from './models';
import { PubSignalsVerifier } from './pub-signal-verifier';

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
  queryLength!: number;

  // InputsMarshal returns Circom private inputs for linkedMultiQueryInputs.circom
  inputsMarshal(): Uint8Array {
    const enabled: number[] = [];
    const claimPathNotExists: number[] = [];
    const claimPathMtp: string[][] = [];
    const claimPathMtpNoAux: string[] = [];
    const claimPathMtpAuxHi: string[] = [];
    const claimPathMtpAuxHv: string[] = [];
    const claimPathKey: string[] = [];
    const claimPathValue: string[] = [];
    const slotIndex: number[] = [];
    const operator: number[] = [];
    const value: string[][] = [];

    for (let i = 0; i < this.queryLength; i++) {
      if (!this.query[i]) {
        enabled.push(0);
        claimPathNotExists.push(0);
        claimPathMtp.push(new Array(this.getMTLevelsClaim()).fill('0'));

        claimPathMtpNoAux.push('0');
        claimPathMtpAuxHi.push('0');
        claimPathMtpAuxHv.push('0');

        claimPathKey.push('0');

        claimPathValue.push('0');

        slotIndex.push(0);
        operator.push(0);

        const valuesArr = prepareCircuitArrayValues([], this.getValueArrSize());
        value.push(bigIntArrayToStringArray(valuesArr));
        continue;
      }
      enabled.push(1);
      const valueProof = this.query[i].valueProof;
      claimPathNotExists.push(existenceToInt(valueProof.mtp.existence));
      claimPathMtp.push(prepareSiblingsStr(valueProof.mtp, this.getMTLevelsClaim()));

      const nodAuxJSONLD = getNodeAuxValue(valueProof.mtp);

      claimPathMtpNoAux.push(nodAuxJSONLD.noAux);
      claimPathMtpAuxHi.push(nodAuxJSONLD.key.bigInt().toString());
      claimPathMtpAuxHv.push(nodAuxJSONLD.value.bigInt().toString());

      claimPathKey.push(valueProof.path.toString());

      claimPathValue.push(valueProof.value.toString());

      slotIndex.push(this.query[i].slotIndex);
      operator.push(this.query[i].operator);

      const valuesArr = prepareCircuitArrayValues(this.query[i].values, this.getValueArrSize());
      value.push(bigIntArrayToStringArray(valuesArr));
    }

    const s: Partial<LinkedMultiQueryCircuitInputs> = {
      linkNonce: this.linkNonce.toString(),
      issuerClaim: this.claim.marshalJson(),
      enabled,
      claimSchema: this.claim.getSchemaHash().bigInt().toString(),
      claimPathNotExists,
      claimPathMtp,
      claimPathMtpNoAux,
      claimPathMtpAuxHi,
      claimPathMtpAuxHv,
      claimPathKey,
      claimPathValue,
      slotIndex,
      operator,
      value
    };

    return byteEncoder.encode(JSON.stringify(s));
  }
}

/**
 * @beta
 */
interface LinkedMultiQueryCircuitInputs {
  linkNonce: string;
  issuerClaim: string[];
  enabled: number[];
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
  enabled!: boolean[];

  /**
   * PubSignalsUnmarshal unmarshal linkedMultiQuery.circom public inputs to LinkedMultiQueryPubSignals
   *
   * @beta
   * @param {Uint8Array} data
   * @returns LinkedMultiQueryPubSignals
   */
  pubSignalsUnmarshal(data: Uint8Array, queryLength: number): LinkedMultiQueryPubSignals {
    const len = queryLength * 3 + 2;
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

    // - enabled
    this.enabled = [];
    for (let i = 0; i < queryLength; i++) {
      const enabledNum = parseInt(sVals[fieldIdx]);
      this.enabled.push(enabledNum === 1);
      fieldIdx++;
    }

    return this;
  }
}

/**
 * Linked multi query pub signals verifier
 *
 * @public
 * @class LinkedMultiQueryVerifier
 * @extends {IDOwnershipPubSignals}
 * @implements {PubSignalsVerifier}
 */
export class LinkedMultiQueryVerifier implements PubSignalsVerifier {
  readonly pubSignals = new LinkedMultiQueryPubSignals();

  constructor(pubSignals: string[]) {
    this.pubSignals = this.pubSignals.pubSignalsUnmarshal(
      byteEncoder.encode(JSON.stringify(pubSignals)),
      10
    );
  }

  verifyIdOwnership(): Promise<void> {
    return Promise.resolve();
  }

  async verifyQuery(query: ProofQuery, schemaLoader?: DocumentLoader): Promise<BaseConfig> {
    let schema: JSONObject;
    const ldOpts = { documentLoader: schemaLoader ?? cacheLoader() };
    try {
      schema = (await ldOpts.documentLoader(query.context || '')).document as JSONObject;
    } catch (e) {
      throw new Error(`can't load schema for request query`);
    }
    const ldContextJSON = JSON.stringify(schema);
    const credentialSubject = query.credentialSubject as JSONObject;
    const schemaId: string = await Path.getTypeIDFromContext(
      JSON.stringify(schema),
      query.type || '',
      ldOpts
    );
    const schemaHash = createSchemaHash(byteEncoder.encode(schemaId));

    const queriesMetadata = await parseQueriesMetadata(
      query.type || '',
      ldContextJSON,
      credentialSubject,
      ldOpts
    );

    const queryHashes = queriesMetadata.map((queryMeta) => {
      const valueHash = poseidon.spongeHashX(queryMeta.values, 6);
      return poseidon.hash([
        schemaHash.bigInt(),
        BigInt(queryMeta.slotIndex),
        BigInt(queryMeta.operator),
        BigInt(queryMeta.claimPathKey),
        queryMeta.merklizedSchema ? 0n : 1n,
        valueHash
      ]);
    });

    if (!queryHashes.every((queryHash, i) => queryHash === this.pubSignals.circuitQueryHash[i])) {
      throw new Error('query hashes do not match');
    }

    return this.pubSignals as unknown as BaseConfig;
  }

  async verifyStates(): Promise<void> {
    return Promise.resolve();
  }
}
