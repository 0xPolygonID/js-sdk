import { AuthV2PubSignals } from './auth-v2';
import { PubSignals, PubSignalsVerifier } from './pub-signal-verifier';

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
