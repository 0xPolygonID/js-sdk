import { PlainPackerParams } from './../types/packer';
import { BasicMessage, IPacker } from '../types';
import { MediaType } from '../constants';
/**
 * Plain packer just serializes bytes to JSON and adds media type
 *
 * @public
 * @class PlainPacker
 * @implements implements IPacker interface
 */
export declare class PlainPacker implements IPacker {
    /**
     * Pack returns packed message to transport envelope
     *
     * @param {Uint8Array} payload - json message serialized
     * @param {PlainPackerParams} _params - not used here
     * @returns `Promise<Uint8Array>`
     */
    pack(payload: Uint8Array, _params: PlainPackerParams): Promise<Uint8Array>;
    /**
     * Unpack returns unpacked message from transport envelope
     *
     * @param {Uint8Array} envelope - packed envelope (serialized json with media type)
     * @returns `Promise<BasicMessage>`
     */
    unpack(envelope: Uint8Array): Promise<BasicMessage>;
    /**
     * returns media type for plain message
     *
     * @returns MediaType
     */
    mediaType(): MediaType;
}
