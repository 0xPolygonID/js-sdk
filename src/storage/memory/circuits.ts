import { CircuitId } from '../../circuits';
import { CircuitData } from '../entities/circuitData';
import { ICircuitStorage } from '../interfaces/circuits';

/**
 * Circuit storage in the memory
 *
 * @export
 * @beta
 * @class InMemoryCircuitStorage
 * @implements implements ICircuitStorage interface
 */
export class InMemoryCircuitStorage implements ICircuitStorage {
  private _circuits: Map<CircuitId, CircuitData>;
  /**
   * Creates an instance of InMemoryCircuitStorage.
   */
  constructor() {
    this._circuits = new Map<CircuitId, CircuitData>();
  }
  /** load circuit data from the memory */
  async loadCircuitData(circuitId: CircuitId): Promise<CircuitData> {
    const circuitData = this._circuits.get(circuitId);
    if (!circuitData) {
      throw new Error(`no circuit data for ${circuitId}`);
    }
    return circuitData;
  }
  /** save circuit data to the memory */
  async saveCircuitData(circuitId: CircuitId, circuitData: CircuitData): Promise<void> {
    this._circuits.set(circuitId, circuitData);
  }
}
