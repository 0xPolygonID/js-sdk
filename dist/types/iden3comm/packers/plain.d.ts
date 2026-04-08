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
    private readonly supportedProtocolVersions;
    /**
     * Packs a basic message using the specified parameters.
     *
     * @param msg - The basic message to pack.
     * @param param - The packer parameters.
     * @returns A promise that resolves to a Uint8Array representing the packed message.
     * @throws An error if the method is not implemented.
     */
    packMessage(msg: BasicMessage): Promise<Uint8Array>;
    /**
     * Pack returns packed message to transport envelope
     *
     * @param {Uint8Array} payload - json message serialized
     * @param {PlainPackerParams} _params - not used here
     * @returns `Promise<Uint8Array>`
     */
    pack(payload: Uint8Array): Promise<Uint8Array>;
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
    /** {@inheritDoc IPacker.getSupportedProfiles} */
    getSupportedProfiles(): string[];
    /** {@inheritDoc IPacker.isProfileSupported} */
    isProfileSupported(profile: string): boolean;
}
//# sourceMappingURL=plain.d.ts.map