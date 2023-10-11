"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NativeProver = void 0;
const witness_calculator_1 = require("./witness_calculator");
const utils_1 = require("../utils");
const snarkjs = __importStar(require("snarkjs"));
const ffjavascript_1 = require("ffjavascript");
/**
 *  NativeProver service responsible for zk generation and verification of groth16 algorithm with bn128 curve
 * @public
 * @class NativeProver
 * @implements implements IZKProver interface
 */
class NativeProver {
    constructor(_circuitStorage) {
        this._circuitStorage = _circuitStorage;
    }
    /**
     * verifies zero knowledge proof
     *
     * @param {ZKProof} zkp - zero knowledge proof that will be verified
     * @param {string} circuitId - circuit id for proof verification
     * @returns `Promise<ZKProof>`
     */
    async verify(zkp, circuitId) {
        try {
            const circuitData = await this._circuitStorage.loadCircuitData(circuitId);
            if (!circuitData.verificationKey) {
                throw new Error(`verification file doesn't exist for circuit ${circuitId}`);
            }
            const result = await snarkjs.groth16.verify(JSON.parse(utils_1.byteDecoder.decode(circuitData.verificationKey)), zkp.pub_signals, zkp.proof);
            // we need to terminate curve manually
            await this.terminateCurve();
            return result;
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.log(e);
            return false;
        }
    }
    /**
     * generates zero knowledge proof
     *
     * @param {Uint8Array} inputs - inputs that will be used for proof generation
     * @param {string} circuitId - circuit id for proof generation
     * @returns `Promise<ZKProof>`
     */
    async generate(inputs, circuitId) {
        const circuitData = await this._circuitStorage.loadCircuitData(circuitId);
        if (!circuitData.wasm) {
            throw new Error(`wasm file doesn't exist for circuit ${circuitId}`);
        }
        const witnessCalculator = await (0, witness_calculator_1.witnessBuilder)(circuitData.wasm);
        const parsedData = JSON.parse(utils_1.byteDecoder.decode(inputs));
        const wtnsBytes = await witnessCalculator.calculateWTNSBin(parsedData, 0);
        if (!circuitData.provingKey) {
            throw new Error(`proving file doesn't exist for circuit ${circuitId}`);
        }
        const { proof, publicSignals } = await snarkjs.groth16.prove(circuitData.provingKey, wtnsBytes);
        // we need to terminate curve manually
        await this.terminateCurve();
        return {
            proof,
            pub_signals: publicSignals
        };
    }
    async terminateCurve() {
        const curve = await (0, ffjavascript_1.getCurveFromName)(NativeProver.curveName);
        curve.terminate();
    }
}
exports.NativeProver = NativeProver;
NativeProver.curveName = 'bn128';
//# sourceMappingURL=prover.js.map