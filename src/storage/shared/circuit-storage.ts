import { CircuitId } from '../../circuits';
import { CircuitData } from '../entities/circuitData';
import { StorageErrors } from '../errors';
import { ICircuitStorage } from '../interfaces/circuits';
import { IDataSource } from '../interfaces/data-source';
import { get, set } from 'idb-keyval';

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
  async saveCircuitData(circuitId: CircuitId, circuitData: CircuitData): Promise<void> {
    await this._dataSource.save(circuitId.toString(), circuitData, 'circuitId');
  }
}

declare const chrome: any;
/**
 * Implementation of ICircuitStorage to store keys data
 *
 * @export
 * @beta
 * @class CircuitStorage
 * @implements circuits extension storage
 */
export class CircuitExtensionStorage implements ICircuitStorage {
  constructor(private readonly storage = chrome.storage.local) {}

  private async get(key: string): Promise<CircuitData> {
    return new Promise((resolve) => {
      this.storage.get(key, (result) => {
        console.log(result, 'result');
        resolve(result[key]);
      });
    });
  }

  private async set(circuitId: CircuitId, value: CircuitData): Promise<void> {
    return new Promise((resolve) => {
      this.storage.set({ [circuitId.toString()]: value }, function () {
        console.log('Value is set to ' + value);

        resolve();
      });
    });
  }

  /**
   * loads circuit data by id
   * {@inheritdoc  ICircuitStorage.loadCircuitData}
   * @param {CircuitId} circuitId - id of the circuit
   * @returns `Promise<CircuitData>`
   */
  async loadCircuitData(circuitId: CircuitId): Promise<CircuitData> {
    const circuitData = await this.get(circuitId.toString());
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
    await this.set(circuitId, circuitData);
  }
}

export class IndexedDBCircuitStorage implements ICircuitStorage {
  /**
   * loads circuit data by id
   * {@inheritdoc  ICircuitStorage.loadCircuitData}
   * @param {CircuitId} circuitId - id of the circuit
   * @returns `Promise<CircuitData>`
   */
  async loadCircuitData(circuitId: CircuitId): Promise<CircuitData> {
    const circuitData = await get(circuitId.toString());
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
    await set(circuitId, circuitData);
  }
}
