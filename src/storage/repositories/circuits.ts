import { CircuitId } from '../../circuits';
import { CircuitData } from '../entities/circuitData';
import { ICircuitStorage } from '../interfaces/circuits';
import { IDataSource } from '../interfaces/data-source';

export class CircuitRepository implements ICircuitStorage {
  constructor(private source: IDataSource<CircuitData>) {}

  async loadCircuitData(circuitId: CircuitId): Promise<CircuitData> {
    return this.source.get(circuitId.toString(), 'id');
  }
  async saveCircuitData(circuitId: CircuitId, circuitData: CircuitData): Promise<void> {
    return this.source.save(circuitId.toString(), circuitData, 'id');
  }

  get data() {
    return this.source.load();
  }
}
