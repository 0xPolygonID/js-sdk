import { DocumentLoader } from '@iden3/js-jsonld-merklization';
import { StateResolvers } from '../storage/interfaces/resolver';
import { AuthV2PubSignals } from './auth-v2';
import { BaseConfig } from './common';
import { Query } from './models';

export type VerifyOpts = {
  // acceptedStateTransitionDelay is the period of time in milliseconds that a revoked state remains valid.
  acceptedStateTransitionDelay?: number;
  // acceptedProofGenerationDelay is the period of time in milliseconds that a generated proof remains valid.
  acceptedProofGenerationDelay?: number;
};

export interface PubSignalsVerifier {
  verifyQuery(
    query: Query,
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

const authV2 = AuthV2PubSignals;

export type VerifierType = PubSignalsVerifier & PubSignals;

const supportedCircuits: { [key: string]: unknown } = {
  authV2
};

export class Circuits {
  static getCircuitPubSignals(id: string): VerifierType {
    id = id.split('-')[0];
    return supportedCircuits[id] as VerifierType;
  }
}
