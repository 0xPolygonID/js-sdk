import { Claim } from '@iden3/js-iden3-core';
import { BaseConfig } from './common';
import { Query } from './models';
/**
 * LinkedMultiQuery circuit representation
 * Inputs and public signals declaration, marshalling and parsing
 *
 * @class LinkedMultiQueryInputs
 */
export declare class LinkedMultiQueryInputs extends BaseConfig {
    private readonly _queryCount;
    constructor(_queryCount: number);
    get queryCount(): number;
    linkNonce: bigint;
    claim: Claim;
    query: Query[];
    inputsMarshal(): Uint8Array;
}
export declare class LinkedMultiQueryPubSignals {
    readonly queryCount: number;
    linkID: bigint;
    merklized: number;
    operatorOutput: bigint[];
    circuitQueryHash: bigint[];
    constructor(queryCount?: number);
    /**
     * PubSignalsUnmarshal unmarshal linkedMultiQuery.circom public inputs to LinkedMultiQueryPubSignals
     *
     * @param {Uint8Array} data
     * @returns LinkedMultiQueryPubSignals
     */
    pubSignalsUnmarshal(data: Uint8Array): LinkedMultiQueryPubSignals;
}
//# sourceMappingURL=linked-multi-query.d.ts.map