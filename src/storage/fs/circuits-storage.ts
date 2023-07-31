import { CircuitId } from '../../circuits';
import { CircuitData } from '../entities/circuitData';
import { ICircuitStorage } from '../interfaces/circuits';
import fs from 'fs';

/**
 * Options for FSCircuitStorage,
 * Path to the circuit file is constructed from `${this._dirname}/${circuitId}/${filename}`,
 * by default values for keys are:
 *   - verification key : verification_key.json
 *   - proving key : circuit_final.zkey
 *   - wasm file : circuit.wasm
 * you can customize filename by passing the corresponding option.
 * dirname is mandatory.
 * hierarchical structure for files is mandatory
 *     e.g. --circuits
 *          -----circuitId
 *          ---------file
 * @public
 * @interface FSCircuitStorageOptions
 */
export interface FSCircuitStorageOptions {
  dirname: string;
  verificationFileName?: string;
  provingFileName?: string;
  wasmFileName?: string;
}
/**
 * Implementation of ICircuitStorage to store keys data in file system
 *
 * @public
 * @class FSCircuitStorage
 * @implements implements ICircuitStorage interface
 */
export class FSCircuitStorage implements ICircuitStorage {
  private readonly _defaultVerificationKeyPath = 'verification_key.json';
  private readonly _defaultProvingKeyPath = 'circuit_final.zkey';
  private readonly _defaultWasmFilePath = 'circuit.wasm';

  /**
   * Creates an instance of FSCircuitStorage.
   * @param {string} opts - options to read / save files
   */
  constructor(private readonly opts: FSCircuitStorageOptions) {}

  /**
   * loads circuit data by id from file storage
   * {@inheritdoc  ICircuitStorage.loadCircuitData}
   * @param {CircuitId} circuitId - id of the circuit
   * @returns `Promise<CircuitData>`
   */
  async loadCircuitData(circuitId: CircuitId): Promise<CircuitData> {
    const verificationKey = await this.loadCircuitFile(
      circuitId,
      this.opts.verificationFileName ?? this._defaultVerificationKeyPath
    );
    const provingKey = await this.loadCircuitFile(
      circuitId,
      this.opts.provingFileName ?? this._defaultProvingKeyPath
    );
    const wasm = await this.loadCircuitFile(
      circuitId,
      this.opts.wasmFileName ?? this._defaultWasmFilePath
    );

    return {
      circuitId,
      wasm,
      provingKey,
      verificationKey
    };
  }

  private async loadCircuitFile(
    circuitId: CircuitId,
    filename: string
  ): Promise<Uint8Array | null> {
    const keyPath = `${this.opts.dirname}/${circuitId}/${filename}`;
    if (fs.existsSync(keyPath)) {
      const keyData = fs.readFileSync(keyPath);
      return new Uint8Array(keyData);
    }
    return null;
  }
  private async writeCircuitFile(
    circuitId: CircuitId,
    filename: string,
    file: Uint8Array,
    encoding?: BufferEncoding
  ): Promise<void> {
    const dirPath = `${this.opts.dirname}/${circuitId}`;
    const keyPath = `${dirPath}/${filename}`;
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(keyPath, file, encoding);
  }

  /**
   * {@inheritdoc  ICircuitStorage.loadCircuitData}
   * saves circuit data for circuit id to the file storage
   * @param {CircuitId} circuitId - id of the circuit
   * @param {CircuitData} circuitData - circuit keys
   * @returns `Promise<void>`
   */
  async saveCircuitData(circuitId: CircuitId, circuitData: CircuitData): Promise<void> {
    if (circuitData.verificationKey) {
      await this.writeCircuitFile(
        circuitId,
        this.opts.verificationFileName ?? this._defaultVerificationKeyPath,
        circuitData.verificationKey,
        'utf-8'
      );
    }

    if (circuitData.provingKey) {
      await this.writeCircuitFile(
        circuitId,
        this.opts.provingFileName ?? this._defaultProvingKeyPath,
        circuitData.provingKey
      );
    }
    if (circuitData.wasm) {
      await this.writeCircuitFile(
        circuitId,
        this.opts.wasmFileName ?? this._defaultWasmFilePath,
        circuitData.wasm
      );
    }
  }
}
