import { AtomicQueryMTPV2PubSignalsVerifier } from './atomic-query-mtp-v2';
import { AtomicQuerySigV2PubSignalsVerifier } from './atomic-query-sig-v2';
import { AtomicQueryV3PubSignalsVerifier } from './atomic-query-v3';
import { AuthV2PubSignalsVerifier } from './auth-v2';
import { LinkedMultiQueryVerifier } from './linked-multi-query';
import { PubSignals, PubSignalsVerifier } from './pub-signal-verifier';

export type VerifierType = PubSignalsVerifier & PubSignals;

/**
 * Supported circuits for handle authorization response
 */
const supportedCircuits: { [key: string]: unknown } = {
  AuthV2PubSignalsVerifier,
  AtomicQueryMTPV2PubSignalsVerifier,
  AtomicQuerySigV2PubSignalsVerifier,
  AtomicQueryV3PubSignalsVerifier,
  LinkedMultiQueryVerifier
};

export class Circuits {
  static getCircuitPubSignals(id: string): VerifierType {
    id = id.split('-')[0];
    return supportedCircuits[id] as VerifierType;
  }
}
