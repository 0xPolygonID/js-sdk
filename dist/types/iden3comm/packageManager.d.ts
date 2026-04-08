import { BasicMessage, IPackageManager, IPacker, PackerParams } from './types';
import { MediaType } from './constants';
/**
 * Basic package manager for iden3 communication protocol
 *
 * @public
 * @class PackageManager
 * @implements implements IPackageManager interface
 */
export declare class PackageManager implements IPackageManager {
    packers: Map<MediaType, IPacker>;
    /**
     * Creates an instance of PackageManager.
     */
    constructor();
    /** {@inheritDoc IPackageManager.getSupportedProfiles} */
    getSupportedProfiles(): string[];
    /** {@inheritDoc IPackageManager.isProfileSupported} */
    isProfileSupported(mediaType: MediaType, profile: string): boolean;
    /** {@inheritDoc IPackageManager.getSupportedMediaTypes} */
    getSupportedMediaTypes(): MediaType[];
    /** {@inheritDoc IPackageManager.registerPackers} */
    registerPackers(packers: Array<IPacker>): void;
    /** {@inheritDoc IPackageManager.pack} */
    pack(mediaType: MediaType, payload: Uint8Array, params: PackerParams): Promise<Uint8Array>;
    /**
     * Packs a protocol message using the specified media type and packer parameters.
     *
     * @param mediaType - The media type to use for packing the message.
     * @param protocolMessage - The protocol message to pack.
     * @param params - The packer parameters.
     * @returns A promise that resolves to the packed message as a Uint8Array.
     * @throws An error if the packer for the specified media type is not found.
     */
    packMessage(mediaType: MediaType, protocolMessage: BasicMessage, params: PackerParams): Promise<Uint8Array>;
    /** {@inheritDoc IPackageManager.unpack} */
    unpack(envelope: Uint8Array): Promise<{
        unpackedMessage: BasicMessage;
        unpackedMediaType: MediaType;
    }>;
    /** {@inheritDoc IPackageManager.unpackWithType} */
    unpackWithType(mediaType: MediaType, envelope: Uint8Array): Promise<BasicMessage>;
    private unpackWithSafeEnvelope;
    /** {@inheritDoc IPackageManager.getMediaType} */
    getMediaType(envelope: string): MediaType;
}
//# sourceMappingURL=packageManager.d.ts.map