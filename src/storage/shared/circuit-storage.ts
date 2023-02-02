import { CircuitId } from '../../circuits';
import { CircuitData } from '../entities/circuitData';
import { StorageErrors } from '../errors';
import { ICircuitStorage } from '../interfaces/circuits';
import { IDataSource } from '../interfaces/data-source';

/**
 * Implementation of ICircuitStorage to store keys data
 *
 * @export
 * @beta
 * @class CircuitStorage
 * @implements implements ICircuitStorage interface
 */
export class CircuitStorage implements ICircuitStorage {
  /**
   * Creates an instance of CircuitStorage.
   * @param {IDataSource<CircuitData>} _dataSource - data source to store circuit keys
   */
  constructor(private readonly _dataSource: IDataSource<CircuitData>) {}

  /**
   * loads circuit data by id
   * {@inheritdoc  ICircuitStorage.loadCircuitData}
   * @param {CircuitId} circuitId - id of the circuit
   * @returns `Promise<CircuitData>`
   */
  async loadCircuitData(circuitId: CircuitId): Promise<CircuitData> {
    const circuitData = this._dataSource.get(circuitId.toString(), 'circuitId');
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
  async saveCircuitData(circuitId: CircuitId, circuitData: CircuitData): Promise<void> {
    this._dataSource.save(circuitId.toString(), circuitData, 'circuitId');
  }
}
