import { CircuitId } from '../../circuits';
import { CircuitData } from '../entities/circuitData';
import { ICircuitStorage } from '../interfaces/circuits';

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
  private readonly _verificationKeyPath: string = 'verification_key.json';
  private readonly _provingKeyPath: string = 'circuit_final.zkey';
  private readonly _wasmFilePath: string = 'circuit.wasm';

  private _fs: typeof import('fs') | null = null;

  private readonly _browserNotSupportedError: Error = new Error(
    'File system operations are not supported in browser environment'
  );

  private async getFs(): Promise<typeof import('fs')> {
    if (this._fs) {
      return this._fs;
    }

    if (!process.env.BUILD_BROWSER) {
      this._fs = await import('fs');
    } else {
      this._fs = {
        existsSync: () => {
          throw this._browserNotSupportedError;
        },
        readFileSync: () => {
          throw this._browserNotSupportedError;
        },
        writeFileSync: () => {
          throw this._browserNotSupportedError;
        },
        mkdirSync: () => {
          throw this._browserNotSupportedError;
        }
      } as unknown as typeof import('fs');
    }

    return this._fs;
  }
  /**
   * Creates an instance of FSCircuitStorage.
   * @param {string} opts - options to read / save files
   */
  constructor(private readonly opts: FSCircuitStorageOptions) {
    this._verificationKeyPath = this.opts.verificationFileName ?? this._verificationKeyPath;
    this._provingKeyPath = this.opts.provingFileName ?? this._provingKeyPath;
    this._wasmFilePath = this.opts.wasmFileName ?? this._wasmFilePath;
  }

  /**
   * loads circuit data by id from file storage
   * {@inheritdoc  ICircuitStorage.loadCircuitData}
   * @param {CircuitId} circuitId - id of the circuit
   * @returns `Promise<CircuitData>`
   */
  async loadCircuitData(circuitId: CircuitId): Promise<CircuitData> {
    const verificationKey = await this.loadCircuitFile(circuitId, this._verificationKeyPath);
    const provingKey = await this.loadCircuitFile(circuitId, this._provingKeyPath);
    const wasm = await this.loadCircuitFile(circuitId, this._wasmFilePath);

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
    const fs = await this.getFs();
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
    const fs = await this.getFs();
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
        this._verificationKeyPath,
        circuitData.verificationKey,
        'utf-8'
      );
    }

    if (circuitData.provingKey) {
      await this.writeCircuitFile(circuitId, this._provingKeyPath, circuitData.provingKey);
    }
    if (circuitData.wasm) {
      await this.writeCircuitFile(circuitId, this._wasmFilePath, circuitData.wasm);
    }
  }
}
