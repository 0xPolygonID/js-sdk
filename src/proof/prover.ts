/* eslint-disable @typescript-eslint/no-var-requires */
import { ZKProof } from '@iden3/js-jwz';
import { CircuitId } from '../circuits';
import { ICircuitStorage } from '../storage/interfaces/circuits';
import { witnessBuilder } from './witness_calculator';
import { byteDecoder } from '../utils';
import * as snarkjs from 'snarkjs';
import { getCurveFromName } from 'ffjavascript';

/**
 * ZKProver is responsible for proof generation and verification
 *
 * @public
 * @interface ZKProver
 */
export interface IZKProver {
  /**
   * generates zero knowledge proof
   *
   * @param {Uint8Array} inputs - inputs that will be used for proof generation
   * @param {string} circuitId - circuit id for proof generation
   * @returns `Promise<ZKProof>`
   */
  generate(inputs: Uint8Array, circuitId: string): Promise<ZKProof>;
  /**
   * verifies zero knowledge proof
   *
   * @param {ZKProof} zkp - zero knowledge proof that will be verified
   * @param {string} circuitId - circuit id for proof verification
   * @returns `Promise<ZKProof>`
   */
  verify(zkp: ZKProof, circuitId: string): Promise<boolean>;
}

/**
 *  NativeProver service responsible for zk generation and verification of groth16 algorithm with bn128 curve
 * @public
 * @class NativeProver
 * @implements implements IZKProver interface
 */
export class NativeProver implements IZKProver {
  private static readonly curveName = 'bn128';
  constructor(private readonly _circuitStorage: ICircuitStorage) {}

  /**
   * verifies zero knowledge proof
   *
   * @param {ZKProof} zkp - zero knowledge proof that will be verified
   * @param {string} circuitId - circuit id for proof verification
   * @returns `Promise<ZKProof>`
   */
  async verify(zkp: ZKProof, circuitName: CircuitId): Promise<boolean> {
    try {
      const verKey: Uint8Array = (await this._circuitStorage.loadCircuitData(circuitName))
        .verificationKey;

      await snarkjs.groth16.verify(
        JSON.parse(byteDecoder.decode(verKey)),
        zkp.pub_signals,
        zkp.proof
      );

      // we need to terminate curve manually
      await this.terminateCurve();
      return true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      return false;
    }
  }

  /**
   * generates zero knowledge proof
   *
   * @param {Uint8Array} inputs - inputs that will be used for proof generation
   * @param {string} circuitId - circuit id for proof generation
   * @returns `Promise<ZKProof>`
   */
  async generate(inputs: Uint8Array, circuitId: CircuitId): Promise<ZKProof> {
    const circuitData = await this._circuitStorage.loadCircuitData(circuitId);
    const wasm: Uint8Array = circuitData.wasm;

    const witnessCalculator = await witnessBuilder(wasm);

    const parsedData = JSON.parse(byteDecoder.decode(inputs));

    const wtnsBytes: Uint8Array = await witnessCalculator.calculateWTNSBin(parsedData, 0);

    const provingKey = circuitData.provingKey;

    const { proof, publicSignals } = await snarkjs.groth16.prove(provingKey, wtnsBytes);

    // we need to terminate curve manually
    await this.terminateCurve();

    return {
      proof,
      pub_signals: publicSignals
    };
  }

  private async terminateCurve(): Promise<void> {
    const curve = await getCurveFromName(NativeProver.curveName);
    curve.terminate();
  }
}
