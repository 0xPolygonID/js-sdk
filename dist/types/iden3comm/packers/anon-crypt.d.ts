import { Resolvable } from 'did-resolver';
import { AcceptJweKEKAlgorithms, MediaType, VerificationMethodType } from '../constants';
import { BasicMessage, DIDDocument, IPacker, PackerParams } from '../types';
import { DID } from '@iden3/js-iden3-core';
import { JoseService } from '../services';
export type RecipientInfo = {
    did: DID;
    didDocument?: DIDDocument;
    keyType?: VerificationMethodType;
    alg?: AcceptJweKEKAlgorithms;
};
export type JWEPackerParams = PackerParams & {
    enc: string;
    recipients: RecipientInfo[];
};
export declare class AnonCryptPacker implements IPacker {
    private readonly _joseService;
    private readonly _documentResolver;
    private readonly _supportedProtocolVersions;
    private _supportedAlgorithms;
    constructor(_joseService: JoseService, _documentResolver: Resolvable);
    packMessage(msg: BasicMessage, param: JWEPackerParams): Promise<Uint8Array>;
    getSupportedAlgorithms(): AcceptJweKEKAlgorithms[];
    registerSupportedAlgorithm(algorithm: AcceptJweKEKAlgorithms): void;
    /**
     * creates JSON Web Signature token
     *
     * @param {Uint8Array} payload - serialized message
     * @param {PackerParams} params - sender id and proving alg are required
     * @returns `Promise<Uint8Array>`
     */
    pack(payload: Uint8Array, params: JWEPackerParams): Promise<Uint8Array>;
    unpack(envelope: Uint8Array): Promise<BasicMessage>;
    mediaType(): MediaType;
    /** {@inheritDoc IPacker.getSupportedProfiles} */
    getSupportedProfiles(): string[];
    /** {@inheritDoc IPacker.isProfileSupported} */
    isProfileSupported(profile: string): boolean;
    private packInternal;
}
//# sourceMappingURL=anon-crypt.d.ts.map