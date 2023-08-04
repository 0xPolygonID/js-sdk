"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthHandler = void 0;
const constants_1 = require("../constants");
const constants_2 = require("../constants");
const js_iden3_core_1 = require("@iden3/js-iden3-core");
const js_jwz_1 = require("@iden3/js-jwz");
const uuid = __importStar(require("uuid"));
const utils_1 = require("../../utils");
/**
 *
 * Allows to process AuthorizationRequest protocol message and produce JWZ response.
 *
 * @public

 * @class AuthHandler
 * @implements implements IAuthHandler interface
 */
class AuthHandler {
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
        if (message.type !== constants_2.PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE) {
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
        if (authRequest.type !== constants_2.PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE) {
            throw new Error('Invalid message type for authorization request');
        }
        if (!opts) {
            opts = {
                mediaType: constants_1.MediaType.ZKPMessage
            };
        }
        if (opts.mediaType === constants_1.MediaType.SignedMessage && !opts.packerOptions) {
            throw new Error(`jws packer options are required for ${constants_1.MediaType.SignedMessage}`);
        }
        if (authRequest.to) {
            // override sender did if it's explicitly specified in the auth request
            did = js_iden3_core_1.DID.parse(authRequest.to);
        }
        const guid = uuid.v4();
        const authResponse = {
            id: guid,
            typ: opts.mediaType,
            type: constants_2.PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE,
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
        const msgBytes = utils_1.byteEncoder.encode(JSON.stringify(authResponse));
        const packerOpts = opts.mediaType === constants_1.MediaType.SignedMessage
            ? opts.packerOptions
            : {
                provingMethodAlg: js_jwz_1.proving.provingMethodGroth16AuthV2Instance.methodAlg
            };
        const token = utils_1.byteDecoder.decode(await this._packerMgr.pack(opts.mediaType, msgBytes, {
            senderDID: did,
            ...packerOpts
        }));
        return { authRequest, authResponse, token };
    }
}
exports.AuthHandler = AuthHandler;
//# sourceMappingURL=auth.js.map