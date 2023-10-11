"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FSCircuitStorage = void 0;
const fs_1 = __importDefault(require("fs"));
/**
 * Implementation of ICircuitStorage to store keys data in file system
 *
 * @public
 * @class FSCircuitStorage
 * @implements implements ICircuitStorage interface
 */
class FSCircuitStorage {
    /**
     * Creates an instance of FSCircuitStorage.
     * @param {string} opts - options to read / save files
     */
    constructor(opts) {
        this.opts = opts;
        this._verificationKeyPath = 'verification_key.json';
        this._provingKeyPath = 'circuit_final.zkey';
        this._wasmFilePath = 'circuit.wasm';
        this._verificationKeyPath = this.opts.verificationFileName ?? this._verificationKeyPath;
        this._provingKeyPath = this.opts.provingFileName ?? this._provingKeyPath;
        this._wasmFilePath = this.opts.wasmFileName ?? this._wasmFilePath;
    }
    /**
     * loads circuit data by id from file storage
     * {@inheritdoc  ICircuitStorage.loadCircuitData}
     * @param {CircuitId} circuitId - id of the circuit
     * @returns `Promise<CircuitData>`
     */
    async loadCircuitData(circuitId) {
        const verificationKey = await this.loadCircuitFile(circuitId, this._verificationKeyPath);
        const provingKey = await this.loadCircuitFile(circuitId, this._provingKeyPath);
        const wasm = await this.loadCircuitFile(circuitId, this._wasmFilePath);
        return {
            circuitId,
            wasm,
            provingKey,
            verificationKey
        };
    }
    async loadCircuitFile(circuitId, filename) {
        const keyPath = `${this.opts.dirname}/${circuitId}/${filename}`;
        if (fs_1.default.existsSync(keyPath)) {
            const keyData = fs_1.default.readFileSync(keyPath);
            return new Uint8Array(keyData);
        }
        return null;
    }
    async writeCircuitFile(circuitId, filename, file, encoding) {
        const dirPath = `${this.opts.dirname}/${circuitId}`;
        const keyPath = `${dirPath}/${filename}`;
        fs_1.default.mkdirSync(dirPath, { recursive: true });
        fs_1.default.writeFileSync(keyPath, file, encoding);
    }
    /**
     * {@inheritdoc  ICircuitStorage.loadCircuitData}
     * saves circuit data for circuit id to the file storage
     * @param {CircuitId} circuitId - id of the circuit
     * @param {CircuitData} circuitData - circuit keys
     * @returns `Promise<void>`
     */
    async saveCircuitData(circuitId, circuitData) {
        if (circuitData.verificationKey) {
            await this.writeCircuitFile(circuitId, this._verificationKeyPath, circuitData.verificationKey, 'utf-8');
        }
        if (circuitData.provingKey) {
            await this.writeCircuitFile(circuitId, this._provingKeyPath, circuitData.provingKey);
        }
        if (circuitData.wasm) {
            await this.writeCircuitFile(circuitId, this._wasmFilePath, circuitData.wasm);
        }
    }
}
exports.FSCircuitStorage = FSCircuitStorage;
//# sourceMappingURL=circuits-storage.js.map