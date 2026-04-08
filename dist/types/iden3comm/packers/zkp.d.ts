import { StateVerificationOpts, AuthDataPrepareFunc, BasicMessage, IPacker, ProvingParams, StateVerificationFunc, VerificationParams, ZKPPackerParams } from '../types';
import { Token, ProvingMethodAlg } from '@iden3/js-jwz';
import { CircuitId } from '../../circuits/index';
import { DID } from '@iden3/js-iden3-core';
import { MediaType } from '../constants';
/**
 * Handler to
 *
 * @public
 * @class DataPrepareHandlerFunc
 */
export declare class DataPrepareHandlerFunc {
    readonly dataPrepareFunc: AuthDataPrepareFunc;
    /**
     * Creates an instance of DataPrepareHandlerFunc.
     * @param {AuthDataPrepareFunc} dataPrepareFunc - function that produces marshaled inputs for auth circuits
     */
    constructor(dataPrepareFunc: AuthDataPrepareFunc);
    /**
     *
     *
     * @param {Uint8Array} hash - challenge that will be signed
     * @param {DID} did - did of identity that will prepare inputs
     * @param {CircuitId} circuitId - circuit id
     * @returns `Promise<Uint8Array>`
     */
    prepare(hash: Uint8Array, did: DID, circuitId: CircuitId): Promise<Uint8Array>;
}
/**
 * Handler to verify public signals of authorization circuits
 *
 * @public
 * @class VerificationHandlerFunc
 */
export declare class VerificationHandlerFunc {
    readonly stateVerificationFunc: StateVerificationFunc;
    /**
     * Creates an instance of VerificationHandlerFunc.
     * @param {StateVerificationFunc} stateVerificationFunc - state verification function
     */
    constructor(stateVerificationFunc: StateVerificationFunc);
    /**
     *
     *
     * @param {string} id  - id of circuit
     * @param {Array<string>} pubSignals - signals that must contain user id and state
     * @returns `Promise<boolean>`
     */
    verify(id: string, pubSignals: Array<string>, opts?: StateVerificationOpts): Promise<boolean>;
}
/**
 * Packer that can pack message to JWZ token,
 * and unpack and validate JWZ envelope
 * @public
 * @class ZKPPacker
 * @implements implements IPacker interface
 */
export declare class ZKPPacker implements IPacker {
    readonly provingParamsMap: Map<string, ProvingParams>;
    readonly verificationParamsMap: Map<string, VerificationParams>;
    private readonly _opts;
    private readonly supportedProtocolVersions;
    private readonly supportedAlgorithms;
    protected supportedCircuitIds: string[];
    /**
     * Creates an instance of ZKPPacker.
     * @param {Map<string, ProvingParams>} provingParamsMap - string is derived by JSON.parse(ProvingMethodAlg)
     * @param {Map<string, VerificationParams>} verificationParamsMap - string is derived by JSON.parse(ProvingMethodAlg)
     */
    constructor(provingParamsMap: Map<string, ProvingParams>, verificationParamsMap: Map<string, VerificationParams>, _opts?: StateVerificationOpts);
    /**
     * Packs a basic message using the specified parameters.
     * @param msg - The basic message to pack.
     * @param param - The parameters for the ZKPPacker.
     * @returns A promise that resolves to a Uint8Array representing the packed message.
     */
    packMessage(msg: BasicMessage, param: ZKPPackerParams): Promise<Uint8Array>;
    /**
     * creates JSON Web Zeroknowledge token
     *
     * @param {Uint8Array} payload - serialized message
     * @param {ZKPPackerParams} params - sender id and proving alg are required
     * @returns `Promise<Uint8Array>`
     */
    pack(payload: Uint8Array, params: ZKPPackerParams): Promise<Uint8Array>;
    protected unpackMessage(token: Token, provingMethodAlg: ProvingMethodAlg): Promise<BasicMessage>;
    protected parseToken(msg: Uint8Array): Promise<Token>;
    /**
     * validate envelope which is jwz token
     *
     * @param {Uint8Array} envelope
     * @returns `Promise<BasicMessage>`
     */
    unpack(envelope: Uint8Array): Promise<BasicMessage>;
    mediaType(): MediaType;
    /** {@inheritDoc IPacker.getSupportedProfiles} */
    getSupportedProfiles(): string[];
    /** {@inheritDoc IPacker.isProfileSupported} */
    isProfileSupported(profile: string): boolean;
}
//# sourceMappingURL=zkp.d.ts.map