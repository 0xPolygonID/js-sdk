/** Circuit data that includes id, wasm file, verification key and proving key */
export type CircuitData = {
  circuitId: string;
  wasm: Uint8Array;
  verificationKey: Uint8Array;
  provingKey: Uint8Array;
};
