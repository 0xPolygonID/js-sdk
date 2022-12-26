import { CircuitId } from '../../circuits';
import { CircuitData } from '../entities/circuitData';
import { ICircuitStorage } from '../interfaces/circuits';

export class InMemoryCircuitStorage implements ICircuitStorage {
  private _circuirs: Map<CircuitId, CircuitData>;
  constructor() {
    this._circuirs = new Map<CircuitId, CircuitData>();
  }
  async loadCircuitData(circuitId: CircuitId): Promise<CircuitData> {
    const circuitData = this._circuirs.get(circuitId);
    if (!circuitData) {
      throw new Error(`no circuit data for ${circuitId}`);
    }
    return circuitData;
  }
  async saveCircuitData(circuitId: CircuitId, circuitData: CircuitData): Promise<void> {
    this._circuirs.set(circuitId, circuitData);
  }
}
