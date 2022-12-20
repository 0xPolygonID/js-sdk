import { ZKProof } from '@iden3/js-jwz';
import * as snarkjs from 'snarkjs';
import { CircuitId } from '../circuits';
import { FullProof } from './proof-service';
import { witnessBuilder } from './witness_calculator';

/* eslint-disable no-console */

// ProverConfig represents prover server config
export interface ProverConfig {
  //todo provide loader
  circuitsLoader: any;
}
// ProverService service responsible for zk generation
export class ProverService {
  constructor(private readonly _config: ProverConfig) {}

  async verify(zkp: FullProof, circuitName: CircuitId): Promise<boolean> {
    try {
      const verKey: Uint8Array = await this._config.circuitsLoader.loadVerificationKey(circuitName);

      await snarkjs.groth16.verify(
        JSON.parse(new TextDecoder().decode(verKey)),
        zkp.pub_signals,
        zkp.proof
      );
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  // Generate calls prover-server for proof generation
  async generate(inputs: Uint8Array, circuitId: string): Promise<ZKProof> {
    try {
      const wasm: Uint8Array = await this._config.circuitsLoader.loadWasm(circuitId);
      const witnessCalculator = await witnessBuilder(wasm);

      const parsedData = JSON.parse(new TextDecoder().decode(inputs));

      const wtnsBytes: Uint8Array = await witnessCalculator.calculateWTNSBin(parsedData, 0);

      const provingKey = await this._config.circuitsLoader.loadProvingKey(circuitId);

      const { proof, publicSignals } = await snarkjs.groth16.prove(provingKey, wtnsBytes);

      return {
        proof: proof,
        pub_signals: publicSignals
      };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
