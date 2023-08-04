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
    /** {@inheritDoc IPackageManager.registerPackers} */
    registerPackers(packers: Array<IPacker>): void;
    /** {@inheritDoc IPackageManager.pack} */
    pack(mediaType: MediaType, payload: Uint8Array, params: PackerParams): Promise<Uint8Array>;
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
