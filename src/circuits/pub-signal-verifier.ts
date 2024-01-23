import { DocumentLoader } from '@iden3/js-jsonld-merklization';
import { StateResolvers } from '../storage/interfaces/resolver';
import { ProofQuery } from '../verifiable';
import { BaseConfig } from './common';

export type VerifyOpts = {
  // acceptedStateTransitionDelay is the period of time in milliseconds that a revoked state remains valid.
  acceptedStateTransitionDelay?: number;
  // acceptedProofGenerationDelay is the period of time in milliseconds that a generated proof remains valid.
  acceptedProofGenerationDelay?: number;
};

export interface PubSignalsVerifier {
  verifyQuery(
    query: ProofQuery,
    schemaLoader?: DocumentLoader,
    verifiablePresentation?: JSON,
    opts?: VerifyOpts,
    circuitParams?: { [key: string]: unknown }
  ): Promise<BaseConfig>;
  verifyStates(resolver: StateResolvers, opts?: VerifyOpts): Promise<void>;
  verifyIdOwnership(sender: string, challenge: bigint): Promise<void>;
}

export interface PubSignals {
  new (pubSignals: string[]): PubSignalsVerifier;
}
