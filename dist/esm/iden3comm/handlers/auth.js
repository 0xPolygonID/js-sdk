import { MediaType } from '../constants';
import { PROTOCOL_MESSAGE_TYPE } from '../constants';
import { DID } from '@iden3/js-iden3-core';
import { proving } from '@iden3/js-jwz';
import * as uuid from 'uuid';
import { byteDecoder, byteEncoder } from '../../utils';
/**
 *
 * Allows to process AuthorizationRequest protocol message and produce JWZ response.
 *
 * @public

 * @class AuthHandler
 * @implements implements IAuthHandler interface
 */
export class AuthHandler {
    /**
     * Creates an instance of AuthHandler.
     * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
     * @param {IProofService} _proofService -  proof service to verify zk proofs
     *
     */
    constructor(_packerMgr, _proofService) {
        this._packerMgr = _packerMgr;
        this._proofService = _proofService;
    }
    /**
     * unpacks authorization request
     * @public
     * @param {Uint8Array} request - raw byte message
     * @returns `Promise<AuthorizationRequestMessage>`
     */
    async parseAuthorizationRequest(request) {
        const { unpackedMessage: message } = await this._packerMgr.unpack(request);
        const authRequest = message;
        if (message.type !== PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE) {
            throw new Error('Invalid media type');
        }
        return authRequest;
    }
    /**
     * unpacks authorization request and packs authorization response
     * @public
     * @param {did} did  - sender DID
     * @param {Uint8Array} request - raw byte message
     * @returns `Promise<{
      token: string;
      authRequest: AuthorizationRequestMessage;
      authResponse: AuthorizationResponseMessage;
    }>`
     */
    async handleAuthorizationRequest(did, request, opts) {
        const authRequest = await this.parseAuthorizationRequest(request);
        if (authRequest.type !== PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE) {
            throw new Error('Invalid message type for authorization request');
        }
        if (!opts) {
            opts = {
                mediaType: MediaType.ZKPMessage
            };
        }
        if (opts.mediaType === MediaType.SignedMessage && !opts.packerOptions) {
            throw new Error(`jws packer options are required for ${MediaType.SignedMessage}`);
        }
        if (authRequest.to) {
            // override sender did if it's explicitly specified in the auth request
            did = DID.parse(authRequest.to);
        }
        const guid = uuid.v4();
        const authResponse = {
            id: guid,
            typ: opts.mediaType,
            type: PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE,
            thid: authRequest.thid ?? guid,
            body: {
                message: authRequest?.body?.message,
                scope: []
            },
            from: did.string(),
            to: authRequest.from
        };
        for (const proofReq of authRequest.body.scope) {
            const zkpReq = {
                id: proofReq.id,
                circuitId: proofReq.circuitId,
                query: proofReq.query
            };
            const query = proofReq.query;
            const zkpRes = await this._proofService.generateProof(zkpReq, did, {
                skipRevocation: query.skipClaimRevocationCheck ?? false
            });
            authResponse.body.scope.push(zkpRes);
        }
        const msgBytes = byteEncoder.encode(JSON.stringify(authResponse));
        const packerOpts = opts.mediaType === MediaType.SignedMessage
            ? opts.packerOptions
            : {
                provingMethodAlg: proving.provingMethodGroth16AuthV2Instance.methodAlg
            };
        const token = byteDecoder.decode(await this._packerMgr.pack(opts.mediaType, msgBytes, {
            senderDID: did,
            ...packerOpts
        }));
        return { authRequest, authResponse, token };
    }
}
//# sourceMappingURL=auth.js.map