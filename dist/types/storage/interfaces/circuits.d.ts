import { CircuitId } from '../../circuits';
import { CircuitData } from '../entities/circuitData';
/**
 * Interface to work with circuit files
 *
 * @public
 * @interface   ICircuitStorage
 */
export interface ICircuitStorage {
    /**
     * load circuit keys by id
     *
     * @param {CircuitId} circuitId - circuit id
     * @returns `{Promise<CircuitData>}`
     */
    loadCircuitData(circuitId: CircuitId): Promise<CircuitData>;
    /**
     * saves circuit files by circuit id
     *
     * @param {CircuitId} circuitId - circuit id
     * @param {CircuitData} circuitData - circuit keys
     * @returns `Promise<void>`
     */
    saveCircuitData(circuitId: CircuitId, circuitData: CircuitData): Promise<void>;
}
