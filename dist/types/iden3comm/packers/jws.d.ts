import { BasicMessage, IPacker, JWSPackerParams } from '../types';
import { MediaType } from '../constants';
import { KMS } from '../../kms/';
import { Resolvable } from 'did-resolver';
/**
 * Packer that can pack message to JWZ token,
 * and unpack and validate JWZ envelope
 * @public
 * @class ZKPPacker
 * @implements implements IPacker interface
 */
export declare class JWSPacker implements IPacker {
    private readonly _kms;
    private readonly _documentResolver;
    /**
     * Creates an instance of JWSPacker.
     *
     * @param {KMS} _kms
     * @param {Resolvable} _documentResolver
     * @memberof JWSPacker
     */
    constructor(_kms: KMS, _documentResolver: Resolvable);
    /**
     * creates JSON Web Signature token
     *
     * @param {Uint8Array} payload - serialized message
     * @param {PackerParams} params - sender id and proving alg are required
     * @returns `Promise<Uint8Array>`
     */
    pack(payload: Uint8Array, params: JWSPackerParams): Promise<Uint8Array>;
    /**
     * validate envelope which is jwz token
     *
     * @param {Uint8Array} envelope
     * @returns `Promise<BasicMessage>`
     */
    unpack(envelope: Uint8Array): Promise<BasicMessage>;
    mediaType(): MediaType;
    private resolveDidDoc;
}
