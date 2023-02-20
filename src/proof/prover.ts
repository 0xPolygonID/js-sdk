import { ZKProof } from '@iden3/js-jwz';
import * as snarkjs from 'snarkjs';
import { CircuitId } from '../circuits';
import { ICircuitStorage } from '../storage/interfaces/circuits';
import { witnessBuilder } from './witness_calculator';
import { getCurveFromName } from 'ffjavascript';

/* eslint-disable no-console */

// NativeProver service responsible for zk generation groth16 algorithm with bn128 curve
export class NativeProver {
  private static readonly curveName = 'bn128';
  constructor(private readonly _circuitStorage: ICircuitStorage) {}

  async verify(zkp: ZKProof, circuitName: CircuitId): Promise<boolean> {
    try {
      const verKey: Uint8Array = (await this._circuitStorage.loadCircuitData(circuitName))
        .verificationKey;

      await snarkjs.groth16.verify(
        JSON.parse(new TextDecoder().decode(verKey)),
        zkp.pub_signals,
        zkp.proof
      );

      // we need to terminate curve manually
      await this.terminateCurve();
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  // Generate calls prover-server for proof generation
  async generate(inputs: Uint8Array, circuitId: CircuitId): Promise<ZKProof> {
    try {
      const circuitData = await this._circuitStorage.loadCircuitData(circuitId);
      const wasm: Uint8Array = circuitData.wasm;

      const witnessCalculator = await witnessBuilder(wasm);

      const parsedData = JSON.parse(new TextDecoder().decode(inputs));

      const wtnsBytes: Uint8Array = await witnessCalculator.calculateWTNSBin(parsedData, 0);

      const provingKey = circuitData.provingKey;

      const { proof, publicSignals } = await snarkjs.groth16.prove(provingKey, wtnsBytes);

      // we need to terminate curve manually
      await this.terminateCurve();

      return {
        proof: proof,
        pub_signals: publicSignals
      };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  private async terminateCurve(): Promise<void> {
    const curve = await getCurveFromName(NativeProver.curveName);
    curve.terminate();
  }
}
