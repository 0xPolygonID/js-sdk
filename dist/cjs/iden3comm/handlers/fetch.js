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
exports.FetchHandler = void 0;
const constants_1 = require("../constants");
const constants_2 = require("../constants");
const uuid = __importStar(require("uuid"));
const utils_1 = require("../../utils");
const js_jwz_1 = require("@iden3/js-jwz");
const js_iden3_core_1 = require("@iden3/js-iden3-core");
/**
 *
 * Allows to handle Credential offer protocol message and return fetched credential
 *
 * @public

 * @class FetchHandler
 * @implements implements IFetchHandler interface
 */
class FetchHandler {
    /**
     * Creates an instance of AuthHandler.
     * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
     */
    constructor(_packerMgr) {
        this._packerMgr = _packerMgr;
    }
    /**
     * Handles only messages with credentials/1.0/offer type
     *
     * @param {
     *     offer: Uint8Array; offer - raw offer message
     *     opts
     *   }) options how to fetch credential
     * @returns `Promise<W3CCredential>`
     */
    async handleCredentialOffer(offer, opts) {
        if (!opts) {
            opts = {
                mediaType: constants_1.MediaType.ZKPMessage
            };
        }
        if (opts.mediaType === constants_1.MediaType.SignedMessage && !opts.packerOptions) {
            throw new Error(`jws packer options are required for ${constants_1.MediaType.SignedMessage}`);
        }
        const { unpackedMessage: message } = await this._packerMgr.unpack(offer);
        const offerMessage = message;
        if (message.type !== constants_2.PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE) {
            throw new Error('Invalid media type');
        }
        const credentials = [];
        for (let index = 0; index < offerMessage.body.credentials.length; index++) {
            const credentialInfo = offerMessage.body.credentials[index];
            const guid = uuid.v4();
            const fetchRequest = {
                id: guid,
                typ: opts.mediaType,
                type: constants_2.PROTOCOL_MESSAGE_TYPE.CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE,
                thid: offerMessage.thid ?? guid,
                body: {
                    id: credentialInfo.id
                },
                from: offerMessage.to,
                to: offerMessage.from
            };
            const msgBytes = utils_1.byteEncoder.encode(JSON.stringify(fetchRequest));
            const packerOpts = opts.mediaType === constants_1.MediaType.SignedMessage
                ? opts.packerOptions
                : {
                    provingMethodAlg: js_jwz_1.proving.provingMethodGroth16AuthV2Instance.methodAlg
                };
            const senderDID = js_iden3_core_1.DID.parse(offerMessage.to);
            const token = utils_1.byteDecoder.decode(await this._packerMgr.pack(opts.mediaType, msgBytes, {
                senderDID,
                ...packerOpts
            }));
            let message;
            try {
                if (!offerMessage?.body?.url) {
                    throw new Error(`could not fetch W3C credential, body url is missing`);
                }
                const resp = await fetch(offerMessage.body.url, {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        ...(opts.headers ?? {})
                    },
                    body: token
                });
                if (resp.status !== 200) {
                    throw new Error(`could not fetch W3C credential, ${credentialInfo?.id}`);
                }
                message = await resp.json();
                credentials.push(message.body.credential);
            }
            catch (e) {
                throw new Error(`could not fetch W3C credential, ${credentialInfo?.id}, error: ${e.message ?? e}`);
            }
        }
        return credentials;
    }
}
exports.FetchHandler = FetchHandler;
//# sourceMappingURL=fetch.js.map