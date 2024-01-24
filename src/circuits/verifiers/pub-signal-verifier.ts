import { DocumentLoader } from '@iden3/js-jsonld-merklization';
import { StateResolvers } from '../../storage/interfaces/resolver';
import { ProofQuery } from '../../verifiable';
import { BaseConfig } from '../common';

/**
 * Options to verify state
 */
export type VerifyOpts = {
  // acceptedStateTransitionDelay is the period of time in milliseconds that a revoked state remains valid.
  acceptedStateTransitionDelay?: number;
  // acceptedProofGenerationDelay is the period of time in milliseconds that a generated proof remains valid.
  acceptedProofGenerationDelay?: number;
};

/**
 *
 * PubSignalsVerifier interface to verify pub signals
 * @public
 * @interface   PubSignalsVerifier
 */
export interface PubSignalsVerifier {
  /**
   * verify query
   *
   * @param {ProofQuery} query
   * @param {DocumentLoader} schemaLoader
   * @param {JSON} verifiablePresentation
   * @param {VerifyOpts} opts
   * @param { { [key: string]: unknown } } circuitParams
   * @returns {Promise<BaseConfig>}
   */
  verifyQuery(
    query: ProofQuery,
    schemaLoader?: DocumentLoader,
    verifiablePresentation?: JSON,
    opts?: VerifyOpts,
    circuitParams?: { [key: string]: unknown }
  ): Promise<BaseConfig>;
  /**
   * verify states
   *
   * @param {StateResolvers} resolver
   * @param {VerifyOpts} opts
   * @returns {Promise<void>}
   */
  verifyStates(resolver: StateResolvers, opts?: VerifyOpts): Promise<void>;
  /**
   * verify id ownerhsip
   *
   * @param {string} sender
   * @param {bigint} challenge
   * @returns {Promise<void>}
   */
  verifyIdOwnership(sender: string, challenge: bigint): Promise<void>;
}

/**
 *
 * PubSignals extends pub signals with constructor which returns PubSignalsVerifier
 * @public
 * @interface   PubSignals
 */
export interface PubSignals {
  new (pubSignals: string[]): PubSignalsVerifier;
}
