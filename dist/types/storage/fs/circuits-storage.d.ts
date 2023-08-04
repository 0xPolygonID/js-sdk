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
export declare class FSCircuitStorage implements ICircuitStorage {
    private readonly opts;
    private readonly _verificationKeyPath;
    private readonly _provingKeyPath;
    private readonly _wasmFilePath;
    /**
     * Creates an instance of FSCircuitStorage.
     * @param {string} opts - options to read / save files
     */
    constructor(opts: FSCircuitStorageOptions);
    /**
     * loads circuit data by id from file storage
     * {@inheritdoc  ICircuitStorage.loadCircuitData}
     * @param {CircuitId} circuitId - id of the circuit
     * @returns `Promise<CircuitData>`
     */
    loadCircuitData(circuitId: CircuitId): Promise<CircuitData>;
    private loadCircuitFile;
    private writeCircuitFile;
    /**
     * {@inheritdoc  ICircuitStorage.loadCircuitData}
     * saves circuit data for circuit id to the file storage
     * @param {CircuitId} circuitId - id of the circuit
     * @param {CircuitData} circuitData - circuit keys
     * @returns `Promise<void>`
     */
    saveCircuitData(circuitId: CircuitId, circuitData: CircuitData): Promise<void>;
}
