import { MediaType } from '../constants';
import { PROTOCOL_MESSAGE_TYPE } from '../constants';
import * as uuid from 'uuid';
import { byteDecoder, byteEncoder } from '../../utils';
import { proving } from '@iden3/js-jwz';
import { DID } from '@iden3/js-iden3-core';
/**
 *
 * Allows to handle Credential offer protocol message and return fetched credential
 *
 * @public

 * @class FetchHandler
 * @implements implements IFetchHandler interface
 */
export class FetchHandler {
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
                mediaType: MediaType.ZKPMessage
            };
        }
        if (opts.mediaType === MediaType.SignedMessage && !opts.packerOptions) {
            throw new Error(`jws packer options are required for ${MediaType.SignedMessage}`);
        }
        const { unpackedMessage: message } = await this._packerMgr.unpack(offer);
        const offerMessage = message;
        if (message.type !== PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE) {
            throw new Error('Invalid media type');
        }
        const credentials = [];
        for (let index = 0; index < offerMessage.body.credentials.length; index++) {
            const credentialInfo = offerMessage.body.credentials[index];
            const guid = uuid.v4();
            const fetchRequest = {
                id: guid,
                typ: opts.mediaType,
                type: PROTOCOL_MESSAGE_TYPE.CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE,
                thid: offerMessage.thid ?? guid,
                body: {
                    id: credentialInfo.id
                },
                from: offerMessage.to,
                to: offerMessage.from
            };
            const msgBytes = byteEncoder.encode(JSON.stringify(fetchRequest));
            const packerOpts = opts.mediaType === MediaType.SignedMessage
                ? opts.packerOptions
                : {
                    provingMethodAlg: proving.provingMethodGroth16AuthV2Instance.methodAlg
                };
            const senderDID = DID.parse(offerMessage.to);
            const token = byteDecoder.decode(await this._packerMgr.pack(opts.mediaType, msgBytes, {
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
//# sourceMappingURL=fetch.js.map