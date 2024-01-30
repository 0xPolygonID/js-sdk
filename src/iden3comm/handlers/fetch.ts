import { MediaType } from '../constants';
import { PROTOCOL_MESSAGE_TYPE } from '../constants';

import {
  CredentialFetchRequestMessage,
  CredentialIssuanceMessage,
  CredentialsOfferMessage,
  IPackageManager,
  JWSPackerParams,
  MessageFetchRequestMessage
} from '../types';

import { W3CCredential } from '../../verifiable';
import { ICredentialWallet, getUserDIDFromCredential } from '../../credentials';

import { byteDecoder, byteEncoder } from '../../utils';
import { proving } from '@iden3/js-jwz';
import { DID } from '@iden3/js-iden3-core';
import * as uuid from 'uuid';

/**
 *
 * Options to pass to fetch handler
 *
 * @public
 * @interface FetchHandlerOptions
 */
export interface FetchHandlerOptions {
  mediaType: MediaType;
  packerOptions?: JWSPackerParams;
  headers?: {
    [key: string]: string;
  };
}

/**
 * Interface that allows the processing of the credential offer in the raw format for given identifier
 *
 * @public
 * @interface IFetchHandler
 */
export interface IFetchHandler {
  /**
   * unpacks authorization request
   * @public
   * @param {Uint8Array} offer - raw byte message
   * @param {FetchHandlerOptions} opts - FetchHandlerOptions
   * @returns `Promise<{
    token: string;
    authRequest: AuthorizationRequestMessage;
    authResponse: AuthorizationResponseMessage;
  }>`
   */
  handleCredentialOffer(offer: Uint8Array, opts?: FetchHandlerOptions): Promise<W3CCredential[]>;

  /**
   * Handles a credential fetch request.
   *
   * @param basicMessage - The basic message containing the fetch request.
   * @returns A promise that resolves to the response message.
   * @throws An error if the request is invalid or if the credential is not found.
   */
  handleCredentialFetchRequest(basicMessage: Uint8Array): Promise<Uint8Array>;

  /**
   * Handles the issuance response message.
   *
   * @param basicMessage - The basic message containing the issuance response.
   * @returns A promise that resolves to a Uint8Array.
   * @throws An error if the credential wallet is not provided in the options or if the credential is missing in the issuance response message.
   */
  handleIssuanceResponseMessage(basicMessage: Uint8Array): Promise<Uint8Array>;
}
/**
 *
 * Allows to handle Credential offer protocol message and return fetched credential
 *
 * @public

 * @class FetchHandler
 * @implements implements IFetchHandler interface
 */
export class FetchHandler implements IFetchHandler {
  /**
   * Creates an instance of FetchHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   */
  constructor(
    private readonly _packerMgr: IPackageManager,
    private readonly opts?: {
      credentialWallet: ICredentialWallet;
    }
  ) {}

  /**
   * Handles only messages with credentials/1.0/offer type
   *
   * @param {
   *     offer: Uint8Array; offer - raw offer message
   *     opts
   *   }) options how to fetch credential
   * @returns `Promise<W3CCredential[]>`
   */
  async handleCredentialOffer(
    offer: Uint8Array,
    opts?: FetchHandlerOptions
  ): Promise<W3CCredential[]> {
    if (!opts) {
      opts = {
        mediaType: MediaType.ZKPMessage
      };
    }

    if (opts.mediaType === MediaType.SignedMessage && !opts.packerOptions) {
      throw new Error(`jws packer options are required for ${MediaType.SignedMessage}`);
    }

    const offerMessage = await FetchHandler.unpackMessage<CredentialsOfferMessage>(
      this._packerMgr,
      offer,
      PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE
    );

    const credentials: W3CCredential[] = [];

    for (let index = 0; index < offerMessage.body.credentials.length; index++) {
      const credentialInfo = offerMessage.body.credentials[index];

      const guid = uuid.v4();
      const fetchRequest: MessageFetchRequestMessage = {
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

      const packerOpts =
        opts.mediaType === MediaType.SignedMessage
          ? opts.packerOptions
          : {
              provingMethodAlg: proving.provingMethodGroth16AuthV2Instance.methodAlg
            };

      const senderDID = DID.parse(offerMessage.to);
      const token = byteDecoder.decode(
        await this._packerMgr.pack(opts.mediaType, msgBytes, {
          senderDID,
          ...packerOpts
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
            'Content-Type': 'application/x-www-form-urlencoded',
            ...(opts.headers ?? {})
          },
          body: token
        });
        if (resp.status !== 200) {
          throw new Error(`could not fetch W3C credential, ${credentialInfo?.id}`);
        }
        message = await resp.json();
        credentials.push(W3CCredential.fromJSON(message.body.credential));
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

  /**
   * @inheritdoc IFetchHandler#handleCredentialFetchRequest
   */
  async handleCredentialFetchRequest(envelope: Uint8Array): Promise<Uint8Array> {
    const msgRequest = await FetchHandler.unpackMessage<CredentialFetchRequestMessage>(
      this._packerMgr,
      envelope,
      PROTOCOL_MESSAGE_TYPE.CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE
    );

    if (!msgRequest.to) {
      throw new Error("failed request. empty 'to' field");
    }

    if (!msgRequest.from) {
      throw new Error("failed request. empty 'from' field");
    }

    const issuerDID = DID.parse(msgRequest.to);
    const userDID = DID.parse(msgRequest.from);

    const credId = msgRequest.body?.id;
    if (!credId) {
      throw new Error('nvalid credential id in fetch request body');
    }

    if (!this.opts?.credentialWallet) {
      throw new Error('please, provide credential wallet in options');
    }

    const cred = await this.opts.credentialWallet.findById(credId);

    if (!cred) {
      throw new Error('credential not found');
    }

    const userToVerifyDID = getUserDIDFromCredential(issuerDID, cred);

    if (userToVerifyDID.string() !== userDID.string()) {
      throw new Error('credential subject is not a sender DID');
    }

    return this._packerMgr.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(
        JSON.stringify({
          id: uuid.v4(),
          type: PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE,
          typ: msgRequest.typ ?? MediaType.PlainMessage,
          thid: msgRequest.thid ?? uuid.v4(),
          body: { credential: cred },
          from: msgRequest.to,
          to: msgRequest.from
        })
      ),
      {}
    );
  }

  /**
   * @inheritdoc IFetchHandler#handleIssuanceResponseMessage
   */
  async handleIssuanceResponseMessage(envelop: Uint8Array): Promise<Uint8Array> {
    const issuanceMsg = await FetchHandler.unpackMessage<CredentialIssuanceMessage>(
      this._packerMgr,
      envelop,
      PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE
    );

    if (!this.opts?.credentialWallet) {
      throw new Error('please provide credential wallet in options');
    }

    if (!issuanceMsg.body?.credential) {
      throw new Error('credential is missing in issuance response message');
    }

    await this.opts.credentialWallet.save(W3CCredential.fromJSON(issuanceMsg.body.credential));

    return Promise.resolve(Uint8Array.from([]));
  }

  /**
   * @inheritdoc IFetchHandler#unpackMessage
   */
  static async unpackMessage<T>(
    packerMgr: IPackageManager,
    envelope: Uint8Array,
    messageType: string
  ): Promise<T> {
    const { unpackedMessage: message } = await packerMgr.unpack(envelope);
    const msgRequest = message as unknown as T;
    if (message.type !== messageType) {
      throw new Error('Invalid message type');
    }
    return msgRequest;
  }
}
