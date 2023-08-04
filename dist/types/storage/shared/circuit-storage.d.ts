import { CircuitId } from '../../circuits';
import { CircuitData } from '../entities/circuitData';
import { ICircuitStorage } from '../interfaces/circuits';
import { IDataSource } from '../interfaces/data-source';
/**
 * Implementation of ICircuitStorage to store keys data
 *
 * @public
 * @class CircuitStorage
 * @implements implements ICircuitStorage interface
 */
export declare class CircuitStorage implements ICircuitStorage {
    private readonly _dataSource;
    /**
     * storage key for circuits
     */
    static readonly storageKey = "circuits";
    /**
     * Creates an instance of CircuitStorage.
     * @param {IDataSource<CircuitData>} _dataSource - data source to store circuit keys
     */
    constructor(_dataSource: IDataSource<CircuitData>);
    /**
     * loads circuit data by id
     * {@inheritdoc  ICircuitStorage.loadCircuitData}
     * @param {CircuitId} circuitId - id of the circuit
     * @returns `Promise<CircuitData>`
     */
    loadCircuitData(circuitId: CircuitId): Promise<CircuitData>;
    /**
     * {@inheritdoc  ICircuitStorage.loadCircuitData}
     * saves circuit data for circuit id
     * @param {CircuitId} circuitId - id of the circuit
     * @param {CircuitData} circuitData - circuit keys
     * @returns `Promise<void>`
     */
    saveCircuitData(circuitId: CircuitId, circuitData: CircuitData): Promise<void>;
}
