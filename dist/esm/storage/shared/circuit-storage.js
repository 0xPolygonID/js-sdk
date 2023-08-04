import { StorageErrors } from '../errors';
/**
 * Implementation of ICircuitStorage to store keys data
 *
 * @public
 * @class CircuitStorage
 * @implements implements ICircuitStorage interface
 */
export class CircuitStorage {
    /**
     * Creates an instance of CircuitStorage.
     * @param {IDataSource<CircuitData>} _dataSource - data source to store circuit keys
     */
    constructor(_dataSource) {
        this._dataSource = _dataSource;
    }
    /**
     * loads circuit data by id
     * {@inheritdoc  ICircuitStorage.loadCircuitData}
     * @param {CircuitId} circuitId - id of the circuit
     * @returns `Promise<CircuitData>`
     */
    async loadCircuitData(circuitId) {
        const circuitData = await this._dataSource.get(circuitId.toString(), 'circuitId');
        if (!circuitData) {
            throw new Error(`${StorageErrors.ItemNotFound}: ${circuitId}`);
        }
        return circuitData;
    }
    /**
     * {@inheritdoc  ICircuitStorage.loadCircuitData}
     * saves circuit data for circuit id
     * @param {CircuitId} circuitId - id of the circuit
     * @param {CircuitData} circuitData - circuit keys
     * @returns `Promise<void>`
     */
    async saveCircuitData(circuitId, circuitData) {
        await this._dataSource.save(circuitId.toString(), circuitData, 'circuitId');
    }
}
/**
 * storage key for circuits
 */
CircuitStorage.storageKey = 'circuits';
//# sourceMappingURL=circuit-storage.js.map