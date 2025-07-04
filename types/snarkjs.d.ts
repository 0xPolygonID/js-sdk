declare module 'snarkjs' {
  export const groth16: {
    verify(verKey: object, pubSignals: string[], proof: object): Promise<boolean>;
    prove(
      provingKey: Uint8Array | object,
      wtnsBytes: Uint8Array | object
    ): Promise<{
      proof: { pi_a: string[]; pi_b: string[][]; pi_c: string[]; protocol: string };
      publicSignals: string[];
    }>;
  };
}
