import { CircuitId } from '../../circuits';
import { CircuitData } from '../entities/circuitData';

/**
 * Circuit load mode
 */
export enum CircuitLoadMode {
  /**
   * Load only proving keys
   */
  Proving = 'proving',
  /**
   * Load only verification keys
   */
  Verification = 'verification',
  /**
   * Load all circuit files
   */
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
   * @param {CircuitLoadOpts} [opts] - load options, determines which circuit files are loaded (e.g. proving keys, verification keys, or all files)
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
