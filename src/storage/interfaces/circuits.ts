import { CircuitId } from '../../circuits';
import { CircuitData } from '../entities/circuitData';

/**
 * Circuit load mode
 */
export enum CircuitLoadMode {
  Proving = 'proving',
  Verification = 'verification',
  Full = 'full'
}

/**
 * Circuit load options
 */
export type CircuitLoadOpts = {
  mode: CircuitLoadMode;
};

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
  loadCircuitData(circuitId: CircuitId, opts?: CircuitLoadOpts): Promise<CircuitData>;

  /**
   * saves circuit files by circuit id
   *
   * @param {CircuitId} circuitId - circuit id
   * @param {CircuitData} circuitData - circuit keys
   * @returns `Promise<void>`
   */
  saveCircuitData(circuitId: CircuitId, circuitData: CircuitData): Promise<void>;
}
