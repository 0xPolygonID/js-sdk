import { CircuitId } from '../../circuits';
import { CircuitData } from '../entities/circuitData';
import { StorageErrors } from '../errors';
import { ICircuitStorage } from '../interfaces/circuits';
import { IDataSource } from '../interfaces/data-source';

export class CircuitStorage implements ICircuitStorage {
  constructor(private readonly _dataSource: IDataSource<CircuitData>) {}

  async loadCircuitData(circuitId: CircuitId): Promise<CircuitData> {
    const circuitData = this._dataSource.get(circuitId.toString(), 'circuitId');
    if (!circuitData) {
      throw new Error(`${StorageErrors.ItemNotFound}: ${circuitId}`);
    }
    return circuitData;
  }

  async saveCircuitData(circuitId: CircuitId, circuitData: CircuitData): Promise<void> {
    this._dataSource.save(circuitId.toString(), circuitData, 'circuitId');
  }
}
