/** Circuit data that includes id, wasm file, verification key and proving key */
export type CircuitData = {
    circuitId: string;
    wasm: Uint8Array | null;
    verificationKey: Uint8Array | null;
    provingKey: Uint8Array | null;
};
