import { verifyGroth16Proof, ZKProof } from '@iden3/js-jwz';
import { witnessBuilder } from './witness_calculator';
import * as snarkjs from 'snarkjs';
import * as ffjavascript from 'ffjavascript';
import { ICircuitStorage } from '../../storage';
import { CircuitId } from '../../circuits';
import { byteDecoder, toArrayBuffer } from '../../utils';

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
   * @returns `Promise<boolean>`
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
  async verify(zkp: ZKProof, circuitId: CircuitId): Promise<boolean> {
    try {
      const circuitData = await this._circuitStorage.loadCircuitData(circuitId);

      if (!circuitData.verificationKey) {
        throw new Error(`verification file doesn't exist for circuit ${circuitId}`);
      }

      return verifyGroth16Proof(zkp, JSON.parse(byteDecoder.decode(circuitData.verificationKey)));
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
    if (!circuitData.wasm) {
      throw new Error(`wasm file doesn't exist for circuit ${circuitId}`);
    }

    const witnessCalculator = await witnessBuilder(toArrayBuffer(circuitData.wasm));

    const parsedData = JSON.parse(byteDecoder.decode(inputs));

    const wtnsBytes: Uint8Array = await witnessCalculator.calculateWTNSBin(parsedData, 0);

    if (!circuitData.provingKey) {
      throw new Error(`proving file doesn't exist for circuit ${circuitId}`);
    }
    const { proof, publicSignals } = await snarkjs.groth16.prove(circuitData.provingKey, wtnsBytes);

    // we need to terminate curve manually
    await this.terminateCurve();

    return {
      proof,
      pub_signals: publicSignals
    };
  }

  private async terminateCurve(): Promise<void> {
    const curve = await ffjavascript.getCurveFromName(NativeProver.curveName);
    curve.terminate();
  }
}
