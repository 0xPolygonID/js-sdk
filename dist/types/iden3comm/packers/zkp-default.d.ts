import { IProofService } from '../../proof';
import { ICircuitStorage } from '../../storage';
import { BasicMessage, StateVerificationOpts, ZKPPackerParams } from '../types';
import { ZKPPacker } from './zkp';
/** * Default ZKP Packer that loads circuit data from provided circuit storage
 * and uses provided proof service to generate and verify proofs.
 *
 * @public
 * @class DefaultZKPPacker
 */
export declare class DefaultZKPPacker extends ZKPPacker {
    private circuitStorage;
    private proofService;
    /**
     * Constructs a new instance of the class.
     *
     * @param circuitStorage - An implementation of the ICircuitStorage interface used to manage circuit data.
     * @param proofService - An implementation of the IProofService interface responsible for generating and verifying proofs.
     * @param opts - Optional state verification options to customize the behavior of the packer.
     */
    constructor(circuitStorage: ICircuitStorage, proofService: IProofService, opts?: StateVerificationOpts);
    /**
     * Packs the given payload using zero-knowledge proof (ZKP) parameters.
     *
     * Loads the circuit data (proving key and wasm) for the specified circuit ID from the circuit storage.
     * If the circuit data is not found, throws an error.
     * Caches the proving parameters for the proving method algorithm if not already cached.
     * Delegates the actual packing to the superclass implementation.
     *
     * @param payload - The data to be packed, as a Uint8Array.
     * @param params - The parameters required for ZKP packing, including the proving method algorithm.
     * @returns A Promise that resolves to the packed payload as a Uint8Array.
     * @throws If the circuit data (proving key or wasm) is not found for the given circuit ID.
     */
    pack(payload: Uint8Array, params: ZKPPackerParams): Promise<Uint8Array>;
    /**
     * Unpacks a ZKP envelope into a `BasicMessage` by parsing the token, loading the verification key if necessary,
     * and preparing the verification parameters for the proving method algorithm.
     *
     * This method ensures that the verification parameters for the given circuit and algorithm are loaded and cached.
     * If the verification key is not found for the specified circuit, an error is thrown.
     *
     * @param envelope - The serialized ZKP envelope as a `Uint8Array`.
     * @returns A promise that resolves to a `BasicMessage` extracted from the envelope.
     * @throws If the verification key for the specified circuit ID cannot be found.
     */
    unpack(envelope: Uint8Array): Promise<BasicMessage>;
}
//# sourceMappingURL=zkp-default.d.ts.map