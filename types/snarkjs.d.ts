declare module 'snarkjs' {
  export namespace groth16 {
    export function verify(verKey: object, pubSignals: string[], proof: object): Promise<boolean>;

    export function prove(
      provingKey: object,
      wtnsBytes: object
    ): Promise<{
      proof: { pi_a: string[]; pi_b: string[][]; pi_c: string[]; protocol: string };
      publicSignals: string[];
    }>;
  }
}
