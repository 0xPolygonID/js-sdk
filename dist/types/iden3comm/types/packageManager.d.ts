import { BasicMessage, IPacker, PackerParams } from './packer';
import { MediaType } from '../constants';
/**
 * Interface for defining the registry of packers
 *
 * @public
 * @interface   IPackageManager
 */
export interface IPackageManager {
    /**
     * Map of packers key is media type, value is packer implementation
     *
     * @type {Map<MediaType, IPacker>}
     */
    packers: Map<MediaType, IPacker>;
    /**
     * registers new packer in the manager
     *
     * @param {Array<IPacker>} packers
     */
    registerPackers(packers: Array<IPacker>): void;
    /**
     * packs payload with a packer that is assigned to media type
     * forwards packer params to implementation
     *
     * @param {MediaType} mediaType
     * @param {Uint8Array} payload
     * @param {PackerParams} params
     * @returns `Promise<Uint8Array>`
     */
    pack(mediaType: MediaType, payload: Uint8Array, params: PackerParams): Promise<Uint8Array>;
    /**
     * unpacks packed envelope to basic protocol message and returns media type of the envelope
     *
     * @param {Uint8Array} envelope - bytes envelope
     * @returns `Promise<{ unpackedMessage: BasicMessage; unpackedMediaType: MediaType }`
     */
    unpack(envelope: Uint8Array): Promise<{
        unpackedMessage: BasicMessage;
        unpackedMediaType: MediaType;
    }>;
    /**
     * unpacks an envelope with a known media type
     *
     * @param {MediaType} mediaType
     * @param {Uint8Array} envelope
     * @returns `Promise<BasicMessage>`
     */
    unpackWithType(mediaType: MediaType, envelope: Uint8Array): Promise<BasicMessage>;
    /**
     * gets media type from an envelope
     *
     * @param {string} envelope
     * @returns MediaType
     */
    getMediaType(envelope: string): MediaType;
}
/**
 * EnvelopeStub is used to stub the jwt based envelops
 */
export type EnvelopeStub = {
    protected: string;
};
/**
 * HeaderStub is used to stub the jwt based envelops
 */
export type HeaderStub = {
    typ: MediaType;
};
