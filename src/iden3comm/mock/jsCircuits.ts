import { Id } from '@iden3/js-iden3-core';

export type CircuitID = string;

// AuthPubSignals auth.circom public signals
export interface AuthPubSignals {
  challenge: bigint;
  userState: bigint;
  userId: Id;
}

const unmarshallToAuthPubSignals = (pubsignals: string[]): AuthPubSignals => {
  const outputs: AuthPubSignals = {} as AuthPubSignals;
  if (pubsignals.length != 3) {
    throw new Error(
      `invalid number of Output values expected ${3} got ${pubsignals.length}`,
    );
  }
  outputs.challenge = BigInt(pubsignals[0]);
  outputs.userState = BigInt(pubsignals[1]);
  outputs.userId = Id.fromBigInt(BigInt(pubsignals[2]));

  return outputs;
};

export const circuits = {
  unmarshallToAuthPubSignals,
  authCircuitID: 'auth',
};
