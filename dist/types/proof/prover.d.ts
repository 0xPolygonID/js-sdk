import { ZKProof } from '@iden3/js-jwz';
import { CircuitId } from '../circuits';
import { ICircuitStorage } from '../storage/interfaces/circuits';
/**
 * ZKProver is responsible for proof generation and verification
 *
 * @public
 * @interface ZKProver
 */
export interface IZKProver {
    /**
     * generates zero knowledge proof
     *
     * @param {Uint8Array} inputs - inputs that will be used for proof generation
     * @param {string} circuitId - circuit id for proof generation
     * @returns `Promise<ZKProof>`
     */
    generate(inputs: Uint8Array, circuitId: string): Promise<ZKProof>;
    /**
     * verifies zero knowledge proof
     *
     * @param {ZKProof} zkp - zero knowledge proof that will be verified
     * @param {string} circuitId - circuit id for proof verification
     * @returns `Promise<boolean>`
     */
    verify(zkp: ZKProof, circuitId: string): Promise<boolean>;
}
/**
 *  NativeProver service responsible for zk generation and verification of groth16 algorithm with bn128 curve
 * @public
 * @class NativeProver
 * @implements implements IZKProver interface
 */
export declare class NativeProver implements IZKProver {
    private readonly _circuitStorage;
    private static readonly curveName;
    constructor(_circuitStorage: ICircuitStorage);
    /**
     * verifies zero knowledge proof
     *
     * @param {ZKProof} zkp - zero knowledge proof that will be verified
     * @param {string} circuitId - circuit id for proof verification
     * @returns `Promise<ZKProof>`
     */
    verify(zkp: ZKProof, circuitId: CircuitId): Promise<boolean>;
    /**
     * generates zero knowledge proof
     *
     * @param {Uint8Array} inputs - inputs that will be used for proof generation
     * @param {string} circuitId - circuit id for proof generation
     * @returns `Promise<ZKProof>`
     */
    generate(inputs: Uint8Array, circuitId: CircuitId): Promise<ZKProof>;
    private terminateCurve;
}
