"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageManager = void 0;
const envelope_1 = require("./utils/envelope");
const rfc4648_1 = require("rfc4648");
const utils_1 = require("../utils");
/**
 * Basic package manager for iden3 communication protocol
 *
 * @public
 * @class PackageManager
 * @implements implements IPackageManager interface
 */
class PackageManager {
    /**
     * Creates an instance of PackageManager.
     */
    constructor() {
        this.packers = new Map();
    }
    /** {@inheritDoc IPackageManager.registerPackers} */
    registerPackers(packers) {
        packers.forEach((p) => {
            this.packers.set(p.mediaType(), p);
        });
    }
    /** {@inheritDoc IPackageManager.pack} */
    async pack(mediaType, payload, params) {
        const p = this.packers.get(mediaType);
        if (!p) {
            throw new Error(`packer for media type ${mediaType} not found`);
        }
        return await p.pack(payload, params);
    }
    /** {@inheritDoc IPackageManager.unpack} */
    async unpack(envelope) {
        const decodedStr = utils_1.byteDecoder.decode(envelope);
        const safeEnvelope = decodedStr.trim();
        const mediaType = this.getMediaType(safeEnvelope);
        return {
            unpackedMessage: await this.unpackWithSafeEnvelope(mediaType, utils_1.byteEncoder.encode(safeEnvelope)),
            unpackedMediaType: mediaType
        };
    }
    /** {@inheritDoc IPackageManager.unpackWithType} */
    async unpackWithType(mediaType, envelope) {
        const decoder = new TextDecoder('utf-8');
        const decodedStr = decoder.decode(envelope);
        const safeEnvelope = decodedStr.trim();
        return await this.unpackWithSafeEnvelope(mediaType, utils_1.byteEncoder.encode(safeEnvelope));
    }
    async unpackWithSafeEnvelope(mediaType, envelope) {
        const p = this.packers.get(mediaType);
        if (!p) {
            throw new Error(`packer for media type ${mediaType} not found`);
        }
        const msg = await p.unpack(envelope);
        return msg;
    }
    /** {@inheritDoc IPackageManager.getMediaType} */
    getMediaType(envelope) {
        let base64HeaderBytes;
        // full serialized
        if (envelope[0] === '{') {
            const envelopeStub = JSON.parse(envelope);
            return envelopeStub.typ;
        }
        else {
            const header = envelope.split('.')[0];
            base64HeaderBytes = rfc4648_1.base64.parse(header, { loose: true });
        }
        const header = (0, envelope_1.bytesToHeaderStub)(base64HeaderBytes);
        return header.typ;
    }
}
exports.PackageManager = PackageManager;
//# sourceMappingURL=packageManager.js.map