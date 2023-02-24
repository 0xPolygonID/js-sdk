import { byteDecoder, byteEncoder } from '../utils/index';
import { MediaType } from '../constants';
import { PROTOCOL_MESSAGE_TYPE } from '../constants';

import {
  CredentialIssuanceMessage,
  CredentialsOfferMessage,
  IPackageManager,
  MessageFetchRequestMessage
} from '../types';
import { DID } from '@iden3/js-iden3-core';
import { proving } from '@iden3/js-jwz';

import * as uuid from 'uuid';
import { W3CCredential } from '../../verifiable';
import axios from 'axios';

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
   * @param {DID} id - identifier that will handle offer
   * @param {CredentialsOfferMessage} offer - raw offer message
   * @param {number} profileNonce -  nonce of the did to which credential has been offered
   * @returns `Promise<W3CCredential>`
   */
  handleCredentialOffer(
    did: DID,
    offer: Uint8Array,
    profileNonce?: number
  ): Promise<W3CCredential[]>;
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
   * @param {DID} did - an identity that will process the request
   * @param {Uint8Array} offer - raw offer message
   * @param {number} profileNonce - nonce of the did to which credential has been offered
   * @returns `Promise<W3CCredential[]` */
  async handleCredentialOffer(
    did: DID,
    offer: Uint8Array,
    profileNonce = 0
  ): Promise<W3CCredential[]> {
    // each credential info in the offer we need to fetch

    const { unpackedMessage: message } = await this._packerMgr.unpack(offer);
    const offerMessage = message as unknown as CredentialsOfferMessage;
    if (message.type !== PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE) {
      throw new Error('Invalid media type');
    }
    const credentials: W3CCredential[] = [];

    for (let index = 0; index < offerMessage.body.credentials.length; index++) {
      const credentialInfo = offerMessage.body.credentials[index];

      const guid = uuid.v4();
      const fetchRequest: MessageFetchRequestMessage = {
        id: guid,
        typ: MediaType.ZKPMessage,
        type: PROTOCOL_MESSAGE_TYPE.CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE,
        thid: offerMessage.thid ?? guid,
        body: {
          id: credentialInfo.id
        },
        from: did.toString(),
        to: offerMessage.from
      };

      const msgBytes = byteEncoder.encode(JSON.stringify(fetchRequest));
      const token = byteDecoder.decode(
        await this._packerMgr.pack(MediaType.ZKPMessage, msgBytes, {
          senderDID: did,
          profileNonce,
          provingMethodAlg: proving.provingMethodGroth16AuthV2Instance.methodAlg
        })
      );

      const resp = await axios.post<CredentialIssuanceMessage>(offerMessage.body.url, token);
      if (resp.status !== 200) {
        throw new Error(`could not fetch W3C credential, ${credentialInfo.id}`);
      }
      credentials.push(resp.data.body.credential);
    }

    return credentials;
  }
}
