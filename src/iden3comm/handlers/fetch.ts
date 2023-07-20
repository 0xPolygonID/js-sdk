import { MediaType } from '../constants';
import { PROTOCOL_MESSAGE_TYPE } from '../constants';

import {
  CredentialsOfferMessage,
  IPackageManager,
  JWSPackerParams,
  MessageFetchRequestMessage,
  PackerParams
} from '../types';
import { DID } from '@iden3/js-iden3-core';

import * as uuid from 'uuid';
import { W3CCredential } from '../../verifiable';
import { byteDecoder, byteEncoder } from '../../utils';
import { ProvingMethodAlg, proving } from '@iden3/js-jwz';
import { ICredentialWallet } from '../../credentials';
import { IIdentityWallet } from '../../identity';

interface FetchHandlerOptions {
  mediaType: MediaType;
  packerOptions:
    | {
        profileNonce: number;
        provingMethodAlg: ProvingMethodAlg;
      }
    | JWSPackerParams;
  did?: DID;
  headers?: {
    [key: string]: string;
  };
}

/**
 * Interface that allows the processing of the credential offer in the raw format for given identifier
 *
 * @export
 * @beta
 * @interface IFetchHandler
 */
export interface IFetchHandler {
  /**
   * unpacks authorization request
   * @export
   * @beta
   * @param {Uint8Array} offer - raw byte message
   * @param {FetchHandlerOptions} opts - FetchHandlerOptions
   * @returns `Promise<{
    token: string;
    authRequest: AuthorizationRequestMessage;
    authResponse: AuthorizationResponseMessage;
  }>`
   */
  handleCredentialOffer(offer: Uint8Array, opts?: FetchHandlerOptions): Promise<W3CCredential[]>;
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
   * @param {ICredentialWallet} _credentialWallet -  wallet to search credentials
   * @param {IIdentityWallet} _identityWallet -  wallet to search profiles and identities
   */
  constructor(
    private readonly _packerMgr: IPackageManager,
    private readonly _identityWallet: IIdentityWallet,
    private readonly _credentialWallet: ICredentialWallet
  ) {}

  /**
   * Handles only messages with credentials/1.0/offer type
   *
   * @param {
   *     offer: Uint8Array; offer - raw offer message
   *     opts
   *   }) options how to fetch credential
   * @returns `Promise<W3CCredential>`
   */
  async handleCredentialOffer(
    offer: Uint8Array,
    opts?: FetchHandlerOptions
  ): Promise<W3CCredential[]> {
    if (!opts) {
      const zkpPackerOpts = {
        profileNonce: 0,
        provingMethodAlg: proving.provingMethodGroth16AuthV2Instance.methodAlg,
        alg: ''
      };

      opts = {
        packerOptions: zkpPackerOpts,
        mediaType: MediaType.ZKPMessage
      };
    }

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
        typ: opts.mediaType,
        type: PROTOCOL_MESSAGE_TYPE.CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE,
        thid: offerMessage.thid ?? guid,
        body: {
          id: credentialInfo?.id || ''
        },
        from: opts.did ? opts.did.string() : offerMessage.to,
        to: offerMessage.from
      };

      const msgBytes = byteEncoder.encode(JSON.stringify(fetchRequest));

      // check if offer is for profile we need to find its nonce
      // if it opts did is set, then
      opts.packerOptions.profileNonce = opts.did
        ? 0
        : this._identityWallet.getProfileNonce(DID.parse(offerMessage.to!));

      const token = byteDecoder.decode(
        await this._packerMgr.pack(opts.mediaType, msgBytes, {
          senderDID: offerMessage.to,
          ...opts.packerOptions
        })
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

    this._credentialWallet.saveAll(credentials);
    return credentials;
  }
}
