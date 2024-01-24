import { poseidon } from '@iden3/js-crypto';
import { DocumentLoader, Path } from '@iden3/js-jsonld-merklization';
import { JSONObject } from '../../iden3comm';
import { parseQueriesMetadata } from '../../proof';
import { cacheLoader, createSchemaHash } from '../../schema-processor';
import { byteEncoder } from '../../utils';
import { ProofQuery } from '../../verifiable';
import { BaseConfig } from '../common';
import { LinkedMultiQueryPubSignals } from '../linked-multi-query';
import { PubSignalsVerifier } from './pub-signal-verifier';

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
