import { CircuitId } from '../../circuits';
import { CircuitData } from '../entities/circuitData';

export interface ICircuitStorage {
  loadCircuitData(circuitId: CircuitId): Promise<CircuitData>;
  saveCircuitData(circuitId: CircuitId, circuitData: CircuitData): Promise<void>;
}
