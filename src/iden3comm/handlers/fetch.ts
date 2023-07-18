import { MediaType } from '../constants';
import { PROTOCOL_MESSAGE_TYPE } from '../constants';

import {
  CredentialsOfferMessage,
  IPackageManager,
  MessageFetchRequestMessage,
  PackerParams
} from '../types';
import { DID } from '@iden3/js-iden3-core';

import * as uuid from 'uuid';
import { W3CCredential } from '../../verifiable';
import { byteDecoder, byteEncoder } from '../../utils';

/**
 * Interface that allows the processing of the credential offer in the raw format for given identifier
 *
 * @export
 * @beta
 * @interface IFetchHandler
 */
export interface IFetchHandler {
  /**
   * Handle credential offer request protocol message
   *
   *@param {({
   *     did: DID;  identifier that will handle offer
   *     offer: Uint8Array; offer - raw offer message
   *     profileNonce?: number; nonce of the did to which credential has been offered
   *     packerOpts: {
   *       mediaType: MediaType;
   *     } & PackerParams; packer options how to pack message
   *   })} options how to fetch credential
   * @returns `Promise<W3CCredential>`
   */
  handleCredentialOffer(options: {
    did: DID;
    offer: Uint8Array;
    profileNonce?: number;
    packer: {
      mediaType: MediaType;
    } & PackerParams;
  }): Promise<W3CCredential[]>;
}
/**
 *
 * Allows to handle Credential offer protocol message and return fetched credential
 *
 * @export
 * @beta

 * @class FetchHandler
 * @implements implements IFetchHandler interface
 */
export class FetchHandler implements IFetchHandler {
  /**
   * Creates an instance of AuthHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   */
  constructor(private readonly _packerMgr: IPackageManager) {}

  /**
   * Handles only messages with credentials/1.0/offer type
   *
   * @param {({
   *     did: DID; identifier that will handle offer
   *     offer: Uint8Array; offer - raw offer message
   *     profileNonce?: number; nonce of the did to which credential has been offered
   *     packer: {
   *       mediaType: MediaType;
   *     } & PackerParams; packer options how to pack message
   *   })} options how to fetch credential
   * @returns `Promise<W3CCredential>`
   */
  async handleCredentialOffer(options: {
    did: DID;
    offer: Uint8Array;
    profileNonce?: number;
    packer: {
      mediaType: MediaType;
    } & PackerParams;
    headers?: {
      [key: string]: string;
    };
  }): Promise<W3CCredential[]> {
    // each credential info in the offer we need to fetch
    const {
      did,
      offer,
      packer: { mediaType, ...packerParams }
    } = options;
    const { unpackedMessage: message } = await this._packerMgr.unpack(offer);
    const offerMessage = message as unknown as CredentialsOfferMessage;
    if (message.type !== PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE) {
      throw new Error('Invalid media type');
    }
    const credentials: W3CCredential[] = [];

    for (let index = 0; index < (offerMessage?.body?.credentials?.length ?? 0); index++) {
      const credentialInfo = offerMessage?.body?.credentials[index];

      const guid = uuid.v4();
      const fetchRequest: MessageFetchRequestMessage = {
        id: guid,
        typ: mediaType,
        type: PROTOCOL_MESSAGE_TYPE.CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE,
        thid: offerMessage.thid ?? guid,
        body: {
          id: credentialInfo?.id || ''
        },
        from: did.string(),
        to: offerMessage.from
      };

      const msgBytes = byteEncoder.encode(JSON.stringify(fetchRequest));
      const token = byteDecoder.decode(
        await this._packerMgr.pack(mediaType, msgBytes, { senderDID: did, ...packerParams })
      );
      let message: { body: { credential: W3CCredential } };
      try {
        if (!offerMessage?.body?.url) {
          throw new Error(`could not fetch W3C credential, body url is missing`);
        }
        const resp = await fetch(offerMessage.body.url, {
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: token
        });
        if (resp.status !== 200) {
          throw new Error(`could not fetch W3C credential, ${credentialInfo?.id}`);
        }
        message = await resp.json();
        credentials.push(message.body.credential);
      } catch (e: unknown) {
        throw new Error(
          `could not fetch W3C credential, ${credentialInfo?.id}, error: ${
            (e as Error).message ?? e
          }`
        );
      }
    }

    return credentials;
  }
}
